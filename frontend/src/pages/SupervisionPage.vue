<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div v-for="s in cards" :key="s.label" class="card !p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ s.label }}</p>
          <p class="text-3xl font-bold mt-2" :class="s.color">{{ s.value }}</p>
        </div>
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="s.bg">
          <component :is="s.icon" class="w-7 h-7" :class="s.iconColor" />
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-1 border-b border-gray-200">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" class="px-6 py-3 text-sm font-medium transition-colors" :class="activeTab === tab.key ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'">
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <div v-if="activeTab === 'supervision'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">重点督办案件（{{ filtered.length }}）</h2>
        <div class="flex items-center space-x-3">
          <select v-model="filterType" class="input-base !w-40">
            <option value="">全部类型</option>
            <option value="major">重大纠纷</option>
            <option value="escalated">情绪升级</option>
            <option value="overdue">履行逾期</option>
            <option value="repeat">重复投诉</option>
            <option value="emotion">高风险情绪</option>
          </select>
          <button @click="refresh" class="btn-outline"><RefreshCw class="w-4 h-4 mr-1.5" />刷新</button>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="c in filtered" :key="c.id" class="card border-l-4" :class="borderClass(c)">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start space-x-4 flex-1">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" :class="headerBg(c)">
                <component :is="headerIcon(c)" class="w-7 h-7" :class="headerColor(c)" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center flex-wrap gap-2 mb-2">
                  <span class="font-mono text-xs text-gray-400">{{ c.caseNo }}</span>
                  <span v-if="c.isMajor" class="badge bg-red-100 text-red-700">重大纠纷</span>
                  <span v-if="c.isKeyFocus" class="badge bg-purple-100 text-purple-700">⭐ 重点关注</span>
                  <span v-if="c.escalationAction === 'joint_mediation'" class="badge bg-indigo-100 text-indigo-700">联席调解</span>
                  <span v-if="c.escalationAction === 'legal_aid'" class="badge bg-blue-100 text-blue-700">法律援助</span>
                  <span v-if="c.status === 'escalated'" class="badge bg-rose-100 text-rose-700">情绪升级</span>
                  <span v-if="c.status === 'fulfillment_overdue'" class="badge bg-red-100 text-red-700">履行逾期</span>
                  <span v-if="c.status === 'repeat_complaint' || (c.repeatCount || 0) > 1" class="badge bg-orange-100 text-orange-700">重复投诉 × {{ c.repeatCount || 1 }}</span>
                  <span v-if="(c.emotionLevel || 0) >= 4 && c.status !== 'escalated'" class="badge bg-amber-100 text-amber-700">高危情绪 {{ c.emotionLevel }}/5</span>
                  <span v-if="c.status === 'meeting_refused'" class="badge bg-gray-200 text-gray-700">拒绝参会 × {{ c.refusalCount || 1 }}</span>
                  <span class="badge" :class="statusCls(c.status)">{{ statusText(c.status) }}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">{{ c.title }}</h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ c.description }}</p>
                <div class="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-gray-500">
                  <span>📍 {{ c.location }}</span>
                  <span>👥 调解员：{{ c.mediatorName || '待分派' }}</span>
                  <span>📅 登记：{{ dayjs(c.submitTime).format('YYYY-MM-DD') }}</span>
                  <span v-if="c.dueDate">⏰ 到期：{{ dayjs(c.dueDate).format('YYYY-MM-DD') }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col space-y-2 ml-4 shrink-0">
              <button @click="openAction(c.id, 'record')" class="btn-primary !py-1.5 !px-4 text-xs whitespace-nowrap"><MessageSquare class="w-3 h-3 mr-1" />督办记录</button>
              <button @click="openAction(c.id, 'escalation_action')" v-if="store.canSupervise" class="btn-warning !py-1.5 !px-4 text-xs whitespace-nowrap"><Zap class="w-3 h-3 mr-1" />升级处置</button>
              <button @click="openAction(c.id, 'assign')" v-if="store.canSupervise" class="btn-outline !py-1.5 !px-4 text-xs whitespace-nowrap"><UserPlus class="w-3 h-3 mr-1" />调整指派</button>
              <button @click="openAction(c.id, 'escalate')" v-if="c.status !== 'escalated'" class="btn-danger !py-1.5 !px-4 text-xs whitespace-nowrap"><TrendingUp class="w-3 h-3 mr-1" />标记升级</button>
              <button @click="goCase(c.id)" class="text-primary-600 hover:text-primary-700 text-xs font-medium text-right">查看详情 →</button>
            </div>
          </div>
          <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div class="flex items-center space-x-4">
              <div class="flex items-center text-xs text-gray-600">
                <span class="mr-2">情绪等级</span>
                <div class="flex space-x-0.5">
                  <div v-for="i in 5" :key="i" class="w-4 h-4 rounded-sm" :class="i <= (c.emotionLevel || 0) ? (c.emotionLevel! >= 4 ? 'bg-red-500' : c.emotionLevel! >= 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-200'"></div>
                </div>
              </div>
              <div class="flex items-center text-xs text-gray-600">
                <span class="mr-2">紧急程度</span>
                <span :class="priorityCls(c.priority)" class="badge">{{ priorityText(c.priority) }}</span>
              </div>
              <div class="flex items-center text-xs text-gray-600">
                <span class="mr-2">超期天数</span>
                <span :class="(c.overdueCount || 0) > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'">{{ c.overdueCount || 0 }} 天</span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-400">督办人：{{ c.judicialStaffName || '未指派' }}</span>
            </div>
          </div>
        </div>
        <div v-if="!filtered.length" class="card text-center py-16 text-gray-400">暂无督办案件</div>
      </div>
    </div>

    <div v-if="activeTab === 'overdue'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">超期案件（超过30天未结案）</h2>
        <button @click="loadOverdueCases" class="btn-outline"><RefreshCw class="w-4 h-4 mr-1.5" />刷新</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3 font-medium text-gray-600">案件编号</th>
              <th class="text-left p-3 font-medium text-gray-600">案件名称</th>
              <th class="text-left p-3 font-medium text-gray-600">登记时间</th>
              <th class="text-left p-3 font-medium text-gray-600">超期天数</th>
              <th class="text-left p-3 font-medium text-gray-600">当前状态</th>
              <th class="text-left p-3 font-medium text-gray-600">调解员</th>
              <th class="text-left p-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in overdueCases" :key="c.id" class="border-b border-gray-100 hover:bg-red-50/50">
              <td class="p-3 font-mono text-xs text-gray-500">{{ c.caseNo }}</td>
              <td class="p-3">
                <div class="font-medium text-gray-800">{{ c.title }}</div>
                <div class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ c.description }}</div>
              </td>
              <td class="p-3 text-gray-600">{{ dayjs(c.submitTime).format('YYYY-MM-DD') }}</td>
              <td class="p-3">
                <span class="badge bg-red-100 text-red-700 font-semibold">{{ c.daysOverdue }} 天</span>
              </td>
              <td class="p-3"><span class="badge" :class="statusCls(c.status)">{{ statusText(c.status) }}</span></td>
              <td class="p-3 text-gray-600">{{ c.mediatorName || '待分派' }}</td>
              <td class="p-3">
                <button @click="goCase(c.id)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">查看详情</button>
              </td>
            </tr>
            <tr v-if="!overdueCases.length">
              <td colspan="7" class="p-8 text-center text-gray-400">暂无超期案件</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'major'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">重大纠纷案件</h2>
        <button @click="loadMajorCases" class="btn-outline"><RefreshCw class="w-4 h-4 mr-1.5" />刷新</button>
      </div>
      <div class="space-y-4">
        <div v-for="c in majorCases" :key="c.id" class="card border-l-4 border-l-red-500">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center flex-wrap gap-2 mb-2">
                <span class="font-mono text-xs text-gray-400">{{ c.caseNo }}</span>
                <span class="badge bg-red-100 text-red-700">重大纠纷</span>
                <span v-if="c.involvedPartiesCount >= 5 || (c.parties?.length || 0) >= 5" class="badge bg-orange-100 text-orange-700">👥 涉多人</span>
                <span v-if="(c.involvedAmount || 0) >= 50000" class="badge bg-amber-100 text-amber-700">💰 涉大额</span>
                <span v-if="c.hasPetitionRisk" class="badge bg-purple-100 text-purple-700">⚠️ 信访风险</span>
                <span class="badge" :class="statusCls(c.status)">{{ statusText(c.status) }}</span>
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">{{ c.title }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2">{{ c.description }}</p>
              <div class="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-gray-500">
                <span>📍 {{ c.location }}</span>
                <span>👥 涉及人数：{{ c.involvedPartiesCount || c.parties?.length || 0 }} 人</span>
                <span v-if="c.involvedAmount">💰 涉及金额：¥{{ c.involvedAmount.toLocaleString() }}</span>
                <span>📅 登记：{{ dayjs(c.submitTime).format('YYYY-MM-DD') }}</span>
                <span>👤 调解员：{{ c.mediatorName || '待分派' }}</span>
              </div>
            </div>
            <div class="flex flex-col space-y-2 ml-4 shrink-0">
              <button @click="openAction(c.id, 'assign')" class="btn-primary !py-1.5 !px-4 text-xs whitespace-nowrap"><UserPlus class="w-3 h-3 mr-1" />调整指派</button>
              <button @click="openAction(c.id, 'escalation_action')" class="btn-warning !py-1.5 !px-4 text-xs whitespace-nowrap"><Zap class="w-3 h-3 mr-1" />升级处置</button>
              <button @click="goCase(c.id)" class="text-primary-600 hover:text-primary-700 text-xs font-medium text-right">查看详情 →</button>
            </div>
          </div>
        </div>
        <div v-if="!majorCases.length" class="card text-center py-16 text-gray-400">暂无重大纠纷案件</div>
      </div>
    </div>

    <div v-if="activeTab === 'supervision_orders'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">督办单管理</h2>
        <div class="flex items-center space-x-3">
          <select v-model="orderFilter" class="input-base !w-40">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="completed">已完成</option>
          </select>
          <button @click="loadSupervisionOrders" class="btn-outline"><RefreshCw class="w-4 h-4 mr-1.5" />刷新</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3 font-medium text-gray-600">督办单编号</th>
              <th class="text-left p-3 font-medium text-gray-600">类型</th>
              <th class="text-left p-3 font-medium text-gray-600">关联案件</th>
              <th class="text-left p-3 font-medium text-gray-600">督办描述</th>
              <th class="text-left p-3 font-medium text-gray-600">指派调解员</th>
              <th class="text-left p-3 font-medium text-gray-600">状态</th>
              <th class="text-left p-3 font-medium text-gray-600">截止日期</th>
              <th class="text-left p-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filteredOrders" :key="o.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="p-3 font-mono text-xs text-gray-500">{{ o.id }}</td>
              <td class="p-3">
                <span class="badge" :class="{ 'bg-red-100 text-red-700': o.type === 'not_fulfilled', 'bg-orange-100 text-orange-700': o.type === 'overdue', 'bg-amber-100 text-amber-700': o.type === 'relapse', 'bg-blue-100 text-blue-700': o.type === 'supervision' }">
                  {{ orderTypeText(o.type) }}
                </span>
              </td>
              <td class="p-3">
                <div class="font-medium text-gray-800">{{ o.caseNo }}</div>
                <div class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ o.caseTitle }}</div>
              </td>
              <td class="p-3 text-gray-600 line-clamp-2 max-w-xs">{{ o.description }}</td>
              <td class="p-3 text-gray-600">{{ o.mediatorName }}</td>
              <td class="p-3">
                <span class="badge" :class="{ 'bg-amber-100 text-amber-700': o.status === 'pending', 'bg-blue-100 text-blue-700': o.status === 'in_progress', 'bg-green-100 text-green-700': o.status === 'completed' }">
                  {{ orderStatusText(o.status) }}
                </span>
              </td>
              <td class="p-3 text-gray-600">{{ dayjs(o.deadline).format('YYYY-MM-DD') }}</td>
              <td class="p-3">
                <button @click="openOrderDetail(o)" class="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">处理</button>
                <button @click="goCase(o.caseId)" class="text-gray-500 hover:text-gray-700 text-sm">详情</button>
              </td>
            </tr>
            <tr v-if="!filteredOrders.length">
              <td colspan="8" class="p-8 text-center text-gray-400">暂无督办单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAction" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showAction = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">
            {{ actionType === 'record' ? '添加督办记录' : actionType === 'assign' ? '调整人员指派' : actionType === 'escalation_action' ? '升级处置' : '情绪升级备案' }}
          </h3>
          <div v-if="actionType === 'record'" class="space-y-4">
            <div>
              <label class="label-base">督办类型</label>
              <select v-model="form.type" class="input-base">
                <option value="overdue">逾期提醒</option>
                <option value="major">重大案件督办</option>
                <option value="escalation">升级备案</option>
                <option value="repeat">重复投诉关注</option>
                <option value="abnormal">异常情况</option>
              </select>
            </div>
            <div>
              <label class="label-base">处理措施 <span class="text-red-500">*</span></label>
              <textarea v-model="form.action" rows="3" class="input-base resize-none" placeholder="采取的具体督办措施..." required></textarea>
            </div>
            <div>
              <label class="label-base">备注说明</label>
              <textarea v-model="form.remarks" rows="2" class="input-base resize-none" placeholder="其他说明"></textarea>
            </div>
          </div>
          <div v-else-if="actionType === 'assign'" class="space-y-4">
            <div>
              <label class="label-base">调解员</label>
              <select class="input-base"><option>李调解员（调解中心）</option><option>王调解员（社区调解站）</option><option>张调解员（法院特邀）</option></select>
            </div>
            <div>
              <label class="label-base">督办人员</label>
              <select class="input-base"><option>赵司法所</option><option>钱司法所</option></select>
            </div>
            <div>
              <label class="label-base">调整说明</label>
              <textarea v-model="form.remarks" rows="2" class="input-base resize-none" placeholder="调整原因、新要求等"></textarea>
            </div>
          </div>
          <div v-else-if="actionType === 'escalation_action'" class="space-y-4">
            <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p class="text-sm font-semibold text-indigo-800 mb-1">🏛️ 司法所升级处置</p>
              <p class="text-xs text-indigo-600">根据案件风险等级，选择适当的升级处置措施。</p>
            </div>
            <div>
              <label class="label-base">处置方式 <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-3 gap-3">
                <label class="flex flex-col items-center p-4 bg-white rounded-xl border-2 cursor-pointer hover:border-indigo-300 transition-all" :class="form.escalationAction === 'joint_mediation' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'">
                  <input type="radio" v-model="form.escalationAction" value="joint_mediation" class="sr-only" />
                  <div class="text-2xl mb-2">🤝</div>
                  <p class="text-sm font-semibold text-gray-800">联席调解</p>
                  <p class="text-xs text-gray-500 text-center mt-1">多部门联合调解</p>
                </label>
                <label class="flex flex-col items-center p-4 bg-white rounded-xl border-2 cursor-pointer hover:border-indigo-300 transition-all" :class="form.escalationAction === 'legal_aid' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'">
                  <input type="radio" v-model="form.escalationAction" value="legal_aid" class="sr-only" />
                  <div class="text-2xl mb-2">⚖️</div>
                  <p class="text-sm font-semibold text-gray-800">法律援助</p>
                  <p class="text-xs text-gray-500 text-center mt-1">转入法律援助</p>
                </label>
                <label class="flex flex-col items-center p-4 bg-white rounded-xl border-2 cursor-pointer hover:border-indigo-300 transition-all" :class="form.escalationAction === 'transferred' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'">
                  <input type="radio" v-model="form.escalationAction" value="transferred" class="sr-only" />
                  <div class="text-2xl mb-2">➡️</div>
                  <p class="text-sm font-semibold text-gray-800">案件移送</p>
                  <p class="text-xs text-gray-500 text-center mt-1">移送其他部门</p>
                </label>
              </div>
            </div>
            <div>
              <label class="label-base">处置说明</label>
              <textarea v-model="form.remarks" rows="2" class="input-base resize-none" placeholder="说明升级处置原因、具体安排等"></textarea>
            </div>
          </div>
          <div v-else-if="actionType === 'escalate'" class="space-y-4">
            <div class="p-4 bg-red-50 rounded-xl border border-red-100">
              <p class="text-sm font-semibold text-red-800 mb-1">🚨 情绪升级备案</p>
              <p class="text-xs text-red-600">标记后案件将进入司法所重点督办范围，需尽快介入处置。</p>
            </div>
            <div>
              <label class="label-base">升级原因 <span class="text-red-500">*</span></label>
              <textarea v-model="form.remarks" rows="3" class="input-base resize-none" placeholder="请详细说明情绪升级原因、当事人状态、风险点..." required></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button @click="showAction = null" class="btn-outline">取消</button>
            <button @click="submitAction" class="btn-primary">确定提交</button>
          </div>
        </div>
      </div>

      <div v-if="selectedOrder" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="selectedOrder = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">督办单详情 - {{ selectedOrder.id }}</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-base">类型</label>
                <p class="text-sm font-medium text-gray-800">{{ orderTypeText(selectedOrder.type) }}</p>
              </div>
              <div>
                <label class="label-base">状态</label>
                <span class="badge" :class="{ 'bg-amber-100 text-amber-700': selectedOrder.status === 'pending', 'bg-blue-100 text-blue-700': selectedOrder.status === 'in_progress', 'bg-green-100 text-green-700': selectedOrder.status === 'completed' }">
                  {{ orderStatusText(selectedOrder.status) }}
                </span>
              </div>
              <div>
                <label class="label-base">关联案件</label>
                <p class="text-sm font-medium text-gray-800">{{ selectedOrder.caseNo }} - {{ selectedOrder.caseTitle }}</p>
              </div>
              <div>
                <label class="label-base">指派调解员</label>
                <p class="text-sm font-medium text-gray-800">{{ selectedOrder.mediatorName }}</p>
              </div>
              <div>
                <label class="label-base">督办人</label>
                <p class="text-sm font-medium text-gray-800">{{ selectedOrder.supervisorName }}</p>
              </div>
              <div>
                <label class="label-base">截止日期</label>
                <p class="text-sm font-medium text-gray-800">{{ dayjs(selectedOrder.deadline).format('YYYY-MM-DD') }}</p>
              </div>
            </div>
            <div>
              <label class="label-base">督办描述</label>
              <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{{ selectedOrder.description }}</p>
            </div>
            <div v-if="selectedOrder.status !== 'completed'">
              <label class="label-base">处理结果 <span class="text-red-500">*</span></label>
              <textarea v-model="orderResult" rows="3" class="input-base resize-none" placeholder="请填写督办处理结果..."></textarea>
            </div>
            <div v-if="selectedOrder.result">
              <label class="label-base">处理结果</label>
              <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{{ selectedOrder.result }}</p>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button @click="selectedOrder = null" class="btn-outline">关闭</button>
            <button v-if="selectedOrder.status !== 'completed'" @click="completeOrder" class="btn-primary">标记完成</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { AlertTriangle, Clock, TrendingUp, ShieldAlert, RefreshCw, MessageSquare, UserPlus, Zap, CalendarClock, FileText, AlertCircle, CheckCircle } from 'lucide-vue-next'
