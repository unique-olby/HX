<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { io, type Socket } from 'socket.io-client'
import { baseUrl } from '@/utils/request'
import RoomStatus from './components/RoomStatus.vue'
import type { Message, TimeMessages } from '@/types/room'
import { MsgType } from '@/enums'

let list = ref<Message[]>([])
const store = useUserStore()
const route = useRoute()
let socket: Socket
const initSocket = () => {
  // 建立链接，创建 socket.io 实例
  socket = io(baseUrl, {
    auth: {
      token: `Bearer ${store.user?.token}`,
    },
    query: {
      orderId: route.query.orderId,
    },
  })

  socket.on('connect', () => {
    // 建立连接成功
    console.log('connect')
  })

  socket.on('error', (event) => {
    // 错误异常消息
    console.log('error')
  })

  socket.on('disconnect', () => {
    // 已经断开连接
    console.log('disconnect')
  })
  //接收WS服务器给浏览器发送默认数据
  // {data}:{data添加类型}
  socket.on('chatMsgList', ({data}:{data:TimeMessages[]}) => {
    console.log('获取聊天记录数据', data)
    const res:Message[] = []
    // 1. 发送消息的时间放入到result中
    data.forEach((item) => {
      res.push({
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime:item.createTime,
        msg:{
          content:item.createTime
        }
      })
      //把items的消息放入res中
      res.push(...item.items)
    })
    list.value.push(...res)
  })
}

onMounted(async () => {
  initSocket()
})
onUnmounted(() => {
  socket.close()
})
</script>

<template>
  <div class="room-page">
    <OwNavBar middle="医生问诊室" />
    <!-- 1. 问诊状态 未接诊，咨询中，问诊结束-->
    <RoomStatus></RoomStatus>
    <!-- 2. 问诊聊天列表消息 咨询中的医生和患者聊天的内容-->
    <room-message :list="list" />
    <!-- 3. 底部操作栏：发消息 -->
    <room-action />
  </div>
</template>
<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
