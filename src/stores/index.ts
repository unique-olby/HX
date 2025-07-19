//创建pinia实例
import { createPinia } from 'pinia'
import persis from 'pinia-plugin-persistedstate'
const pinia = createPinia()
//注册持久化插件
pinia.use(persis)

export default pinia
export * from './modules/user'
