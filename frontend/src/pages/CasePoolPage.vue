<template>
  <div class="space-y-5">
    <div class="card !p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[240px]">
          <input v-model="keyword" class="input-base" placeholder="搜索案件编号、标题、描述..." />
        </div>
        <select v-model="fStatus" class="input-base !w-36"><option value="">全部状态</option><option v-for="v in Object.keys(statusMap)" :key="v" :value="v">{{ statusMap[v as CaseStatus] }}</option></select>
        <select v-model="fCat" class="input-base !w-32"><option value="">全部类别</option><option v-for="v in cats" :key="v.value" :value="v.value">{{ v.label }}</option></select>
        <label class="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" v-model="fMajor" class="rounded text-primary-600" />仅重大纠纷</label>
        <label class="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" v-model="fOverdue" class="rounded text-red-600" />仅逾期案件</label>
        <router-link v-if="store.canManageClues" to="/clue/register" class="btn-primary"><Plus class="w-4 h-4 mr-1.5" />登记线索</router-link>
      </div>
    </div>
    <div class="flex items-center justify-between px-1">
      <p class="text-sm text-gray-500">共 <span class="font-semibold text-gray-800">{{ filtered.length }}</span> 条案件</p>
      <div class="flex space-x-2">
        <button v-for="v in views" :key="v.k" @click="view = v.k" class="btn !py-1.5 !px-3" :class="view === v.k ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'btn-outline'">
          <component :is="v.i" class="w-4 h-4 mr-1.5" />{{ v.l }}
        </button>
      </div>
    </div>
    <div v-if="view === 'list'" class="card overflow-hidden !p-0">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-100">
          <tr>
            <th class="px-5 py-3 text-left font-medium">编号</th>
            <th class="px-5 py-3 text-left font-medium">标题 / 位置</th>
            <th class="px-5 py-3 text-left font-medium">类别</th>
            <th class="px-5 py-3 text-left font-medium">状态</th>
            <th class="px-5 py-3 text-left font-medium">调解员</th>
            <th class="px-5 py-3 text-left font-medium">风险标记</th>
            <th class="px-5 py-3 text-left font-medium">时间</th>
            <th class="px-5 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in filtered" :key="c.id" class="hover:bg-primary-50/30 transition-colors cursor-pointer" @click="goCase(c.id)">
            <td class="px-5 py-4 font-mono text-xs text-gray-500">{{ c.caseNo }}</td>
            <td class="px-5 py-4">
              <div class="font-medium text-gray-800">{{ c.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ c.location }}</div>
            </td>
            <td class="px-5 py-4"><span class="badge bg-gray-100 text-gray-700">{{ catLabel(c.category) }}</span></td>
            <td class="px-5 py-4"><span class="badge" :class="sc(c.status)">{{ statusMap[c.status] }}</span></td>
            <td class="px-5 py-4 text-gray-700">{{ c.mediatorName || '—' }}</td>
            <td class="px-5 py-4">
              <div class="flex items-center space-x-1">
                <span v-if="c.isMajor" class="badge bg-red-100 text-red-700">重大</span>
                <span v-if="(c.repeatCount || 0) > 0" class="badge bg-orange-100 text-orange-700">重复{{ c.repeatCount }}</span>
                <span v-if="(c.emotionLevel || 0) >= 4" class="badge bg-rose-100 text-rose-700">情绪{{ c.emotionLevel }}</span>
                <span v-if="(c.overdueCount || 0) > 0" class="badge bg-red-100 text-red-700">逾期</span>
              </div>
            </td>
            <td class="px-5 py-4 text-gray-500 text-xs">{{ dayjs(c.submitTime).format('YYYY-MM-DD') }}</td>
            <td class="px-5 py-4 text-right">
              <button @click.stop="goCase(c.id)" class="text-primary-600 hover:text-primary-700 font-medium">详情 →</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="c in filtered" :key="c.id" @click="goCase(c.id)" class="card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-t-4" :class="cardBorder(c.status)">
        <div class="flex items-start justify-between mb-3">
          <span class="font-mono text-xs text-gray-400">{{ c.caseNo }}</span>
          <span class="badge" :class="sc(c.status)">{{ statusMap[c.status] }}</span>
        </div>
        <h3 class="font-bold text-gray-800 mb-2 line-clamp-2">{{ c.title }}</h3>
        <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ c.description }}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">
          <span class="badge bg-gray-100 text-gray-600">{{ catLabel(c.category) }}</span>
          <span v-if="c.isMajor" class="badge bg-red-100 text-red-700">重大</span>
          <span v-if="(c.repeatCount || 0) > 0" class="badge bg-orange-100 text-orange-700">重复</span>
          <span v-if="c.status === 'escalated'" class="badge bg-rose-100 text-rose-700">情绪升级</span>
          <span v-if="c.status === 'fulfillment_overdue'" class="badge bg-red-100 text-red-700">履行逾期</span>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{{ c.mediatorName?.charAt(0) || '?' }}</div>
            <div class="ml-2">
              <div class="text-xs text-gray-700">{{ c.mediatorName || '待分派' }}</div>
              <div class="text-xs text-gray-400">{{ dayjs(c.submitTime).format('MM-DD') }}</div>
            </div>
          </div>
          <button class="text-primary-600 text-sm font-medium">查看 →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, List, LayoutGrid } from 'lucide-vue-next'
