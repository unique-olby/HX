<template>
  <h1>测试页面</h1>
  <ul>
    <li>
      {{ store.user }}
    </li>
    <li @click="changeStore">点击改变</li>
  </ul>
  <van-button>你好 </van-button>
  <svg aria-hidden="true">
    <!-- #icon-文件夹名称-图片名称 -->
    <use href="#icon-login-eye-off" />
  </svg>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores'
import { request } from '@/utils/request'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
const store = useUserStore()

//获取当前路由地址
const route = useRoute()
console.log('当前路由地址', route)
const getHome = async () => {
  const res = await request.get('/patient/myUser')
  console.log(res)
}

const login = async () => {
  const res = await request.post('/login/password', {
    mobile: '132111122',
    password: 'abc12345',
  })
  console.log('登陈工', res)
}

onMounted(() => {
  // getHome()
  login()
})

const changeStore = () => {
  // store.setUser({
  //   code: 400,
  //   data: {
  //     token: '123',
  //     id: '1',
  //     account: '',
  //     mobile: '1241561236',
  //     avatar: '',
  //     refreshToken: '5555',
  //   },
  //   message: 'nihao',
  // })
}
</script>
