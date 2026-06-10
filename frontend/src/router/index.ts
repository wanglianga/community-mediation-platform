import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../pages/DashboardPage.vue'),
          meta: { title: '工作台' }
        },
        {
          path: 'case-pool',
          name: 'CasePool',
          component: () => import('../pages/CasePoolPage.vue'),
          meta: { title: '案件池' }
        },
        {
          path: 'clue/register',
          name: 'ClueRegister',
          component: () => import('../pages/ClueRegisterPage.vue'),
          meta: { title: '线索登记' }
        },
        {
          path: 'clue/list',
          name: 'ClueList',
          component: () => import('../pages/ClueListPage.vue'),
          meta: { title: '线索列表' }
        },
        {
          path: 'mediation/progress',
          name: 'MediationProgress',
          component: () => import('../pages/MediationProgressPage.vue'),
          meta: { title: '调解进度' }
        },
        {
          path: 'mediation/meeting/:id?',
          name: 'MediationMeeting',
          component: () => import('../pages/MediationMeetingPage.vue'),
          meta: { title: '调解会议' }
        },
        {
          path: 'agreement/sign/:id?',
          name: 'AgreementSign',
          component: () => import('../pages/AgreementSignPage.vue'),
          meta: { title: '协议签署' }
        },
        {
          path: 'fulfillment/track',
          name: 'FulfillmentTrack',
          component: () => import('../pages/FulfillmentTrackPage.vue'),
          meta: { title: '协议履行' }
        },
        {
          path: 'followup',
          name: 'Followup',
          component: () => import('../pages/FollowupPage.vue'),
          meta: { title: '回访提醒' }
        },
        {
          path: 'supervision',
          name: 'Supervision',
          component: () => import('../pages/SupervisionPage.vue'),
          meta: { title: '司法所督办' }
        },
        {
          path: 'case/:id',
          name: 'CaseDetail',
          component: () => import('../pages/CaseDetailPage.vue'),
          meta: { title: '案件详情' }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { title: '登录' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 矛盾纠纷调解平台` : '矛盾纠纷调解平台'
  next()
})

export default router
