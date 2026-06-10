import type { Case, CaseStatus, DisputeCategory, Clue, Meeting, Agreement, FulfillmentNode, Followup } from '../types'
import { useMockData } from '../mock/data'

const mock = useMockData()

async function post(url: string, data: any) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

async function put(url: string, data: any) {
  return fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export const caseApi = {
  async list(params?: { status?: CaseStatus; category?: DisputeCategory; keyword?: string; isMajor?: boolean; isOverdue?: boolean }) {
    try {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
      const res = await fetch(`/api/cases${query}`)
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
    try {
      const res = await post('/api/cases', data)
      if (res.ok) return res.json()
    } catch {}
    return mock.createCase(data)
  },
  async update(id: string, data: Partial<Case>) {
    try {
      const res = await put(`/api/cases/${id}`, data)
      if (res.ok) return res.json()
    } catch {}
    return mock.updateCase(id, data)
  },
  async updateStatus(id: string, status: CaseStatus, remark?: string) {
    try {
      const res = await post(`/api/cases/${id}/status`, { status, remark })
      if (res.ok) return res.json()
    } catch {}
    return mock.updateCaseStatus(id, status, remark)
  },
  async assignMediator(id: string, mediatorId: string, mediatorName: string) {
    try {
      const res = await post(`/api/cases/${id}/assign`, { mediatorId, mediatorName })
      if (res.ok) return res.json()
    } catch {}
    return mock.assignMediator(id, mediatorId, mediatorName)
  },
  async getTimeline(caseId: string) {
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`)
      if (res.ok) return res.json()
    } catch {}
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
    try {
      const res = await fetch('/api/cases/supervision')
      if (res.ok) return res.json()
    } catch {}
    return mock.getSupervisionCases()
  }
}

export const clueApi = {
  async list(params?: { status?: string; category?: DisputeCategory }) {
    try {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
      const res = await fetch(`/api/clues${query}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getClues(params)
  },
  async get(id: string) {
    try {
      const res = await fetch(`/api/clues/${id}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getClue(id)
  },
  async create(data: Partial<Clue>) {
    try {
      const res = await post('/api/clues', data)
      if (res.ok) return res.json()
    } catch {}
    return mock.createClue(data)
  },
  async accept(id: string) {
    try {
      const res = await post(`/api/clues/${id}/accept`, {})
      if (res.ok) return res.json()
    } catch {}
    return mock.acceptClue(id)
  },
  async reject(id: string, reason: string) {
    try {
      const res = await post(`/api/clues/${id}/reject`, { reason })
      if (res.ok) return res.json()
    } catch {}
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
    try {
      const res = await fetch(`/api/meetings/${id}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getMeeting(id)
  },
  async create(data: Partial<Meeting>) {
    try {
      const res = await post('/api/meetings', data)
      if (res.ok) return res.json()
    } catch {}
    return mock.createMeeting(data)
  },
  async update(id: string, data: Partial<Meeting>) {
    try {
      const res = await put(`/api/meetings/${id}`, data)
      if (res.ok) return res.json()
    } catch {}
    return mock.updateMeeting(id, data)
  },
  async recordRefusal(id: string, participantId: string, reason: string) {
    try {
      const res = await post(`/api/meetings/${id}/refusal`, { participantId, reason })
      if (res.ok) return res.json()
    } catch {}
    return mock.recordMeetingRefusal(id, participantId, reason)
  },
  async complete(id: string, data: { minutes: string; resolution: string }) {
    try {
      const res = await post(`/api/meetings/${id}/complete`, data)
      if (res.ok) return res.json()
    } catch {}
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
    try {
      const res = await fetch(`/api/agreements/${id}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getAgreement(id)
  },
  async create(data: Partial<Agreement>) {
    try {
      const res = await post('/api/agreements', data)
      if (res.ok) return res.json()
    } catch {}
    return mock.createAgreement(data)
  },
  async sign(id: string, partyId: string) {
    try {
      const res = await post(`/api/agreements/${id}/sign`, { partyId })
      if (res.ok) return res.json()
    } catch {}
    return mock.signAgreement(id, partyId)
  },
  async reject(id: string, partyId: string, reason: string) {
    try {
      const res = await post(`/api/agreements/${id}/reject`, { partyId, reason })
      if (res.ok) return res.json()
    } catch {}
    return mock.rejectAgreement(id, partyId, reason)
  },
  async getFulfillmentNodes(agreementId: string) {
    try {
      const res = await fetch(`/api/agreements/${agreementId}/nodes`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getFulfillmentNodes(agreementId)
  },
  async updateFulfillmentNode(nodeId: string, data: Partial<FulfillmentNode>) {
    try {
      const res = await put(`/api/agreements/nodes/${nodeId}`, data)
      if (res.ok) return res.json()
    } catch {}
    return mock.updateFulfillmentNode(nodeId, data)
  },
  async getFulfillmentList() {
    try {
      const res = await fetch('/api/agreements/fulfillments')
      if (res.ok) return res.json()
    } catch {}
    return mock.getFulfillmentList()
  }
}

export const followupApi = {
  async list(params?: { status?: string }) {
    try {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
      const res = await fetch(`/api/followups${query}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getFollowups(params)
  },
  async get(id: string) {
    try {
      const res = await fetch(`/api/followups/${id}`)
      if (res.ok) return res.json()
    } catch {}
    return mock.getFollowup(id)
  },
  async create(data: Partial<Followup>) {
    try {
      const res = await post('/api/followups', data)
      if (res.ok) return res.json()
    } catch {}
    return mock.createFollowup(data)
  },
  async complete(id: string, result: NonNullable<Followup['result']>) {
    try {
      const res = await post(`/api/followups/${id}/complete`, result)
      if (res.ok) return res.json()
    } catch {}
    return mock.completeFollowup(id, result)
  },
  async getUpcoming() {
    try {
      const res = await fetch('/api/followups/upcoming')
      if (res.ok) return res.json()
    } catch {}
    return mock.getUpcomingFollowups()
  }
}