import type { Case, CaseStatus, PriorityLevel, SupervisionOrder } from '../types'
import { caseApi } from '../api'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const cases = ref<Case[]>([])
const overdueCases = ref<Case[]>([])
const majorCases = ref<Case[]>([])
const supervisionOrders = ref<SupervisionOrder[]>([])
const filterType = ref('')
const orderFilter = ref('')
const showAction = ref<string | null>(null)
const actionCaseId = ref('')
const actionType = ref<'record' | 'assign' | 'escalate' | 'escalation_action'>('record')
const form = reactive({ type: 'overdue', action: '', remarks: '', escalationAction: 'joint_mediation' })
const activeTab = ref<'supervision' | 'overdue' | 'major' | 'supervision_orders'>('supervision')
const selectedOrder = ref<SupervisionOrder | null>(null)
const orderResult = ref('')

const tabs = computed(() => [
  { key: 'supervision', label: '重点督办', count: filtered.value.length },
  { key: 'overdue', label: '超期案件', count: overdueCases.value.length },
  { key: 'major', label: '重大纠纷', count: majorCases.value.length },
  { key: 'supervision_orders', label: '督办单', count: supervisionOrders.value.length }
])

const cards = computed(() => [
  { label: '重大纠纷', value: cases.value.filter(c => c.isMajor).length, icon: markRaw(ShieldAlert), bg: 'bg-red-50', color: 'text-red-600', iconColor: 'text-red-500' },
  { label: '超期案件', value: overdueCases.value.length, icon: markRaw(CalendarClock), bg: 'bg-amber-50', color: 'text-amber-600', iconColor: 'text-amber-500' },
  { label: '情绪升级', value: cases.value.filter(c => c.status === 'escalated' || (c.emotionLevel || 0) >= 4).length, icon: markRaw(TrendingUp), bg: 'bg-orange-50', color: 'text-orange-600', iconColor: 'text-orange-500' },
  { label: '履行逾期', value: cases.value.filter(c => c.status === 'fulfillment_overdue').length, icon: markRaw(Clock), bg: 'bg-rose-50', color: 'text-rose-600', iconColor: 'text-rose-500' },
  { label: '重复投诉', value: cases.value.filter(c => c.status === 'repeat_complaint' || (c.repeatCount || 0) > 1).length, icon: markRaw(AlertTriangle), bg: 'bg-purple-50', color: 'text-purple-600', iconColor: 'text-purple-500' }
])

