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
]

export default routes
