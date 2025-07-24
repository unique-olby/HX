import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

//路由守卫
router.beforeEach((to) => {
  //添加title
  document.title = `HX健康通-${to.meta.title}`
  //检查是否有token，没有就拦截返回登录
  const store = useUserStore()
  if (!store.user?.token && !['/login', '/other'].includes(to.path)) {
    return '/login'
  }
})
export default router
