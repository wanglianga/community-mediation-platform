import type { Case, CaseStatus, DisputeCategory, Clue, Meeting, Agreement, FulfillmentNode, Followup } from '../types'
import { useMockData } from '../mock/data'

const mock = useMockData()

export const caseApi = {
  async list(params?: { status?: CaseStatus; category?: DisputeCategory; keyword?: string; isMajor?: boolean; isOverdue?: boolean }) {
    try {
      const res = await fetch('/api/cases', { method: 'GET' })
      if (res.ok) return res.json()
    } catch {}
    return mock.getCases(params)
  },
  async get(id: string) {
    try {
      const res = await fetch(`/api/cases/${id}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getCase(id)
  },
  async create(data: Partial<Case>) {
    return mock.createCase(data)
  },
  async update(id: string, data: Partial<Case>) {
    return mock.updateCase(id, data)
  },
  async updateStatus(id: string, status: CaseStatus, remark?: string) {
    return mock.updateCaseStatus(id, status, remark)
  },
  async assignMediator(id: string, mediatorId: string, mediatorName: string) {
    return mock.assignMediator(id, mediatorId, mediatorName)
  },
  async getTimeline(caseId: string) {
    return mock.getCaseTimeline(caseId)
  },
  async getStats() {
    try {
      const res = await fetch('/api/cases/stats')
      if (res.ok) return res.json()
    } catch {}
    return mock.getStats()
  },
  async getSupervisionCases() {
    return mock.getSupervisionCases()
  }
}

export const clueApi = {
  async list(params?: { status?: string; category?: DisputeCategory }) {
    try {
      const res = await fetch('/api/clues')
      if (res.ok) return res.json()
    } catch {}
    return mock.getClues(params)
  },
  async get(id: string) {
    return mock.getClue(id)
  },
  async create(data: Partial<Clue>) {
    return mock.createClue(data)
  },
  async accept(id: string) {
    return mock.acceptClue(id)
  },
  async reject(id: string, reason: string) {
    return mock.rejectClue(id, reason)
  }
}

export const meetingApi = {
  async list(caseId?: string) {
    try {
      const res = await fetch(`/api/meetings${caseId ? `?caseId=${caseId}` : ''}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getMeetings(caseId)
  },
  async get(id: string) {
    return mock.getMeeting(id)
  },
  async create(data: Partial<Meeting>) {
    return mock.createMeeting(data)
  },
  async update(id: string, data: Partial<Meeting>) {
    return mock.updateMeeting(id, data)
  },
  async recordRefusal(id: string, participantId: string, reason: string) {
    return mock.recordMeetingRefusal(id, participantId, reason)
  },
  async complete(id: string, data: { minutes: string; resolution: string }) {
    return mock.completeMeeting(id, data)
  }
}

export const agreementApi = {
  async list(caseId?: string) {
    try {
      const res = await fetch(`/api/agreements${caseId ? `?caseId=${caseId}` : ''}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getAgreements(caseId)
  },
  async get(id: string) {
    return mock.getAgreement(id)
  },
  async create(data: Partial<Agreement>) {
    return mock.createAgreement(data)
  },
  async sign(id: string, partyId: string) {
    return mock.signAgreement(id, partyId)
  },
  async reject(id: string, partyId: string, reason: string) {
    return mock.rejectAgreement(id, partyId, reason)
  },
  async getFulfillmentNodes(agreementId: string) {
    return mock.getFulfillmentNodes(agreementId)
  },
  async updateFulfillmentNode(nodeId: string, data: Partial<FulfillmentNode>) {
    return mock.updateFulfillmentNode(nodeId, data)
  },
  async getFulfillmentList() {
    return mock.getFulfillmentList()
  }
}

export const followupApi = {
  async list(params?: { status?: string }) {
    try {
      const res = await fetch('/api/followups')
      if (res.ok) return res.json()
    } catch {}
    return mock.getFollowups(params)
  },
  async get(id: string) {
    return mock.getFollowup(id)
  },
  async create(data: Partial<Followup>) {
    return mock.createFollowup(data)
  },
  async complete(id: string, result: NonNullable<Followup['result']>) {
    return mock.completeFollowup(id, result)
  },
  async getUpcoming() {
    return mock.getUpcomingFollowups()
  }
}
