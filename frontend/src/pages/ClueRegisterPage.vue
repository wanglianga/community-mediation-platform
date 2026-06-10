<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-gray-800">登记纠纷线索</h2>
          <p class="text-xs text-gray-500">网格员上门或电话登记，一键转立案</p>
        </div>
        <form @submit.prevent="submit" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="label-base">纠纷标题 <span class="text-red-500">*</span></label>
              <input v-model="form.title" class="input-base" placeholder="例如：302室夜间噪声扰民纠纷" required />
            </div>
            <div>
              <label class="label-base">纠纷类别 <span class="text-red-500">*</span></label>
              <select v-model="form.category" class="input-base" required>
                <option value="noise">邻里噪声</option>
                <option value="parking">停车占位</option>
                <option value="property">物业收费</option>
                <option value="support">家庭赡养</option>
                <option value="neighbor">邻里纠纷</option>
                <option value="family">家庭纠纷</option>
                <option value="contract">合同纠纷</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label class="label-base">紧急程度</label>
              <select v-model="form.priority" class="input-base">
                <option value="low">低（常规处理）</option>
                <option value="medium">中（尽快安排）</option>
                <option value="high">高（优先处理）</option>
                <option value="urgent">紧急（需立即介入）</option>
              </select>
            </div>
            <div>
              <label class="label-base">发生地点 <span class="text-red-500">*</span></label>
              <input v-model="form.location" class="input-base" placeholder="例如：幸福小区3号楼4单元" required />
            </div>
            <div>
              <label class="label-base">举报人/联系人</label>
              <input v-model="form.informantName" class="input-base" placeholder="选填，可匿名" />
            </div>
            <div>
              <label class="label-base">联系电话</label>
              <input v-model="form.informantPhone" class="input-base" placeholder="便于后续回访" />
            </div>
            <div>
              <label class="label-base">登记人（网格员）</label>
              <input :value="store.userName" disabled class="input-base bg-gray-50 text-gray-500" />
            </div>
            <div class="md:col-span-2">
              <label class="label-base">纠纷情况描述 <span class="text-red-500">*</span></label>
              <textarea v-model="form.description" rows="5" class="input-base resize-none" placeholder="请详细描述纠纷起因、经过、双方诉求及目前状态..." required></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="label-base">当事人信息（至少填写1人）</label>
              <div class="space-y-3">
                <div v-for="(p, i) in form.parties" :key="i" class="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
                  <select v-model="p.role" class="input-base !w-28">
                    <option value="plaintiff">申请人</option>
                    <option value="defendant">被申请人</option>
                    <option value="third_party">第三人</option>
                  </select>
                  <input v-model="p.name" class="input-base !w-40" placeholder="姓名" />
                  <input v-model="p.phone" class="input-base !w-40" placeholder="电话" />
                  <input v-model="p.address" class="input-base flex-1 min-w-[150px]" placeholder="地址" />
                  <button type="button" v-if="form.parties.length > 1" @click="removeParty(i)" class="btn-danger !py-1.5 !px-3"><X class="w-4 h-4" /></button>
                </div>
                <button type="button" @click="addParty" class="btn-outline text-sm !w-full !py-2.5 border-dashed"><Plus class="w-4 h-4 mr-1" />添加一位当事人</button>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="label-base">证据材料（可留空）</label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/20 transition-colors cursor-pointer">
                <Upload class="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p class="text-sm text-gray-500">点击或拖拽上传（照片、录音、聊天记录截图等）</p>
                <p class="text-xs text-gray-400 mt-1">支持 JPG / PNG / PDF / MP3，单文件不超过 10MB</p>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input type="checkbox" v-model="form.needSiteVisit" class="mt-1 rounded text-primary-600" />
                <div>
                  <p class="text-sm font-medium text-gray-800">建议上门实地走访</p>
                  <p class="text-xs text-gray-500 mt-0.5">如涉及现场情况，请勾选以便安排调解员入户核实</p>
                </div>
              </label>
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" class="btn-outline !px-6">暂存草稿</button>
            <button type="submit" class="btn-primary !px-8"><Send class="w-4 h-4 mr-1.5" />提交线索</button>
          </div>
        </form>
      </div>
    </div>
    <div class="space-y-6">
      <div class="card bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center"><Lightbulb class="w-5 h-5 mr-2 text-amber-500" />常见纠纷类型参考</h3>
        <div class="space-y-2">
          <div v-for="tip in tips" :key="tip.title" class="p-3 bg-white rounded-lg border border-gray-100 hover:border-primary-200 cursor-pointer transition-colors" @click="applyTip(tip)">
            <h4 class="text-sm font-semibold text-gray-800">{{ tip.title }}</h4>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center"><Info class="w-5 h-5 mr-2 text-primary-500" />登记小贴士</h3>
        <ul class="space-y-2.5 text-sm text-gray-600">
          <li class="flex items-start"><CheckCircle class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />标题简明扼要，包含地点+事由+主体</li>
          <li class="flex items-start"><CheckCircle class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />描述按起因-经过-现状顺序撰写</li>
          <li class="flex items-start"><CheckCircle class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />尽可能写明双方联系方式</li>
          <li class="flex items-start"><CheckCircle class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />有冲突升级迹象直接标记"紧急"</li>
          <li class="flex items-start"><CheckCircle class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />重大群体性纠纷请立即电话上报</li>
        </ul>
      </div>
      <div v-if="similarCases.length > 0" class="card border-orange-200 bg-orange-50/50">
        <h3 class="font-bold text-orange-800 mb-3 flex items-center"><AlertTriangle class="w-5 h-5 mr-2" />检测到历史案件</h3>
        <p class="text-xs text-orange-700 mb-3">系统检测到同一位当事人曾有过类似纠纷记录，请特别注意：</p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="sc in similarCases" :key="sc.id" class="p-2.5 bg-white rounded-lg border border-orange-100 hover:border-orange-300 cursor-pointer transition-colors" @click="router.push(`/case/${sc.id}`)">
            <div class="flex items-center justify-between mb-1">
              <span class="font-mono text-xs text-gray-400">{{ sc.caseNo }}</span>
              <span class="badge" :class="scCls(sc.status)">{{ scTxt(sc.status) }}</span>
            </div>
            <p class="text-sm font-medium text-gray-800 line-clamp-1">{{ sc.title }}</p>
            <p class="text-xs text-gray-500 mt-1">登记：{{ d(sc.submitTime) }}</p>
          </div>
        </div>
        <p class="text-xs text-orange-600 mt-3">💡 提示：受理后可在案件详情页进行合并处理</p>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showResult" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showResult = false">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div class="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-5">
            <CheckCircle class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">线索提交成功</h3>
          <p class="text-gray-500 mb-6">编号：{{ submittedClue?.id || '-' }}<br />社区调解中心将在24小时内受理审核</p>
          <div class="flex space-x-3">
            <button @click="showResult = false; router.push('/clue/list')" class="btn-outline flex-1">查看线索列表</button>
            <button @click="reset(); showResult = false" class="btn-primary flex-1">继续登记</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Plus, X, Upload, Send, Lightbulb, Info, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import { clueApi, caseApi } from '../api'
