<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="card !p-5 flex items-center justify-between">
        <div><p class="text-sm text-gray-500">{{ s.label }}</p><p class="text-3xl font-bold mt-2" :class="s.color">{{ s.value }}</p></div>
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="s.bg"><component :is="s.icon" class="w-7 h-7" :class="s.iconColor" /></div>
      </div>
    </div>
    <div class="card !p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <select v-model="fStatus" class="input-base !w-32">
          <option value="">全部</option>
          <option value="pending">待回访</option>
          <option value="completed">已完成</option>
          <option value="overdue">已逾期</option>
        </select>
        <select v-model="fType" class="input-base !w-32">
          <option value="">全部方式</option>
          <option value="phone">电话回访</option>
          <option value="home_visit">上门回访</option>
          <option value="video">视频回访</option>
          <option value="onsite">现场回访</option>
        </select>
      </div>
      <button @click="openCreate" v-if="store.canMediate || store.userRole === 'grid_worker'" class="btn-primary"><Plus class="w-4 h-4 mr-1.5" />新建回访计划</button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="f in filtered" :key="f.id" class="card transition-all" :class="f.status === 'overdue' ? 'border-l-4 border-l-red-500' : f.status === 'completed' ? '' : 'border-l-4 border-l-primary-500'">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start space-x-4 flex-1 min-w-0">
            <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" :class="f.status === 'overdue' ? 'bg-red-50' : f.status === 'completed' ? 'bg-green-50' : 'bg-primary-50'">
              <component :is="iconByType(f.type)" class="w-7 h-7" :class="f.status === 'overdue' ? 'text-red-500' : f.status === 'completed' ? 'text-green-500' : 'text-primary-500'" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center flex-wrap gap-2 mb-1.5">
                <span class="badge" :class="f.status === 'completed' ? 'status-completed' : f.status === 'overdue' ? 'status-overdue' : 'status-pending'">{{ stText(f.status) }}</span>
                <span class="badge bg-blue-50 text-blue-600 text-xs">{{ typeText(f.type) }}</span>
                <span v-if="f.status === 'overdue'" class="badge bg-red-100 text-red-700 text-xs">已逾期 {{ Math.max(0, dayjs().diff(dayjs(f.scheduledTime), 'day')) }} 天</span>
              </div>
              <h3 class="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{{ findCase(f.caseId)?.title || '案件已归档' }}</h3>
              <p class="text-sm text-gray-500">案件编号：{{ findCase(f.caseId)?.caseNo || '—' }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 py-3 border-y border-gray-100 mb-4">
          <span class="flex items-center"><CalendarClock class="w-4 h-4 mr-2 text-gray-400" />计划：{{ dayjs(f.scheduledTime).format('YYYY-MM-DD HH:mm') }}</span>
          <span class="flex items-center"><User class="w-4 h-4 mr-2 text-gray-400" />执行人：{{ f.handlerName }}</span>
          <span v-if="f.result" class="flex items-center"><Clock class="w-4 h-4 mr-2 text-gray-400" />完成：{{ dayjs(f.result.recordTime).format('YYYY-MM-DD') }}</span>
        </div>
        <div v-if="f.result" class="space-y-3 mb-4">
          <div class="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
            <div class="text-center"><p class="text-xs text-gray-500">满意度</p><div class="flex mt-1"><Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= (f.result.satisfaction || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'" /></div></div>
            <div class="h-10 w-px bg-gray-200"></div>
            <div class="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><span class="text-gray-500">情绪状态：</span><span :class="emo(f.result.emotionalState)[1]">{{ emo(f.result.emotionalState)[0] }}</span></p>
              <p><span class="text-gray-500">履行情况：</span><span :class="perf(f.result.performanceStatus)[1]">{{ perf(f.result.performanceStatus)[0] }}</span></p>
              <p class="col-span-2"><span class="text-gray-500">是否有新纠纷：</span>{{ f.result.hasDispute ? '⚠️ 存在新纠纷' : '✓ 无新纠纷' }}</p>
            </div>
          </div>
          <div class="p-4 bg-primary-50/40 rounded-xl border border-primary-100">
            <p class="text-xs font-semibold text-primary-700 mb-1.5 flex items-center"><MessageSquare class="w-3.5 h-3.5 mr-1" />回访记录</p>
            <p class="text-sm text-gray-700 leading-relaxed">{{ f.result.notes }}</p>
          </div>
          <div v-if="f.result.hasDispute && (findCase(f.caseId)?.status === 'repeat_complaint')" class="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
            ⚠️ 回访发现新问题，案件已升级为"重复投诉"状态，需重新跟进。
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center text-xs text-gray-400">
            <span v-if="f.agreementId">关联协议：{{ f.agreementId }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button v-if="findCase(f.caseId)" @click="goCase(f.caseId)" class="btn-outline !py-1.5 !px-3 text-xs">查看案件</button>
            <button v-if="f.status !== 'completed'" @click="openResult(f)" class="btn-success !py-1.5 !px-3 text-xs"><CheckCircle class="w-3 h-3 mr-1" />记录结果</button>
            <button v-if="f.status !== 'completed' && store.canSupervise" @click="escalate(f)" class="btn-danger !py-1.5 !px-3 text-xs">督办升级</button>
          </div>
        </div>
      </div>
      <div v-if="!filtered.length" class="lg:col-span-2 card text-center py-16 text-gray-400">暂无回访记录</div>
    </div>
    <Teleport to="body">
      <div v-if="showResult" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showResult = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-1">记录回访结果</h3>
          <p class="text-sm text-gray-500 mb-5">案件：{{ findCase(showResult.caseId)?.title }}</p>
          <form @submit.prevent="submitResult" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="label-base">当事人满意度</label>
                <div class="flex space-x-2 py-2">
                  <button v-for="i in 5" :key="i" type="button" @click="rf.satisfaction = i" class="p-1 rounded hover:scale-110 transition-transform">
                    <Star class="w-8 h-8" :class="i <= rf.satisfaction ? 'text-amber-400 fill-amber-400' : 'text-gray-300'" />
                  </button>
                </div>
              </div>
              <div><label class="label-base">情绪状态</label>
                <select v-model="rf.emotionalState" class="input-base">
                  <option value="stable">稳定（正常交流）</option>
                  <option value="anxious">焦虑（略有担忧）</option>
                  <option value="angry">愤怒（明显不满）</option>
                  <option value="depressed">低落（消极应对）</option>
                </select>
              </div>
              <div><label class="label-base">履行情况</label>
                <select v-model="rf.performanceStatus" class="input-base">
                  <option value="normal">正常履行</option>
                  <option value="delayed">略有延迟</option>
                  <option value="problematic">存在问题</option>
                </select>
              </div>
              <div><label class="label-base">是否有新纠纷</label>
                <select v-model="rf.hasDispute" class="input-base">
                  <option :value="false">无新纠纷</option>
                  <option :value="true">存在新的争议</option>
                </select>
              </div>
            </div>
            <div v-if="rf.hasDispute">
              <label class="label-base">新纠纷说明</label>
              <textarea v-model="rf.disputeDescription" rows="2" class="input-base resize-none" placeholder="请说明新的争议点..."></textarea>
              <div class="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
                ⚠️ 如存在新纠纷，提交后案件将自动升级为"重复投诉"，进入司法所督办范围。
              </div>
            </div>
            <div class="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <label class="label-base !text-rose-700 !font-semibold mb-3">情绪预警标记（网格员回访发现）</label>
              <div class="grid grid-cols-3 gap-3 mb-3">
                <label class="flex items-center space-x-2 p-3 bg-white rounded-lg border cursor-pointer hover:border-rose-300 transition-colors" :class="rf.hasThreat ? 'border-rose-500 bg-rose-50' : 'border-gray-200'">
                  <input type="checkbox" v-model="rf.hasThreat" class="w-4 h-4 text-rose-600" />
                  <div>
                    <p class="text-sm font-medium text-gray-800">⚠️ 威胁言论</p>
                    <p class="text-xs text-gray-500">扬言报复、伤人等</p>
                  </div>
                </label>
                <label class="flex items-center space-x-2 p-3 bg-white rounded-lg border cursor-pointer hover:border-rose-300 transition-colors" :class="rf.hasGathering ? 'border-rose-500 bg-rose-50' : 'border-gray-200'">
                  <input type="checkbox" v-model="rf.hasGathering" class="w-4 h-4 text-rose-600" />
                  <div>
                    <p class="text-sm font-medium text-gray-800">👥 聚集倾向</p>
                    <p class="text-xs text-gray-500">串联他人、围堵等</p>
                  </div>
                </label>
                <label class="flex items-center space-x-2 p-3 bg-white rounded-lg border cursor-pointer hover:border-rose-300 transition-colors" :class="rf.hasVerbalAbuse ? 'border-rose-500 bg-rose-50' : 'border-gray-200'">
                  <input type="checkbox" v-model="rf.hasVerbalAbuse" class="w-4 h-4 text-rose-600" />
                  <div>
                    <p class="text-sm font-medium text-gray-800">💢 持续辱骂</p>
                    <p class="text-xs text-gray-500">人身攻击、谩骂等</p>
                  </div>
                </label>
              </div>
              <div v-if="rf.hasThreat || rf.hasGathering || rf.hasVerbalAbuse">
                <label class="label-base !text-rose-700 text-xs">具体情况描述</label>
                <textarea v-model="rf.emotionWarningDescription" rows="2" class="input-base resize-none !border-rose-200 !focus:border-rose-400" placeholder="请描述情绪预警的具体情况、当事人言行、严重程度..."></textarea>
                <div class="mt-2 p-2 bg-rose-100/50 rounded-lg text-xs text-rose-700">
                  🚨 标记后案件将自动升级为"重点关注"，威胁/聚集类直接触发情绪升级，进入司法所督办。
                </div>
              </div>
            </div>
            <div><label class="label-base">回访记录 <span class="text-red-500">*</span></label>
              <textarea v-model="rf.notes" rows="4" class="input-base resize-none" placeholder="请详细记录回访过程：当事人反馈、当前生活情况、协议履行细节、调解后续建议..." required></textarea>
            </div>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" @click="showResult = null" class="btn-outline">取消</button>
              <button type="submit" class="btn-primary">提交回访结果</button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="showCreate" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showCreate = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-5">新建回访计划</h3>
          <form @submit.prevent="submitCreate" class="space-y-4">
            <div><label class="label-base">关联案件 <span class="text-red-500">*</span></label>
              <select v-model="nf.caseId" class="input-base" required>
                <option v-for="c in closedCases" :key="c.id" :value="c.id">{{ c.caseNo }} - {{ c.title }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="label-base">回访方式</label>
                <select v-model="nf.type" class="input-base">
                  <option value="phone">电话回访</option><option value="home_visit">上门回访</option>
                  <option value="video">视频回访</option><option value="onsite">现场回访</option>
                </select>
              </div>
              <div><label class="label-base">回访时间</label><input v-model="nf.scheduledTime" type="datetime-local" class="input-base" required /></div>
            </div>
            <div><label class="label-base">执行人</label><input :value="store.userName" disabled class="input-base bg-gray-50 text-gray-500" /></div>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" @click="showCreate = false" class="btn-outline">取消</button>
              <button type="submit" class="btn-primary">创建计划</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { CalendarClock, User, Clock, Plus, CheckCircle, MessageSquare, Star, Phone, Home, Video, MapPin, AlertTriangle } from 'lucide-vue-next'
import type { Followup, Case } from '../types'
import { followupApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const list = ref<Followup[]>([])
const cases = ref<Case[]>([])
const fStatus = ref('')
const fType = ref('')
const showResult = ref<Followup | null>(null)
const showCreate = ref(false)

const rf = reactive({ satisfaction: 5, emotionalState: 'stable', performanceStatus: 'normal', hasDispute: false, disputeDescription: '', notes: '', hasThreat: false, hasGathering: false, hasVerbalAbuse: false, emotionWarningDescription: '' })
const nf = reactive({ caseId: '', type: 'phone' as Followup['type'], scheduledTime: dayjs().add(3, 'day').hour(10).minute(0).format('YYYY-MM-DDTHH:mm') })

function stText(s: string) { return { pending: '待回访', completed: '回访完成', overdue: '已逾期', in_progress: '回访中' }[s] || s }
function typeText(t: any) { 
  const typeStr = typeof t === 'string' ? t : (t?.type || String(t))
  const map: Record<string, string> = { phone: '电话回访', home_visit: '上门回访', video: '视频回访', onsite: '现场回访' }
  return map[typeStr] || typeStr
}
function iconByType(t: any) { 
  const typeStr = typeof t === 'string' ? t : (t?.type || 'phone')
  const map: Record<string, any> = { phone: markRaw(Phone), home_visit: markRaw(Home), video: markRaw(Video), onsite: markRaw(MapPin) }
  return map[typeStr] || CalendarClock 
}
function emo(v: string) { return { stable: ['稳定', 'text-green-600'], anxious: ['焦虑', 'text-amber-600'], angry: ['愤怒', 'text-red-600'], depressed: ['低落', 'text-blue-600'] } as any[v] }
function perf(v: string) { return { normal: ['正常', 'text-green-600'], delayed: ['延迟', 'text-amber-600'], problematic: ['有问题', 'text-red-600'] } as any[v] }

const stats = computed(() => [
  { label: '回访计划', value: list.value.length, icon: markRaw(CalendarClock), bg: 'bg-primary-50', color: 'text-primary-600', iconColor: 'text-primary-500' },
  { label: '待回访', value: list.value.filter(f => f.status === 'pending').length, icon: markRaw(Clock), bg: 'bg-amber-50', color: 'text-amber-600', iconColor: 'text-amber-500' },
  { label: '已完成', value: list.value.filter(f => f.status === 'completed').length, icon: markRaw(CheckCircle), bg: 'bg-green-50', color: 'text-green-600', iconColor: 'text-green-500' },
  { label: '已逾期', value: list.value.filter(f => f.status === 'overdue').length, icon: markRaw(AlertTriangle), bg: 'bg-red-50', color: 'text-red-600', iconColor: 'text-red-500' }
])

const closedCases = computed(() => cases.value.filter(c => ['fulfillment_start', 'fulfillment_completed', 'followup_pending', 'agreement_signed'].includes(c.status)))
const filtered = computed(() => list.value.filter(f => {
  if (fStatus.value && f.status !== fStatus.value) return false
  if (fType.value && f.type !== fType.value) return false
  return true
}))

function findCase(id: string) { return cases.value.find(c => c.id === id) }
function goCase(id: string) { router.push(`/case/${id}`) }

function openResult(f: Followup) {
  showResult.value = f
  rf.satisfaction = 5; rf.emotionalState = 'stable'; rf.performanceStatus = 'normal'
  rf.hasDispute = false; rf.disputeDescription = ''; rf.notes = ''
  rf.hasThreat = false; rf.hasGathering = false; rf.hasVerbalAbuse = false; rf.emotionWarningDescription = ''
}
async function submitResult() {
  if (!showResult.value) return
  await followupApi.complete(showResult.value.id, {
    satisfaction: rf.satisfaction, emotionalState: rf.emotionalState as any,
    performanceStatus: rf.performanceStatus as any, hasDispute: rf.hasDispute,
    disputeDescription: rf.disputeDescription || undefined, notes: rf.notes,
    recordTime: dayjs().format(),
    hasThreat: rf.hasThreat, hasGathering: rf.hasGathering, hasVerbalAbuse: rf.hasVerbalAbuse,
    emotionWarningDescription: rf.emotionWarningDescription || undefined
  })
  showResult.value = null
  list.value = await followupApi.list()
  cases.value = await caseApi.list()
}

function openCreate() {
  nf.caseId = closedCases.value[0]?.id || ''
  nf.type = 'phone'
  nf.scheduledTime = dayjs().add(3, 'day').hour(10).minute(0).format('YYYY-MM-DDTHH:mm')
  showCreate.value = true
}
async function submitCreate() {
  if (!nf.caseId) return
  await followupApi.create({
    caseId: nf.caseId, type: nf.type,
    scheduledTime: nf.scheduledTime,
    handlerId: store.currentUser?.id, handlerName: store.userName
  })
  showCreate.value = false
  list.value = await followupApi.list()
}
function escalate(f: Followup) {
  alert('督办通知：\n回访 "' + typeText(f.type) + '" 已逾期，建议：\n1. 指派专人上门落实情况\n2. 联系当事人确认情况\n3. 必要时联合司法所督办')
  void f
}

onMounted(async () => { list.value = await followupApi.list(); cases.value = await caseApi.list() })
</script>
