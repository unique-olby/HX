const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login//LoginIndex.vue'),
    meta: { title: '登录' },
  },
  //tabBar页面
  {
    //父路由：layout公共布局
    path: '/',
    component: () => import('@/views/LayOut/LayOutIndex.vue'),
    //子路由
    children: [
      {
        path: '/home',
        component: () => import('@/views/Home/HomeIndex.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/article',
        component: () => import('@/views/Article/ArticleIndex.vue'),
        meta: { title: '健康百科' },
      },
      {
        path: '/notify',
        component: () => import('@/views/Notify/NotifyIndex.vue'),
        meta: { title: '消息通知' },
      },
      {
        path: '/user',
        component: () => import('@/views/User/UserIndex.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
  //家庭档案
  {
    path: '/user/patient',
    component: () => import('@/views/User/PatientInfo.vue'),
  },
  //问诊级别
  {
    path: '/consult/fast',
    component: () => import('@/views/consult/ConsultFast.vue'),
    meta: { title: '急速问诊' },
  },
  //选择科室
  {
    path: '/consult/dep',
    component: () => import('@/views/consult/ConsultDep.vue'),
    meta: { title: '选择科室' },
  },
  //病情描述
  {
    path: '/consult/illness',
    component: () => import('@/views/consult/ConsultIllness.vue'),
    meta: { title: '图文问诊' },
  },
  {
    path: '/consult/pay',
    component: () => import('@/views/consult/ConsultPay.vue'),
    meta: { title: '问诊支付' },
  },
]

export default routes