const statusText = (s: CaseStatus) => ({
  clue_submitted: '待受理', clue_accepted: '已受理', assigned: '已分派',
  meeting_scheduled: '会议排期', meeting_refused: '拒绝参会', meeting_completed: '会议完成',
  agreement_drafted: '协议草拟', agreement_signed: '协议已签', agreement_rejected: '协议被拒',
  fulfillment_start: '履行中', fulfillment_overdue: '履行逾期', fulfillment_completed: '履行完成',
  followup_pending: '待回访', followup_completed: '回访完成', escalated: '情绪升级',
  case_closed: '结案', repeat_complaint: '重复投诉', merged: '已合并',
  supervision_pending: '督办中', relapse: '已复发'
}[s] || s)
const statusCls = (s: CaseStatus) => ({
  clue_submitted: 'status-pending', clue_accepted: 'status-pending', assigned: 'bg-blue-100 text-blue-700',
  meeting_scheduled: 'bg-purple-100 text-purple-700', meeting_refused: 'status-rejected', meeting_completed: 'bg-indigo-100 text-indigo-700',
  agreement_drafted: 'bg-violet-100 text-violet-700', agreement_signed: 'bg-teal-100 text-teal-700', agreement_rejected: 'status-rejected',
  fulfillment_start: 'status-progress', fulfillment_overdue: 'status-overdue', fulfillment_completed: 'status-completed',
  followup_pending: 'bg-cyan-100 text-cyan-700', followup_completed: 'status-completed', escalated: 'status-escalated',
  case_closed: 'status-completed', repeat_complaint: 'bg-orange-100 text-orange-700',
  merged: 'bg-gray-200 text-gray-700', supervision_pending: 'bg-red-100 text-red-700', relapse: 'bg-orange-100 text-orange-700'
}[s] || 'status-pending')
function priorityText(p: PriorityLevel) { return { low: '低', medium: '中', high: '高', urgent: '紧急' }[p] }
function priorityCls(p: PriorityLevel) { return { low: 'bg-green-100 text-green-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[p] }

function borderClass(c: Case) {
  if (c.status === 'fulfillment_overdue') return 'border-l-red-500'
  if (c.status === 'escalated') return 'border-l-rose-500'
  if (c.status === 'repeat_complaint' || (c.repeatCount || 0) > 1) return 'border-l-orange-500'
  if (c.isMajor) return 'border-l-amber-500'
  return 'border-l-primary-500'
}
function headerBg(c: Case) {
  if (c.status === 'fulfillment_overdue') return 'bg-red-50'
  if (c.status === 'escalated') return 'bg-rose-50'
  if (c.status === 'repeat_complaint') return 'bg-orange-50'
  if (c.isMajor) return 'bg-amber-50'
  return 'bg-primary-50'
}
function headerIcon(c: Case) {
  if (c.status === 'fulfillment_overdue') return markRaw(Clock)
  if (c.status === 'escalated') return markRaw(TrendingUp)
  if (c.status === 'repeat_complaint') return markRaw(AlertTriangle)
  return markRaw(ShieldAlert)
}
function headerColor(c: Case) {
  if (c.status === 'fulfillment_overdue') return 'text-red-500'
  if (c.status === 'escalated') return 'text-rose-500'
  if (c.status === 'repeat_complaint') return 'text-orange-500'
  return 'text-primary-500'
}

function orderTypeText(t: string) {
  return { not_fulfilled: '未履行督办', overdue: '超期督办', relapse: '复发督办', supervision: '常规督办' }[t] || t
}
function orderStatusText(s: string) {
  return { pending: '待处理', in_progress: '处理中', completed: '已完成' }[s] || s
}

const filtered = computed(() => cases.value.filter(c => {
  if (filterType.value === 'major' && !c.isMajor) return false
  if (filterType.value === 'escalated' && c.status !== 'escalated' && (c.emotionLevel || 0) < 4) return false
  if (filterType.value === 'overdue' && c.status !== 'fulfillment_overdue') return false
  if (filterType.value === 'repeat' && c.status !== 'repeat_complaint' && (c.repeatCount || 0) < 2) return false
  if (filterType.value === 'emotion' && (c.emotionLevel || 0) < 4) return false
  return true
}))

const filteredOrders = computed(() => supervisionOrders.value.filter(o => {
  if (orderFilter.value && o.status !== orderFilter.value) return false
  return true
}))

async function refresh() { cases.value = await caseApi.getSupervisionCases() }
async function loadOverdueCases() { overdueCases.value = await caseApi.getOverdueCases() }
async function loadMajorCases() { majorCases.value = await caseApi.getMajorCases() }
async function loadSupervisionOrders() { supervisionOrders.value = await caseApi.getSupervisionOrders() }
function goCase(id: string) { router.push(`/case/${id}`) }
function openAction(id: string, t: 'record' | 'assign' | 'escalate' | 'escalation_action') {
  actionCaseId.value = id
  actionType.value = t
  showAction.value = 'open'
  form.type = 'overdue'; form.action = ''; form.remarks = ''; form.escalationAction = 'joint_mediation'
}
async function submitAction() {
  if (actionType.value === 'escalate' && !form.remarks.trim()) return
  if (actionType.value === 'escalate') {
    await caseApi.updateStatus(actionCaseId.value, 'escalated', form.remarks)
  }
  if (actionType.value === 'escalation_action') {
    await caseApi.setEscalationAction(actionCaseId.value, form.escalationAction, store.userName)
  }
  showAction.value = null
  await refresh()
}
function openOrderDetail(o: SupervisionOrder) {
  selectedOrder.value = { ...o }
  orderResult.value = ''
}
async function completeOrder() {
  if (!selectedOrder.value || !orderResult.value.trim()) return
  await caseApi.updateSupervisionOrder(selectedOrder.value.id, {
    status: 'completed',
    result: orderResult.value,
    completeTime: dayjs().format()
  })
  selectedOrder.value = null
  await loadSupervisionOrders()
}

onMounted(async () => {
  cases.value = await caseApi.getSupervisionCases()
  overdueCases.value = await caseApi.getOverdueCases()
  majorCases.value = await caseApi.getMajorCases()
  supervisionOrders.value = await caseApi.getSupervisionOrders()
})
</script>
