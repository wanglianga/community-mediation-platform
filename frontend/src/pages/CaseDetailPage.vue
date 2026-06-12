<template>
  <div v-if="data" class="space-y-6">
    <div class="card !p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-5">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shrink-0 shadow-lg">
            <FileText class="w-9 h-9" />
          </div>
          <div>
            <div class="flex items-center flex-wrap gap-2 mb-2">
              <span class="font-mono text-sm text-gray-400">{{ data.caseNo }}</span>
              <span v-if="data.isMajor" class="badge bg-red-100 text-red-700">重大纠纷</span>
              <span v-if="data.isKeyFocus" class="badge bg-purple-100 text-purple-700">⭐ 重点关注</span>
              <span v-if="data.isRelapse" class="badge bg-orange-100 text-orange-700">🔄 已复发</span>
              <span v-if="data.relapseCount && data.relapseCount > 0" class="badge bg-orange-100 text-orange-700">复发×{{ data.relapseCount }}</span>
              <span v-if="data.escalationAction === 'joint_mediation'" class="badge bg-indigo-100 text-indigo-700">联席调解</span>
              <span v-if="data.escalationAction === 'legal_aid'" class="badge bg-blue-100 text-blue-700">法律援助</span>
              <span v-if="(data.repeatCount || 0) > 0" class="badge bg-orange-100 text-orange-700">重复×{{ data.repeatCount }}</span>
              <span v-if="data.status === 'escalated'" class="badge bg-rose-100 text-rose-700">情绪升级</span>
              <span v-if="data.status === 'supervision_pending'" class="badge bg-red-100 text-red-700">督办中</span>
              <span v-if="data.status === 'relapse'" class="badge bg-orange-100 text-orange-700">已复发</span>
              <span v-if="data.status === 'merged'" class="badge bg-gray-300 text-gray-700">已合并</span>
              <span class="badge" :class="sc(data.status)">{{ st(data.status) }}</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ data.title }}</h1>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span>📍 {{ data.location }}</span>
              <span>📂 {{ catL(data.category) }}</span>
              <span>📅 登记：{{ d(data.submitTime) }}</span>
              <span>👮 网格员：{{ data.gridWorkerName }}</span>
              <span>⚖️ 调解员：{{ data.mediatorName || '待分派' }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col space-y-2 items-end">
          <button @click="router.back()" class="btn-outline !py-1.5"><ArrowLeft class="w-4 h-4 mr-1" />返回</button>
          <div v-if="showActions" class="flex flex-wrap gap-2 justify-end">
            <button v-if="['clue_accepted'].includes(data.status)" @click="doAssign" class="btn-primary !py-1.5 text-xs"><UserPlus class="w-3 h-3 mr-1" />分派调解</button>
            <button v-if="['assigned', 'meeting_refused'].includes(data.status)" @click="goMeeting" class="btn-primary !py-1.5 text-xs"><Calendar class="w-3 h-3 mr-1" />安排会议</button>
            <button v-if="['meeting_completed'].includes(data.status)" @click="goAgreement" class="btn-primary !py-1.5 text-xs"><FileSignature class="w-3 h-3 mr-1" />草拟协议</button>
            <button v-if="store.canSupervise" @click="escalate" class="btn-danger !py-1.5 text-xs"><TrendingUp class="w-3 h-3 mr-1" />升级</button>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><Users class="w-5 h-5 mr-2 text-primary-600" />当事人信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="p in data.parties" :key="p.id" class="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div class="flex items-center justify-between mb-2">
                <span class="badge" :class="p.role === 'plaintiff' ? 'bg-blue-100 text-blue-700' : p.role === 'defendant' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'">
                  {{ p.role === 'plaintiff' ? '申请人' : p.role === 'defendant' ? '被申请人' : '第三人' }}
                </span>
              </div>
              <h3 class="font-bold text-gray-800">{{ p.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">📞 {{ p.phone }}</p>
              <p v-if="p.address" class="text-sm text-gray-500">🏠 {{ p.address }}</p>
            </div>
          </div>
        </div>
        <div class="card">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><FileText class="w-5 h-5 mr-2 text-primary-600" />纠纷情况</h2>
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{{ data.description }}</p>
        </div>
        <div class="card" v-if="agreementList.length">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><FileSignature class="w-5 h-5 mr-2 text-primary-600" />调解协议</h2>
          <div v-for="a in agreementList" :key="a.id" class="p-4 border border-gray-100 rounded-xl mb-3 last:mb-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-gray-800">{{ a.title }}</h3>
              <span class="badge" :class="a.status === 'effective' || a.status === 'fully_signed' ? 'status-completed' : a.status === 'rejected' ? 'status-rejected' : a.status === 'pending_sign' ? 'status-pending' : 'bg-teal-100 text-teal-700'">
                {{ agStatus(a.status) }}
              </span>
            </div>
            <div class="space-y-2 mb-3">
              <div v-for="t in a.terms" :key="t.id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">{{ t.order }}</span>
                <div class="flex-1">
                  <p class="text-sm text-gray-800">{{ t.content }}</p>
                  <div class="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>负责方：{{ t.partyResponsible }}</span>
                    <span v-if="t.deadline">期限：{{ t.deadline }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div class="flex items-center space-x-3">
                <span v-for="s in a.signatures" :key="s.partyId" class="inline-flex items-center">
                  <span :class="s.status === 'signed' ? 'text-green-600' : s.status === 'rejected' ? 'text-red-600' : 'text-gray-400'">{{ s.status === 'signed' ? '✓' : s.status === 'rejected' ? '✗' : '○' }}</span>
                  <span class="ml-1">{{ s.partyName }}</span>
                </span>
              </div>
              <span v-if="a.effectiveTime">生效：{{ d(a.effectiveTime) }}</span>
            </div>
            <button v-if="(a.status === 'pending_sign' || a.status === 'partially_signed') && store.canSignAgreement" @click="goAgreement(a.id)" class="btn-primary mt-3 !py-1.5 text-xs">签署/查看协议 →</button>
          </div>
        </div>
        <div class="card" v-if="meetings.length">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><Calendar class="w-5 h-5 mr-2 text-primary-600" />调解会议</h2>
          <div v-for="m in meetings" :key="m.id" class="p-4 border border-gray-100 rounded-xl mb-3 last:mb-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-gray-800">{{ m.title }}</h3>
              <span class="badge" :class="m.status === 'completed' ? 'status-completed' : m.status === 'refused' ? 'status-rejected' : m.status === 'scheduled' ? 'status-pending' : 'status-progress'">
                {{ mStatus(m.status) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
              <span>📅 {{ d(m.scheduleTime) }}</span>
              <span>📍 {{ m.location }}</span>
              <span>⚖️ 调解员：{{ m.mediatorName }}</span>
              <span>👥 参会：{{ m.participants.length }} 人</span>
            </div>
            <div class="mb-3">
              <p class="text-xs text-gray-500 mb-1">参会状态：</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="p in m.participants" :key="p.id" class="badge text-xs" :class="p.status === 'attended' ? 'bg-green-100 text-green-700' : p.status === 'refused' ? 'bg-red-100 text-red-700' : p.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'">
                  {{ p.name }} · {{ pStatus(p.status) }}
                </span>
              </div>
            </div>
            <div v-if="m.minutes" class="p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-600 mb-1">📝 会议记录</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ m.minutes }}</p>
              <p v-if="m.resolution" class="text-sm text-primary-700 mt-2 font-medium">✓ 达成共识：{{ m.resolution }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><TrendingUp class="w-5 h-5 mr-2 text-primary-600" />案件风险评估</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1.5"><span class="text-gray-600">情绪等级</span><span class="font-semibold" :class="(data.emotionLevel || 0) >= 4 ? 'text-red-600' : (data.emotionLevel || 0) >= 3 ? 'text-amber-600' : 'text-green-600'">{{ data.emotionLevel || 0 }} / 5</span></div>
              <div class="flex space-x-1"><div v-for="i in 5" :key="i" class="flex-1 h-2 rounded-full" :class="i <= (data.emotionLevel || 0) ? ((data.emotionLevel || 0) >= 4 ? 'bg-red-500' : (data.emotionLevel || 0) >= 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-200'"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1.5"><span class="text-gray-600">紧急程度</span><span class="font-semibold" :class="pCls(data.priority)">{{ pTxt(data.priority) }}</span></div>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <div class="text-center p-3 rounded-lg bg-gray-50"><p class="text-xs text-gray-500">重复投诉</p><p class="text-xl font-bold text-gray-800 mt-1">{{ data.repeatCount || 0 }}</p></div>
              <div class="text-center p-3 rounded-lg bg-gray-50"><p class="text-xs text-gray-500">拒会次数</p><p class="text-xl font-bold text-gray-800 mt-1">{{ data.refusalCount || 0 }}</p></div>
              <div class="text-center p-3 rounded-lg bg-gray-50"><p class="text-xs text-gray-500">逾期次数</p><p class="text-xl font-bold text-gray-800 mt-1">{{ data.overdueCount || 0 }}</p></div>
              <div class="text-center p-3 rounded-lg" :class="data.isMajor ? 'bg-red-50' : 'bg-gray-50'"><p class="text-xs text-gray-500">重大标记</p><p class="text-xl font-bold mt-1" :class="data.isMajor ? 'text-red-600' : 'text-gray-800'">{{ data.isMajor ? '是' : '否' }}</p></div>
            </div>
          </div>
        </div>
        <div class="card" v-if="data.originalCaseId">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><RefreshCw class="w-5 h-5 mr-2 text-orange-500" />关联原案件</h2>
          <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p class="text-xs text-orange-600 mb-2">🔄 本案件为复发案件，关联原案件信息：</p>
            <p class="text-sm font-medium text-orange-800 cursor-pointer hover:underline" @click="goCase(data.originalCaseId!)">
              {{ originalCase?.caseNo }} - {{ originalCase?.title }} →
            </p>
            <p class="text-xs text-orange-600 mt-2">原案件状态：{{ originalCase ? st(originalCase.status) : '加载中...' }}</p>
          </div>
        </div>

        <div class="card" v-if="supervisionOrders.length > 0">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><FileText class="w-5 h-5 mr-2 text-red-500" />督办记录</h2>
          <div class="space-y-3">
            <div v-for="o in supervisionOrders" :key="o.id" class="p-3 rounded-lg border" :class="o.status === 'completed' ? 'bg-green-50 border-green-200' : o.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'">
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-xs text-gray-500">{{ o.id }}</span>
                <span class="badge" :class="{ 'bg-green-100 text-green-700': o.status === 'completed', 'bg-blue-100 text-blue-700': o.status === 'in_progress', 'bg-red-100 text-red-700': o.status === 'pending' }">
                  {{ o.status === 'completed' ? '已完成' : o.status === 'in_progress' ? '处理中' : '待处理' }}
                </span>
              </div>
              <p class="text-sm font-medium text-gray-800">{{ orderTypeText(o.type) }}</p>
              <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ o.description }}</p>
              <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>指派：{{ o.mediatorName }}</span>
                <span>截止：{{ d(o.deadline) }}</span>
              </div>
              <div v-if="o.result" class="mt-2 p-2 bg-white rounded text-xs text-gray-600">
                <span class="font-medium">处理结果：</span>{{ o.result }}
              </div>
            </div>
          </div>
        </div>

        <div class="card" v-if="similarCases.length > 0">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><AlertTriangle class="w-5 h-5 mr-2 text-orange-500" />相似/历史案件</h2>
          <div class="space-y-3">
            <p class="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
              ⚠️ 检测到 {{ similarCases.length }} 件同一当事人的历史/相似案件，请注意是否为重复投诉。
            </p>
            <div v-for="sc in similarCases" :key="sc.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer" @click="goCase(sc.id)">
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-xs text-gray-400">{{ sc.caseNo }}</span>
                <span class="badge" :class="scCls(sc.status)">{{ scTxt(sc.status) }}</span>
              </div>
              <p class="text-sm font-medium text-gray-800 line-clamp-1">{{ sc.title }}</p>
              <p class="text-xs text-gray-500 mt-1">登记：{{ d(sc.submitTime) }}</p>
            </div>
            <button v-if="store.canMediate && data.status !== 'merged'" @click="openMerge" class="w-full btn-warning !py-2 text-sm">
              <Merge class="w-4 h-4 mr-1.5" />合并处理
            </button>
          </div>
        </div>
        <div class="card" v-if="warnings.length > 0">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><Zap class="w-5 h-5 mr-2 text-rose-500" />情绪预警记录</h2>
          <div class="space-y-3">
            <div v-for="w in warnings" :key="w.id" class="p-3 rounded-lg border" :class="warnTypeCls(w.type)">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-sm">{{ warnTypeText(w.type) }}</span>
                <span class="text-xs text-gray-500">{{ d(w.reportTime, true) }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ w.description }}</p>
              <p class="text-xs text-gray-500 mt-2">记录人：{{ w.reporterName }}</p>
            </div>
          </div>
        </div>
        <div class="card" v-if="data.mergedInto || (data.mergedFrom && data.mergedFrom.length > 0)">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><GitBranch class="w-5 h-5 mr-2 text-gray-600" />合并关系</h2>
          <div class="space-y-3">
            <div v-if="data.mergedInto" class="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p class="text-xs text-blue-600 mb-2">📥 已并入主案件</p>
              <p class="text-sm font-medium text-blue-800 cursor-pointer hover:underline" @click="goCase(data.mergedInto!)">查看主案件 →</p>
            </div>
            <div v-if="data.mergedFrom && data.mergedFrom.length > 0">
              <p class="text-xs text-green-600 mb-2">📤 已合并案件（{{ data.mergedFrom.length }} 件）</p>
              <div v-for="mid in data.mergedFrom" :key="mid" class="p-2 bg-green-50 rounded border border-green-100 mb-2 cursor-pointer hover:bg-green-100 transition-colors" @click="goCase(mid)">
                <span class="text-sm text-green-800">{{ mid }}</span>
                <span class="text-xs text-green-600 ml-2">→ 点击查看</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><Clock class="w-5 h-5 mr-2 text-primary-600" />流转时间线</h2>
          <div class="relative pl-7 space-y-5">
            <div class="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            <div v-for="(e, i) in timeline" :key="e.id" class="relative">
              <div class="absolute -left-5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow" :class="i === 0 ? 'bg-primary-500' : e.type === 'relapse' ? 'bg-orange-500' : e.type === 'supervision' ? 'bg-red-500' : 'bg-gray-400'">
                <Check v-if="i !== timeline.length - 1" class="w-3 h-3" />
                <RefreshCw v-else-if="e.type === 'relapse'" class="w-3 h-3" />
                <AlertTriangle v-else-if="e.type === 'supervision'" class="w-3 h-3" />
                <Circle v-else class="w-2.5 h-2.5 animate-pulse" />
              </div>
              <div class="pt-0.5" :class="e.type === 'relapse' ? 'pl-2 border-l-2 border-orange-200' : ''">
                <div class="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                  <span>{{ d(e.timestamp, true) }}</span>
                  <span v-if="e.operatorName">· {{ e.operatorName }}</span>
                  <span v-if="e.type === 'relapse'" class="badge bg-orange-100 text-orange-700 !py-0 !px-1.5">🔄 复发</span>
                  <span v-if="e.type === 'supervision'" class="badge bg-red-100 text-red-700 !py-0 !px-1.5">🚨 督办</span>
                </div>
                <h4 class="text-sm font-semibold" :class="e.type === 'relapse' ? 'text-orange-700' : e.type === 'supervision' ? 'text-red-700' : 'text-gray-800'">{{ e.title }}</h4>
                <p class="text-xs text-gray-500 mt-0.5">{{ e.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card" v-if="fulfillmentNodes.length">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><ClipboardCheck class="w-5 h-5 mr-2 text-primary-600" />履行进度</h2>
          <div class="space-y-3">
            <div v-for="n in fulfillmentNodes" :key="n.id" class="p-3 rounded-lg border border-gray-100">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2"><span class="badge" :class="n.status === 'completed' ? 'status-completed' : n.status === 'overdue' || n.status === 'violated' ? 'status-overdue' : n.status === 'in_progress' ? 'status-progress' : 'status-pending'">{{ fStatus(n.status) }}</span></div>
                  <h4 class="text-sm font-medium text-gray-800 mt-1">{{ n.nodeName }}</h4>
                  <p class="text-xs text-gray-500 mt-0.5">{{ n.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">📅 {{ d(n.deadline) }} · 负责：{{ n.responsibleParty }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showAssign" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showAssign = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">分派调解员</h3>
          <div class="space-y-4">
            <div><label class="label-base">选择调解员</label>
              <select v-model="assignMediator" class="input-base">
                <option value="md1|李调解员">李调解员（街道调解中心，经验丰富）</option>
                <option value="md2|王调解员">王调解员（社区调解站）</option>
                <option value="md3|张调解员">张调解员（法院特邀）</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="showAssign = false" class="btn-outline">取消</button>
            <button @click="submitAssign" class="btn-primary">确认分派</button>
          </div>
        </div>
      </div>
      <div v-if="showMerge" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showMerge = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2">合并案件处理</h3>
          <p class="text-sm text-gray-500 mb-4">主案件：{{ data?.caseNo }} - {{ data?.title }}</p>
          <div class="space-y-4">
            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p class="text-sm font-semibold text-amber-800 mb-1">⚠️ 合并说明</p>
              <ul class="text-xs text-amber-700 space-y-1">
                <li>• 合并后，被合并案件状态变为"已合并"</li>
                <li>• 原投诉轨迹全部保留，可通过合并关系查看</li>
                <li>• 主案件重复计数 +1，情绪等级自动提升</li>
                <li>• 合并操作不可撤销，请谨慎操作</li>
              </ul>
            </div>
            <div>
              <label class="label-base">选择要合并的案件 <span class="text-red-500">*</span></label>
              <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                <label v-for="sc in similarCases" :key="sc.id" class="flex items-start p-3 bg-gray-50 rounded-lg border-2 cursor-pointer hover:border-orange-300 transition-colors" :class="mergeCaseId === sc.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'">
                  <input type="radio" v-model="mergeCaseId" :value="sc.id" class="mt-1 mr-3" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-mono text-xs text-gray-400">{{ sc.caseNo }}</span>
                      <span class="badge" :class="scCls(sc.status)">{{ scTxt(sc.status) }}</span>
                    </div>
                    <p class="text-sm font-medium text-gray-800">{{ sc.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">登记：{{ d(sc.submitTime) }} · {{ sc.parties.length }} 位当事人</p>
                  </div>
                </label>
                <div v-if="similarCases.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无可合并的相似案件</div>
              </div>
            </div>
            <div>
              <label class="label-base">合并原因 <span class="text-red-500">*</span></label>
              <textarea v-model="mergeReason" rows="3" class="input-base resize-none" placeholder="请说明合并原因，例如：同一当事人同一事项、系列纠纷等..." required></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button @click="showMerge = false" class="btn-outline">取消</button>
            <button @click="submitMerge" :disabled="!mergeCaseId || !mergeReason.trim()" class="btn-primary" :class="{ 'opacity-50 cursor-not-allowed': !mergeCaseId || !mergeReason.trim() }">确认合并</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <div v-else class="card text-center py-20 text-gray-400">加载中...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { FileText, Users, FileSignature, Calendar, Clock, TrendingUp, Check, Circle, ClipboardCheck, ArrowLeft, UserPlus, AlertTriangle, Zap, GitBranch, Merge, RefreshCw } from 'lucide-vue-next'
import type { Case, CaseTimeline, Meeting, Agreement, FulfillmentNode, PriorityLevel, DisputeCategory, EmotionWarning, EmotionWarningType, SupervisionOrder } from '../types'
import { caseApi, meetingApi, agreementApi } from '../api'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const data = ref<Case | null>(null)
const timeline = ref<CaseTimeline[]>([])
const meetings = ref<Meeting[]>([])
const agreementList = ref<Agreement[]>([])
const fulfillmentNodes = ref<FulfillmentNode[]>([])
const similarCases = ref<Case[]>([])
const warnings = ref<EmotionWarning[]>([])
const supervisionOrders = ref<SupervisionOrder[]>([])
const originalCase = ref<Case | null>(null)
const showAssign = ref(false)
const showMerge = ref(false)
const assignMediator = ref('md1|李调解员')
const mergeCaseId = ref('')
const mergeReason = ref('')

const showActions = computed(() => store.canMediate || store.canSupervise)

function d(t: string, full = false) { return dayjs(t).format(full ? 'MM-DD HH:mm' : 'YYYY-MM-DD') }
function st(s: CaseStatus) { return { clue_submitted: '待受理', clue_accepted: '已受理', assigned: '已分派', meeting_scheduled: '会议排期', meeting_refused: '拒绝参会', meeting_completed: '会议完成', agreement_drafted: '协议草拟', agreement_signed: '协议已签', agreement_rejected: '协议被拒', fulfillment_start: '履行中', fulfillment_overdue: '履行逾期', fulfillment_completed: '履行完成', followup_pending: '待回访', followup_completed: '回访完成', escalated: '情绪升级', case_closed: '结案', repeat_complaint: '重复投诉', merged: '已合并', supervision_pending: '督办中', relapse: '已复发' }[s] || s }
function sc(s: CaseStatus) { return { clue_submitted: 'status-pending', clue_accepted: 'status-pending', assigned: 'bg-blue-100 text-blue-700', meeting_scheduled: 'bg-purple-100 text-purple-700', meeting_refused: 'status-rejected', meeting_completed: 'bg-indigo-100 text-indigo-700', agreement_drafted: 'bg-violet-100 text-violet-700', agreement_signed: 'bg-teal-100 text-teal-700', agreement_rejected: 'status-rejected', fulfillment_start: 'status-progress', fulfillment_overdue: 'status-overdue', fulfillment_completed: 'status-completed', followup_pending: 'bg-cyan-100 text-cyan-700', followup_completed: 'status-completed', escalated: 'status-escalated', case_closed: 'status-completed', repeat_complaint: 'bg-orange-100 text-orange-700', merged: 'bg-gray-200 text-gray-700', supervision_pending: 'bg-red-100 text-red-700', relapse: 'bg-orange-100 text-orange-700' }[s] || '' }
function orderTypeText(t: string) {
  return { not_fulfilled: '未履行督办', overdue: '超期督办', relapse: '复发督办', supervision: '常规督办' }[t] || t
}
function scTxt(s: CaseStatus) { return st(s) }
function scCls(s: CaseStatus) { return sc(s) }
function catL(c: DisputeCategory) { return { noise: '邻里噪声', parking: '停车占位', property: '物业收费', support: '家庭赡养', neighbor: '邻里纠纷', family: '家庭纠纷', contract: '合同纠纷', other: '其他' }[c] || c }
function agStatus(s: string) { return { draft: '草拟中', pending_sign: '待签署', partially_signed: '部分签署', fully_signed: '已签署', rejected: '已被拒', effective: '已生效' }[s] || s }
function mStatus(s: string) { return { scheduled: '已排期', confirmed: '已确认', in_progress: '进行中', completed: '已完成', cancelled: '已取消', refused: '参会人拒绝' }[s] || s }
function pStatus(s: string) { return { invited: '待确认', confirmed: '已确认', refused: '拒绝', attended: '已参会', absent: '缺席' }[s] || s }
function pTxt(p: PriorityLevel) { return { low: '低', medium: '中', high: '高', urgent: '紧急' }[p] }
function pCls(p: PriorityLevel) { return { low: 'text-green-600', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600' }[p] }
function fStatus(s: string) { return { pending: '待开始', in_progress: '进行中', completed: '已完成', overdue: '已逾期', violated: '违约' }[s] || s }
function warnTypeText(t: EmotionWarningType) { return { threat: '⚠️ 威胁言论', gathering: '👥 聚集倾向', verbal_abuse: '💢 持续辱骂', other: '其他异常' }[t] || t }
function warnTypeCls(t: EmotionWarningType) {
  return { threat: 'bg-red-50 border-red-200', gathering: 'bg-orange-50 border-orange-200', verbal_abuse: 'bg-amber-50 border-amber-200', other: 'bg-gray-50 border-gray-200' }[t] || 'bg-gray-50 border-gray-200'
}

async function load() {
  const id = route.params.id as string
  data.value = await caseApi.get(id)
  timeline.value = await caseApi.getTimeline(id)
  meetings.value = await meetingApi.list(id)
  agreementList.value = await agreementApi.list(id)
  if (agreementList.value.length) fulfillmentNodes.value = await agreementApi.getFulfillmentNodes(agreementList.value[0].id)
  if (data.value?.parties?.length) {
    const firstPartyName = data.value.parties[0]?.name || ''
    if (firstPartyName) {
      similarCases.value = await caseApi.findSimilar(firstPartyName, data.value.category, id)
    }
  }
  warnings.value = await caseApi.getWarnings(id)
  supervisionOrders.value = await caseApi.getCaseSupervisionOrders(id)
  if (data.value?.originalCaseId) {
    originalCase.value = await caseApi.get(data.value.originalCaseId)
  }
}
function doAssign() { showAssign.value = true }
async function submitAssign() {
  const [mid, mname] = assignMediator.value.split('|')
  await caseApi.assignMediator(data.value!.id, mid, mname)
  showAssign.value = false
  await load()
}
function openMerge() {
  mergeCaseId.value = ''
  mergeReason.value = ''
  showMerge.value = true
}
async function submitMerge() {
  if (!mergeCaseId.value || !mergeReason.value.trim() || !data.value) return
  await caseApi.mergeCase(data.value.id, mergeCaseId.value, mergeReason.value, store.userName)
  showMerge.value = false
  await load()
}
async function escalate() { await caseApi.updateStatus(data.value!.id, 'escalated'); await load() }
function goCase(id: string) { router.push(`/case/${id}`) }
function goMeeting() { router.push(`/mediation/meeting/${data.value?.id}`) }
function goAgreement(id?: string) { router.push(id ? `/agreement/sign/${agreementList.value.find(a => a.id === id)?.caseId}` : `/agreement/sign/${data.value?.id}`) }

onMounted(load)
</script>
