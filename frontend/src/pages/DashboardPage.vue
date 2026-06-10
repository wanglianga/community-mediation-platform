<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="card !p-5 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer" @click="s.onClick?.()">
        <div>
          <p class="text-sm text-gray-500">{{ s.label }}</p>
          <p class="text-3xl font-bold mt-2" :class="s.color">{{ s.value }}</p>
          <p v-if="s.sub" class="text-xs mt-1 text-gray-400">{{ s.sub }}</p>
        </div>
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="s.bg">
          <component :is="s.icon" class="w-7 h-7" :class="s.iconColor" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-800 text-lg">本月调解趋势</h3>
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <span class="inline-block w-3 h-3 rounded bg-primary-500"></span>
            案件受理数
          </div>
        </div>
        <div class="flex items-end space-x-4 h-48 px-2">
          <div v-for="item in stats.monthlyTrend" :key="item.month" class="flex-1 flex flex-col items-center">
            <div class="w-full flex-1 flex flex-col justify-end">
              <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500" :style="{ height: `${(item.count / maxMonth * 100)}%` }">
                <span class="block text-center text-xs text-white font-medium pt-1">{{ item.count }}</span>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500">{{ item.month }}</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 class="font-bold text-gray-800 text-lg mb-5">纠纷类别分布</h3>
        <div class="space-y-4">
          <div v-for="cat in stats.categoryStats" :key="cat.name">
            <div class="flex justify-between text-sm mb-1.5">
              <span class="text-gray-700">{{ cat.name }}</span>
              <span class="font-semibold text-gray-800">{{ cat.value }}</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" :style="{ width: `${(cat.value / maxCat * 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800 text-lg">近期待办案件</h3>
          <router-link to="/case-pool" class="text-sm text-primary-600 hover:text-primary-700 font-medium">查看全部 →</router-link>
        </div>
        <div class="space-y-3">
          <div v-for="c in recentCases" :key="c.id" @click="goCase(c.id)" class="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-mono text-gray-400">{{ c.caseNo }}</span>
                <span class="badge" :class="statusClass(c.status)">{{ statusText(c.status) }}</span>
                <span v-if="c.isMajor" class="badge bg-red-100 text-red-700">重大</span>
              </div>
              <span class="text-xs text-gray-400">{{ timeText(c.submitTime) }}</span>
            </div>
            <h4 class="font-medium text-gray-800 line-clamp-1">{{ c.title }}</h4>
            <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>调解员：{{ c.mediatorName || '待分派' }}</span>
              <div class="flex items-center space-x-2">
                <span v-if="c.repeatCount" class="flex items-center text-orange-600"><Repeat class="w-3 h-3 mr-1" />重复{{ c.repeatCount }}</span>
                <span v-if="(c.emotionLevel || 0) >= 4" class="flex items-center text-red-600"><AlertTriangle class="w-3 h-3 mr-1" />高危情绪</span>
              </div>
            </div>
          </div>
          <div v-if="!recentCases.length" class="text-center py-8 text-gray-400 text-sm">暂无近期案件</div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800 text-lg">待回访/紧急预警</h3>
          <router-link to="/followup" class="text-sm text-primary-600 hover:text-primary-700 font-medium">管理回访 →</router-link>
        </div>
        <div class="space-y-3">
          <div v-for="f in upcomingFollowups" :key="f.id" class="p-4 rounded-xl border-l-4 transition-all" :class="f.status === 'overdue' ? 'border-red-500 bg-red-50/50' : 'border-primary-500 bg-primary-50/30'">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center text-sm font-medium text-gray-800"><CalendarClock class="w-4 h-4 mr-1 text-primary-500" />{{ typeText(f.type) }}回访</span>
                  <span class="badge" :class="f.status === 'overdue' ? 'bg-red-100 text-red-700' : 'status-pending'">{{ f.status === 'overdue' ? '已逾期' : '待安排' }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">案件：{{ findCase(f.caseId)?.title || '—' }}</p>
                <p class="text-xs text-gray-500 mt-1">计划时间：{{ formatTime(f.scheduledTime) }}</p>
                <p class="text-xs text-gray-500">执行人：{{ f.handlerName }}</p>
              </div>
              <button @click="doFollowup(f.id)" class="btn-primary !px-3 !py-1.5 text-xs">处理</button>
            </div>
          </div>
          <div v-if="!upcomingFollowups.length" class="text-center py-8 text-gray-400 text-sm">暂无待回访</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Repeat, CalendarClock } from 'lucide-vue-next'
import { caseApi, followupApi } from '../api'
import dayjs from 'dayjs'
import type { Case, CaseStatus, Followup } from '../types'

const router = useRouter()
const cases = ref<Case[]>([])
const stats = ref<any>({ categoryStats: [], monthlyTrend: [] })
const followups = ref<Followup[]>([])

const statusMap: Record<CaseStatus, { text: string; cls: string }> = {
  clue_submitted: { text: '待受理', cls: 'status-pending' },
  clue_accepted: { text: '已受理', cls: 'status-pending' },
  assigned: { text: '已分派', cls: 'bg-blue-50 text-blue-700' },
  meeting_scheduled: { text: '会议已排期', cls: 'bg-purple-100 text-purple-700' },
  meeting_refused: { text: '拒绝参会', cls: 'status-rejected' },
  meeting_completed: { text: '调解会议完成', cls: 'bg-indigo-100 text-indigo-700' },
  agreement_drafted: { text: '协议草拟', cls: 'bg-violet-100 text-violet-700' },
  agreement_signed: { text: '协议已签', cls: 'bg-teal-100 text-teal-700' },
  agreement_rejected: { text: '协议被拒', cls: 'status-rejected' },
  fulfillment_start: { text: '履行中', cls: 'status-progress' },
  fulfillment_overdue: { text: '履行逾期', cls: 'status-overdue' },
  fulfillment_completed: { text: '履行完成', cls: 'status-completed' },
  followup_pending: { text: '待回访', cls: 'bg-cyan-100 text-cyan-700' },
  followup_completed: { text: '回访完成', cls: 'status-completed' },
  escalated: { text: '情绪升级', cls: 'status-escalated' },
  case_closed: { text: '结案', cls: 'status-completed' },
  repeat_complaint: { text: '重复投诉', cls: 'bg-orange-100 text-orange-700' }
}
function statusText(s: CaseStatus) { return statusMap[s]?.text || s }
function statusClass(s: CaseStatus) { return statusMap[s]?.cls || 'status-pending' }

const recentCases = computed(() => cases.value.slice(0, 5))
const upcomingFollowups = computed(() => followups.value.slice(0, 5))
const maxMonth = computed(() => Math.max(...stats.value.monthlyTrend.map((x: any) => x.count), 1))
const maxCat = computed(() => Math.max(...stats.value.categoryStats.map((x: any) => x.value), 1))

const cardStats = computed(() => [
  { label: '总案件数', value: stats.value.total || 0, sub: '本年度以来', icon: markRaw(FileText), bg: 'bg-blue-50', color: 'text-blue-600', iconColor: 'text-blue-500', onClick: () => router.push('/case-pool') },
  { label: '待处理', value: stats.value.pending || 0, sub: '含新受理案件', icon: markRaw(Clock), bg: 'bg-amber-50', color: 'text-amber-600', iconColor: 'text-amber-500', onClick: () => router.push('/case-pool') },
  { label: '调解进行中', value: stats.value.inProgress || 0, sub: '会议/签署/履行', icon: markRaw(TrendingUp), bg: 'bg-indigo-50', color: 'text-indigo-600', iconColor: 'text-indigo-500', onClick: () => router.push('/mediation/progress') },
  { label: '重大风险', value: (stats.value.major || 0) + (stats.value.escalated || 0), sub: '含情绪升级', icon: markRaw(AlertTriangle), bg: 'bg-red-50', color: 'text-red-600', iconColor: 'text-red-500', onClick: () => router.push('/supervision') }
])

function timeText(t: string) { const d = dayjs(t); const diff = dayjs().diff(d, 'day'); return diff === 0 ? '今天' : diff === 1 ? '昨天' : diff < 7 ? `${diff}天前` : d.format('MM-DD') }
function formatTime(t: string) { return dayjs(t).format('MM月DD日 HH:mm') }
function typeText(t: any) { 
  const typeStr = typeof t === 'string' ? t : (t?.type || String(t))
  const map: Record<string, string> = { phone: '电话', home_visit: '上门', video: '视频', onsite: '现场' }
  return map[typeStr] || typeStr
}
function findCase(id: string) { return cases.value.find(c => c.id === id) }
function goCase(id: string) { router.push(`/case/${id}`) }
function doFollowup(id: string) { router.push(`/followup`) }

onMounted(async () => {
  cases.value = await caseApi.list()
  stats.value = await caseApi.getStats()
  followups.value = (await followupApi.getUpcoming()) || []
})
</script>
