import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/user'

//用户store:存储用户相关数据
export const useUserStore = defineStore(
  'cp-user',
  () => {
    const user = ref({} as User)

    const setUser = (userData: User) => {
      user.value = userData
    }

    const deleteUser = () => {
      user.value = {} as User
    }

    return {
      user,
      setUser,
      deleteUser,
    }
  },
  //方式1
  // {
  //   persist: true, //开启数据持久化
  // },
  //方式2
  {
    persist: {
      key: 'cp-user',
    },
  },
)
