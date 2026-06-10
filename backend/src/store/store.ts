import { Injectable, OnModuleInit } from '@nestjs/common';
import dayjs from 'dayjs';

const now = dayjs();

export type CaseStatus = string;
export type DisputeCategory = string;
export type PriorityLevel = string;

export interface Party { id: string; name: string; phone: string; address?: string; role: string; }
export interface Case {
  id: string; caseNo: string; title: string; category: DisputeCategory; status: CaseStatus; priority: PriorityLevel;
  description: string; gridWorkerId?: string; gridWorkerName?: string; mediatorId?: string; mediatorName?: string;
  judicialStaffId?: string; judicialStaffName?: string; parties: Party[]; submitTime: string; acceptTime?: string;
  assignTime?: string; closeTime?: string; dueDate?: string; location: string; tags?: string[];
  isMajor?: boolean; isOverdue?: boolean; repeatCount?: number; emotionLevel?: number; refusalCount?: number; overdueCount?: number;
}
export interface Clue {
  id: string; title: string; category: DisputeCategory; description: string; location: string;
  gridWorkerId: string; gridWorkerName: string; submitTime: string; informantName?: string; informantPhone?: string;
  caseId?: string; status: string; rejectReason?: string;
}
export interface MeetingParticipant {
  id: string; name: string; role: string; status: string;
  refusalReason?: string; absentReason?: string;
  claims?: string; isKeyParty?: boolean; phone?: string;
  participantType?: 'plaintiff' | 'defendant' | 'third_party' | 'property' | 'committee' | 'relative' | 'other';
}
export interface Evidence { id: string; name: string; type: string; url: string; uploadTime: string; }
export interface Meeting {
  id: string; caseId: string; title: string; scheduleTime: string; location: string; mediatorId: string; mediatorName: string;
  participants: MeetingParticipant[]; requirements: string[]; evidenceMaterials: Evidence[];
  minutes?: string; resolution?: string; status: string; actualStartTime?: string; actualEndTime?: string; createTime: string;
}
export interface AgreementTerm { id: string; order: number; content: string; partyResponsible: string; deadline?: string; status: string; }
export interface AgreementSignature { partyId: string; partyName: string; status: string; signTime?: string; rejectReason?: string; }
export interface Agreement {
  id: string; caseId: string; caseTitle: string; caseNo: string; title: string; terms: AgreementTerm[]; supplementaryNotes?: string;
  signatures: AgreementSignature[]; mediatorSign: boolean; createTime: string; draftTime?: string; signDeadline?: string;
  status: string; effectiveTime?: string;
}
export interface FulfillmentNode {
  id: string; agreementId: string; termId: string; nodeName: string; description: string; deadline: string;
  responsibleParty: string; responsiblePartyId?: string; status: string; completeTime?: string;
  proofUrls?: string[]; proofImages?: { id: string; name: string; url: string; uploadTime: string }[];
  remarks?: string; category?: 'move_car' | 'pay_fee' | 'repair_leak' | 'apologize' | 'other';
  supervisionRequired?: boolean; supervisionTime?: string; supervisionHandler?: string;
}
export interface FollowupResult {
  satisfaction: number; hasDispute: boolean; disputeDescription?: string; emotionalState: string;
  performanceStatus: string; notes: string; recordTime: string;
}
export interface Followup {
  id: string; caseId: string; agreementId?: string; type: string; scheduledTime: string; handlerId: string; handlerName: string;
  status: string; result?: FollowupResult; createTime: string;
}
export interface Timeline { id: string; caseId: string; eventType: string; title: string; description: string; operatorName?: string; timestamp: string; }

let caseIdCounter = 1000;
let clueIdCounter = 2000;
let meetingIdCounter = 3000;
let agreementIdCounter = 4000;
let followupIdCounter = 5000;
let tlIdCounter = 6000;
let nodeIdCounter = 7000;

@Injectable()
export class InMemoryStore implements OnModuleInit {
  cases: Case[] = [];
  clues: Clue[] = [];
  meetings: Meeting[] = [];
  agreements: Agreement[] = [];
  fulfillmentNodes: FulfillmentNode[] = [];
  followups: Followup[] = [];
  timelines: Timeline[] = [];

  onModuleInit() {
    this.seed();
  }

