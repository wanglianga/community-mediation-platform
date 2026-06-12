import type { Case, CaseStatus, Clue, Meeting, Agreement, FulfillmentNode, Followup, CaseTimeline, DisputeCategory } from '../types'
import dayjs from 'dayjs'

let caseIdCounter = 1000
let clueIdCounter = 2000
let meetingIdCounter = 3000
let agreementIdCounter = 4000
let followupIdCounter = 5000
let timelineIdCounter = 6000

const now = dayjs()

const initialCases: Case[] = [
  {
    id: 'C001', caseNo: 'MD-2024-001', title: '302室夜间噪声扰民纠纷',
    category: 'noise', status: 'assigned', priority: 'medium',
    description: '302室业主反映楼上402室每晚10点后仍有大声唱歌及拖拽桌椅声，持续达两周，多次沟通无效，双方情绪激动。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P1', name: '陈先生', phone: '13900000001', role: 'plaintiff', address: '幸福小区302室' },
      { id: 'P2', name: '刘女士', phone: '13900000002', role: 'defendant', address: '幸福小区402室' }
    ],
    submitTime: now.subtract(3, 'day').format(), acceptTime: now.subtract(2, 'day').format(),
    assignTime: now.subtract(1, 'day').format(), location: '幸福小区3号楼',
    tags: ['邻里纠纷', '噪声'], repeatCount: 0, emotionLevel: 3
  },
  {
    id: 'C002', caseNo: 'MD-2024-002', title: '地下停车位长期被占用',
    category: 'parking', status: 'meeting_scheduled', priority: 'high',
    description: '业主购买的B1-088号车位长期被外来车辆占用，物业未有效处理，业主已拒缴物业费。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P3', name: '孙先生', phone: '13900000003', role: 'plaintiff', address: '阳光花园A座501' },
      { id: 'P4', name: '阳光物业', phone: '13900000004', role: 'defendant', address: '阳光花园物业中心' }
    ],
    submitTime: now.subtract(5, 'day').format(), acceptTime: now.subtract(4, 'day').format(),
    assignTime: now.subtract(3, 'day').format(), location: '阳光花园',
    dueDate: now.add(2, 'day').format(), tags: ['物业纠纷', '停车'],
    isOverdue: false, repeatCount: 1, emotionLevel: 4
  },
  {
    id: 'C003', caseNo: 'MD-2024-003', title: '兄弟俩母亲赡养义务争议',
    category: 'support', status: 'agreement_signed', priority: 'high',
    description: '大儿子与小儿子就85岁老母亲赡养费用分摊及居住安排产生分歧，老母亲目前暂居女儿家。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P5', name: '王建国', phone: '13900000005', role: 'defendant', address: '安泰社区1栋201' },
      { id: 'P6', name: '王建军', phone: '13900000006', role: 'plaintiff', address: '安泰社区1栋301' },
      { id: 'P7', name: '王母', phone: '13900000007', role: 'third_party' }
    ],
    submitTime: now.subtract(15, 'day').format(), acceptTime: now.subtract(14, 'day').format(),
    assignTime: now.subtract(12, 'day').format(), closeTime: now.subtract(1, 'day').format(),
    location: '安泰社区居委会', tags: ['家庭纠纷', '赡养'],
    isMajor: true, repeatCount: 0, emotionLevel: 3
  },
  {
    id: 'C004', caseNo: 'MD-2024-004', title: '物业费涨价异议群体性纠纷',
    category: 'property', status: 'escalated', priority: 'urgent',
    description: '小区32户业主联合抵制物业费从1.5元涨至2.2元，认为涨价程序不透明，未召开业主大会。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    judicialStaffId: 'js1', judicialStaffName: '赵司法所',
    parties: [
      { id: 'P8', name: '业主代表等32人', phone: '13900000008', role: 'plaintiff' },
      { id: 'P9', name: '和谐物业管理公司', phone: '13900000009', role: 'defendant' }
    ],
    submitTime: now.subtract(10, 'day').format(), acceptTime: now.subtract(9, 'day').format(),
    assignTime: now.subtract(8, 'day').format(), location: '和谐花园',
    tags: ['群体性纠纷', '物业收费'], isMajor: true,
    repeatCount: 2, emotionLevel: 5, involvedPartiesCount: 32, hasPetitionRisk: true
  },
  {
    id: 'C005', caseNo: 'MD-2024-005', title: '501室装修漏水致401室损坏索赔',
    category: 'neighbor', status: 'fulfillment_start', priority: 'medium',
    description: '501室卫生间防水处理不当漏水至楼下401室，造成天花板及墙面泡损，双方对赔偿金额有异议。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P10', name: '周先生', phone: '13900000010', role: 'plaintiff', address: '翠湖苑5栋401' },
      { id: 'P11', name: '吴女士', phone: '13900000011', role: 'defendant', address: '翠湖苑5栋501' }
    ],
    submitTime: now.subtract(20, 'day').format(), acceptTime: now.subtract(19, 'day').format(),
    assignTime: now.subtract(17, 'day').format(), location: '翠湖苑5栋',
    tags: ['邻里纠纷', '财产损害'], repeatCount: 0, emotionLevel: 2
  },
  {
    id: 'C006', caseNo: 'MD-2024-006', title: '餐饮油烟扰民调解后反复投诉',
    category: 'environment', status: 'repeat_complaint', priority: 'high',
    description: '楼下餐厅油烟排放影响楼上住户，曾达成整改协议后再次反弹，业主情绪激动。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    judicialStaffId: 'js1', judicialStaffName: '赵司法所',
    parties: [
      { id: 'P12', name: '王桂兰', phone: '138xxxx1112', role: 'plaintiff' },
      { id: 'P121', name: '住户联盟', phone: '13900000012', role: 'plaintiff' },
      { id: 'P13', name: '家乡菜馆', phone: '13900000013', role: 'defendant' }
    ],
    submitTime: now.subtract(35, 'day').format(), acceptTime: now.subtract(34, 'day').format(),
    assignTime: now.subtract(32, 'day').format(), location: '美食街68号',
    tags: ['重复投诉', '环境污染'], isMajor: true,
    repeatCount: 3, emotionLevel: 5, refusalCount: 1, overdueCount: 1, involvedPartiesCount: 8
  },
  {
    id: 'C007', caseNo: 'MD-2024-007', title: '履行节点逾期未完成',
    category: 'contract', status: 'fulfillment_overdue', priority: 'high',
    description: '装修合同纠纷已签署协议，第一期赔款应于3天前支付，但被告未履约。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P14', name: '郑先生', phone: '13900000014', role: 'plaintiff' },
      { id: 'P15', name: '某装修公司', phone: '13900000015', role: 'defendant' }
    ],
    submitTime: now.subtract(40, 'day').format(), acceptTime: now.subtract(39, 'day').format(),
    assignTime: now.subtract(37, 'day').format(), location: '金桂小区',
    tags: ['合同纠纷', '履行逾期'], overdueCount: 1, emotionLevel: 4, involvedAmount: 85000
  },
  {
    id: 'C008', caseNo: 'MD-2024-008', title: '已结案：小区门禁系统费用分摊',
    category: 'property', status: 'case_closed', priority: 'low',
    description: '门禁系统升级费用分摊争议，已完成调解、签署协议并履行完毕，回访反馈良好。',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    mediatorId: 'md1', mediatorName: '李调解员',
    parties: [
      { id: 'P16', name: '业委会', phone: '13900000016', role: 'plaintiff' },
      { id: 'P17', name: '物业公司', phone: '13900000017', role: 'defendant' }
    ],
    submitTime: now.subtract(60, 'day').format(), acceptTime: now.subtract(59, 'day').format(),
    assignTime: now.subtract(57, 'day').format(), closeTime: now.subtract(30, 'day').format(),
    location: '桂花苑', tags: ['已结案', '物业纠纷'], repeatCount: 0, emotionLevel: 1
  }
]

