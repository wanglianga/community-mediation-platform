<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="s in summary" :key="s.label" class="card !p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ s.label }}</p>
          <p class="text-3xl font-bold mt-2" :class="s.color">{{ s.value }}</p>
        </div>
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="s.bg">
          <component :is="s.icon" class="w-7 h-7" :class="s.iconColor" />
        </div>
      </div>
    </div>
    <div class="card !p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <select v-model="fStatus" class="input-base !w-36">
          <option value="">全部状态</option>
          <option value="pending">待开始</option>
          <option value="in_progress">履行中</option>
          <option value="completed">已完成</option>
          <option value="overdue">已逾期</option>
          <option value="violated">违约</option>
        </select>
        <select v-model="fRisk" class="input-base !w-32">
          <option value="">全部风险</option>
          <option value="high">高风险</option>
          <option value="normal">常规</option>
        </select>
      </div>
      <div class="flex items-center text-sm text-gray-500">
        <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>正常
        <span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5 ml-4"></span>即将到期
        <span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 ml-4"></span>已逾期
      </div>
    </div>
    <div class="space-y-5">
      <div v-for="item in filteredList" :key="item.agreement.id" class="card" :class="item.hasOverdue ? 'border-l-4 border-l-red-500' : ''">
        <div class="flex items-start justify-between mb-5">
          <div class="flex items-start space-x-4 flex-1 min-w-0">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shrink-0 shadow-lg"><ClipboardCheck class="w-8 h-8" /></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center flex-wrap gap-2 mb-2">
                <span class="font-mono text-xs text-gray-400">{{ item.case?.caseNo }}</span>
                <span v-if="item.hasOverdue" class="badge bg-red-100 text-red-700">⚠️ 存在逾期</span>
                <span v-if="!item.hasOverdue && item.completeRate >= 1" class="badge status-completed">全部完成</span>
                <span v-else-if="!item.hasOverdue && item.completeRate > 0" class="badge status-progress">部分完成</span>
                <span v-else class="badge status-pending">待开始履行</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-1">{{ item.agreement.title }}</h3>
              <p class="text-sm text-gray-500">{{ item.case?.title }}</p>
              <div class="flex items-center gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                <span>📄 协议：{{ item.agreement.id }}</span>
                <span v-if="item.agreement.effectiveTime">生效：{{ dayjs(item.agreement.effectiveTime).format('YYYY-MM-DD') }}</span>
                <span>当事人：{{ item.agreement.signatures.length }} 方</span>
              </div>
            </div>
          </div>
          <div class="ml-4 shrink-0 text-center">
            <p class="text-xs text-gray-500 mb-1">总体完成率</p>
            <div class="relative w-20 h-20">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#f1f5f9" stroke-width="3"/>
                <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" :stroke="item.hasOverdue ? '#ef4444' : '#10b981'" stroke-width="3" stroke-linecap="round" :stroke-dasharray="`${item.completeRate * 100}, 100`"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold" :class="item.hasOverdue ? 'text-red-600' : 'text-gray-800'">{{ Math.round(item.completeRate * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-5">
          <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center"><FileText class="w-4 h-4 mr-2 text-primary-500" />履行节点进度</h4>
          <div class="space-y-3">
            <div v-for="n in item.nodes" :key="n.id" class="p-4 rounded-xl border transition-all" :class="n.status === 'completed' ? 'bg-green-50/50 border-green-100' : n.status === 'overdue' || n.status === 'violated' ? 'bg-red-50/50 border-red-100' : n.status === 'in_progress' ? 'bg-primary-50/50 border-primary-100' : 'bg-gray-50/50 border-gray-100'">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center flex-wrap gap-2 mb-1">
                    <span class="badge text-xs" :class="n.status === 'completed' ? 'status-completed' : n.status === 'overdue' ? 'status-overdue' : n.status === 'violated' ? 'bg-red-200 text-red-800' : n.status === 'in_progress' ? 'status-progress' : 'status-pending'">
                      {{ fs(n.status) }}
                    </span>
                    <span v-if="isNearDeadline(n) && n.status !== 'completed'" class="badge bg-amber-100 text-amber-700 text-xs">⏰ 即将到期</span>
                  </div>
                  <h5 class="font-semibold text-gray-800 text-sm mt-1">{{ n.nodeName }}</h5>
                  <p class="text-sm text-gray-600 mt-0.5">{{ n.description }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    <span>👤 责任方：{{ n.responsibleParty }}</span>
                    <span>📅 截止：{{ dayjs(n.deadline).format('YYYY-MM-DD') }}</span>
                    <span v-if="n.completeTime">✅ 完成：{{ dayjs(n.completeTime).format('YYYY-MM-DD') }}</span>
                    <span v-if="n.status === 'overdue'">⏳ 逾期：{{ daysOverdue(n.deadline) }} 天</span>
                  </div>
                  <p v-if="n.remarks" class="text-xs mt-2 p-2 rounded-lg" :class="n.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'">📝 {{ n.remarks }}</p>
                </div>
                <div class="flex flex-col space-y-2 shrink-0">
                  <button v-if="n.status !== 'completed' && store.canMediate" @click="openComplete(item.agreement.id, n)" class="btn-success !py-1.5 !px-3 text-xs whitespace-nowrap"><Check class="w-3 h-3 mr-1" />确认完成</button>
                  <button v-if="(n.status === 'overdue' || n.status === 'violated') && store.canSupervise" @click="alert(n)" class="btn-danger !py-1.5 !px-3 text-xs whitespace-nowrap"><AlertTriangle class="w-3 h-3 mr-1" />督办</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
          <button v-if="item.case" @click="goCase(item.case!.id)" class="btn-outline !py-1.5 text-xs">查看案件详情</button>
          <button v-if="store.canMediate" @click="createFollowup(item)" class="btn-primary !py-1.5 text-xs"><CalendarClock class="w-3 h-3 mr-1" />发起回访</button>
        </div>
      </div>
      <div v-if="!filteredList.length" class="card text-center py-16 text-gray-400">暂无履行中协议</div>
    </div>
    <Teleport to="body">
      <div v-if="showComplete" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showComplete = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">确认履行节点完成</h3>
          <div class="p-4 bg-gray-50 rounded-xl mb-4">
            <p class="text-sm font-semibold text-gray-700 mb-1">{{ showComplete.nodeName }}</p>
            <p class="text-xs text-gray-500">{{ showComplete.description }}</p>
            <p class="text-xs text-gray-500 mt-1">责任方：{{ showComplete.responsibleParty }}</p>
          </div>
          <div class="space-y-4">
            <div><label class="label-base">完成情况说明</label><textarea v-model="cf.remarks" rows="3" class="input-base resize-none" placeholder="简述履行情况..."></textarea></div>
            <div>
              <label class="label-base block mb-2">上传凭证（可选）</label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center text-sm text-gray-500 hover:border-primary-400 hover:bg-primary-50/20 cursor-pointer">
                <Upload class="w-6 h-6 mx-auto mb-1 text-gray-400" />
                点击上传凭证照片/转账截图
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="showComplete = null" class="btn-outline">取消</button>
            <button @click="submitComplete" class="btn-success">确认完成</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, reactive } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ClipboardCheck, FileText, Check, AlertTriangle, CalendarClock, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-vue-next'
import type { FulfillmentNode, Agreement } from '../types'
import { agreementApi, followupApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const list = ref<any[]>([])
const fStatus = ref('')
const fRisk = ref('')
const showComplete = ref<FulfillmentNode | null>(null)
const cf = reactive({ remarks: '' })

function fs(s: string) { return { pending: '待开始', in_progress: '履行中', completed: '已完成', overdue: '已逾期', violated: '违约' }[s] || s }
function isNearDeadline(n: FulfillmentNode) { const d = dayjs(n.deadline); return dayjs().isAfter(d.subtract(3, 'day')) && dayjs().isBefore(d) }
function daysOverdue(d: string) { return dayjs().diff(dayjs(d), 'day') }

const summary = computed(() => {
  let total = 0, pending = 0, progress = 0, done = 0, overdue = 0
  list.value.forEach(it => {
    total++
    it.nodes.forEach((n: FulfillmentNode) => {
      if (n.status === 'pending') pending++
      if (n.status === 'in_progress') progress++
      if (n.status === 'completed') done++
      if (n.status === 'overdue' || n.status === 'violated') overdue++
    })
  })
  return [
    { label: '生效协议', value: total, icon: markRaw(ClipboardCheck), bg: 'bg-primary-50', color: 'text-primary-600', iconColor: 'text-primary-500' },
    { label: '待履行节点', value: pending, icon: markRaw(Clock), bg: 'bg-gray-100', color: 'text-gray-700', iconColor: 'text-gray-600' },
    { label: '履行完成', value: done, icon: markRaw(CheckCircle), bg: 'bg-green-50', color: 'text-green-600', iconColor: 'text-green-500' },
    { label: '逾期/违约', value: overdue, icon: markRaw(AlertCircle), bg: 'bg-red-50', color: 'text-red-600', iconColor: 'text-red-500' }
  ]
})

const filteredList = computed(() => list.value.filter((it: any) => {
  if (fStatus.value) {
    if (!it.nodes.some((n: FulfillmentNode) => n.status === fStatus.value)) return false
  }
  if (fRisk.value === 'high' && !it.hasOverdue) return false
  if (fRisk.value === 'normal' && it.hasOverdue) return false
  return true
}))

function openComplete(aid: string, n: FulfillmentNode) {
  showComplete.value = n
  cf.remarks = ''
  void aid
}
async function submitComplete() {
  if (!showComplete.value) return
  await agreementApi.updateFulfillmentNode(showComplete.value.id, { status: 'completed', remarks: cf.remarks })
  showComplete.value = null
  list.value = await agreementApi.getFulfillmentList()
}
function alert(n: FulfillmentNode) { alert('督办提醒：节点"' + n.nodeName + '"已逾期，需联系司法所介入') }
function goCase(id: string) { router.push(`/case/${id}`) }
async function createFollowup(item: any) {
  if (!item.case) return
  await followupApi.create({
    caseId: item.case.id, agreementId: item.agreement.id,
    type: 'phone', scheduledTime: dayjs().add(3, 'day').hour(10).minute(0).format(),
    handlerId: store.currentUser?.id, handlerName: store.userName
  })
  router.push('/followup')
}

onMounted(async () => { list.value = await agreementApi.getFulfillmentList() })
</script>
