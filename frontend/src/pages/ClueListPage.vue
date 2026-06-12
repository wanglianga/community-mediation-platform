<template>
  <div class="space-y-5">
    <div class="card !p-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="keyword" class="input-base !w-64" placeholder="搜索线索标题、地点..." />
        <select v-model="fStatus" class="input-base !w-32">
          <option value="">全部状态</option>
          <option value="pending">待受理</option>
          <option value="accepted">已受理</option>
          <option value="converted">已转案件</option>
          <option value="rejected">已驳回</option>
        </select>
        <select v-model="fCat" class="input-base !w-32">
          <option value="">全部类别</option>
          <option value="noise">邻里噪声</option>
          <option value="parking">停车占位</option>
          <option value="property">物业收费</option>
          <option value="support">家庭赡养</option>
          <option value="neighbor">邻里纠纷</option>
          <option value="other">其他</option>
        </select>
        <div class="ml-auto text-sm text-gray-500">共 <span class="font-semibold text-gray-800">{{ filtered.length }}</span> 条线索</div>
      </div>
    </div>
    <div class="card !p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr class="text-gray-600">
            <th class="px-5 py-3 text-left font-medium">编号</th>
            <th class="px-5 py-3 text-left font-medium">标题 / 地点</th>
            <th class="px-5 py-3 text-left font-medium">类别</th>
            <th class="px-5 py-3 text-left font-medium">登记人</th>
            <th class="px-5 py-3 text-left font-medium">举报人</th>
            <th class="px-5 py-3 text-left font-medium">登记时间</th>
            <th class="px-5 py-3 text-left font-medium">状态</th>
            <th class="px-5 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in filtered" :key="c.id" class="hover:bg-primary-50/30 transition-colors">
            <td class="px-5 py-4 font-mono text-xs text-gray-500">{{ c.id }}</td>
            <td class="px-5 py-4">
              <div class="font-medium text-gray-800 line-clamp-1">{{ c.title }}</div>
              <div class="text-xs text-gray-500">{{ c.location }}</div>
            </td>
            <td class="px-5 py-4"><span class="badge bg-gray-100 text-gray-700">{{ catLabel(c.category) }}</span></td>
            <td class="px-5 py-4 text-gray-700">{{ c.gridWorkerName }}</td>
            <td class="px-5 py-4 text-gray-700">{{ c.informantName || '匿名' }}</td>
            <td class="px-5 py-4 text-gray-500 text-xs">{{ dayjs(c.submitTime).format('YYYY-MM-DD HH:mm') }}</td>
            <td class="px-5 py-4"><span class="badge" :class="statusClass(c.status)">{{ statusText(c.status) }}</span></td>
            <td class="px-5 py-4 text-right space-x-2">
              <button v-if="c.status === 'pending' && store.canManageClues" @click="accept(c.id)" class="btn-success !py-1 !px-3 text-xs">受理</button>
              <button v-if="c.status === 'pending' && store.canManageClues" @click="openReject(c.id)" class="btn-danger !py-1 !px-3 text-xs">驳回</button>
              <button v-if="c.caseId" @click="goCase(c.caseId)" class="text-primary-600 hover:text-primary-700 text-xs font-medium">关联案件 →</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filtered.length" class="py-16 text-center text-gray-400">暂无数据</div>
    </div>
    <Teleport to="body">
      <div v-if="rejectId" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="rejectId = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">驳回线索</h3>
          <textarea v-model="rejectReason" rows="4" class="input-base resize-none mb-4" placeholder="请填写驳回原因..."></textarea>
          <div class="flex justify-end space-x-3">
            <button @click="rejectId = null" class="btn-outline">取消</button>
            <button @click="doReject" class="btn-danger">确认驳回</button>
          </div>
        </div>
      </div>

      <div v-if="showRelapseDialog" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showRelapseDialog = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div class="flex items-start space-x-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <AlertTriangle class="w-6 h-6 text-orange-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 mb-1">检测到重复投诉</h3>
              <p class="text-sm text-gray-500">系统发现该线索与以下案件存在高度相似性，可能为重复投诉。</p>
            </div>
          </div>
          
          <div v-if="similarCase" class="mb-5 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h4 class="font-semibold text-gray-800 mb-3">相似案件信息</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">案件编号：</span>
                <span class="font-mono text-gray-800">{{ similarCase.caseNo }}</span>
              </div>
              <div>
                <span class="text-gray-500">当前状态：</span>
                <span class="badge" :class="statusCls(similarCase.status)">{{ statusText(similarCase.status) }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500">案件名称：</span>
                <span class="font-medium text-gray-800">{{ similarCase.title }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500">当事人：</span>
                <span class="text-gray-800">{{ similarCase.parties.map(p => p.name).join('、') }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500">登记时间：</span>
                <span class="text-gray-800">{{ dayjs(similarCase.submitTime).format('YYYY-MM-DD HH:mm') }}</span>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <h4 class="font-semibold text-gray-800 mb-3">当前线索信息</h4>
            <div class="p-4 bg-gray-50 rounded-xl text-sm">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="text-gray-500">线索编号：</span>
                  <span class="font-mono text-gray-800">{{ pendingClue?.id }}</span>
                </div>
                <div>
                  <span class="text-gray-500">类别：</span>
                  <span class="text-gray-800">{{ catLabel(pendingClue?.category || 'other') }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500">标题：</span>
                  <span class="font-medium text-gray-800">{{ pendingClue?.title }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500">举报人：</span>
                  <span class="text-gray-800">{{ pendingClue?.informantName || '匿名' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-5">
            <p class="text-sm text-amber-800 font-medium mb-1">📋 关联原案件将自动执行以下操作：</p>
            <ul class="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>新案件状态回退为"待调解"，并标记为"复发"</li>
              <li>原案件时间轴中添加"复发"标记记录</li>
              <li>自动生成督办单，指派原调解员跟进处理</li>
              <li>案件复发次数+1，升级为重大纠纷督办</li>
            </ul>
          </div>

          <div class="flex justify-end space-x-3">
            <button @click="acceptAsNew" class="btn-outline">
              <Plus class="w-4 h-4 mr-1.5" />作为新案件受理
            </button>
            <button @click="acceptWithRelapse" class="btn-warning">
              <RefreshCw class="w-4 h-4 mr-1.5" />关联原案件并受理
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { AlertTriangle, Plus, RefreshCw } from 'lucide-vue-next'
import type { Clue, DisputeCategory, Case, CaseStatus } from '../types'
import { clueApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const list = ref<Clue[]>([])
const keyword = ref('')
const fStatus = ref('')
const fCat = ref<DisputeCategory | ''>('')
const rejectId = ref<string | null>(null)
const rejectReason = ref('')
const showRelapseDialog = ref(false)
const pendingClue = ref<Clue | null>(null)
const similarCase = ref<Case | null>(null)

const cats: { value: DisputeCategory; label: string }[] = [
  { value: 'noise', label: '邻里噪声' }, { value: 'parking', label: '停车占位' },
  { value: 'property', label: '物业收费' }, { value: 'support', label: '家庭赡养' },
  { value: 'neighbor', label: '邻里纠纷' }, { value: 'family', label: '家庭纠纷' },
  { value: 'contract', label: '合同纠纷' }, { value: 'other', label: '其他' }
]
function catLabel(v: DisputeCategory) { return cats.find(x => x.value === v)?.label || v }
function statusText(s: string) { return { pending: '待受理', accepted: '已受理', converted: '已转案件', rejected: '已驳回' } as any[s] || s }
function statusCls(s: CaseStatus) { return {
  clue_submitted: 'status-pending', clue_accepted: 'status-pending', assigned: 'bg-blue-100 text-blue-700',
  meeting_scheduled: 'bg-purple-100 text-purple-700', meeting_refused: 'status-rejected', meeting_completed: 'bg-indigo-100 text-indigo-700',
  agreement_drafted: 'bg-violet-100 text-violet-700', agreement_signed: 'bg-teal-100 text-teal-700', agreement_rejected: 'status-rejected',
  fulfillment_start: 'status-progress', fulfillment_overdue: 'status-overdue', fulfillment_completed: 'status-completed',
  followup_pending: 'bg-cyan-100 text-cyan-700', followup_completed: 'status-completed', escalated: 'status-escalated',
  case_closed: 'status-completed', repeat_complaint: 'bg-orange-100 text-orange-700',
  merged: 'bg-gray-200 text-gray-700', supervision_pending: 'bg-red-100 text-red-700', relapse: 'bg-orange-100 text-orange-700'
}[s] || 'status-pending' }
function statusClass(s: string) { return { pending: 'status-pending', accepted: 'status-progress', converted: 'bg-green-100 text-green-700', rejected: 'status-rejected' } as any[s] || '' }

const filtered = computed(() => list.value.filter(c => {
  if (fStatus.value && c.status !== fStatus.value) return false
  if (fCat.value && c.category !== fCat.value) return false
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    if (!c.title.toLowerCase().includes(kw) && !c.location.toLowerCase().includes(kw)) return false
  }
  return true
}))

async function accept(id: string) {
  const clue = list.value.find(c => c.id === id)
  if (!clue) return
  
  const result = await clueApi.checkRepeat({
    informantName: clue.informantName,
    category: clue.category,
    description: clue.description || clue.title,
    parties: clue.parties
  })
  
  if (result && result.originalCase) {
    pendingClue.value = clue
    similarCase.value = result.originalCase
    showRelapseDialog.value = true
  } else {
    await clueApi.accept(id)
    list.value = await clueApi.list()
  }
}

async function acceptAsNew() {
  if (!pendingClue.value) return
  await clueApi.accept(pendingClue.value.id)
  showRelapseDialog.value = false
  pendingClue.value = null
  similarCase.value = null
  list.value = await clueApi.list()
}

async function acceptWithRelapse() {
  if (!pendingClue.value || !similarCase.value) return
  await clueApi.accept(pendingClue.value.id, similarCase.value.id)
  showRelapseDialog.value = false
  pendingClue.value = null
  similarCase.value = null
  list.value = await clueApi.list()
}

function openReject(id: string) { rejectId.value = id; rejectReason.value = '' }
async function doReject() {
  if (!rejectId.value || !rejectReason.value.trim()) return
  await clueApi.reject(rejectId.value, rejectReason.value.trim())
  rejectId.value = null
  list.value = await clueApi.list()
}
function goCase(id: string) { router.push(`/case/${id}`) }

onMounted(async () => { list.value = await clueApi.list() })
</script>
