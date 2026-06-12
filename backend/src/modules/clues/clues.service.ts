import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import { CasesService } from '../cases/cases.service';
import dayjs from 'dayjs';

@Injectable()
export class CluesService {
  constructor(private readonly store: InMemoryStore, private readonly casesService: CasesService) {}
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
      category: data.category || data.type || 'other',
      categoryName: data.categoryName || data.subcategory || '',
      description: data.description || data.remarks || data.content || '',
      location: data.location || data.address || '',
      address: data.address || data.location || '',
      gridWorkerId: data.gridWorkerId || data.reporterId || 'gw1',
      gridWorkerName: data.gridWorkerName || data.reporterName || '网格员',
      submitTime: data.submitTime || dayjs().format(),
      informantName: data.informantName || data.reporterName || data.submitterName || '',
      informantPhone: data.informantPhone || data.reporterPhone || data.phone || '',
      reporterName: data.reporterName || data.informantName || data.submitterName || '',
      reporterPhone: data.reporterPhone || data.informantPhone || data.phone || '',
      status: 'pending',
      parties: data.parties || (data.reporterName ? [data.reporterName] : [])
    };
    this.store.clues.unshift(nc);
    return nc;
  }
  
  checkRepeatComplaint(clueData: any) {
    return this.casesService.checkAndHandleRelapse(clueData);
  }
  
  accept(id: string, originalCaseId?: string, body?: any) {
    const cl = this.store.clues.find(c => c.id === id);
    if (!cl) return null;
    cl.status = 'accepted';
    
    const caseData: any = {
      title: cl.title,
      category: cl.category,
      description: cl.description,
      location: cl.location || cl.address,
      gridWorkerId: cl.gridWorkerId,
      gridWorkerName: cl.gridWorkerName,
      parties: (cl as any).parties || [],
      submitTime: cl.submitTime
    };
    
    const newCase = this.casesService.createCaseWithRelapseCheck(caseData, originalCaseId);
    
    cl.caseId = newCase.id;
    cl.status = 'converted';
    if (originalCaseId) {
      (cl as any).originalCaseId = originalCaseId;
      (cl as any).isRelapse = body?.isRelapse ?? true;
      (cl as any).relapseNotes = body?.relapseNotes || '';
    }
    
    this.store.addTimeline(newCase.id, 'clue_submitted', '线索转案件', `由线索 ${id} 转立案`, cl.gridWorkerName);
    this.store.addTimeline(newCase.id, 'clue_accepted', '线索受理', '社区已受理', '系统');
    
    return { clue: cl, case: newCase, isRelapse: !!originalCaseId };
  }
  reject(id: string, reason: string) {
    const cl = this.store.clues.find(c => c.id === id);
    if (cl) { cl.status = 'rejected'; cl.rejectReason = reason; }
    return cl;
  }
}
