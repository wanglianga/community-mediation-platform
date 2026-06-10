import { defineStore } from 'pinia'
import type { User, UserRole } from '../types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    isLoggedIn: false
  }),
  getters: {
    userRole: (state): UserRole => state.currentUser?.role || 'grid_worker',
    userName: (state): string => state.currentUser?.name || '',
    canManageClues: (state): boolean => ['grid_worker', 'mediator', 'judicial'].includes(state.currentUser?.role || ''),
    canMediate: (state): boolean => ['mediator', 'judicial'].includes(state.currentUser?.role || ''),
    canSignAgreement: (state): boolean => ['party', 'mediator', 'judicial'].includes(state.currentUser?.role || ''),
    canSupervise: (state): boolean => state.currentUser?.role === 'judicial'
  },
  actions: {
    login(role: UserRole) {
      const userMap: Record<UserRole, User> = {
        grid_worker: { id: 'gw1', name: '张网格员', role: 'grid_worker', phone: '13800138001', department: '幸福社区网格站' },
        mediator: { id: 'md1', name: '李调解员', role: 'mediator', phone: '13800138002', department: '街道调解中心' },
        party: { id: 'py1', name: '王当事人', role: 'party', phone: '13800138003' },
        judicial: { id: 'js1', name: '赵司法所', role: 'judicial', phone: '13800138004', department: '街道司法所' }
      }
      this.currentUser = userMap[role]
      this.isLoggedIn = true
      localStorage.setItem('mediation_user', JSON.stringify(this.currentUser))
    },
    logout() {
      this.currentUser = null
      this.isLoggedIn = false
      localStorage.removeItem('mediation_user')
    },
    restoreFromStorage() {
      const saved = localStorage.getItem('mediation_user')
      if (saved) {
        this.currentUser = JSON.parse(saved)
        this.isLoggedIn = true
      }
    }
  }
})