  seed() {
    this.cases = [
      {
        id: 'C001', caseNo: 'MD-2024-001', title: '302室夜间噪声扰民纠纷',
        category: 'noise', status: 'assigned', priority: 'medium',
        description: '302室业主反映楼上402室每晚10点后仍有大声唱歌及拖拽桌椅声，持续达两周，多次沟通无效，双方情绪激动。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P1', name: '陈先生', phone: '13900000001', address: '幸福小区302室', role: 'plaintiff' },
          { id: 'P2', name: '刘女士', phone: '13900000002', address: '幸福小区402室', role: 'defendant' }
        ],
        submitTime: now.subtract(3, 'day').format(), acceptTime: now.subtract(2, 'day').format(),
        assignTime: now.subtract(1, 'day').format(), location: '幸福小区3号楼', tags: ['邻里纠纷', '噪声'], repeatCount: 0, emotionLevel: 3
      },
      {
        id: 'C002', caseNo: 'MD-2024-002', title: '地下停车位长期被占用',
        category: 'parking', status: 'meeting_scheduled', priority: 'high',
        description: '业主购买的B1-088号车位长期被外来车辆占用，物业未有效处理，业主已拒缴物业费。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P3', name: '孙先生', phone: '13900000003', address: '阳光花园A座501', role: 'plaintiff' },
          { id: 'P4', name: '阳光物业', phone: '13900000004', role: 'defendant' }
        ],
        submitTime: now.subtract(5, 'day').format(), acceptTime: now.subtract(4, 'day').format(),
        assignTime: now.subtract(3, 'day').format(), location: '阳光花园',
        dueDate: now.add(2, 'day').format(), tags: ['物业纠纷', '停车'], repeatCount: 1, emotionLevel: 4
      },
      {
        id: 'C003', caseNo: 'MD-2024-003', title: '兄弟俩母亲赡养义务争议',
        category: 'support', status: 'agreement_signed', priority: 'high',
        description: '大儿子与小儿子就85岁老母亲赡养费用分摊及居住安排产生分歧。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P5', name: '王建国', phone: '13900000005', address: '安泰社区1栋201', role: 'defendant' },
          { id: 'P6', name: '王建军', phone: '13900000006', address: '安泰社区1栋301', role: 'plaintiff' },
          { id: 'P7', name: '王母', phone: '13900000007', role: 'third_party' }
        ],
        submitTime: now.subtract(15, 'day').format(), acceptTime: now.subtract(14, 'day').format(),
        assignTime: now.subtract(12, 'day').format(), location: '安泰社区居委会',
        tags: ['家庭纠纷', '赡养'], isMajor: true, repeatCount: 0, emotionLevel: 3
      },
      {
        id: 'C004', caseNo: 'MD-2024-004', title: '物业费涨价异议群体性纠纷',
        category: 'property', status: 'escalated', priority: 'urgent',
        description: '小区32户业主联合抵制物业费从1.5元涨至2.2元，认为涨价程序不透明。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        judicialStaffId: 'js1', judicialStaffName: '赵司法所',
        parties: [
          { id: 'P8', name: '业主代表等32人', phone: '13900000008', role: 'plaintiff' },
          { id: 'P9', name: '和谐物业管理公司', phone: '13900000009', role: 'defendant' }
        ],
        submitTime: now.subtract(10, 'day').format(), acceptTime: now.subtract(9, 'day').format(),
        assignTime: now.subtract(8, 'day').format(), location: '和谐花园',
        tags: ['群体性纠纷', '物业收费'], isMajor: true, repeatCount: 2, emotionLevel: 5
      },
      {
        id: 'C005', caseNo: 'MD-2024-005', title: '501室装修漏水致401室损坏索赔',
        category: 'neighbor', status: 'fulfillment_start', priority: 'medium',
        description: '501室卫生间防水处理不当漏水至楼下401室，造成天花板及墙面泡损。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P10', name: '周先生', phone: '13900000010', address: '翠湖苑5栋401', role: 'plaintiff' },
          { id: 'P11', name: '吴女士', phone: '13900000011', address: '翠湖苑5栋501', role: 'defendant' }
        ],
        submitTime: now.subtract(20, 'day').format(), acceptTime: now.subtract(19, 'day').format(),
        assignTime: now.subtract(17, 'day').format(), location: '翠湖苑5栋',
        tags: ['邻里纠纷', '财产损害'], repeatCount: 0, emotionLevel: 2
      },
      {
        id: 'C006', caseNo: 'MD-2024-006', title: '餐饮油烟扰民调解后反复投诉',
        category: 'noise', status: 'repeat_complaint', priority: 'high',
        description: '楼下餐厅油烟排放影响楼上住户，曾达成整改协议后再次反弹，业主情绪激动。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        judicialStaffId: 'js1', judicialStaffName: '赵司法所',
        parties: [
          { id: 'P12', name: '住户联盟', phone: '13900000012', role: 'plaintiff' },
          { id: 'P13', name: '家乡菜馆', phone: '13900000013', role: 'defendant' }
        ],
        submitTime: now.subtract(30, 'day').format(), acceptTime: now.subtract(29, 'day').format(),
        assignTime: now.subtract(27, 'day').format(), location: '美食街68号',
        tags: ['重复投诉', '环境污染'], isMajor: true, repeatCount: 3, emotionLevel: 5, refusalCount: 1, overdueCount: 1
      },
      {
        id: 'C007', caseNo: 'MD-2024-007', title: '履行节点逾期未完成',
        category: 'contract', status: 'fulfillment_overdue', priority: 'high',
        description: '装修合同纠纷已签署协议，第一期赔款应于3天前支付，但被告未履约。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P14', name: '郑先生', phone: '13900000014', role: 'plaintiff' },
          { id: 'P15', name: '某装修公司', phone: '13900000015', role: 'defendant' }
        ],
        submitTime: now.subtract(25, 'day').format(), acceptTime: now.subtract(24, 'day').format(),
        assignTime: now.subtract(22, 'day').format(), location: '金桂小区',
        tags: ['合同纠纷', '履行逾期'], overdueCount: 1, emotionLevel: 4
      },
      {
        id: 'C008', caseNo: 'MD-2024-008', title: '已结案：小区门禁系统费用分摊',
        category: 'property', status: 'case_closed', priority: 'low',
        description: '门禁系统升级费用分摊争议，已完成调解、签署协议并履行完毕。',
        gridWorkerId: 'gw1', gridWorkerName: '张网格员', mediatorId: 'md1', mediatorName: '李调解员',
        parties: [
          { id: 'P16', name: '业委会', phone: '13900000016', role: 'plaintiff' },
          { id: 'P17', name: '物业公司', phone: '13900000017', role: 'defendant' }
        ],
        submitTime: now.subtract(60, 'day').format(), acceptTime: now.subtract(59, 'day').format(),
        assignTime: now.subtract(57, 'day').format(), closeTime: now.subtract(30, 'day').format(),
        location: '桂花苑', tags: ['已结案', '物业纠纷'], repeatCount: 0, emotionLevel: 1
      }
    ];

    this.clues = [
      {
        id: 'CL001', title: '广场舞早间音乐音量过大', category: 'noise',
        description: '多位老人反映小区广场每天早6点广场舞音量影响高三学生备考休息。',
        location: '幸福小区中心广场', gridWorkerId: 'gw1', gridWorkerName: '张网格员',
        submitTime: now.subtract(1, 'hour').format(), informantName: '匿名', status: 'pending'
      },
      {
        id: 'CL002', title: '建筑垃圾堆放楼道一月未清', category: 'neighbor',
        description: '7栋2单元楼道堆放大量装修建筑垃圾，影响通行及消防通道畅通。',
        location: '阳光花园7栋2单元', gridWorkerId: 'gw1', gridWorkerName: '张网格员',
        submitTime: now.subtract(3, 'hour').format(), informantName: '李女士', informantPhone: '13812345678', status: 'accepted'
      },
      {
        id: 'CL003', title: '一楼阳台私搭阳光房被投诉', category: 'neighbor',
        description: '101室阳台未经批准搭建阳光房，二楼业主担心影响安全及采光。',
        location: '翠湖苑3栋101', gridWorkerId: 'gw1', gridWorkerName: '张网格员',
        submitTime: now.subtract(5, 'hour').format(), informantName: '何先生', status: 'pending'
      }
    ];

    this.meetings = [
      {
        id: 'M001', caseId: 'C002', title: '阳光花园停车位纠纷调解会议（第一次）',
        scheduleTime: now.add(1, 'day').hour(14).minute(0).format(),
        location: '阳光花园会议室', mediatorId: 'md1', mediatorName: '李调解员',
        participants: [
          { id: 'P3', name: '孙先生', role: '申请人', status: 'confirmed', isKeyParty: true, participantType: 'plaintiff', claims: '要求物业立即清理占用车位的外来车辆，并赔偿因无法使用车位造成的损失', phone: '13900000003' },
          { id: 'P4', name: '物业经理-钱某', role: '被申请人', status: 'invited', isKeyParty: true, participantType: 'property', claims: '外来车辆为临时访客登记，将加强管理', phone: '13900000004' },
          { id: 'P-EX1', name: '阳光花园业委会-李主任', role: '第三方协调方', status: 'invited', isKeyParty: false, participantType: 'committee', claims: '业委会可协助监督物业整改，建议增设临时车位', phone: '13900000100' }
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
          { id: 'P1', name: '陈先生', role: '申请人', status: 'attended', isKeyParty: true, participantType: 'plaintiff', claims: '要求楼上停止夜间噪声，保证正常休息', phone: '13900000001' },
          { id: 'P2', name: '刘女士', role: '被申请人', status: 'attended', isKeyParty: true, participantType: 'defendant', claims: '正常生活活动产生的声音，认为楼下过于敏感', phone: '13900000002' }
        ],
        requirements: ['双方到场陈述事实情况'],
        evidenceMaterials: [],
        minutes: '双方到场陈述，情绪激烈，402室承认偶有声音但认为302反应过度。经调解员耐心疏导，双方初步达成谅解意向。',
        resolution: '402室承诺22:30后停止噪音活动，302室同意给予观察期。',
        status: 'completed', actualStartTime: now.subtract(6, 'hour').format(),
        actualEndTime: now.subtract(4, 'hour').format(), createTime: now.subtract(3, 'day').format()
      }
    ];

    this.agreements = [
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
    ];

    this.fulfillmentNodes = [
      { id: 'N001', agreementId: 'A005', termId: 'T4', nodeName: '支付漏水赔偿款', description: '501室吴女士一次性支付401室周先生装修修复及赔偿费共计8000元整', deadline: now.add(3, 'day').format(), responsibleParty: '吴女士', status: 'in_progress', category: 'pay_fee' },
      { id: 'N002', agreementId: 'A005', termId: 'T5', nodeName: '卫生间防水维修', description: '501室完成卫生间防水重新施工并出具合格证明', deadline: now.add(5, 'day').format(), responsibleParty: '吴女士', status: 'pending', category: 'repair_leak' },
      { id: 'N003', agreementId: 'A005', termId: 'T6', nodeName: '书面道歉', description: '吴女士就漏水事件向周先生书面致歉', deadline: now.add(2, 'day').format(), responsibleParty: '吴女士', status: 'pending', category: 'apologize' },
      { id: 'N004', agreementId: 'A003', termId: 'T2', nodeName: '本月赡养费支付', description: '两兄弟各支付本月赡养费1000元', deadline: now.format('YYYY-MM-DD'), responsibleParty: '两兄弟', status: 'pending', category: 'pay_fee' },
      { id: 'N005', agreementId: '', termId: '', nodeName: '（已逾期）挪车义务', description: '占用他人车位的车辆应于3天前移走', deadline: now.subtract(3, 'day').format(), responsibleParty: '装修公司', status: 'overdue', category: 'move_car', remarks: '负责人电话无法接通，经网格员上门确认公司已搬离原注册地址，建议启动司法确认程序', supervisionRequired: true, supervisionTime: now.subtract(1, 'day').format(), supervisionHandler: '赵司法所' }
    ];

    this.followups = [
      { id: 'F001', caseId: 'C003', agreementId: 'A003', type: 'phone', scheduledTime: now.add(3, 'day').hour(10).minute(0).format(), handlerId: 'gw1', handlerName: '张网格员', status: 'pending', createTime: now.subtract(1, 'day').format() },
      {
        id: 'F002', caseId: 'C008', type: 'home_visit',
        scheduledTime: now.subtract(2, 'day').hour(15).minute(0).format(),
        handlerId: 'gw1', handlerName: '张网格员', status: 'completed',
        result: { satisfaction: 5, hasDispute: false, emotionalState: 'stable', performanceStatus: 'normal', notes: '双方对调解结果均满意，门禁系统已正常运行一月有余，邻里关系和睦。', recordTime: now.subtract(2, 'day').format() },
        createTime: now.subtract(5, 'day').format()
      },
      { id: 'F003', caseId: 'C006', type: 'onsite', scheduledTime: now.add(1, 'day').hour(9).minute(30).format(), handlerId: 'js1', handlerName: '赵司法所', status: 'pending', createTime: now.format() },
      { id: 'F004', caseId: 'C007', type: 'video', scheduledTime: now.subtract(1, 'day').hour(14).minute(0).format(), handlerId: 'md1', handlerName: '李调解员', status: 'overdue', createTime: now.subtract(3, 'day').format() }
    ];
  }

  nextCaseId() { return 'C' + (++caseIdCounter); }
  nextClueId() { return 'CL' + (++clueIdCounter); }
  nextMeetingId() { return 'M' + (++meetingIdCounter); }
  nextAgreementId() { return 'A' + (++agreementIdCounter); }
  nextFollowupId() { return 'F' + (++followupIdCounter); }
  nextTlId() { return 'TL' + (++tlIdCounter); }
  nextNodeId() { return 'N' + (++nodeIdCounter); }

  addTimeline(caseId: string, eventType: string, title: string, description: string, operatorName?: string) {
    this.timelines.push({
      id: this.nextTlId(), caseId, eventType, title, description,
      operatorName, timestamp: now.format()
    });
  }
}
