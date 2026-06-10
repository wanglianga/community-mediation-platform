import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import dayjs from 'dayjs';

@Injectable()
export class FollowupsService {
  constructor(private readonly store: InMemoryStore) {}
  list(params?: any) {
    return this.store.followups.filter(f => {
      if (params?.status && f.status !== params.status) return false;
      return true;
    });
  }
  get(id: string) { return this.store.followups.find(f => f.id === id) || null; }
  updateCaseStatus(caseId: string, status: string, remark?: string) {
    const c = this.store.cases.find(x => x.id === caseId); if (!c) return;
    const flags: any = {};
    if (status === 'repeat_complaint') { flags.repeatCount = (c.repeatCount || 0) + 1; flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1); }
    Object.assign(c, flags); c.status = status;
    this.store.addTimeline(caseId, status, `状态：${status}`, remark || '案件状态变更', '系统');
  }
  create(data: any) {
    const nf: any = {
      id: this.store.nextFollowupId(), caseId: data.caseId || '', agreementId: data.agreementId,
      type: data.type || 'phone', scheduledTime: data.scheduledTime || dayjs().add(3, 'day').format(),
      handlerId: data.handlerId || 'gw1', handlerName: data.handlerName || '张网格员',
      status: 'pending', createTime: dayjs().format()
    };
    this.store.followups.unshift(nf);
    const c = this.store.cases.find(cc => cc.id === nf.caseId);
    if (c && ['fulfillment_completed', 'agreement_signed', 'fulfillment_start'].includes(c.status)) {
      this.updateCaseStatus(nf.caseId, 'followup_pending');
    }
    return nf;
  }
  complete(id: string, result: any) {
    const f = this.store.followups.find(x => x.id === id); if (!f) return null;
    f.status = 'completed';
    f.result = { ...result, recordTime: dayjs().format() };
    if (result.hasDispute || result.performanceStatus === 'problematic') {
      this.updateCaseStatus(f.caseId, 'repeat_complaint', result.disputeDescription || '回访发现问题');
    } else {
      const c = this.store.cases.find(cc => cc.id === f.caseId);
      if (c && c.status === 'followup_pending') this.updateCaseStatus(f.caseId, 'case_closed');
    }
    return f;
  }
  getUpcoming() { return this.store.followups.filter(f => f.status === 'pending' || f.status === 'overdue'); }
}