import dayjs from 'dayjs'
import type { Case, CaseStatus, DisputeCategory } from '../types'
import { caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const cases = ref<Case[]>([])
const keyword = ref('')
const fStatus = ref<CaseStatus | ''>('')
const fCat = ref<DisputeCategory | ''>('')
const fMajor = ref(false)
const fOverdue = ref(false)
const view = ref<'list' | 'grid'>('list')

const views = [
  { k: 'list' as const, l: '列表', i: markRaw(List) },
  { k: 'grid' as const, l: '卡片', i: markRaw(LayoutGrid) }
]

const cats: { value: DisputeCategory; label: string }[] = [
  { value: 'noise', label: '噪声扰民' },
  { value: 'parking', label: '停车占位' },
  { value: 'property', label: '物业收费' },
  { value: 'support', label: '家庭赡养' },
  { value: 'neighbor', label: '邻里纠纷' },
  { value: 'family', label: '家庭纠纷' },
  { value: 'contract', label: '合同纠纷' },
  { value: 'other', label: '其他' }
]

const statusMap: Record<CaseStatus, string> = {
  clue_submitted: '待受理', clue_accepted: '已受理', assigned: '已分派',
  meeting_scheduled: '会议排期', meeting_refused: '拒绝参会', meeting_completed: '会议完成',
  agreement_drafted: '协议草拟', agreement_signed: '协议已签', agreement_rejected: '协议被拒',
  fulfillment_start: '履行中', fulfillment_overdue: '履行逾期', fulfillment_completed: '履行完成',
  followup_pending: '待回访', followup_completed: '回访完成', escalated: '情绪升级',
  case_closed: '结案', repeat_complaint: '重复投诉'
}

const sc: Record<CaseStatus, string> = {
  clue_submitted: 'status-pending', clue_accepted: 'status-pending', assigned: 'bg-blue-100 text-blue-700',
  meeting_scheduled: 'bg-purple-100 text-purple-700', meeting_refused: 'status-rejected', meeting_completed: 'bg-indigo-100 text-indigo-700',
  agreement_drafted: 'bg-violet-100 text-violet-700', agreement_signed: 'bg-teal-100 text-teal-700', agreement_rejected: 'status-rejected',
  fulfillment_start: 'status-progress', fulfillment_overdue: 'status-overdue', fulfillment_completed: 'status-completed',
  followup_pending: 'bg-cyan-100 text-cyan-700', followup_completed: 'status-completed', escalated: 'status-escalated',
  case_closed: 'status-completed', repeat_complaint: 'bg-orange-100 text-orange-700'
}
function catLabel(v: DisputeCategory) { return cats.find(x => x.value === v)?.label || v }
function cardBorder(s: CaseStatus) {
  const map: Record<string, string> = { pending: 'border-t-yellow-400', progress: 'border-t-blue-500', completed: 'border-t-green-500', overdue: 'border-t-red-500', escalated: 'border-t-orange-500', rejected: 'border-t-gray-400' }
  const k = sc[s].match(/(pending|progress|completed|overdue|escalated|rejected)/)?.[1] || 'pending'
  return map[k] || 'border-t-gray-300'
}

const filtered = computed(() => {
  return cases.value.filter(c => {
    if (fStatus.value && c.status !== fStatus.value) return false
    if (fCat.value && c.category !== fCat.value) return false
    if (fMajor.value && !c.isMajor) return false
    if (fOverdue.value && c.status !== 'fulfillment_overdue') return false
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      if (!c.title.toLowerCase().includes(kw) && !c.description.toLowerCase().includes(kw) && !c.caseNo.toLowerCase().includes(kw)) return false
    }
    return true
  })
})
function goCase(id: string) { router.push(`/case/${id}`) }

onMounted(async () => { cases.value = await caseApi.list() })
</script>
