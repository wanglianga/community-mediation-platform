<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-8">
    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
      <div class="w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white hidden md:flex flex-col justify-between">
        <div>
          <div class="flex items-center space-x-3">
            <Scale class="w-10 h-10" />
            <h1 class="text-2xl font-bold">矛盾纠纷调解平台</h1>
          </div>
          <p class="mt-2 text-primary-100 text-sm">从线索到结案 · 全流程闭环管理</p>
        </div>
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"><FileText class="w-6 h-6" /></div>
            <div>
              <h3 class="font-semibold">智能案件池</h3>
              <p class="text-sm text-primary-100 mt-1">分类管理各类纠纷，精准分派调解资源</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"><FileSignature class="w-6 h-6" /></div>
            <div>
              <h3 class="font-semibold">电子协议签署</h3>
              <p class="text-sm text-primary-100 mt-1">条款节点清晰，多方签署留痕可追溯</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"><ClipboardCheck class="w-6 h-6" /></div>
            <div>
              <h3 class="font-semibold">履行跟踪督办</h3>
              <p class="text-sm text-primary-100 mt-1">节点提醒、逾期预警、回访闭环</p>
            </div>
          </div>
        </div>
        <p class="text-xs text-primary-200">© 2024 街道社会治理综合服务中心</p>
      </div>
      <div class="flex-1 p-12 flex flex-col justify-center">
        <h2 class="text-3xl font-bold text-gray-800">欢迎登录</h2>
        <p class="text-gray-500 mt-2">请选择您的身份角色进入系统</p>
        <div class="mt-8 grid grid-cols-2 gap-4">
          <button
            v-for="role in roles"
            :key="role.value"
            @click="selectRole(role.value)"
            class="group relative p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg"
            :class="selected === role.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'"
          >
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-3" :class="selected === role.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600'">
              <component :is="role.icon" class="w-6 h-6" />
            </div>
            <h3 class="font-bold text-gray-800">{{ role.label }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ role.desc }}</p>
            <div v-if="selected === role.value" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"><Check class="w-3 h-3 text-white" /></div>
          </button>
        </div>
        <button
          @click="login"
          :disabled="!selected"
          class="mt-8 w-full py-3 rounded-xl font-semibold transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          :class="selected ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25' : ''"
        >
          进入平台
        </button>
        <div class="mt-6 text-center text-xs text-gray-400">
          演示系统 · 无需输入账号密码
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { Scale, FileText, FileSignature, ClipboardCheck, Users, ShieldAlert, MapPin, Check, UserCheck } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import type { UserRole } from '../types'

const store = useUserStore()
const router = useRouter()
const selected = ref<UserRole | null>(null)

const roles = [
  { value: 'grid_worker' as UserRole, label: '网格员', desc: '线索登记 日常回访', icon: markRaw(MapPin) },
  { value: 'mediator' as UserRole, label: '调解员', desc: '调解会议 协议签署', icon: markRaw(Users) },
  { value: 'party' as UserRole, label: '当事人', desc: '进度查询 协议确认', icon: markRaw(UserCheck) },
  { value: 'judicial' as UserRole, label: '司法所', desc: '重大督办 统计分析', icon: markRaw(ShieldAlert) }
]

function selectRole(r: UserRole) { selected.value = r }
function login() {
  if (!selected.value) return
  store.login(selected.value)
  router.push('/dashboard')
}
</script>