const initialClues: Clue[] = [
  {
    id: 'CL001', title: '广场舞早间音乐音量过大', category: 'noise',
    description: '多位老人反映小区广场每天早6点广场舞音量影响高三学生备考休息。',
    location: '幸福小区中心广场',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    submitTime: now.subtract(1, 'hour').format(),
    informantName: '匿名', status: 'pending', tags: ['噪声', '公共空间'] as any
  },
  {
    id: 'CL002', title: '建筑垃圾堆放楼道一月未清', category: 'neighbor',
    description: '7栋2单元楼道堆放大量装修建筑垃圾，影响通行及消防通道畅通。',
    location: '阳光花园7栋2单元',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    submitTime: now.subtract(3, 'hour').format(),
    informantName: '李女士', informantPhone: '13812345678', status: 'accepted'
  },
  {
    id: 'CL003', title: '一楼阳台私搭阳光房被投诉', category: 'neighbor',
    description: '101室阳台未经批准搭建阳光房，二楼业主担心影响安全及采光。',
    location: '翠湖苑3栋101',
    gridWorkerId: 'gw1', gridWorkerName: '张网格员',
    submitTime: now.subtract(5, 'hour').format(),
    informantName: '何先生', status: 'pending'
  }
]

const initialMeetings: Meeting[] = [
  {
    id: 'M001', caseId: 'C002', title: '阳光花园停车位纠纷调解会议（第一次）',
    scheduleTime: now.add(1, 'day').hour(14).minute(0).format(),
    location: '阳光花园会议室', mediatorId: 'md1', mediatorName: '李调解员',
    participants: [
      { id: 'P3', name: '孙先生', role: '申请人', status: 'confirmed' },
      { id: 'P4', name: '物业经理-钱某', role: '被申请人', status: 'invited' }
    ],
    requirements: ['出示车位购买证明', '提供外来车辆登记台账', '说明长期占用原因'],
    evidenceMaterials: [
      { id: 'E1', name: '车位购买合同.pdf', type: 'document', url: '#', uploadTime: now.subtract(1, 'day').format() },
      { id: 'E2', name: '占用照片.jpg', type: 'image', url: '#', uploadTime: now.subtract(1, 'day').format() }
    ],
    status: 'scheduled', createTime: now.subtract(2, 'day').format()
  },
  {
    id: 'M002', caseId: 'C001', title: '噪声纠纷面对面调解',
    scheduleTime: now.subtract(6, 'hour').format(),
    location: '幸福社区调解室', mediatorId: 'md1', mediatorName: '李调解员',
    participants: [
      { id: 'P1', name: '陈先生', role: '申请人', status: 'attended' },
      { id: 'P2', name: '刘女士', role: '被申请人', status: 'attended' }
    ],
    requirements: ['双方到场陈述事实情况'],
    evidenceMaterials: [],
    minutes: '双方到场陈述，情绪激烈，402室承认偶有声音但认为302反应过度。经调解员耐心疏导，双方初步达成谅解意向。',
    resolution: '402室承诺22:30后停止噪音活动，302室同意给予观察期。',
    status: 'completed', actualStartTime: now.subtract(6, 'hour').format(),
    actualEndTime: now.subtract(4, 'hour').format(), createTime: now.subtract(3, 'day').format()
  }
]

