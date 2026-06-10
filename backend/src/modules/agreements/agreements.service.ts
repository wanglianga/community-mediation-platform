import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import dayjs from 'dayjs';

@Injectable()
export class AgreementsService {
  constructor(private readonly store: InMemoryStore) {}
  list(caseId?: string) { return caseId ? this.store.agreements.filter(a => a.caseId === caseId) : this.store.agreements; }
  get(id: string) { return this.store.agreements.find(a => a.id === id) || null; }
  updateCaseStatus(caseId: string, status: string, remark?: string) {
    const c = this.store.cases.find(x => x.id === caseId); if (!c) return;
    const flags: any = {};
    if (status === 'fulfillment_overdue') { flags.overdueCount = (c.overdueCount || 0) + 1; flags.isOverdue = true; }
    if (status === 'repeat_complaint') { flags.repeatCount = (c.repeatCount || 0) + 1; flags.emotionLevel = Math.min(5, (c.emotionLevel || 3) + 1); }
    if (status === 'escalated') { flags.emotionLevel = 5; flags.isMajor = true; }
    Object.assign(c, flags); c.status = status;
    this.store.addTimeline(caseId, status, `状态：${status}`, remark || '案件状态变更', '系统');
  }
  create(data: any) {
    const na: any = {
      id: this.store.nextAgreementId(), caseId: data.caseId || '', caseNo: data.caseNo || '', caseTitle: data.caseTitle || '',
      title: data.title || '', terms: (data.terms || []).map((t: any, i: number) => ({ id: 'T' + Date.now() + i, ...t })),
      signatures: (data.signatures || []).map((s: any) => ({ ...s, status: 'pending' })),
      supplementaryNotes: data.supplementaryNotes, signDeadline: data.signDeadline,
      mediatorSign: false, createTime: dayjs().format(), status: data.status || 'draft'
    };
    this.store.agreements.unshift(na);
    if (na.caseId) this.updateCaseStatus(na.caseId, 'agreement_drafted');
    if (na.status === 'pending_sign') na.draftTime = dayjs().format();
    return na;
  }
  sign(id: string, partyId: string) {
    const a = this.store.agreements.find(x => x.id === id); if (!a) return null;
    const s = a.signatures.find((sg: any) => sg.partyId === partyId);
    if (s) { s.status = 'signed'; s.signTime = dayjs().format(); }
    const allSigned = a.signatures.every((sg: any) => sg.status === 'signed');
    const anySigned = a.signatures.some((sg: any) => sg.status === 'signed');
    if (allSigned) {
      a.status = 'effective'; a.effectiveTime = dayjs().format(); a.mediatorSign = true;
      if (a.caseId) {
        this.updateCaseStatus(a.caseId, 'agreement_signed');
        this.updateCaseStatus(a.caseId, 'fulfillment_start');
        a.terms.forEach((t: any, i: number) => {
          const deadline = t.deadline && !['长期', '当月结算', '每月1日', '收到赔偿款当日'].includes(t.deadline)
            ? t.deadline : dayjs().add(7 + i * 3, 'day').format('YYYY-MM-DD');
          this.store.fulfillmentNodes.unshift({
            id: this.store.nextNodeId(), agreementId: a.id, termId: t.id,
            nodeName: `第${t.order}条履行节点`, description: t.content, deadline,
            responsibleParty: t.partyResponsible, status: t.status || 'pending'
          });
        });
      }
    } else if (anySigned) {
      a.status = 'partially_signed';
      if (a.caseId) this.updateCaseStatus(a.caseId, 'agreement_signed');
    } else a.status = 'pending_sign';
    return a;
  }
  reject(id: string, partyId: string, reason: string) {
    const a = this.store.agreements.find(x => x.id === id); if (!a) return null;
    const s = a.signatures.find((sg: any) => sg.partyId === partyId);
    if (s) { s.status = 'rejected'; s.rejectReason = reason; }
    a.status = 'rejected';
    if (a.caseId) this.updateCaseStatus(a.caseId, 'agreement_rejected', reason);
    return a;
  }
  getFulfillmentNodes(aid: string) { return this.store.fulfillmentNodes.filter(n => n.agreementId === aid); }
  updateFulfillmentNode(nodeId: string, data: any) {
    const idx = this.store.fulfillmentNodes.findIndex(n => n.id === nodeId);
    if (idx >= 0) {
      this.store.fulfillmentNodes[idx] = { ...this.store.fulfillmentNodes[idx], ...data };
      if (data.status === 'completed') this.store.fulfillmentNodes[idx].completeTime = dayjs().format();
      return this.store.fulfillmentNodes[idx];
    }
    return null;
  }
  getFulfillmentList() {
    const list = this.store.agreements.filter(a => ['effective', 'fully_signed', 'partially_signed'].includes(a.status));
    const result = list.map(a => {
      const nodes = this.getFulfillmentNodes(a.id);
      const c = this.store.cases.find(cc => cc.id === a.caseId);
      return {
        agreement: a, case: c, nodes,
        hasOverdue: nodes.some(n => n.status === 'overdue' || n.status === 'violated'),
        completeRate: nodes.length ? nodes.filter(n => n.status === 'completed').length / nodes.length : 0,
      };
    });
    if (!result.some(r => r.hasOverdue)) {
      const c7 = this.store.cases.find(cc => cc.id === 'C007');
      if (c7) {
        const extraAgreement: any = {
          id: 'A007', caseId: 'C007', caseNo: 'MD-2024-007', caseTitle: '装修合同纠纷',
          title: '装修合同履行协议', terms: [{ order: 1 }],
          signatures: [{ partyName: '郑先生', partyId: 'x', status: 'signed' }, { partyName: '装修公司', partyId: 'y', status: 'signed' }],
          mediatorSign: true, effectiveTime: dayjs().subtract(10, 'day').format(),
        };
        result.unshift({
          agreement: extraAgreement, case: c7,
          nodes: this.store.fulfillmentNodes.filter(n => !n.agreementId),
          hasOverdue: true, completeRate: 0
        });
      }
    }
    return result;
  }
}
