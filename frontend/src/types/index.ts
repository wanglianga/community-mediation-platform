export type UserRole = 'grid_worker' | 'mediator' | 'party' | 'judicial'

export interface User {
  id: string
  name: string
  role: UserRole
  phone: string
  department?: string
  avatar?: string
}

export type CaseStatus = 
  | 'clue_submitted'      // 线索已提交
  | 'clue_accepted'       // 线索已受理
  | 'assigned'            // 已分派调解
  | 'meeting_scheduled'   // 会议已安排
  | 'meeting_refused'     // 拒绝参会
  | 'meeting_completed'   // 会议已完成
  | 'agreement_drafted'   // 协议已草拟
  | 'agreement_signed'    // 协议已签署
  | 'agreement_rejected'  // 协议被拒
  | 'fulfillment_start'   // 履行开始
  | 'fulfillment_overdue' // 履行逾期
  | 'fulfillment_completed' // 履行完成
  | 'followup_pending'    // 待回访
  | 'followup_completed'  // 回访完成
  | 'escalated'           // 情绪升级
  | 'case_closed'         // 案件结案
  | 'repeat_complaint'    // 重复投诉

export type DisputeCategory = 'noise' | 'parking' | 'property' | 'support' | 'neighbor' | 'family' | 'contract' | 'other'

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'

export interface Party {
  id: string
  name: string
  phone: string
  address?: string
  role: 'plaintiff' | 'defendant' | 'third_party'
  idNumber?: string
}

export interface Case {
  id: string
  caseNo: string
  title: string
  category: DisputeCategory
  status: CaseStatus
  priority: PriorityLevel
  description: string
  gridWorkerId?: string
  gridWorkerName?: string
  mediatorId?: string
  mediatorName?: string
  judicialStaffId?: string
  judicialStaffName?: string
  parties: Party[]
  submitTime: string
  acceptTime?: string
  assignTime?: string
  closeTime?: string
  dueDate?: string
  location: string
  tags?: string[]
  isMajor?: boolean
  isOverdue?: boolean
  repeatCount?: number
  emotionLevel?: number
  refusalCount?: number
  overdueCount?: number
}

export interface Clue {
  id: string
  title: string
  category: DisputeCategory
  description: string
  location: string
  gridWorkerId: string
  gridWorkerName: string
  submitTime: string
  informantName?: string
  informantPhone?: string
  evidenceUrls?: string[]
  caseId?: string
  status: 'pending' | 'accepted' | 'rejected' | 'converted'
  rejectReason?: string
}

export type ParticipantType = 'plaintiff' | 'defendant' | 'third_party' | 'property' | 'committee' | 'relative' | 'other'

export interface Meeting {
  id: string
  caseId: string
  title: string
  scheduleTime: string
  location: string
  mediatorId: string
  mediatorName: string
  participants: {
    id: string
    name: string
    role: string
    status: 'invited' | 'confirmed' | 'refused' | 'attended' | 'absent'
    refusalReason?: string
    absentReason?: string
    claims?: string
    isKeyParty?: boolean
    phone?: string
    participantType?: ParticipantType
  }[]
  requirements: string[]
  evidenceMaterials: {
    id: string
    name: string
    type: string
    url: string
    uploadTime: string
  }[]
  minutes?: string
  resolution?: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refused'
  actualStartTime?: string
  actualEndTime?: string
  createTime: string
}

export interface AgreementTerm {
  id: string
  order: number
  content: string
  partyResponsible: string
  deadline?: string
  status: 'pending' | 'in_progress' | 'completed' | 'violated'
}

export interface Agreement {
  id: string
  caseId: string
  caseTitle: string
  caseNo: string
  title: string
  terms: AgreementTerm[]
  supplementaryNotes?: string
  signatures: {
    partyId: string
    partyName: string
    status: 'pending' | 'signed' | 'rejected'
    signTime?: string
    rejectReason?: string
  }[]
  mediatorSign?: boolean
  createTime: string
  draftTime?: string
  signDeadline?: string
  status: 'draft' | 'pending_sign' | 'partially_signed' | 'fully_signed' | 'rejected' | 'effective'
  effectiveTime?: string
}

export type FulfillmentCategory = 'move_car' | 'pay_fee' | 'repair_leak' | 'apologize' | 'other'

export interface FulfillmentNode {
  id: string
  agreementId: string
  termId: string
  nodeName: string
  description: string
  deadline: string
  responsibleParty: string
  responsiblePartyId?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'violated'
  completeTime?: string
  proofUrls?: string[]
  proofImages?: { id: string; name: string; url: string; uploadTime: string }[]
  remarks?: string
  category?: FulfillmentCategory
  supervisionRequired?: boolean
  supervisionTime?: string
  supervisionHandler?: string
}

export interface Followup {
  id: string
  caseId: string
  agreementId?: string
  type: 'phone' | 'home_visit' | 'video' | 'onsite'
  scheduledTime: string
  handlerId: string
  handlerName: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  result?: {
    satisfaction: number
    hasDispute: boolean
    disputeDescription?: string
    emotionalState: 'stable' | 'anxious' | 'angry' | 'depressed'
    performanceStatus: 'normal' | 'delayed' | 'problematic'
    notes: string
    recordTime: string
  }
  createTime: string
}

export interface SupervisionRecord {
  id: string
  caseId: string
  type: 'overdue' | 'major' | 'escalation' | 'repeat' | 'abnormal'
  handlerId: string
  handlerName: string
  action: string
  remarks: string
  result: string
  createTime: string
}

export interface CaseTimeline {
  id: string
  caseId: string
  eventType: CaseStatus | 'note'
  title: string
  description: string
  operatorId?: string
  operatorName?: string
  timestamp: string
}