const initialAgreements: Agreement[] = [
  {
    id: 'A003', caseId: 'C003', caseNo: 'MD-2024-003', caseTitle: '兄弟俩母亲赡养义务争议',
    title: '母亲赡养义务分担协议书',
    terms: [
      { id: 'T1', order: 1, content: '王母居住安排：单月居住在大儿子王建国家中，双月居住在小儿子王建军家中', partyResponsible: '双方共同执行', deadline: '长期', status: 'in_progress' },
      { id: 'T2', order: 2, content: '王母每月赡养费2000元，两兄弟各承担1000元，于每月1日按时存入母亲银行卡', partyResponsible: '两兄弟各1000元', deadline: '每月1日', status: 'in_progress' },
      { id: 'T3', order: 3, content: '母亲日常医疗费用在1000元以内当月居住子女承担，超过1000元部分两兄弟平摊', partyResponsible: '两兄弟平摊', deadline: '当月结算', status: 'pending' }
    ],
    supplementaryNotes: '如遇重大疾病住院需特殊护理，由姐妹三人协商轮班。',
    signatures: [
      { partyId: 'P5', partyName: '王建国', status: 'signed', signTime: now.subtract(2, 'day').format() },
      { partyId: 'P6', partyName: '王建军', status: 'signed', signTime: now.subtract(2, 'day').format() },
      { partyId: 'P7', partyName: '王母（由女儿代签）', status: 'signed', signTime: now.subtract(2, 'day').format() }
    ],
    mediatorSign: true, createTime: now.subtract(5, 'day').format(), draftTime: now.subtract(4, 'day').format(),
    status: 'effective', effectiveTime: now.subtract(2, 'day').format()
  },
  {
    id: 'A005', caseId: 'C005', caseNo: 'MD-2024-005', caseTitle: '装修漏水致损索赔纠纷',
    title: '漏水损坏赔偿协议书',
    terms: [
      { id: 'T4', order: 1, content: '501室吴女士于签署协议后5日内一次性支付401室周先生装修修复及赔偿费共计人民币8000元整', partyResponsible: '吴女士', deadline: now.add(3, 'day').format('YYYY-MM-DD'), status: 'in_progress' },
      { id: 'T5', order: 2, content: '501室需在7日内完成卫生间防水重新施工并出具合格证明', partyResponsible: '吴女士', deadline: now.add(5, 'day').format('YYYY-MM-DD'), status: 'pending' },
      { id: 'T6', order: 3, content: '401室收到赔偿款后不得再就本次漏水事件追究对方其他责任', partyResponsible: '周先生', deadline: '收到赔偿款当日', status: 'pending' }
    ],
    signatures: [
      { partyId: 'P10', partyName: '周先生', status: 'signed', signTime: now.subtract(1, 'day').format() },
      { partyId: 'P11', partyName: '吴女士', status: 'signed', signTime: now.subtract(1, 'day').format() }
    ],
    mediatorSign: true, createTime: now.subtract(10, 'day').format(), draftTime: now.subtract(5, 'day').format(),
    status: 'effective', effectiveTime: now.subtract(1, 'day').format()
  },
  {
    id: 'A001', caseId: 'C001', caseNo: 'MD-2024-001', caseTitle: '夜间噪声扰民纠纷',
    title: '邻里噪声谅解协议（待签署）',
    terms: [
      { id: 'T7', order: 1, content: '402室承诺每晚22:30后自觉降低活动音量，避免制造明显噪声', partyResponsible: '刘女士', deadline: '长期', status: 'pending' },
      { id: 'T8', order: 2, content: '302室如遇特殊情况需联系物业处理，不得直接上楼争执', partyResponsible: '陈先生', deadline: '长期', status: 'pending' }
    ],
    signatures: [
      { partyId: 'P1', partyName: '陈先生', status: 'pending' },
      { partyId: 'P2', partyName: '刘女士', status: 'pending' }
    ],
    mediatorSign: false, createTime: now.subtract(1, 'day').format(),
    signDeadline: now.add(3, 'day').format(), status: 'pending_sign'
  }
]

const initialFulfillmentNodes: FulfillmentNode[] = [
  {
    id: 'N001', agreementId: 'A005', termId: 'T4', nodeName: '第一期赔偿款支付',
    description: '501室吴女士一次性支付赔偿款8000元', deadline: now.add(3, 'day').format(),
    responsibleParty: '吴女士', status: 'in_progress'
  },
  {
    id: 'N002', agreementId: 'A005', termId: 'T5', nodeName: '卫生间防水施工',
    description: '501室重新做卫生间防水处理', deadline: now.add(5, 'day').format(),
    responsibleParty: '吴女士', status: 'pending'
  },
  {
    id: 'N003', agreementId: 'A005', termId: 'T6', nodeName: '收款确认与免责声明',
    description: '401室确认收款并签署不再追究确认书', deadline: now.add(6, 'day').format(),
    responsibleParty: '周先生', status: 'pending'
  },
  {
    id: 'N004', agreementId: 'A003', termId: 'T2', nodeName: '本月赡养费支付',
    description: '两兄弟各支付本月赡养费1000元', deadline: now.format('YYYY-MM-DD'),
    responsibleParty: '两兄弟', status: 'pending'
  },
  {
    id: 'N005', agreementId: '', termId: '', nodeName: '（已逾期）装修公司首期赔款',
    description: '装修公司首期赔款5000元，已于3天前到期', deadline: now.subtract(3, 'day').format(),
    responsibleParty: '装修公司', status: 'overdue',
    remarks: '装修公司负责人电话无法接通，经网格员上门确认公司已搬离原注册地址，建议启动司法确认程序'
  }
]

