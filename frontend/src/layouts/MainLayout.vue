<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div class="h-16 px-6 flex items-center border-b border-gray-200">
        <Scale class="w-8 h-8 text-primary-600 shrink-0" />
        <div class="ml-3">
          <h1 class="text-base font-bold text-gray-800 leading-tight">矛盾纠纷调解平台</h1>
          <p class="text-xs text-gray-500">智慧调解 · 和谐社区</p>
        </div>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <template v-for="group in navGroups" :key="group.label">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1">{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            v-show="visible(item)"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="{
              'bg-primary-50 text-primary-700 font-medium': route.path.startsWith(item.path),
              'text-gray-600 hover:bg-gray-50': !route.path.startsWith(item.path)
            }"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0 mr-3" />
            {{ item.label }}
            <span v-if="item.badge" class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{{ item.badge }}</span>
          </router-link>
        </template>
      </nav>
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="ml-3 min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800 truncate">{{ user?.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ roleText }}</p>
          </div>
          <button @click="logout" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="切换角色">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-lg font-bold text-gray-800">{{ route.meta?.title || '工作台' }}</h2>
          <p class="text-xs text-gray-500">{{ today }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <select v-model="roleSwitch" @change="switchRole" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-primary-500">
            <option value="grid_worker">切换：网格员</option>
            <option value="mediator">切换：调解员</option>
            <option value="party">切换：当事人</option>
            <option value="judicial">切换：司法所</option>
          </select>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Scale, LayoutDashboard, FileText, ClipboardList, Users, FileSignature, ClipboardCheck, CalendarClock, ShieldAlert, LogOut, Bell, Plus } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import dayjs from 'dayjs'
import type { UserRole } from '../types'

const store = useUserStore()
const route = useRoute()
const router = useRouter()

const roleSwitch = ref<UserRole>(store.userRole)

const user = computed(() => store.currentUser)
const today = dayjs().format('YYYY年MM月DD日 dddd')

const roleText = computed(() => {
  const m: Record<UserRole, string> = { grid_worker: '社区网格员', mediator: '专职调解员', party: '案件当事人', judicial: '街道司法所' }
  return m[store.userRole]
})

function logout() {
  store.logout()
  router.push('/login')
}
function switchRole() {
  store.login(roleSwitch.value)
}

onMounted(() => {
  if (!store.isLoggedIn) store.login('grid_worker')
  roleSwitch.value = store.userRole
})

const navGroups = [
  {
    label: '概览',
    items: [
      { path: '/dashboard', label: '工作台', icon: markRaw(LayoutDashboard), roles: ['grid_worker', 'mediator', 'party', 'judicial'] as UserRole[] }
    ]
  },
  {
    label: '线索受理',
    items: [
      { path: '/clue/register', label: '线索登记', icon: markRaw(Plus), roles: ['grid_worker', 'judicial'] as UserRole[] },
      { path: '/clue/list', label: '线索列表', icon: markRaw(ClipboardList), roles: ['grid_worker', 'mediator', 'judicial'] as UserRole[] }
    ]
  },
  {
    label: '调解管理',
    items: [
      { path: '/case-pool', label: '案件池', icon: markRaw(FileText), roles: ['grid_worker', 'mediator', 'judicial', 'party'] as UserRole[], badge: 8 },
      { path: '/mediation/progress', label: '调解进度', icon: markRaw(Users), roles: ['grid_worker', 'mediator', 'judicial', 'party'] as UserRole[] },
      { path: '/mediation/meeting', label: '调解会议', icon: markRaw(Users), roles: ['mediator', 'judicial', 'party'] as UserRole[] }
    ]
  },
  {
    label: '协议与履行',
    items: [
      { path: '/agreement/sign', label: '协议签署', icon: markRaw(FileSignature), roles: ['mediator', 'party', 'judicial'] as UserRole[] },
      { path: '/fulfillment/track', label: '履行跟踪', icon: markRaw(ClipboardCheck), roles: ['grid_worker', 'mediator', 'judicial', 'party'] as UserRole[] }
    ]
  },
  {
    label: '督办回访',
    items: [
      { path: '/followup', label: '回访提醒', icon: markRaw(CalendarClock), roles: ['grid_worker', 'mediator', 'judicial'] as UserRole[], badge: 3 },
      { path: '/supervision', label: '司法所督办', icon: markRaw(ShieldAlert), roles: ['judicial'] as UserRole[] }
    ]
  }
]

function visible(item: { roles: UserRole[] }) {
  return item.roles.includes(store.userRole)
}

watch(() => store.userRole, () => { roleSwitch.value = store.userRole })
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
