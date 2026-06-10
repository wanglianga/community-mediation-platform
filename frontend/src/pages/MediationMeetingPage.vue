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
          <div class="space-y-1.5">
            <div v-for="p in m.participants" :key="p.id" class="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg">
              <span class="text-gray-800">{{ p.name }} <span class="text-gray-400 ml-2 text-xs">{{ p.role }}</span></span>
              <div class="flex items-center space-x-2">
                <span class="badge text-xs" :class="p.status === 'attended' ? 'bg-green-100 text-green-700' : p.status === 'refused' ? 'bg-red-100 text-red-700' : p.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : p.status === 'absent' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'">{{ pStatus(p.status) }}</span>
                <button v-if="(m.status === 'scheduled' || m.status === 'confirmed') && p.status !== 'refused'" @click="openRefuse(m.id, p.id)" class="text-xs text-red-500 hover:text-red-600">拒</button>
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
          <h3 class="text-xl font-bold text-gray-800 mb-5">{{ modalMode === 'create' ? '安排调解会议' : modalMode === 'complete' ? '记录调解结果' : modalMode === 'refuse' ? '记录拒绝原因' : '编辑会议' }}</h3>
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
                  <div v-for="(p, i) in mf.participants" :key="i" class="flex gap-2 items-center">
                    <input v-model="p.name" class="input-base !w-32" placeholder="姓名" />
                    <input v-model="p.role" class="input-base !w-28" placeholder="角色" />
                    <select v-model="p.status" class="input-base !w-24"><option value="invited">邀请中</option><option value="confirmed">已确认</option><option value="attended">已参会</option><option value="refused">拒绝</option><option value="absent">缺席</option></select>
                    <button v-if="mf.participants.length > 1" type="button" @click="mf.participants.splice(i,1)" class="text-red-500 hover:text-red-600">×</button>
                  </div>
                  <button type="button" @click="mf.participants.push({id:'',name:'',role:'',status:'invited'})" class="btn-outline text-xs !w-full !py-1.5 border-dashed">+ 添加参会人</button>
                </div>
              </div>
              <div><label class="label-base">诉求/需准备材料（每行一条）</label><textarea v-model="reqText" rows="3" class="input-base resize-none" placeholder="例如：&#10;1. 提供身份证复印件&#10;2. 携带证据原件"></textarea></div>
            </template>
            <template v-if="modalMode === 'complete'">
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
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" @click="showModal = false" class="btn-outline">取消</button>
              <button type="submit" class="btn-primary">确认{{ modalMode === 'create' ? '创建' : modalMode === 'complete' ? '提交' : modalMode === 'refuse' ? '记录' : '保存' }}</button>
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
import { Plus, Calendar, MapPin, User, Users, FileText, Paperclip, Check } from 'lucide-vue-next'
import type { Meeting, Case } from '../types'
import { meetingApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const list = ref<Meeting[]>([])
const cases = ref<Case[]>([])
const filterCase = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'complete' | 'refuse'>('create')
const targetId = ref('')
const targetPid = ref('')
const reqText = ref('')

const mf = reactive({
  caseId: '', title: '', scheduleTime: '', location: '',
  participants: [] as any[], minutes: '', resolution: '', refuseReason: ''
})

function statusText(s: string) { return { scheduled: '已排期', confirmed: '已确认', in_progress: '进行中', completed: '已完成', cancelled: '已取消', refused: '参会人拒绝' }[s] || s }
function statusCls(s: string) { return { scheduled: 'status-pending', confirmed: 'bg-blue-100 text-blue-700', in_progress: 'status-progress', completed: 'status-completed', cancelled: 'status-rejected', refused: 'bg-red-100 text-red-700' }[s] || '' }
function pStatus(s: string) { return { invited: '待确认', confirmed: '已确认', refused: '拒绝', attended: '已参会', absent: '缺席' }[s] || s }

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
    mf.participants = c.parties.map(p => ({ ...p, status: 'invited' }))
  }
}

function openCreate() {
  Object.assign(mf, { caseId: cases.value[0]?.id || '', title: '', scheduleTime: dayjs().add(1, 'day').hour(14).minute(0).format('YYYY-MM-DDTHH:mm'), location: '街道调解中心', participants: [], minutes: '', resolution: '', refuseReason: '' })
  reqText.value = ''; modalMode.value = 'create'; showModal.value = true
}
function edit(id: string) {
  const m = list.value.find(x => x.id === id); if (!m) return
  Object.assign(mf, { caseId: m.caseId, title: m.title, scheduleTime: dayjs(m.scheduleTime).format('YYYY-MM-DDTHH:mm'), location: m.location, participants: m.participants.map(p => ({ ...p })), minutes: m.minutes || '', resolution: m.resolution || '', refuseReason: '' })
  reqText.value = m.requirements.join('\n'); modalMode.value = 'edit'; targetId.value = id; showModal.value = true
}
function openComplete(id: string) { targetId.value = id; Object.assign(mf, { minutes: '', resolution: '', refuseReason: '' }); modalMode.value = 'complete'; showModal.value = true }
function openRefuse(mid: string, pid: string) { targetId.value = mid; targetPid.value = pid; Object.assign(mf, { refuseReason: '' }); modalMode.value = 'refuse'; showModal.value = true }

async function submitModal() {
  if (modalMode.value === 'create') {
    await meetingApi.create({ ...mf, requirements: reqText.value.split('\n').map(x => x.trim()).filter(Boolean) })
  } else if (modalMode.value === 'edit') {
    await meetingApi.update(targetId.value, { ...mf, requirements: reqText.value.split('\n').map(x => x.trim()).filter(Boolean) })
  } else if (modalMode.value === 'complete') {
    await meetingApi.complete(targetId.value, { minutes: mf.minutes, resolution: mf.resolution })
  } else if (modalMode.value === 'refuse') {
    await meetingApi.recordRefusal(targetId.value, targetPid.value, mf.refuseReason)
  }
  showModal.value = false
  list.value = filterCase.value ? await meetingApi.list(filterCase.value) : await meetingApi.list()
  cases.value = await caseApi.list()
}

onMounted(async () => { list.value = await meetingApi.list(); cases.value = await caseApi.list() })
</script>