import { useUserStore } from '../stores/user'
import type { DisputeCategory, Clue, Party, Case, CaseStatus } from '../types'

const store = useUserStore()
const router = useRouter()
const showResult = ref(false)
const submittedClue = ref<Clue | null>(null)
const similarCases = ref<Case[]>([])

const form = reactive({
  title: '', category: 'neighbor' as DisputeCategory, priority: 'medium',
  location: '', description: '',
  informantName: '', informantPhone: '',
  needSiteVisit: false,
  parties: [{ role: 'plaintiff' as const, name: '', phone: '', address: '' }] as Party[]
})

function d(t: string, full = false) { return dayjs(t).format(full ? 'MM-DD HH:mm' : 'YYYY-MM-DD') }
function scTxt(s: CaseStatus) { return { clue_submitted: '待受理', clue_accepted: '已受理', assigned: '已分派', meeting_scheduled: '会议排期', meeting_refused: '拒绝参会', meeting_completed: '会议完成', agreement_drafted: '协议草拟', agreement_signed: '协议已签', agreement_rejected: '协议被拒', fulfillment_start: '履行中', fulfillment_overdue: '履行逾期', fulfillment_completed: '履行完成', followup_pending: '待回访', followup_completed: '回访完成', escalated: '情绪升级', case_closed: '结案', repeat_complaint: '重复投诉', merged: '已合并' }[s] || s }
function scCls(s: CaseStatus) { return { clue_submitted: 'status-pending', clue_accepted: 'status-pending', assigned: 'bg-blue-100 text-blue-700', meeting_scheduled: 'bg-purple-100 text-purple-700', meeting_refused: 'status-rejected', meeting_completed: 'bg-indigo-100 text-indigo-700', agreement_drafted: 'bg-violet-100 text-violet-700', agreement_signed: 'bg-teal-100 text-teal-700', agreement_rejected: 'status-rejected', fulfillment_start: 'status-progress', fulfillment_overdue: 'status-overdue', fulfillment_completed: 'status-completed', followup_pending: 'bg-cyan-100 text-cyan-700', followup_completed: 'status-completed', escalated: 'status-escalated', case_closed: 'status-completed', repeat_complaint: 'bg-orange-100 text-orange-700', merged: 'bg-gray-200 text-gray-700' }[s] || '' }

let searchTimer: any = null
watch(() => form.parties.map(p => p.name).join(','), () => {
  clearTimeout(searchTimer)
  const firstName = form.parties.find(p => p.name.trim())?.name.trim()
  if (!firstName) {
    similarCases.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    similarCases.value = await caseApi.findSimilar(firstName, form.category)
  }, 500)
}, { deep: true })

const tips = [
  { title: '邻里噪声类', desc: '多发生于夜间，涉及装修、家电、乐器、宠物、娱乐活动等，需记录时间频率及取证方式', cat: 'noise' as DisputeCategory },
  { title: '停车占位类', desc: '车位被占用、地锁被破坏、消防通道被堵等，需要求物业提供登记台账', cat: 'parking' as DisputeCategory },
  { title: '物业收费类', desc: '物业费、水电费、维修基金争议，需要求提供缴费凭证和服务合同', cat: 'property' as DisputeCategory },
  { title: '家庭赡养类', desc: '老人赡养、抚养费、财产继承等，注意情绪疏导并评估老人实际情况', cat: 'support' as DisputeCategory }
]

function addParty() { form.parties.push({ role: 'plaintiff', name: '', phone: '', address: '' }) }
function removeParty(i: number) { form.parties.splice(i, 1) }
function applyTip(t: typeof tips[number]) {
  form.category = t.cat
  form.title = t.title.replace('类', '：请补充具体楼栋房号')
  form.priority = t.cat === 'support' || t.cat === 'property' ? 'high' : 'medium'
}
async function submit() {
  const res = await clueApi.create({
    ...form,
    gridWorkerId: store.currentUser?.id,
    gridWorkerName: store.userName
  })
  submittedClue.value = res
  showResult.value = true
}
function reset() {
  form.title = ''; form.category = 'neighbor'; form.priority = 'medium'
  form.location = ''; form.description = ''
  form.informantName = ''; form.informantPhone = ''
  form.needSiteVisit = false
  form.parties = [{ role: 'plaintiff', name: '', phone: '', address: '' }]
}
</script>