const initialFollowups: Followup[] = [
  {
    id: 'F001', caseId: 'C003', agreementId: 'A003', type: 'phone',
    scheduledTime: now.add(3, 'day').hour(10).minute(0).format(),
    handlerId: 'gw1', handlerName: '张网格员', status: 'pending',
    createTime: now.subtract(1, 'day').format()
  },
  {
    id: 'F002', caseId: 'C008', type: 'home_visit',
    scheduledTime: now.subtract(2, 'day').hour(15).minute(0).format(),
    handlerId: 'gw1', handlerName: '张网格员', status: 'completed',
    result: {
      satisfaction: 5, hasDispute: false, emotionalState: 'stable',
      performanceStatus: 'normal',
      notes: '双方对调解结果均满意，门禁系统已正常运行一月有余，邻里关系和睦。回访时看到双方在楼下打招呼交流。',
      recordTime: now.subtract(2, 'day').format()
    },
    createTime: now.subtract(5, 'day').format()
  },
  {
    id: 'F003', caseId: 'C006', type: 'onsite',
    scheduledTime: now.add(1, 'day').hour(9).minute(30).format(),
    handlerId: 'js1', handlerName: '赵司法所', status: 'pending',
    createTime: now.format()
  },
  {
    id: 'F004', caseId: 'C007', type: 'video',
    scheduledTime: now.subtract(1, 'day').hour(14).minute(0).format(),
    handlerId: 'md1', handlerName: '李调解员', status: 'overdue',
    createTime: now.subtract(3, 'day').format()
  }
]

function makeTimeline(caseId: string): CaseTimeline[] {
  const base: Record<string, { title: string, desc: string, event: CaseStatus }> = {
    C001: [
      { title: '网格员上门登记', desc: '张网格员入户302室听取情况说明并录音取证', event: 'clue_submitted' },
      { title: '线索受理立案', desc: '经社区居委会审核，以邻里纠纷正式立案', event: 'clue_accepted' },
      { title: '分派调解员', desc: '调解中心指派李调解员负责本案调解工作', event: 'assigned' }
    ].map((x, i) => ({
      id: 'TL' + (++timelineIdCounter), caseId, eventType: x.event,
      title: x.title, description: x.desc,
      operatorName: ['张网格员', '社区主任', '调解中心'][i],
      timestamp: now.subtract([3, 2, 1][i], 'day').format()
    })) as any,
    C003: [
      { title: '线索登记', desc: '兄弟争执惊动邻居报警后转介', event: 'clue_submitted' },
      { title: '立案受理', desc: '司法所备案为重点家庭纠纷', event: 'clue_accepted' },
      { title: '分派调解', desc: '安排有经验的李调解员负责', event: 'assigned' },
      { title: '安排调解会议', desc: '通知三兄妹到场参加调解会', event: 'meeting_scheduled' },
      { title: '会议完成', desc: '历时3小时的情感疏导后达成共识', event: 'meeting_completed' },
      { title: '草拟协议', desc: '根据讨论结果草拟赡养分担协议', event: 'agreement_drafted' },
      { title: '签署协议', desc: '三兄妹及调解员均签字确认', event: 'agreement_signed' },
      { title: '开始履行', desc: '按协议进入实际履行阶段', event: 'fulfillment_start' }
    ].map((x, i) => ({
      id: 'TL' + (++timelineIdCounter), caseId, eventType: x.event,
      title: x.title, description: x.desc,
      operatorName: ['网格员', '司法所', '主任', '调解员', '调解员', '调解员', '调解员', '调解员'][i],
      timestamp: now.subtract([15, 14, 12, 10, 8, 7, 2, 2], 'day').format()
    })) as any,
    C005: [
      { title: '线索登记', desc: '401室业主主动到社区申请调解', event: 'clue_submitted' },
      { title: '立案分派', desc: '当天立案并指派调解员', event: 'assigned' },
      { title: '现场勘查', desc: '调解员与物业共同入户查看受损情况', event: 'note' as any, operatorName: '李调解员', timestamp: now.subtract(18, 'day').format() },
      { title: '协议签署', desc: '双方对调解方案均无异议', event: 'agreement_signed' },
      { title: '开始履行', desc: '进入第一期赔偿履行期', event: 'fulfillment_start' }
    ].map((x, i) => ({
      id: 'TL' + (++timelineIdCounter), caseId, eventType: x.event, title: x.title, description: x.desc,
      operatorName: x.operatorName || ['网格员', '主任', '', '调解员', '调解员'][i],
      timestamp: x.timestamp || now.subtract([20, 19, '', 1, 1][i] as any, 'day').format()
    })) as any
  }
  return base[caseId] || []
}

