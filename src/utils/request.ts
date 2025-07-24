import { useUserStore } from '@/stores'
import router from '@/router'
import axios, { AxiosError } from 'axios'
import { showFailToast } from 'vant'

//axios实例
const baseUrl = 'https://consult-api.itheima.net/'
const request = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
})

//请求拦截器，携带token
request.interceptors.request.use(
  (config) => {
    const store = useUserStore()
    if (store.user?.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${store.user?.token}`
    }
    return config
  },
  (err) => {
    Promise.reject(err)
  },
)

//响应拦截器,剥离无效数据，401拦截
request.interceptors.response.use(
  (res) => {
    if (res.data?.code !== 10000) {
      showFailToast(res.data.message)
      return Promise.reject(res.data)
    }
    console.log('接口原始响应', res.data.data)
    return res.data.data
  },
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      //删除用户信息
      const store = useUserStore()
      store.deleteUser()
      //跳转登录
      router.push(`/login?returnUrl=${router.currentRoute.value.fullPath}`) //要带参数必须用fullpath，不能path
    }
    return Promise.reject(err)
  },
)

export { request, baseUrl }
