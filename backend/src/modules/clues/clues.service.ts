import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import dayjs from 'dayjs';

@Injectable()
export class CluesService {
  constructor(private readonly store: InMemoryStore) {}
  list(params?: any) {
    return this.store.clues.filter(c => {
      if (params?.status && c.status !== params.status) return false;
      if (params?.category && c.category !== params.category) return false;
      return true;
    });
  }
  get(id: string) { return this.store.clues.find(c => c.id === id) || null; }
  create(data: any) {
    const nc = {
      id: this.store.nextClueId(),
      title: data.title || '',
      category: data.category || 'other',
      description: data.description || '',
      location: data.location || '',
      gridWorkerId: data.gridWorkerId || 'gw1',
      gridWorkerName: data.gridWorkerName || '网格员',
      submitTime: dayjs().format(),
      informantName: data.informantName,
      informantPhone: data.informantPhone,
      status: 'pending',
    };
    this.store.clues.unshift(nc);
    return nc;
  }
  accept(id: string) {
    const cl = this.store.clues.find(c => c.id === id);
    if (!cl) return null;
    cl.status = 'accepted';
    const caseId = this.store.nextCaseId();
    const nc: any = {
      id: caseId, caseNo: 'MD-2024-' + caseId,
      title: cl.title, category: cl.category, description: cl.description,
      location: cl.location, gridWorkerId: cl.gridWorkerId, gridWorkerName: cl.gridWorkerName,
      parties: [], status: 'clue_accepted', acceptTime: dayjs().format(),
      submitTime: cl.submitTime, tags: [], repeatCount: 0, emotionLevel: 2
    };
    this.store.cases.unshift(nc);
    cl.caseId = caseId;
    cl.status = 'converted';
    this.store.addTimeline(caseId, 'clue_submitted', '线索转案件', `由线索 ${id} 转立案`, cl.gridWorkerName);
    this.store.addTimeline(caseId, 'clue_accepted', '线索受理', '社区已受理', '系统');
    return cl;
  }
  reject(id: string, reason: string) {
    const cl = this.store.clues.find(c => c.id === id);
    if (cl) { cl.status = 'rejected'; cl.rejectReason = reason; }
    return cl;
  }
}