export function useMockData() {
  let cases = [...initialCases]
  let clues = [...initialClues]
  let meetings = [...initialMeetings]
  let agreements = [...initialAgreements]
  let fulfillmentNodes = [...initialFulfillmentNodes]
  let followups = [...initialFollowups]

  function filterStatus(s: CaseStatus, t?: CaseStatus) { return !t || s === t }
  function filterCategory(c: DisputeCategory, t?: DisputeCategory) { return !t || c === t }

  return {
    getCases(params?: { status?: CaseStatus; category?: DisputeCategory; keyword?: string; isMajor?: boolean; isOverdue?: boolean }) {
      return cases.filter(c => {
        if (params?.status && c.status !== params.status) return false
        if (params?.category && c.category !== params.category) return false
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase()
          if (!c.title.toLowerCase().includes(kw) && !c.description.toLowerCase().includes(kw) && !c.caseNo.toLowerCase().includes(kw)) return false
        }
        if (params?.isMajor && !c.isMajor) return false
        if (params?.isOverdue && c.status !== 'fulfillment_overdue') return false
        return true
      })
    },
    getCase(id: string) { return cases.find(c => c.id === id) || null },
    createCase(data: Partial<Case>) {
      const nc: Case = {
        id: 'C' + (++caseIdCounter), caseNo: 'MD-2024-' + caseIdCounter,
        title: data.title || '未命名案件', category: data.category || 'other',
        status: 'clue_submitted', priority: data.priority || 'medium',
        description: data.description || '', parties: data.parties || [],
        submitTime: now.format(), location: data.location || '',
        gridWorkerId: data.gridWorkerId, gridWorkerName: data.gridWorkerName,
        tags: data.tags || [], repeatCount: 0, emotionLevel: 2,
        ...data
      } as Case
      cases.unshift(nc)
      return nc
    },
    updateCase(id: string, data: Partial<Case>) {
      const idx = cases.findIndex(c => c.id === id)
      if (idx >= 0) { cases[idx] = { ...cases[idx], ...data }; return cases[idx] }
      return null
    },
    updateCaseStatus(id: string, status: CaseStatus, remark?: string) {
      const c = cases.find(x => x.id === id)
      if (!c) return null
      let flags: Partial<Case> = {}
      if (status === 'meeting_refused') { flags.refusalCount = (c.refusalCount || 0) + 1; if ((flags.refusalCount as number) >= 2) flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1) }
      if (status === 'fulfillment_overdue') { flags.overdueCount = (c.overdueCount || 0) + 1; flags.isOverdue = true }
      if (status === 'repeat_complaint') { flags.repeatCount = (c.repeatCount || 0) + 1; flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1) }
      if (status === 'escalated') { flags.emotionLevel = 5; flags.isMajor = true }
      c.status = status
      Object.assign(c, flags)
      return c
    },
    assignMediator(id: string, mediatorId: string, mediatorName: string) {
      return this.updateCase(id, { mediatorId, mediatorName, status: 'assigned', assignTime: now.format() })
    },
    getCaseTimeline(caseId: string) { return makeTimeline(caseId) },
    getStats() {
      return {
        total: cases.length,
        pending: cases.filter(c => ['clue_submitted', 'clue_accepted', 'assigned'].includes(c.status)).length,
        inProgress: cases.filter(c => ['meeting_scheduled', 'meeting_completed', 'agreement_drafted', 'agreement_signed', 'fulfillment_start', 'followup_pending'].includes(c.status)).length,
        completed: cases.filter(c => c.status === 'case_closed').length,
        major: cases.filter(c => c.isMajor).length,
        overdue: cases.filter(c => c.status === 'fulfillment_overdue').length,
        escalated: cases.filter(c => c.status === 'escalated').length,
        repeat: cases.filter(c => c.status === 'repeat_complaint' || (c.repeatCount || 0) > 0).length,
        refusedMeeting: cases.filter(c => c.status === 'meeting_refused' || (c.refusalCount || 0) > 0).length,
        categoryStats: [
          { name: '噪声纠纷', value: cases.filter(c => c.category === 'noise').length },
          { name: '停车纠纷', value: cases.filter(c => c.category === 'parking').length },
          { name: '物业收费', value: cases.filter(c => c.category === 'property').length },
          { name: '家庭赡养', value: cases.filter(c => c.category === 'support').length },
          { name: '邻里纠纷', value: cases.filter(c => c.category === 'neighbor').length },
          { name: '其他', value: cases.filter(c => !['noise', 'parking', 'property', 'support', 'neighbor'].includes(c.category)).length }
        ],
        monthlyTrend: [
          { month: '1月', count: 12 }, { month: '2月', count: 9 }, { month: '3月', count: 15 },
          { month: '4月', count: 18 }, { month: '5月', count: 22 }, { month: '6月', count: cases.length }
        ]
      }
    },
    getSupervisionCases() {
      return cases.filter(c => c.isMajor || c.status === 'escalated' || c.status === 'fulfillment_overdue' || c.status === 'repeat_complaint' || (c.repeatCount || 0) >= 2 || (c.emotionLevel || 0) >= 4)
    },
    getClues(params?: { status?: string; category?: DisputeCategory }) {
      return clues.filter(c => {
        if (params?.status && c.status !== params.status) return false
        if (params?.category && c.category !== params.category) return false
        return true
      })
    },
    getClue(id: string) { return clues.find(c => c.id === id) || null },
    createClue(data: Partial<Clue>) {
      const nc: Clue = {
        id: 'CL' + (++clueIdCounter), title: data.title || '',
        category: data.category || 'other', description: data.description || '',
        location: data.location || '', gridWorkerId: data.gridWorkerId || 'gw1',
        gridWorkerName: data.gridWorkerName || '张网格员', submitTime: now.format(),
        status: 'pending', ...data
      } as Clue
      clues.unshift(nc)
      return nc
    },
    rejectClue(id: string, reason: string) {
      const cl = clues.find(c => c.id === id)
      if (cl) { cl.status = 'rejected'; cl.rejectReason = reason; return cl }
      return null
    },
    getMeetings(caseId?: string) {
      return caseId ? meetings.filter(m => m.caseId === caseId) : meetings
    },
    getMeeting(id: string) { return meetings.find(m => m.id === id) || null },
    createMeeting(data: Partial<Meeting>) {
      const nm: Meeting = {
        id: 'M' + (++meetingIdCounter), caseId: data.caseId || '',
        title: data.title || '', scheduleTime: data.scheduleTime || now.add(1, 'day').format(),
        location: data.location || '', mediatorId: data.mediatorId || 'md1',
        mediatorName: data.mediatorName || '李调解员', participants: data.participants || [],
        requirements: data.requirements || [], evidenceMaterials: data.evidenceMaterials || [],
        status: 'scheduled', createTime: now.format(), ...data
      } as Meeting
      meetings.unshift(nm)
      if (nm.caseId) {
        this.updateCaseStatus(nm.caseId, 'meeting_scheduled')
      }
      return nm
    },
    updateMeeting(id: string, data: Partial<Meeting>) {
      const idx = meetings.findIndex(m => m.id === id)
      if (idx >= 0) { meetings[idx] = { ...meetings[idx], ...data }; return meetings[idx] }
      return null
    },
    recordMeetingRefusal(id: string, participantId: string, reason: string) {
      const m = meetings.find(x => x.id === id)
      if (!m) return null
      const p = m.participants.find(pp => pp.id === participantId)
      if (p) { p.status = 'refused'; p.refusalReason = reason }
      if (m.participants.some(pp => pp.status === 'refused')) {
        m.status = 'refused'
        this.updateCaseStatus(m.caseId, 'meeting_refused', '参会人拒绝：' + reason)
      }
      return m
    },
    completeMeeting(id: string, data: { minutes: string; resolution: string }) {
      const m = meetings.find(x => x.id === id)
      if (!m) return null
      m.status = 'completed'
      m.minutes = data.minutes
      m.resolution = data.resolution
      m.actualEndTime = now.format()
      m.participants.forEach(p => { if (p.status !== 'refused') p.status = 'attended' })
      this.updateCaseStatus(m.caseId, 'meeting_completed')
      return m
    },
    getAgreements(caseId?: string) {
      return caseId ? agreements.filter(a => a.caseId === caseId) : agreements
    },
    getAgreement(id: string) { return agreements.find(a => a.id === id) || null },
    createAgreement(data: Partial<Agreement>) {
      const na: Agreement = {
        id: 'A' + (++agreementIdCounter), caseId: data.caseId || '', caseNo: data.caseNo || '',
        caseTitle: data.caseTitle || '', title: data.title || '', terms: data.terms || [],
        signatures: data.signatures || [], createTime: now.format(),
        status: 'draft', mediatorSign: false, ...data
      } as Agreement
      agreements.unshift(na)
      if (na.caseId) this.updateCaseStatus(na.caseId, 'agreement_drafted')
      return na
    },
    signAgreement(id: string, partyId: string) {
      const a = agreements.find(x => x.id === id)
      if (!a) return null
      const s = a.signatures.find(sg => sg.partyId === partyId)
      if (s) { s.status = 'signed'; s.signTime = now.format() }
      if (a.signatures.every(sg => sg.status === 'signed')) {
        a.status = 'effective'; a.effectiveTime = now.format()
        if (a.caseId) { this.updateCaseStatus(a.caseId, 'agreement_signed'); setTimeout(() => this.updateCaseStatus(a.caseId!, 'fulfillment_start'), 0) }
      } else if (a.signatures.some(sg => sg.status === 'signed')) {
        a.status = 'partially_signed'
        if (a.caseId) this.updateCaseStatus(a.caseId, 'agreement_signed')
      }
      return a
    },
    rejectAgreement(id: string, partyId: string, reason: string) {
      const a = agreements.find(x => x.id === id)
      if (!a) return null
      const s = a.signatures.find(sg => sg.partyId === partyId)
      if (s) { s.status = 'rejected'; s.rejectReason = reason }
      a.status = 'rejected'
      if (a.caseId) this.updateCaseStatus(a.caseId, 'agreement_rejected', reason)
      return a
    },
    getFulfillmentNodes(agreementId: string) { return fulfillmentNodes.filter(n => n.agreementId === agreementId) },
    updateFulfillmentNode(nodeId: string, data: Partial<FulfillmentNode>) {
      const idx = fulfillmentNodes.findIndex(n => n.id === nodeId)
      if (idx >= 0) {
        fulfillmentNodes[idx] = { ...fulfillmentNodes[idx], ...data }
        if (data.status === 'completed') fulfillmentNodes[idx].completeTime = now.format()
        return fulfillmentNodes[idx]
      }
      return null
    },
    getFulfillmentList() {
      return agreements.filter(a => ['effective', 'fully_signed', 'partially_signed'].includes(a.status)).map(a => {
        const nodes = this.getFulfillmentNodes(a.id)
        const c = cases.find(cc => cc.id === a.caseId)
        return {
          agreement: a, case: c, nodes,
          hasOverdue: nodes.some(n => n.status === 'overdue' || n.status === 'violated'),
          completeRate: nodes.length ? nodes.filter(n => n.status === 'completed').length / nodes.length : 0
        }
      })
    },
    getFollowups(params?: { status?: string }) {
      return followups.filter(f => !params?.status || f.status === params.status)
    },
    getFollowup(id: string) { return followups.find(f => f.id === id) || null },
    createFollowup(data: Partial<Followup>) {
      const nf: Followup = {
        id: 'F' + (++followupIdCounter), caseId: data.caseId || '',
        type: data.type || 'phone', scheduledTime: data.scheduledTime || now.add(3, 'day').format(),
        handlerId: data.handlerId || 'gw1', handlerName: data.handlerName || '张网格员',
        status: 'pending', createTime: now.format(), ...data
      } as Followup
      followups.unshift(nf)
      const c = cases.find(cc => cc.id === nf.caseId)
      if (c && c.status === 'fulfillment_completed') this.updateCaseStatus(nf.caseId, 'followup_pending')
      return nf
    },
    completeFollowup(id: string, result: NonNullable<Followup['result']>) {
      const f = followups.find(x => x.id === id)
      if (!f) return null
      f.status = 'completed'
      f.result = result
      if (result.hasDispute || result.performanceStatus === 'problematic') {
        this.updateCaseStatus(f.caseId, 'repeat_complaint', result.disputeDescription || '回访发现问题')
      } else if (f.caseId) {
        const c = cases.find(cc => cc.id === f.caseId)
        if (c && c.status === 'followup_pending') this.updateCaseStatus(f.caseId, 'case_closed')
      }
      return f
    },
    getUpcomingFollowups() { return followups.filter(f => f.status === 'pending' || f.status === 'overdue') },
    
    findSimilarCases(partyName: string, category?: string, excludeCaseId?: string) {
      const name = partyName.toLowerCase().trim()
      return cases.filter(c => {
        if (excludeCaseId && c.id === excludeCaseId) return false
        if (category && c.category !== category) return false
        return c.parties.some(p => p.name.toLowerCase().includes(name) || name.includes(p.name.toLowerCase()))
      })
    },
    
    getCaseWarnings(caseId: string) {
      const warnings: any[] = []
      const f = followups.find(ff => ff.caseId === caseId && ff.result && (ff.result.hasThreat || ff.result.hasGathering || ff.result.hasVerbalAbuse))
      if (f && f.result) {
        if (f.result.hasThreat) {
          warnings.push({ id: 'W001', caseId, type: 'threat', description: '回访中发现威胁言论', reporterId: f.handlerId, reporterName: f.handlerName, reportTime: f.result.recordTime, sourceType: 'followup', sourceId: f.id })
        }
        if (f.result.hasGathering) {
          warnings.push({ id: 'W002', caseId, type: 'gathering', description: '回访中发现聚集倾向', reporterId: f.handlerId, reporterName: f.handlerName, reportTime: f.result.recordTime, sourceType: 'followup', sourceId: f.id })
        }
        if (f.result.hasVerbalAbuse) {
          warnings.push({ id: 'W003', caseId, type: 'verbal_abuse', description: '回访中发现持续辱骂', reporterId: f.handlerId, reporterName: f.handlerName, reportTime: f.result.recordTime, sourceType: 'followup', sourceId: f.id })
        }
      }
      return warnings
    },
    
    getCaseMergeRecords(caseId: string) {
      const records: any[] = []
      const c = cases.find(cc => cc.id === caseId)
      if (c?.mergedFrom) {
        c.mergedFrom.forEach((mid, i) => {
          records.push({
            id: 'MR' + (i + 1),
            mainCaseId: caseId,
            mergedCaseId: mid,
            mergeTime: now.subtract(i + 1, 'day').format(),
            operatorId: 'md1',
            operatorName: '李调解员',
            reason: '同一当事人同一事项，合并处理'
          })
        })
      }
      return records
    },
    
    getMergedCaseInfo(caseId: string) {
      const c = cases.find(cc => cc.id === caseId)
      if (!c) return null
      const mainCase = c.mergedInto ? cases.find(cc => cc.id === c.mergedInto) : null
      const mergedCases = c.mergedFrom ? cases.filter(cc => c.mergedFrom?.includes(cc.id)) : []
      const caseAgreements = agreements.filter(a => a.caseId === caseId)
      const caseFollowups = followups.filter(f => f.caseId === caseId)
      return {
        case: c,
        mainCase,
        mergedCases,
        mergeRecords: this.getCaseMergeRecords(caseId),
        agreements: caseAgreements,
        followups: caseFollowups
      }
    },

    getOverdueCases() {
      return cases.filter(c => {
        if (c.status === 'case_closed' || c.status === 'merged') return false
        const days = now.diff(dayjs(c.submitTime), 'day')
        c.daysOverdue = Math.max(0, days - 30)
        return days > 30
      })
    },

    getMajorCases() {
      const AMOUNT_THRESHOLD = 50000
      const PARTIES_THRESHOLD = 5
      return cases.filter(c => {
        const involvedCount = c.involvedPartiesCount || c.parties?.length || 0
        const isManyParties = involvedCount >= PARTIES_THRESHOLD
        const isHighAmount = (c.involvedAmount || 0) >= AMOUNT_THRESHOLD
        const hasPetitionRisk = c.hasPetitionRisk === true
        return isManyParties || isHighAmount || hasPetitionRisk
      })
    },

    findRepeatComplaint(partyName: string, category: string, description: string) {
      const name = partyName.toLowerCase().trim()
      const desc = description.toLowerCase().trim()
      return cases.find(c => {
        if (c.status === 'merged') return false
        if (c.category !== category) return false
        const partyMatch = c.parties.some(p => 
          p.name.toLowerCase().includes(name) || name.includes(p.name.toLowerCase())
        )
        if (!partyMatch) return false
        const descMatch = c.description.toLowerCase().includes(desc.substring(0, Math.min(20, desc.length)))
        const titleMatch = c.title.toLowerCase().includes(desc.substring(0, Math.min(10, desc.length)))
        return descMatch || titleMatch
      })
    },

    checkAndHandleRelapse(clueData: any) {
      const firstName = clueData.parties?.find((p: any) => p.name?.trim())?.name || clueData.informantName || ''
      if (!firstName) return null
      
      const originalCase = this.findRepeatComplaint(
        firstName,
        clueData.category || 'other',
        clueData.description || ''
      )
      
      if (originalCase) {
        return {
          originalCase,
          isRelapse: true
        }
      }
      return null
    },

    createCaseWithRelapseCheck(clueData: any, originalCaseId?: string) {
      const nc: Case = {
        id: 'C' + (++caseIdCounter), caseNo: 'MD-2024-' + caseIdCounter,
        title: clueData.title || '未命名案件', category: clueData.category || 'other',
        status: 'clue_submitted', priority: clueData.priority || 'medium',
        description: clueData.description || '', parties: clueData.parties || [],
        submitTime: now.format(), location: clueData.location || '',
        gridWorkerId: clueData.gridWorkerId, gridWorkerName: clueData.gridWorkerName,
        tags: clueData.tags || [], repeatCount: 0, emotionLevel: 2,
        ...clueData
      } as Case
      cases.unshift(nc)
      
      if (originalCaseId) {
        const originalCase = cases.find(c => c.id === originalCaseId)
        if (originalCase) {
          nc.isRelapse = true
          nc.originalCaseId = originalCaseId
          nc.relapseCount = (originalCase.relapseCount || 0) + 1
          nc.repeatCount = (originalCase.repeatCount || 0) + 1
          nc.emotionLevel = Math.min(5, (originalCase.emotionLevel || 3) + 1)
          nc.isKeyFocus = true
          nc.status = 'assigned'
          
          if ((nc.relapseCount || 0) >= 1) {
            nc.isMajor = true
          }
          
          if (originalCase.mediatorId) {
            nc.mediatorId = originalCase.mediatorId
            nc.mediatorName = originalCase.mediatorName
            nc.assignTime = now.format()
          }
        }
      }
      
      return nc
    },

    getSupervisionOrders(params?: { status?: string; type?: string; caseId?: string }) {
      const orders: any[] = [
        {
          id: 'S001', caseId: 'C006', caseNo: 'MD-2024-006', caseTitle: '餐饮油烟扰民调解后反复投诉',
          type: 'relapse', source: 'auto_relapse',
          mediatorId: 'md1', mediatorName: '李调解员',
          supervisorId: 'js1', supervisorName: '赵司法所',
          status: 'in_progress',
          deadline: now.add(5, 'day').format(),
          description: '案件复发，需重新调解跟进。当事人反映油烟问题仍未解决，情绪激动。',
          createTime: now.subtract(2, 'day').format(),
          assignTime: now.subtract(2, 'day').format()
        },
        {
          id: 'S002', caseId: 'C007', caseNo: 'MD-2024-007', caseTitle: '履行节点逾期未完成',
          type: 'overdue', source: 'auto_overdue',
          mediatorId: 'md1', mediatorName: '李调解员',
          status: 'pending',
          deadline: now.add(3, 'day').format(),
          description: '履行节点逾期超过3天，需督办调解员跟进落实。',
          createTime: now.subtract(1, 'day').format()
        }
      ]
      return orders.filter(o => {
        if (params?.status && o.status !== params.status) return false
        if (params?.type && o.type !== params.type) return false
        if (params?.caseId && o.caseId !== params.caseId) return false
        return true
      })
    },

    getSupervisionOrder(id: string) {
      return this.getSupervisionOrders().find(o => o.id === id) || null
    },

    updateSupervisionOrder(id: string, data: any) {
      const orders = this.getSupervisionOrders()
      const idx = orders.findIndex(o => o.id === id)
      if (idx >= 0) {
        Object.assign(orders[idx], data)
        return orders[idx]
      }
      return null
    },

    getCaseSupervisionOrders(caseId: string) {
      return this.getSupervisionOrders({ caseId })
    },

    acceptClue(id: string, originalCaseId?: string) {
      const cl = clues.find(c => c.id === id)
      if (cl) {
        cl.status = 'accepted'
        const nc = this.createCaseWithRelapseCheck({
          title: cl.title, category: cl.category, description: cl.description,
          location: cl.location, gridWorkerId: cl.gridWorkerId, gridWorkerName: cl.gridWorkerName
        }, originalCaseId)
        cl.caseId = nc.id
        cl.status = 'converted'
        return { clue: cl, newCase: nc, isRelapse: !!originalCaseId }
      }
      return null
    }
  }
}
