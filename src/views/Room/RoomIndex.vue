<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, provide } from 'vue'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { io, type Socket } from 'socket.io-client'
import { baseUrl } from '@/utils/request'
import RoomStatus from './components/RoomStatus.vue'
import type { Message, TimeMessages } from '@/types/room'
import { MsgType, OrderType } from '@/enums'
import type { ConsultOrderItem, Image } from '@/types/consult'
import { getOrderDetail } from '@/apis/consult'
import OwNavBar from '@/components/ow-nav-bar.vue'

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
    // 连接成功时清空旧数据，避免重复
    list.value = []
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
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    const res: Message[] = []
    // 1. 发送消息的时间放入到result中
    data.forEach((item) => {
      res.push({
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime,
        },
      })
      //把items的消息放入res中
      res.push(...item.items)
    })
    // 替换数据而不是追加，避免重复
    list.value = res
    console.log('聊天室消息数据', list.value)
  })
  // 2.医生接收消息
  socket.on('receiveChatMsg', async (msg) => {
    list.value.push(msg)
    // 每次有新消息，自动滚动到最底部
    // 说明？：list消息列表更新后，直接滚动会失效
    // 原因？：改了数据后dom的更新是异步的
    // 解决：等到异步更新结束后，再执行滚动
    await nextTick()
    window.scrollTo(0, document.body.scrollHeight)
  })

  socket.on('statusChange', (data) => {
    getDetail()

    console.log('订单变化', data)
  })
}

const orderDetail = ref<ConsultOrderItem>()

const getDetail = async () => {
  orderDetail.value = await getOrderDetail(route.query.orderId as string)
  console.log('订单详情', orderDetail.value)
}
const sendText = (val: string) => {
  console.log('文字消息内容', val)
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: orderDetail.value?.docInfo?.id,
    msgType: MsgType.MsgText,
    msg: {
      content: val,
    },
  })
}
// 评价成功，修改评价消息状态和数据，切换卡片展示
const completeEva = (score: number) => {
  // 获取评价信息数据
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    // 更新分数
    item.msg.evaluateDoc = { score }
    item.msgType = MsgType.CardEva
  }
}
const sendImage = (val: Image) => {
  console.log('图片消息内容', val)
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: orderDetail.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: {
      picture: val,
    },
  })

}
provide('orderDetail', orderDetail.value)
provide('completeEva', completeEva)
onMounted(async () => {
  initSocket()
  getDetail()
})
onUnmounted(() => {
  socket.close()
})
</script>

<template>
  <div class="room-page">
    <OwNavBar right="结束问诊" middle="医生问诊室" />
    <!-- 1. 问诊状态 未接诊，咨询中，问诊结束-->
    <RoomStatus :status="orderDetail?.status" :countdown="orderDetail?.countdown"></RoomStatus>
    <!-- 2. 问诊聊天列表消息 咨询中的医生和患者聊天的内容-->
    <room-message :list="list" />
    <!-- 3. 底部操作栏：发消息 -->
    <room-action
      :disabled="orderDetail?.status !== OrderType.ConsultChat"
      @send-text="sendText"
      @send-img="sendImage"
    />
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
