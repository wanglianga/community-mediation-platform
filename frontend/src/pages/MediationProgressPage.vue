<template>
  <div class="space-y-5">
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800">案件流转进度全景图</h3>
          <p class="text-sm text-gray-500 mt-1">线索受理 → 分派调解 → 会议记录 → 协议签署 → 履行跟踪 → 回访督办</p>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <span class="inline-block w-3 h-3 rounded bg-blue-500"></span> 当前阶段
          <span class="inline-block w-3 h-3 rounded bg-gray-300 ml-3"></span> 未开始
          <span class="inline-block w-3 h-3 rounded bg-green-500 ml-3"></span> 已完成
          <span class="inline-block w-3 h-3 rounded bg-red-500 ml-3"></span> 异常
        </div>
      </div>
      <div class="grid grid-cols-6 gap-1 mb-4">
        <div v-for="(st, i) in pipelineStages" :key="st.key" class="text-center">
          <div class="h-24 relative flex items-center justify-center">
            <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10" :class="stageBgClass(st.key)">
              <component :is="st.icon" class="w-7 h-7" />
            </div>
            <div v-if="i < pipelineStages.length - 1" class="absolute top-1/2 left-1/2 right-0 h-1 -translate-y-1/2" :class="connectorClass(st.key, pipelineStages[i + 1].key)"></div>
          </div>
          <p class="text-sm font-medium text-gray-800 mt-1">{{ st.label }}</p>
          <p class="text-xs text-gray-500">{{ counts[st.key] || 0 }} 件</p>
        </div>
      </div>
    </div>
    <div class="card !p-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="keyword" class="input-base !w-72" placeholder="搜索案件标题/编号..." />
        <select v-model="stageFilter" class="input-base !w-40"><option value="">全部阶段</option><option v-for="st in pipelineStages" :key="st.key" :value="st.key">{{ st.label }}（{{ counts[st.key] || 0 }}）</option></select>
        <select v-model="fRisk" class="input-base !w-36"><option value="">风险等级</option><option value="high">高风险</option><option value="normal">常规</option></select>
      </div>
    </div>
    <div class="space-y-4">
      <div v-for="c in filteredCases" :key="c.id" class="card hover:shadow-md transition-all" @click="goCase(c.id)">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <span class="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{{ c.caseNo }}</span>
            <h3 class="text-lg font-bold text-gray-800">{{ c.title }}</h3>
          </div>
          <div class="flex items-center space-x-2">
            <span v-if="c.isMajor" class="badge bg-red-100 text-red-700">重大</span>
            <span v-if="(c.repeatCount || 0) > 0" class="badge bg-orange-100 text-orange-700">重复投诉</span>
            <span v-if="(c.emotionLevel || 0) >= 4" class="badge bg-rose-100 text-rose-700">情绪升级</span>
            <span v-if="c.status === 'fulfillment_overdue'" class="badge bg-red-100 text-red-700">履行逾期</span>
            <span v-if="c.status === 'meeting_refused'" class="badge bg-gray-200 text-gray-700">拒绝参会</span>
          </div>
        </div>
        <div class="relative">
          <div class="flex justify-between mb-2">
            <div v-for="st in pipelineStages" :key="st.key" class="w-1/6 text-center shrink-0">
              <div class="w-4 h-4 mx-auto rounded-full mb-1 border-2 flex items-center justify-center" :class="dotClass(c, st.key)">
                <div v-if="isStageComplete(c, st.key)" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                <X v-else-if="isStageAbnormal(c, st.key)" class="w-3 h-3 text-white" />
              </div>
              <p class="text-xs" :class="isStageActive(c, st.key) ? 'text-primary-600 font-bold' : 'text-gray-400'">{{ st.label }}</p>
              <p v-if="getTime(c, st.key)" class="text-[10px] text-gray-400 mt-0.5">{{ getTime(c, st.key) }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
          <div class="flex items-center space-x-6 text-gray-500">
            <span class="flex items-center"><User class="w-4 h-4 mr-1" />调解员：{{ c.mediatorName || '待分派' }}</span>
            <span class="flex items-center"><Users class="w-4 h-4 mr-1" />当事人：{{ c.parties.length }} 人</span>
            <span class="flex items-center"><MapPin class="w-4 h-4 mr-1" />{{ c.location }}</span>
          </div>
          <button class="btn-outline !py-1.5 text-primary-600 border-primary-200 hover:bg-primary-50">查看详情 →</button>
        </div>
      </div>
      <div v-if="!filteredCases.length" class="card text-center py-16 text-gray-400">暂无匹配案件</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ClipboardList, Users, FileSignature, ClipboardCheck, CalendarClock, ShieldCheck, X, User, MapPin } from 'lucide-vue-next'
import type { Case, CaseStatus } from '../types'
import { caseApi } from '../api'

const router = useRouter()
const cases = ref<Case[]>([])
const keyword = ref('')
const stageFilter = ref('')
const fRisk = ref('')

