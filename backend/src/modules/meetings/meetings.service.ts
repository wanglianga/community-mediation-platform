import { Injectable, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import dayjs from 'dayjs';

@Injectable()
export class MeetingsService {
  constructor(private readonly store: InMemoryStore) {}
  list(caseId?: string) { return caseId ? this.store.meetings.filter(m => m.caseId === caseId) : this.store.meetings; }
  get(id: string) { return this.store.meetings.find(m => m.id === id) || null; }
  updateCaseStatus(caseId: string, status: string, remark?: string) {
    const c = this.store.cases.find(x => x.id === caseId); if (!c) return;
    const flags: any = {};
    if (status === 'meeting_refused') {
      flags.refusalCount = (c.refusalCount || 0) + 1;
      if (flags.refusalCount >= 2) flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1);
    }
    if (status === 'fulfillment_overdue') { flags.overdueCount = (c.overdueCount || 0) + 1; flags.isOverdue = true; }
    if (status === 'repeat_complaint') { flags.repeatCount = (c.repeatCount || 0) + 1; flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1); }
    if (status === 'escalated') { flags.emotionLevel = 5; flags.isMajor = true; }
    Object.assign(c, flags); c.status = status;
    this.store.addTimeline(caseId, status, `状态：${status}`, remark || '案件状态变更', '系统');
  }
  create(data: any) {
    const nm: any = {
      id: this.store.nextMeetingId(), caseId: data.caseId || '', title: data.title || '',
      scheduleTime: data.scheduleTime || dayjs().add(1, 'day').format(), location: data.location || '',
      mediatorId: data.mediatorId || 'md1', mediatorName: data.mediatorName || '调解员',
      participants: (data.participants || []).map((p: any) => ({
        id: p.id || ('P-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
        name: p.name || '', role: p.role || '', status: p.status || 'invited',
        participantType: p.participantType || 'other', isKeyParty: p.isKeyParty !== undefined ? p.isKeyParty : false,
        claims: p.claims || '', phone: p.phone || ''
      })),
      requirements: data.requirements || [],
      evidenceMaterials: data.evidenceMaterials || [], status: 'scheduled', createTime: dayjs().format()
    };
    this.store.meetings.unshift(nm);
    if (nm.caseId) this.updateCaseStatus(nm.caseId, 'meeting_scheduled');
    return nm;
  }
  update(id: string, data: any) {
    const idx = this.store.meetings.findIndex(m => m.id === id);
    if (idx >= 0) this.store.meetings[idx] = { ...this.store.meetings[idx], ...data };
    return this.store.meetings[idx] || null;
  }
  addParticipant(id: string, participant: any) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    const np = {
      id: 'P-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: participant.name || '', role: participant.role || '', status: participant.status || 'invited',
      participantType: participant.participantType || 'other', isKeyParty: participant.isKeyParty || false,
      claims: participant.claims || '', phone: participant.phone || ''
    };
    m.participants.push(np);
    this.store.addTimeline(m.caseId, 'note', '追加参会方', `追加参会方：${np.name}（${np.role}）`, '调解员');
    return m;
  }
  removeParticipant(id: string, pid: string) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    m.participants = m.participants.filter(p => p.id !== pid);
    return m;
  }
  updateParticipant(id: string, pid: string, data: any) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    const p = m.participants.find(pp => pp.id === pid); if (!p) return null;
    Object.assign(p, data);
    return m;
  }
  checkKeyPartiesAttended(id: string) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return { allAttended: true, missingKeyParties: [] };
    const missing = m.participants.filter(p => p.isKeyParty && p.status !== 'attended' && p.status !== 'confirmed');
    return {
      allAttended: missing.length === 0,
      missingKeyParties: missing.map(p => ({ id: p.id, name: p.name, role: p.role, status: p.status, absentReason: p.absentReason }))
    };
  }
  recordRefusal(id: string, pid: string, reason: string) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    const p = m.participants.find(pp => pp.id === pid);
    if (p) { p.status = 'refused'; p.refusalReason = reason; }
    if (m.participants.some(pp => pp.status === 'refused')) {
      m.status = 'refused';
      if (m.caseId) this.updateCaseStatus(m.caseId, 'meeting_refused', reason);
    }
    return m;
  }
  recordAbsent(id: string, pid: string, reason: string) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    const p = m.participants.find(pp => pp.id === pid);
    if (p) { p.status = 'absent'; p.absentReason = reason; }
    return m;
  }
  complete(id: string, data: any) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    const keyCheck = this.checkKeyPartiesAttended(id);
    if (!keyCheck.allAttended && !data.forceComplete) {
      const missingNames = keyCheck.missingKeyParties.map(p => p.name).join('、');
      throw new BadRequestException(`关键方缺席，无法生成最终协议。缺席关键方：${missingNames}。如需继续请勾选强制完成。`);
    }
    m.status = 'completed'; m.minutes = data.minutes; m.resolution = data.resolution;
    m.actualEndTime = dayjs().format();
    m.participants.forEach((p: any) => {
      if (p.status !== 'refused' && p.status !== 'absent') p.status = 'attended';
    });
    if (m.caseId) this.updateCaseStatus(m.caseId, 'meeting_completed');
    return m;
  }
}
