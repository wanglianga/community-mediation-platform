import { Injectable } from '@nestjs/common';
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
      participants: data.participants || [], requirements: data.requirements || [],
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
  complete(id: string, data: any) {
    const m = this.store.meetings.find(x => x.id === id); if (!m) return null;
    m.status = 'completed'; m.minutes = data.minutes; m.resolution = data.resolution;
    m.actualEndTime = dayjs().format();
    m.participants.forEach((p: any) => { if (p.status !== 'refused') p.status = 'attended'; });
    if (m.caseId) this.updateCaseStatus(m.caseId, 'meeting_completed');
    return m;
  }
}