const pipelineStages = [
  { key: 'accept', label: '线索受理', icon: markRaw(ClipboardList) },
  { key: 'assign', label: '分派调解', icon: markRaw(Users) },
  { key: 'meeting', label: '会议记录', icon: markRaw(Users) },
  { key: 'agreement', label: '协议签署', icon: markRaw(FileSignature) },
  { key: 'fulfill', label: '履行跟踪', icon: markRaw(ClipboardCheck) },
  { key: 'followup', label: '回访督办', icon: markRaw(CalendarClock) }
] as const

type StageKey = typeof pipelineStages[number]['key']

function stageIndex(s: CaseStatus): { stage: StageKey; progress: 'done' | 'current' | 'notstart' | 'abnormal' } {
  const flow: CaseStatus[] = ['clue_submitted', 'clue_accepted', 'assigned', 'meeting_scheduled', 'meeting_completed', 'agreement_drafted', 'agreement_signed', 'fulfillment_start', 'fulfillment_completed', 'followup_pending', 'followup_completed', 'case_closed']
  const idx = flow.indexOf(s)
  if (s === 'meeting_refused') return { stage: 'meeting', progress: 'abnormal' }
  if (s === 'agreement_rejected') return { stage: 'agreement', progress: 'abnormal' }
  if (s === 'fulfillment_overdue') return { stage: 'fulfill', progress: 'abnormal' }
  if (s === 'escalated') return { stage: Math.min(idx > -1 ? flow.indexOf('meeting_completed') : 1, 1) === 1 ? 'meeting' : 'assign', progress: 'abnormal' } as any
  if (s === 'repeat_complaint') return { stage: 'followup', progress: 'abnormal' }
  if (idx < 0) return { stage: 'accept', progress: 'current' }
  if (idx <= 1) return { stage: 'accept', progress: idx === 1 ? 'done' : 'current' }
  if (idx === 2) return { stage: 'assign', progress: 'done' }
  if (idx <= 4) return { stage: 'meeting', progress: idx === 4 ? 'done' : 'current' }
  if (idx <= 6) return { stage: 'agreement', progress: idx === 6 ? 'done' : 'current' }
  if (idx <= 8) return { stage: 'fulfill', progress: idx === 8 ? 'done' : 'current' }
  if (idx <= 10) return { stage: 'followup', progress: idx === 10 ? 'done' : 'current' }
  return { stage: 'followup', progress: 'done' }
}

function stageBgClass(key: StageKey) {
  const c = counts.value[key] || 0
  const all = pipelineStages.map(x => [x.key, counts.value[x.key] || 0])
  void c; void all
  return 'bg-gradient-to-br from-primary-500 to-primary-600'
}
function connectorClass(_a: StageKey, _b: StageKey) { return 'bg-gray-200 z-0' }

function isStageComplete(c: Case, key: StageKey): boolean {
  const order = pipelineStages.map(x => x.key)
  const cur = stageIndex(c.status)
  return order.indexOf(key) < order.indexOf(cur.stage) || (cur.stage === key && cur.progress === 'done')
}
function isStageActive(c: Case, key: StageKey): boolean {
  const cur = stageIndex(c.status)
  return cur.stage === key && (cur.progress === 'current' || cur.progress === 'abnormal')
}
function isStageAbnormal(c: Case, key: StageKey): boolean {
  const cur = stageIndex(c.status)
  return cur.stage === key && cur.progress === 'abnormal'
}
function dotClass(c: Case, key: StageKey) {
  if (isStageComplete(c, key)) return 'bg-green-500 border-green-500'
  if (isStageAbnormal(c, key)) return 'bg-red-500 border-red-500'
  if (isStageActive(c, key)) return 'bg-primary-500 border-primary-500 animate-pulse'
  return 'bg-white border-gray-300'
}
function getTime(c: Case, key: StageKey) {
  if (key === 'accept') return c.acceptTime ? dayjs(c.acceptTime).format('MM-DD') : ''
  if (key === 'assign') return c.assignTime ? dayjs(c.assignTime).format('MM-DD') : ''
  if (key === 'followup' && c.closeTime) return dayjs(c.closeTime).format('MM-DD')
  return ''
}

const counts = computed<Record<StageKey, number>>(() => {
  const r: Record<string, number> = { accept: 0, assign: 0, meeting: 0, agreement: 0, fulfill: 0, followup: 0 }
  cases.value.forEach(c => r[stageIndex(c.status).stage]++)
  return r as Record<StageKey, number>
})

const filteredCases = computed(() => {
  return cases.value.filter(c => {
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      if (!c.title.toLowerCase().includes(kw) && !c.caseNo.toLowerCase().includes(kw)) return false
    }
    if (stageFilter.value) {
      if (stageIndex(c.status).stage !== stageFilter.value) return false
    }
    if (fRisk.value === 'high') {
      const hi = c.isMajor || (c.repeatCount || 0) > 0 || (c.emotionLevel || 0) >= 4 || c.status === 'escalated' || c.status === 'fulfillment_overdue'
      if (!hi) return false
    } else if (fRisk.value === 'normal') {
      const hi = c.isMajor || (c.repeatCount || 0) > 0 || (c.emotionLevel || 0) >= 4 || c.status === 'escalated' || c.status === 'fulfillment_overdue'
      if (hi) return false
    }
    return true
  })
})

function goCase(id: string) { router.push(`/case/${id}`) }

onMounted(async () => { cases.value = await caseApi.list() })
</script>
