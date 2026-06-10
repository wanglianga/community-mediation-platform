<template>
  <div class="space-y-6">
    <div class="card !p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <select v-model="filterCase" class="input-base !w-72">
          <option value="">全部案件会议</option>
          <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.caseNo }} - {{ c.title }}</option>
        </select>
        <select v-model="filterStatus" class="input-base !w-36">
          <option value="">全部状态</option>
          <option value="scheduled">已排期</option>
          <option value="confirmed">已确认</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="refused">参会人拒绝</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
      <button @click="openCreate" v-if="store.canMediate" class="btn-primary"><Plus class="w-4 h-4 mr-1.5" />安排新会议</button>
    </div>
    <div v-if="!list.length" class="card text-center py-16 text-gray-400">暂无调解会议记录</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="m in filteredList" :key="m.id" class="card hover:shadow-md transition-all">
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="badge" :class="statusCls(m.status)">{{ statusText(m.status) }}</span>
            <h3 class="font-bold text-gray-800 mt-2 text-lg">{{ m.title }}</h3>
            <p class="text-xs text-gray-500 mt-1">案件：{{ findCase(m.caseId)?.title || '—' }}</p>
          </div>
          <div class="flex items-start space-x-2">
            <button v-if="m.status === 'scheduled' || m.status === 'confirmed'" @click="openComplete(m.id)" class="btn-success !py-1.5 !px-3 text-xs"><Check class="w-3 h-3 mr-1" />记录结果</button>
            <button v-if="m.status === 'scheduled' || m.status === 'confirmed'" @click="openAddParticipant(m.id)" class="btn-outline !py-1.5 !px-3 text-xs"><UserPlus class="w-3 h-3 mr-1" />追加参会方</button>
            <button @click="edit(m.id)" class="btn-outline !py-1.5 !px-3 text-xs">编辑</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
          <span class="text-gray-600 flex items-center"><Calendar class="w-4 h-4 mr-2 text-gray-400" />{{ dayjs(m.scheduleTime).format('YYYY-MM-DD HH:mm') }}</span>
          <span class="text-gray-600 flex items-center"><MapPin class="w-4 h-4 mr-2 text-gray-400" />{{ m.location }}</span>
          <span class="text-gray-600 flex items-center"><User class="w-4 h-4 mr-2 text-gray-400" />调解员：{{ m.mediatorName }}</span>
          <span class="text-gray-600 flex items-center"><Users class="w-4 h-4 mr-2 text-gray-400" />参会：{{ m.participants.length }}人</span>
        </div>
        <div v-if="m.requirements.length" class="mb-4">
          <p class="text-xs font-semibold text-gray-600 mb-2 flex items-center"><FileText class="w-3.5 h-3.5 mr-1.5" />诉求/需准备材料</p>
          <ul class="list-disc list-inside text-sm text-gray-700 space-y-1 pl-2"><li v-for="r in m.requirements" :key="r">{{ r }}</li></ul>
        </div>
        <div v-if="m.evidenceMaterials.length" class="mb-4">
          <p class="text-xs font-semibold text-gray-600 mb-2 flex items-center"><Paperclip class="w-3.5 h-3.5 mr-1.5" />证据材料</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="e in m.evidenceMaterials" :key="e.id" class="inline-flex items-center px-2.5 py-1 bg-gray-50 rounded-md text-xs text-gray-700 border border-gray-100"><FileText class="w-3 h-3 mr-1 text-primary-500" />{{ e.name }}</span>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-600 mb-2 flex items-center"><Users class="w-3.5 h-3.5 mr-1.5" />参会人员状态</p>
          <div class="space-y-2">
            <div v-for="p in m.participants" :key="p.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-800">{{ p.name }}</span>
                  <span class="text-xs text-gray-400">{{ p.role }}</span>
                  <span v-if="p.participantType" class="badge text-[10px]" :class="participantTypeBadge(p.participantType)">{{ participantTypeText(p.participantType) }}</span>
                  <span v-if="p.isKeyParty" class="badge bg-red-100 text-red-600 text-[10px]">⭐ 关键方</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="badge text-xs" :class="p.status === 'attended' ? 'bg-green-100 text-green-700' : p.status === 'refused' ? 'bg-red-100 text-red-700' : p.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : p.status === 'absent' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'">{{ pStatus(p.status) }}</span>
                  <div class="flex items-center space-x-1">
                    <button v-if="(m.status === 'scheduled' || m.status === 'confirmed') && p.status !== 'refused'" @click="openRefuse(m.id, p.id)" class="text-xs text-red-500 hover:text-red-600">拒</button>
                    <button v-if="(m.status === 'scheduled' || m.status === 'confirmed') && p.status === 'absent'" @click="openAbsent(m.id, p.id)" class="text-xs text-orange-500 hover:text-orange-600">原因</button>
                    <button v-if="(m.status === 'scheduled' || m.status === 'confirmed') && p.status !== 'attended'" @click="openEditParticipant(m.id, p)" class="text-xs text-primary-500 hover:text-primary-600">编辑</button>
                    <button v-if="(m.status === 'scheduled' || m.status === 'confirmed') && !p.isKeyParty" @click="removeParticipant(m.id, p.id)" class="text-xs text-gray-400 hover:text-gray-600">×</button>
                  </div>
                </div>
              </div>
              <div v-if="p.phone" class="text-xs text-gray-500 mt-1">📞 {{ p.phone }}</div>
              <div v-if="p.claims" class="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-gray-100">
                <span class="text-gray-400">诉求：</span>{{ p.claims }}
              </div>
              <div v-if="p.absentReason" class="text-xs text-orange-600 mt-1 p-2 bg-orange-50 rounded border border-orange-100">
                <span>缺席原因：</span>{{ p.absentReason }}
              </div>
              <div v-if="p.refusalReason" class="text-xs text-red-600 mt-1 p-2 bg-red-50 rounded border border-red-100">
                <span>拒绝原因：</span>{{ p.refusalReason }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="m.minutes" class="mt-4 p-4 bg-primary-50/30 rounded-xl border border-primary-100">
          <p class="text-xs font-semibold text-primary-700 mb-2">📝 调解记录</p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ m.minutes }}</p>
          <p v-if="m.resolution" class="mt-2 text-sm font-medium text-green-700">✓ {{ m.resolution }}</p>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-5">{{ modalTitle }}</h3>
          <form @submit.prevent="submitModal" class="space-y-4">
            <template v-if="modalMode === 'create' || modalMode === 'edit'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2"><label class="label-base">关联案件 <span class="text-red-500">*</span></label>
                  <select v-model="mf.caseId" class="input-base" required @change="onCaseChange">
                    <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.caseNo }} - {{ c.title }}</option>
                  </select>
                </div>
                <div class="md:col-span-2"><label class="label-base">会议标题 <span class="text-red-500">*</span></label><input v-model="mf.title" class="input-base" required /></div>
                <div><label class="label-base">会议时间 <span class="text-red-500">*</span></label><input v-model="mf.scheduleTime" type="datetime-local" class="input-base" required /></div>
                <div><label class="label-base">会议地点 <span class="text-red-500">*</span></label><input v-model="mf.location" class="input-base" required /></div>
              </div>
              <div><label class="label-base">参会人员</label>
                <div class="space-y-2">
                  <div v-for="(p, i) in mf.participants" :key="i" class="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div class="flex gap-2 items-center flex-wrap">
                      <input v-model="p.name" class="input-base !w-28" placeholder="姓名*" />
                      <input v-model="p.role" class="input-base !w-24" placeholder="角色" />
                      <input v-model="p.phone" class="input-base !w-28" placeholder="电话" />
                      <select v-model="p.participantType" class="input-base !w-28">
                        <option value="">参与方类型</option>
                        <option value="plaintiff">申请人</option>
                        <option value="defendant">被申请人</option>
                        <option value="third_party">第三方</option>
                        <option value="property">物业</option>
                        <option value="committee">业委会</option>
                        <option value="relative">亲属</option>
                        <option value="other">其他</option>
                      </select>
                      <select v-model="p.status" class="input-base !w-20">
                        <option value="invited">邀请中</option>
                        <option value="confirmed">已确认</option>
                        <option value="attended">已参会</option>
                        <option value="absent">缺席</option>
                        <option value="refused">拒绝</option>
                      </select>
                      <label class="flex items-center text-xs text-gray-600">
                        <input type="checkbox" v-model="p.isKeyParty" class="mr-1" />关键方
                      </label>
                      <button v-if="mf.participants.length > 1" type="button" @click="mf.participants.splice(i,1)" class="text-red-500 hover:text-red-600 text-lg">×</button>
                    </div>
                    <textarea v-model="p.claims" rows="2" class="input-base resize-none text-sm" placeholder="该方诉求（可选）"></textarea>
                  </div>
                  <button type="button" @click="mf.participants.push({id:'',name:'',role:'',phone:'',status:'invited',participantType:'',isKeyParty:false,claims:''})" class="btn-outline text-xs !w-full !py-1.5 border-dashed">+ 添加参会人</button>
                </div>
              </div>
              <div><label class="label-base">诉求/需准备材料（每行一条）</label><textarea v-model="reqText" rows="3" class="input-base resize-none" placeholder="例如：&#10;1. 提供身份证复印件&#10;2. 携带证据原件"></textarea></div>
            </template>
            <template v-if="modalMode === 'complete'">
              <div v-if="keyCheckResult && !keyCheckResult.allAttended" class="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                <p class="text-sm font-semibold text-red-700 mb-2">⚠️ 关键方缺席提醒</p>
                <ul class="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li v-for="mp in keyCheckResult.missingKeyParties" :key="mp.id">
                    {{ mp.name }}（{{ mp.role }}）- 状态：{{ pStatus(mp.status) }}
                    <span v-if="mp.absentReason">，原因：{{ mp.absentReason }}</span>
                  </li>
                </ul>
                <label class="flex items-center mt-3 text-sm text-red-700">
                  <input type="checkbox" v-model="mf.forceComplete" class="mr-2" />
                  我已确认关键方缺席情况，仍要强制生成最终协议
                </label>
              </div>
              <div><label class="label-base">调解过程记录 <span class="text-red-500">*</span></label><textarea v-model="mf.minutes" rows="6" class="input-base resize-none" placeholder="记录双方陈述、争论焦点、调解员介入过程等..." required></textarea></div>
              <div><label class="label-base">达成共识/处理结果 <span class="text-red-500">*</span></label><textarea v-model="mf.resolution" rows="3" class="input-base resize-none" placeholder="本次会议达成的一致意见或下一步安排..." required></textarea></div>
            </template>
            <template v-if="modalMode === 'refuse'">
              <div><label class="label-base">拒绝参会原因 <span class="text-red-500">*</span></label><textarea v-model="mf.refuseReason" rows="4" class="input-base resize-none" placeholder="记录参会人拒绝的原因，如因病、出差、情绪抵触等..." required></textarea>
                <div class="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
                  ⚠️ 记录拒绝后，案件状态将转为"拒绝参会"，多次拒绝参会将升级案件风险等级。
                </div>
              </div>
            </template>
            <template v-if="modalMode === 'absent'">
              <div><label class="label-base">缺席原因 <span class="text-red-500">*</span></label><textarea v-model="mf.absentReason" rows="4" class="input-base resize-none" placeholder="记录参会人缺席的原因..." required></textarea></div>
            </template>
            <template v-if="modalMode === 'addParticipant'">
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div><label class="label-base">姓名 <span class="text-red-500">*</span></label><input v-model="newParticipant.name" class="input-base" placeholder="如：物业王经理" required /></div>
                  <div><label class="label-base">联系电话</label><input v-model="newParticipant.phone" class="input-base" placeholder="手机号" /></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div><label class="label-base">身份角色</label><input v-model="newParticipant.role" class="input-base" placeholder="如：物业代表" /></div>
                  <div>
                    <label class="label-base">参会方类型 <span class="text-red-500">*</span></label>
                    <select v-model="newParticipant.participantType" class="input-base" required>
                      <option value="">请选择</option>
                      <option value="property">物业方</option>
                      <option value="committee">业委会</option>
                      <option value="relative">当事人亲属</option>
                      <option value="plaintiff">申请人</option>
                      <option value="defendant">被申请人</option>
                      <option value="third_party">第三方</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>
                <label class="flex items-center text-sm text-gray-700">
                  <input type="checkbox" v-model="newParticipant.isKeyParty" class="mr-2" />
                  标记为关键方（缺席将影响生成最终协议）
                </label>
                <div><label class="label-base">该方诉求（可选）</label><textarea v-model="newParticipant.claims" rows="3" class="input-base resize-none" placeholder="记录该参会方的诉求或意见..."></textarea></div>
                <div>
                  <label class="label-base">参会状态</label>
                  <select v-model="newParticipant.status" class="input-base">
                    <option value="invited">邀请中</option>
                    <option value="confirmed">已确认</option>
                    <option value="attended">已参会</option>
                  </select>
                </div>
              </div>
            </template>
            <template v-if="modalMode === 'editParticipant'">
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div><label class="label-base">姓名</label><input v-model="editParticipantData.name" class="input-base" /></div>
                  <div><label class="label-base">联系电话</label><input v-model="editParticipantData.phone" class="input-base" /></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div><label class="label-base">身份角色</label><input v-model="editParticipantData.role" class="input-base" /></div>
                  <div>
                    <label class="label-base">参会方类型</label>
                    <select v-model="editParticipantData.participantType" class="input-base">
                      <option value="">请选择</option>
                      <option value="property">物业方</option>
                      <option value="committee">业委会</option>
                      <option value="relative">当事人亲属</option>
                      <option value="plaintiff">申请人</option>
                      <option value="defendant">被申请人</option>
                      <option value="third_party">第三方</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>
                <label class="flex items-center text-sm text-gray-700">
                  <input type="checkbox" v-model="editParticipantData.isKeyParty" class="mr-2" />
                  标记为关键方（缺席将影响生成最终协议）
                </label>
                <div><label class="label-base">该方诉求</label><textarea v-model="editParticipantData.claims" rows="3" class="input-base resize-none"></textarea></div>
                <div>
                  <label class="label-base">参会状态</label>
                  <select v-model="editParticipantData.status" class="input-base">
                    <option value="invited">邀请中</option>
                    <option value="confirmed">已确认</option>
                    <option value="attended">已参会</option>
                    <option value="absent">缺席</option>
                    <option value="refused">拒绝</option>
                  </select>
                </div>
                <div v-if="editParticipantData.status === 'absent'">
                  <label class="label-base">缺席原因</label>
                  <textarea v-model="editParticipantData.absentReason" rows="2" class="input-base resize-none"></textarea>
                </div>
              </div>
            </template>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" @click="showModal = false" class="btn-outline">取消</button>
              <button type="submit" class="btn-primary">确认{{ modalMode === 'create' ? '创建' : modalMode === 'complete' ? '提交' : modalMode === 'refuse' ? '记录' : modalMode === 'absent' ? '记录原因' : modalMode === 'addParticipant' ? '追加' : modalMode === 'editParticipant' ? '保存' : '保存' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Plus, Calendar, MapPin, User, Users, FileText, Paperclip, Check, UserPlus } from 'lucide-vue-next'
import type { Meeting, Case, ParticipantType } from '../types'
import { meetingApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const list = ref<Meeting[]>([])
const cases = ref<Case[]>([])
const filterCase = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'complete' | 'refuse' | 'absent' | 'addParticipant' | 'editParticipant'>('create')
const targetId = ref('')
const targetPid = ref('')
const reqText = ref('')
const keyCheckResult = ref<any>(null)

const mf = reactive({
  caseId: '', title: '', scheduleTime: '', location: '',
  participants: [] as any[], minutes: '', resolution: '',
  refuseReason: '', absentReason: '', forceComplete: false
})

const newParticipant = reactive({
  name: '', role: '', phone: '', claims: '',
  participantType: '' as ParticipantType | '', isKeyParty: false, status: 'invited'
})

const editParticipantData = reactive({
  id: '', name: '', role: '', phone: '', claims: '', absentReason: '',
  participantType: '' as ParticipantType | '', isKeyParty: false, status: 'invited'
})

const modalTitle = computed(() => ({
  create: '安排调解会议',
  edit: '编辑会议',
  complete: '记录调解结果',
  refuse: '记录拒绝原因',
  absent: '记录缺席原因',
  addParticipant: '追加参会方',
  editParticipant: '编辑参会方信息'
} as any)[modalMode.value] || '')

function statusText(s: string) { return { scheduled: '已排期', confirmed: '已确认', in_progress: '进行中', completed: '已完成', cancelled: '已取消', refused: '参会人拒绝' }[s] || s }
function statusCls(s: string) { return { scheduled: 'status-pending', confirmed: 'bg-blue-100 text-blue-700', in_progress: 'status-progress', completed: 'status-completed', cancelled: 'status-rejected', refused: 'bg-red-100 text-red-700' }[s] || '' }
function pStatus(s: string) { return { invited: '待确认', confirmed: '已确认', refused: '拒绝', attended: '已参会', absent: '缺席' }[s] || s }
function participantTypeText(t: string) {
  return { plaintiff: '申请人', defendant: '被申请人', third_party: '第三方', property: '物业', committee: '业委会', relative: '亲属', other: '其他' }[t] || t
}
function participantTypeBadge(t: string) {
  return {
    property: 'bg-purple-100 text-purple-700',
    committee: 'bg-indigo-100 text-indigo-700',
    relative: 'bg-pink-100 text-pink-700',
    plaintiff: 'bg-green-100 text-green-700',
    defendant: 'bg-orange-100 text-orange-700',
    third_party: 'bg-cyan-100 text-cyan-700',
    other: 'bg-gray-100 text-gray-700'
  }[t] || 'bg-gray-100 text-gray-700'
}

const filteredList = computed(() => list.value.filter(m => {
  if (filterCase.value && m.caseId !== filterCase.value) return false
  if (filterStatus.value && m.status !== filterStatus.value) return false
  return true
}))

function findCase(id: string) { return cases.value.find(c => c.id === id) }
function onCaseChange() {
  const c = cases.value.find(x => x.id === mf.caseId)
  if (c) {
    mf.title = `${c.title} - 调解会议`
    mf.participants = c.parties.map((p: any) => ({
      id: p.id, name: p.name, role: p.role === 'plaintiff' ? '申请人' : p.role === 'defendant' ? '被申请人' : '第三方',
      status: 'invited', participantType: p.role, isKeyParty: true, claims: '', phone: p.phone
    }))
  }
}

function openCreate() {
  Object.assign(mf, { caseId: cases.value[0]?.id || '', title: '', scheduleTime: dayjs().add(1, 'day').hour(14).minute(0).format('YYYY-MM-DDTHH:mm'), location: '街道调解中心', participants: [], minutes: '', resolution: '', refuseReason: '', absentReason: '', forceComplete: false })
  reqText.value = ''; modalMode.value = 'create'; showModal.value = true
  onCaseChange()
}
function edit(id: string) {
  const m = list.value.find(x => x.id === id); if (!m) return
  Object.assign(mf, { caseId: m.caseId, title: m.title, scheduleTime: dayjs(m.scheduleTime).format('YYYY-MM-DDTHH:mm'), location: m.location, participants: m.participants.map(p => ({ ...p })), minutes: m.minutes || '', resolution: m.resolution || '', refuseReason: '', absentReason: '', forceComplete: false })
  reqText.value = m.requirements.join('\n'); modalMode.value = 'edit'; targetId.value = id; showModal.value = true
}
async function openComplete(id: string) {
  targetId.value = id
  Object.assign(mf, { minutes: '', resolution: '', refuseReason: '', absentReason: '', forceComplete: false })
  keyCheckResult.value = await meetingApi.checkKeyParties(id)
  modalMode.value = 'complete'; showModal.value = true
}
function openRefuse(mid: string, pid: string) { targetId.value = mid; targetPid.value = pid; Object.assign(mf, { refuseReason: '' }); modalMode.value = 'refuse'; showModal.value = true }
function openAbsent(mid: string, pid: string) { targetId.value = mid; targetPid.value = pid; Object.assign(mf, { absentReason: '' }); modalMode.value = 'absent'; showModal.value = true }
function openAddParticipant(mid: string) {
  targetId.value = mid
  Object.assign(newParticipant, { name: '', role: '', phone: '', claims: '', participantType: '', isKeyParty: false, status: 'invited' })
  modalMode.value = 'addParticipant'; showModal.value = true
}
function openEditParticipant(mid: string, p: any) {
  targetId.value = mid
  Object.assign(editParticipantData, {
    id: p.id, name: p.name, role: p.role, phone: p.phone || '', claims: p.claims || '',
    absentReason: p.absentReason || '', participantType: p.participantType || '',
    isKeyParty: !!p.isKeyParty, status: p.status
  })
  modalMode.value = 'editParticipant'; showModal.value = true
}
async function removeParticipant(mid: string, pid: string) {
  if (!confirm('确定移除此参会方？')) return
  await meetingApi.removeParticipant(mid, pid)
  await refreshList()
}

async function submitModal() {
  try {
    if (modalMode.value === 'create') {
      await meetingApi.create({ ...mf, requirements: reqText.value.split('\n').map(x => x.trim()).filter(Boolean) })
    } else if (modalMode.value === 'edit') {
      await meetingApi.update(targetId.value, { ...mf, requirements: reqText.value.split('\n').map(x => x.trim()).filter(Boolean) })
    } else if (modalMode.value === 'complete') {
      await meetingApi.complete(targetId.value, { minutes: mf.minutes, resolution: mf.resolution, forceComplete: mf.forceComplete })
    } else if (modalMode.value === 'refuse') {
      await meetingApi.recordRefusal(targetId.value, targetPid.value, mf.refuseReason)
    } else if (modalMode.value === 'absent') {
      await meetingApi.recordAbsent(targetId.value, targetPid.value, mf.absentReason)
    } else if (modalMode.value === 'addParticipant') {
      await meetingApi.addParticipant(targetId.value, { ...newParticipant })
    } else if (modalMode.value === 'editParticipant') {
      const { id, ...rest } = editParticipantData
      await meetingApi.updateParticipant(targetId.value, id, rest)
    }
    showModal.value = false
    await refreshList()
  } catch (e: any) {
    alert(e.message || '操作失败')
  }
}

async function refreshList() {
  list.value = filterCase.value ? await meetingApi.list(filterCase.value) : await meetingApi.list()
  cases.value = await caseApi.list()
}

onMounted(async () => { await refreshList() })
</script>
