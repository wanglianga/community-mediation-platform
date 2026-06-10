import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import dayjs from 'dayjs';

@Injectable()
export class CasesService {
  constructor(private readonly store: InMemoryStore) {}

  list(params?: any) {
    return this.store.cases.filter(c => {
      if (params?.status && c.status !== params.status) return false;
      if (params?.category && c.category !== params.category) return false;
      if (params?.keyword) {
        const kw = String(params.keyword).toLowerCase();
        if (!c.title.toLowerCase().includes(kw) && !c.description.toLowerCase().includes(kw) && !c.caseNo.toLowerCase().includes(kw)) return false;
      }
      if (params?.isMajor && !c.isMajor) return false;
      return true;
    });
  }

  get(id: string) { return this.store.cases.find(c => c.id === id) || null; }

  create(data: any) {
    const nc = {
      id: this.store.nextCaseId(),
      caseNo: 'MD-2024-' + this.store.cases.length + 1,
      title: data.title || '',
      category: data.category || 'other',
      status: 'clue_submitted',
      priority: data.priority || 'medium',
      description: data.description || '',
      parties: data.parties || [],
      submitTime: dayjs().format(),
      location: data.location || '',
      gridWorkerId: data.gridWorkerId,
      gridWorkerName: data.gridWorkerName,
      tags: data.tags || [],
      repeatCount: 0,
      emotionLevel: 2,
      ...data,
    };
    this.store.cases.unshift(nc);
    this.store.addTimeline(nc.id, 'clue_submitted', '案件登记', `登记：${nc.title}`, data.gridWorkerName || '系统');
    return nc;
  }

  update(id: string, data: any) {
    const idx = this.store.cases.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.store.cases[idx] = { ...this.store.cases[idx], ...data };
      return this.store.cases[idx];
    }
    return null;
  }

  updateStatus(id: string, status: string, remark?: string) {
    const c = this.store.cases.find(x => x.id === id);
    if (!c) return null;
    const flags: any = {};
    if (status === 'meeting_refused') {
      flags.refusalCount = (c.refusalCount || 0) + 1;
      if (flags.refusalCount >= 2) flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1);
    }
    if (status === 'fulfillment_overdue') { flags.overdueCount = (c.overdueCount || 0) + 1; flags.isOverdue = true; }
    if (status === 'repeat_complaint') { flags.repeatCount = (c.repeatCount || 0) + 1; flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1); }
    if (status === 'escalated') { flags.emotionLevel = 5; flags.isMajor = true; }
    Object.assign(c, flags);
    c.status = status;
    const titleMap: any = {
      clue_submitted: '提交线索', clue_accepted: '线索受理', assigned: '分派调解',
      meeting_scheduled: '安排调解会议', meeting_refused: '拒绝参会', meeting_completed: '调解会议完成',
      agreement_drafted: '草拟协议', agreement_signed: '协议签署完成', agreement_rejected: '协议被拒',
      fulfillment_start: '开始履行', fulfillment_overdue: '履行逾期', fulfillment_completed: '履行完成',
      followup_pending: '进入回访阶段', followup_completed: '回访完成',
      escalated: '情绪升级', case_closed: '案件结案', repeat_complaint: '重复投诉'
    };
    this.store.addTimeline(c.id, status, titleMap[status] || status, remark || '状态变更', '系统');
    return c;
  }

  assignMediator(id: string, mediatorId: string, mediatorName: string) {
    const r = this.update(id, { mediatorId, mediatorName, assignTime: dayjs().format() });
    this.updateStatus(id, 'assigned');
    return r;
  }

  getTimeline(caseId: string) {
    return this.store.timelines.filter(t => t.caseId === caseId).sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf());
  }

  getStats() {
    const cases = this.store.cases;
    const categoryStats = [
      { name: '噪声纠纷', value: cases.filter(c => c.category === 'noise').length },
      { name: '停车纠纷', value: cases.filter(c => c.category === 'parking').length },
      { name: '物业收费', value: cases.filter(c => c.category === 'property').length },
      { name: '家庭赡养', value: cases.filter(c => c.category === 'support').length },
      { name: '邻里纠纷', value: cases.filter(c => c.category === 'neighbor').length },
      { name: '其他', value: cases.filter(c => !['noise', 'parking', 'property', 'support', 'neighbor'].includes(c.category)).length },
    ];
    const monthlyTrend = [
      { month: '1月', count: 12 }, { month: '2月', count: 9 }, { month: '3月', count: 15 },
      { month: '4月', count: 18 }, { month: '5月', count: 22 }, { month: '6月', count: cases.length },
    ];
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
      categoryStats,
      monthlyTrend,
    };
  }

  getSupervisionCases() {
    return this.store.cases.filter(c => c.isMajor || c.status === 'escalated' || c.status === 'fulfillment_overdue' || c.status === 'repeat_complaint' || (c.repeatCount || 0) >= 2 || (c.emotionLevel || 0) >= 4);
  }
}
