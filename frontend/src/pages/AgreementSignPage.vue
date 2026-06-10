<template>
  <div class="space-y-6">
    <div class="card !p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <select v-model="filter" class="input-base !w-48">
          <option value="">全部协议</option>
          <option value="pending_sign">待签署</option>
          <option value="partially_signed">部分签署</option>
          <option value="effective">已生效</option>
          <option value="rejected">已拒绝</option>
        </select>
        <select v-model="fCase" class="input-base !w-64"><option value="">全部案件</option><option v-for="c in cases" :key="c.id" :value="c.id">{{ c.caseNo }} - {{ c.title }}</option></select>
      </div>
      <button @click="openDraft" v-if="store.canMediate" class="btn-primary"><Plus class="w-4 h-4 mr-1.5" />草拟新协议</button>
    </div>
    <div v-if="!list.length" class="card text-center py-16 text-gray-400">暂无调解协议</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="a in filtered" :key="a.id" class="card hover:shadow-md transition-all">
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="badge" :class="cls(a.status)">{{ txt(a.status) }}</span>
            <h3 class="font-bold text-gray-800 mt-2 text-lg">{{ a.title }}</h3>
            <p class="text-xs text-gray-500 mt-1 font-mono">{{ a.caseNo }} - {{ a.caseTitle }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="openDetail(a)" class="btn-outline !py-1.5 !px-3 text-xs">查看详情</button>
          </div>
        </div>
        <div class="mb-4">
          <p class="text-xs font-semibold text-gray-600 mb-3">📋 协议条款（{{ a.terms.length }}条）</p>
          <div class="space-y-2">
            <div v-for="t in a.terms.slice(0, 3)" :key="t.id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">{{ t.order }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 line-clamp-2">{{ t.content }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>负责：{{ t.partyResponsible }}</span><span v-if="t.deadline">期限：{{ t.deadline }}</span>
                </div>
              </div>
            </div>
            <div v-if="a.terms.length > 3" class="text-xs text-gray-500 text-center py-1">... 还有 {{ a.terms.length - 3 }} 条条款</div>
          </div>
        </div>
        <div v-if="a.supplementaryNotes" class="mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-100">
          <span class="font-semibold">补充说明：</span>{{ a.supplementaryNotes }}
        </div>
        <div class="pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold text-gray-600">✍️ 签署状态</p>
            <span class="text-xs text-gray-500">{{ signedCount(a.signatures) }}/{{ a.signatures.length }} 方已签</span>
          </div>
          <div class="flex items-center space-x-2 mb-4">
            <div v-for="s in a.signatures" :key="s.partyId" class="flex-1 text-center">
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold text-white shadow" :class="s.status === 'signed' ? 'bg-green-500' : s.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'">
                <Check v-if="s.status === 'signed'" class="w-5 h-5" />
                <X v-else-if="s.status === 'rejected'" class="w-5 h-5" />
                <span v-else>{{ s.partyName.charAt(0) }}</span>
              </div>
              <p class="text-xs mt-1.5 font-medium text-gray-700 line-clamp-1">{{ s.partyName }}</p>
              <p class="text-[10px] text-gray-400">{{ s.status === 'signed' ? dayjs(s.signTime!).format('MM-DD HH:mm') : s.status === 'rejected' ? '已拒绝' : '待签署' }}</p>
              <button v-if="(a.status === 'pending_sign' || a.status === 'partially_signed') && s.status === 'pending' && store.canSignAgreement" @click="signOne(a.id, s.partyId)" class="mt-1 text-[10px] text-primary-600 hover:text-primary-700 font-medium">签署</button>
            </div>
            <div class="flex-1 text-center">
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold text-white shadow" :class="a.mediatorSign ? 'bg-primary-500' : 'bg-gray-300'"><Scale class="w-5 h-5" /></div>
              <p class="text-xs mt-1.5 font-medium text-gray-700">调解员</p>
              <p class="text-[10px] text-gray-400">{{ a.mediatorSign ? '已见证' : '待见证' }}</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button v-if="(a.status === 'pending_sign' || a.status === 'partially_signed') && store.canSignAgreement" @click="openSign(a.id)" class="btn-success flex-1 !py-2 text-sm"><FileSignature class="w-4 h-4 mr-1.5" />签署协议</button>
            <button v-if="a.status === 'effective'" @click="goFulfill(a)" class="btn-primary flex-1 !py-2 text-sm"><ClipboardCheck class="w-4 h-4 mr-1.5" />跟踪履行</button>
          </div>
          <div v-if="a.status === 'effective' && a.effectiveTime" class="mt-3 p-3 bg-green-50 rounded-lg border border-green-100 text-center text-sm text-green-700">
            ✓ 本协议于 {{ dayjs(a.effectiveTime).format('YYYY年MM月DD日') }} 生效
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showDraft" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showDraft = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-5">草拟调解协议</h3>
          <form @submit.prevent="submitDraft" class="space-y-5">
            <div><label class="label-base">关联案件</label>
              <select v-model="df.caseId" class="input-base" @change="onCase">
                <option v-for="c in signableCases" :key="c.id" :value="c.id">{{ c.caseNo }} - {{ c.title }}</option>
              </select>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="label-base">协议标题</label><input v-model="df.title" class="input-base" /></div>
              <div><label class="label-base">签署截止</label><input v-model="df.signDeadline" type="date" class="input-base" /></div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="label-base !mb-0">协议条款 <span class="text-red-500">*</span></label>
                <button type="button" @click="addTerm" class="text-xs text-primary-600 hover:text-primary-700 font-medium">+ 新增条款</button>
              </div>
              <div class="space-y-3">
                <div v-for="(t, i) in df.terms" :key="i" class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold text-gray-700">第 {{ t.order }} 条</span>
                    <button v-if="df.terms.length > 1" type="button" @click="rmTerm(i)" class="text-xs text-red-500 hover:text-red-600">删除</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="md:col-span-3"><textarea v-model="t.content" rows="2" class="input-base resize-none" placeholder="条款内容..." required></textarea></div>
                    <input v-model="t.partyResponsible" class="input-base" placeholder="责任方" required />
                    <input v-model="t.deadline" class="input-base" placeholder="履行期限（如 每月1日 或 2024-12-31）" />
                    <select v-model="t.status" class="input-base"><option value="pending">待履行</option><option value="in_progress">履行中</option></select>
                  </div>
                </div>
              </div>
            </div>
            <div><label class="label-base">补充说明（可选）</label><textarea v-model="df.supplementaryNotes" rows="3" class="input-base resize-none" placeholder="未尽事宜、其他约定等..."></textarea></div>
            <div><label class="label-base">拟签署方</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="s in df.signatures" :key="s.partyId" class="badge bg-gray-100 text-gray-700 px-3 py-1.5">{{ s.partyName }}</span>
              </div>
            </div>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" @click="showDraft = false" class="btn-outline">取消</button>
              <button type="submit" class="btn-primary">保存并发起签署</button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="showDetail" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showDetail = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-8 py-10 border-b border-gray-100 text-center bg-gradient-to-b from-gray-50 to-white">
            <h2 class="text-2xl font-serif font-bold text-gray-800">{{ showDetail.title }}</h2>
            <p class="text-sm text-gray-500 mt-2">编号：{{ showDetail.id }} · 案件：{{ showDetail.caseNo }}</p>
          </div>
          <div class="p-8 space-y-5">
            <div>
              <h4 class="text-sm font-semibold text-gray-600 mb-3 border-b border-gray-100 pb-2">协议条款</h4>
              <div v-for="t in showDetail.terms" :key="t.id" class="mb-5">
                <p class="font-medium text-gray-800 mb-1">第{{ t.order }}条</p>
                <p class="text-gray-700 leading-relaxed pl-4">{{ t.content }}</p>
                <p class="text-xs text-gray-500 mt-1.5 pl-4">责任方：{{ t.partyResponsible }} · 履行期限：{{ t.deadline || '见补充说明' }}</p>
              </div>
            </div>
            <div v-if="showDetail.supplementaryNotes" class="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p class="text-sm font-semibold text-amber-800 mb-1">补充说明</p>
              <p class="text-amber-700">{{ showDetail.supplementaryNotes }}</p>
            </div>
            <div class="pt-6 border-t-2 border-dashed border-gray-200">
              <h4 class="text-sm font-semibold text-gray-600 mb-4">签署确认</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="s in showDetail.signatures" :key="s.partyId" class="p-4 border rounded-xl text-center" :class="s.status === 'signed' ? 'border-green-200 bg-green-50' : s.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'">
                  <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold" :class="s.status === 'signed' ? 'bg-green-500' : s.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'">
                    {{ s.status === 'signed' ? '✓' : s.status === 'rejected' ? '✗' : s.partyName.charAt(0) }}
                  </div>
                  <p class="mt-2 font-semibold text-gray-800">{{ s.partyName }}</p>
                  <p class="text-xs mt-1" :class="s.status === 'signed' ? 'text-green-600' : s.status === 'rejected' ? 'text-red-600' : 'text-gray-400'">
                    {{ s.status === 'signed' ? '已于 ' + dayjs(s.signTime!).format('MM-DD HH:mm') + ' 签署' : s.status === 'rejected' ? '已拒绝：' + s.rejectReason : '待签署' }}
                  </p>
                </div>
                <div class="p-4 border rounded-xl text-center" :class="showDetail.mediatorSign ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'">
                  <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold" :class="showDetail.mediatorSign ? 'bg-primary-500' : 'bg-gray-300'"><Scale class="w-7 h-7" /></div>
                  <p class="mt-2 font-semibold text-gray-800">调解员</p>
                  <p class="text-xs mt-1" :class="showDetail.mediatorSign ? 'text-primary-600' : 'text-gray-400'">{{ showDetail.mediatorSign ? '已见证签署' : '待见证' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 rounded-b-2xl">
            <button @click="showDetail = null" class="btn-outline">关闭</button>
          </div>
        </div>
      </div>
      <div v-if="showSignId" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showSignId = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2">签署调解协议</h3>
          <p class="text-sm text-gray-500 mb-5">您正在以 <span class="font-semibold text-primary-600">{{ store.userName }}</span>（{{ roleText }}）身份签署本协议</p>
          <div class="p-4 bg-primary-50/50 rounded-xl border border-primary-100 mb-5">
            <p class="text-sm font-semibold text-primary-800 mb-2">📌 签署须知</p>
            <ul class="text-xs text-primary-700 space-y-1 list-disc list-inside">
              <li>签署后协议条款对本人具有法律约束力</li>
              <li>请确认已仔细阅读全部条款内容</li>
              <li>如有疑问可联系调解员咨询后再签署</li>
              <li>所有签署记录将归档并可申请司法确认</li>
            </ul>
          </div>
          <label class="flex items-start space-x-3 cursor-pointer mb-5">
            <input type="checkbox" v-model="agreeChecked" class="mt-1 rounded text-primary-600" />
            <span class="text-sm text-gray-700">我已阅读并完全理解协议全部条款，自愿签署本调解协议</span>
          </label>
          <div class="flex space-x-3">
            <button @click="openReject" class="btn-outline flex-1 !text-red-600 !border-red-200 hover:!bg-red-50">拒绝签署</button>
            <button @click="confirmSign" :disabled="!agreeChecked" class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">确认签署</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { Plus, Check, X, Scale, FileSignature, ClipboardCheck } from 'lucide-vue-next'
import type { Agreement, Case } from '../types'
import { agreementApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

const list = ref<Agreement[]>([])
const cases = ref<Case[]>([])
const filter = ref('')
const fCase = ref('')
const showDraft = ref(false)
const showDetail = ref<Agreement | null>(null)
const showSignId = ref<string | null>(null)
const signTargetParty = ref('')
const agreeChecked = ref(false)

const df = reactive({
  caseId: '', title: '', signDeadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  terms: [{ order: 1, content: '', partyResponsible: '', deadline: '', status: 'pending' as const }],
  supplementaryNotes: '', signatures: [] as any[]
})

const roleText = computed(() => ({ grid_worker: '网格员', mediator: '调解员', party: '当事人', judicial: '司法所' } as any)[store.userRole])

const signableCases = computed(() => cases.value.filter(c => ['assigned', 'meeting_scheduled', 'meeting_completed'].includes(c.status)))

function cls(s: string) { return { draft: 'bg-gray-100 text-gray-700', pending_sign: 'status-pending', partially_signed: 'bg-blue-100 text-blue-700', fully_signed: 'bg-teal-100 text-teal-700', rejected: 'status-rejected', effective: 'status-completed' }[s] || '' }
function txt(s: string) { return { draft: '草拟中', pending_sign: '待签署', partially_signed: '部分已签', fully_signed: '已签署', rejected: '已被拒', effective: '已生效' }[s] || s }
function signedCount(sigs: any[]) { return sigs.filter(s => s.status === 'signed').length }

const filtered = computed(() => list.value.filter(a => {
  if (filter.value && a.status !== filter.value) return false
  if (fCase.value && a.caseId !== fCase.value) return false
  return true
}))

function onCase() {
  const c = cases.value.find(x => x.id === df.caseId)
  if (c) {
    df.title = `${c.title} - 调解协议书`
    df.signatures = c.parties.map(p => ({ partyId: p.id, partyName: p.name, status: 'pending' }))
  }
}
function addTerm() { df.terms.push({ order: df.terms.length + 1, content: '', partyResponsible: '', deadline: '', status: 'pending' }) }
function rmTerm(i: number) { df.terms.splice(i, 1); df.terms.forEach((t, idx) => t.order = idx + 1) }
function openDraft() {
  Object.assign(df, { caseId: signableCases.value[0]?.id || '', title: '', signDeadline: dayjs().add(7, 'day').format('YYYY-MM-DD'), terms: [{ order: 1, content: '', partyResponsible: '', deadline: '', status: 'pending' as const }], supplementaryNotes: '', signatures: [] })
  onCase(); showDraft.value = true
}
async function submitDraft() {
  const c = cases.value.find(x => x.id === df.caseId)
  await agreementApi.create({
    caseId: df.caseId, caseNo: c?.caseNo, caseTitle: c?.title, title: df.title,
    terms: df.terms, signatures: df.signatures,
    supplementaryNotes: df.supplementaryNotes, signDeadline: df.signDeadline, status: 'pending_sign'
  })
  showDraft.value = false
  list.value = await agreementApi.list()
  cases.value = await caseApi.list()
}
function openDetail(a: Agreement) { showDetail.value = a }
function signOne(id: string, pid: string) { showSignId.value = id; signTargetParty.value = pid; agreeChecked.value = false }
async function confirmSign() {
  if (!showSignId.value) return
  const a = list.value.find(x => x.id === showSignId.value)
  if (!a) return
  let partyId = signTargetParty.value
  if (!partyId) {
    const mine = a.signatures.find(s => s.partyName === store.userName)
    if (mine) partyId = mine.partyId
    else if (a.signatures.length) partyId = a.signatures[0].partyId
  }
  await agreementApi.sign(showSignId.value, partyId)
  showSignId.value = null; signTargetParty.value = ''
  list.value = await agreementApi.list()
  cases.value = await caseApi.list()
}
function openReject() {
  const reason = prompt('请填写拒绝签署原因')
  if (!reason || !showSignId.value) return
  const a = list.value.find(x => x.id === showSignId.value)
  let partyId = signTargetParty.value
  if (!partyId && a && a.signatures.length) partyId = a.signatures[0].partyId
  if (partyId) agreementApi.reject(showSignId.value, partyId, reason)
  showSignId.value = null; signTargetParty.value = ''
}
function goFulfill(a: Agreement) {
  if (a.caseId) router.push(`/case/${a.caseId}`)
  else router.push('/fulfillment/track')
}

onMounted(async () => {
  list.value = await agreementApi.list()
  cases.value = await caseApi.list()
  const pid = route.params.id as string
  if (pid) fCase.value = pid
})
</script>
