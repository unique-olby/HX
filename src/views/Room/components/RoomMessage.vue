<script setup lang="ts">
// 评价医生
import type { Message, Prescription } from '@/types/room'
import EvaluateCard from './EvaluateCard.vue'
import { ConsultTime, MsgType, PrescriptionStatus } from '@/enums'
import { timeOptions, flagOptions } from '@/apis/const'
import { showImagePreview, showToast } from 'vant'
import type { Image } from '@/types/consult'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores'
import { getPrescriptionPic } from '@/apis/consult'
import { request } from '@/utils/request'
import { useRouter } from 'vue-router'

defineProps<{
  list: Message[]
}>()
const router = useRouter()
const store = useUserStore()
// 定义格式化描述患病时间和是否就诊
const formIllness = (value: ConsultTime) => {
  return timeOptions.find((item) => item.value === value)?.label
}
const formFlag = (value: 0 | 1) => {
  return flagOptions.find((item) => item.value === value)?.label
}
//解决图片消息滚动失败问题
const loadSuccess = () => {
  window.scrollTo(0, document.body.scrollHeight)
}

// 预览患者图片
const previewImg = (imgs?: Image[]) => {
  if (imgs && imgs.length > 0) {
    showImagePreview(imgs.map((item) => item.url))
  }
}
// 查看处方
const lookPre = async (id?: string) => {
  try {
    if (!id) return showToast('处方id不存在')
    const res = await getPrescriptionPic(id)
    showImagePreview([res.url])
  } catch (error) {
    console.log('查看处方失败', error)
  }
}

// 跳转支付
const goPay = (prescription?: Prescription) => {
  if (prescription) {
    if (prescription.status === PrescriptionStatus.Invalid) {
      showToast('处方已失效')
      return
    }
    if (prescription.status === PrescriptionStatus.NotPayment) {
      showToast('处方未支付')
      return router.push(`/medicine/pay?id=${prescription.id}`)
    }
  }
}
// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('HH:mm')
}
</script>

<template>
  <!-- 消息列表 -->
  <template v-for="item in list" :key="item.id">
    <!-- 1. 病情描述 -->
    <div class="msg msg-illness" v-if="MsgType.CardPat === item.msgType">
      <div class="patient van-hairline--bottom" v-if="item.msg.consultRecord">
        <p>
          {{ item.msg.consultRecord.patientInfo.name }}
          {{ item.msg.consultRecord.patientInfo.genderValue }}
          {{ item.msg.consultRecord.patientInfo.age }}岁
        </p>
        <p>
          {{ formIllness(item.msg.consultRecord.illnessTime) }}|
          {{ formFlag(item.msg.consultRecord.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ item.msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(item.msg.consultRecord?.pictures)">点击查看</van-col>
      </van-row>
    </div>
    <!-- 2. 温馨提示 -->
    <div class="msg msg-tip" v-if="MsgType.NotifyTip === item.msgType">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ item.msg.content }}</span>
      </div>
    </div>
    <!-- 3. 通用通知 -->
    <div class="msg msg-tip" v-if="MsgType.Notify === item.msgType">
      <div class="content">
        <span>{{ item.msg.content }}</span>
      </div>
    </div>
    <!-- 4. 发送文字  患者-->
    <div class="msg msg-to" v-if="MsgType.MsgText === item.msgType && store.user?.id === item.from">
      <div class="content">
        <div class="time">{{ formatTime(item.createTime) }}</div>
        <div class="pao">{{ item.msg.content }}</div>
      </div>
      <van-image :src="store.user.avatar" />
    </div>
    <!-- 5. 接收文字 医生 -->
    <div
      class="msg msg-from"
      v-if="MsgType.MsgText === item.msgType && store.user?.id !== item.from"
    >
      <van-image src="src\assets\doctor.png" />
      <div class="content">
        <div class="time">{{ formatTime(item.createTime) }}</div>
        <div class="pao">{{ item.msg.content }}</div>
      </div>
    </div>
    <!-- 6. 发送图片 -->
    <div
      class="msg msg-to"
      v-if="MsgType.MsgImage === item.msgType && store.user?.id === item.from"
    >
      <div class="content">
        <div class="time">{{ formatTime(item.createTime) }}</div>
        <van-image fit="contain" :src="item.msg.picture?.url" />
      </div>
      <van-image :src="store.user.avatar" />
    </div>
    <!-- 7. 接收图片 -->
    <div
      class="msg msg-from"
      v-if="MsgType.MsgImage === item.msgType && store.user?.id !== item.from"
    >
      <van-image src="src\assets\doctor.png" />
      <div class="content">
        <div class="time">{{ formatTime(item.createTime) }}</div>
        <van-image fit="contain" :src="item.msg.picture?.url" />
      </div>
    </div>
    <!-- 8. 处方消息 -->
    <div class="msg msg-recipe" v-if="MsgType.CardPre === item.msgType">
      <div class="content">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="lookPre(item.msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ item.msg.prescription?.name }}
            {{ item.msg.prescription?.genderValue }}
            {{ item.msg.prescription?.age }}岁
            {{ item.msg.prescription?.diagnosis }}
          </p>
          <p>开方时间：{{ item.msg.prescription?.createTime }}</p>
        </div>
        <div class="body">
          <div class="body-item" v-for="med in item.msg.prescription?.medicines" :key="med.id">
            <div class="durg">
              <p>{{ med.name }}</p>
              <p>{{ med.specs }}</p>
            </div>
            <div class="num">x{{ med.amount }}</div>
          </div>
        </div>
        <div class="foot" @click="goPay(item.msg.prescription)"><span>购买药品</span></div>
      </div>
    </div>
    <!-- 9. 订单取消 -->
    <div class="msg msg-tip msg-tip-cancel" v-if="MsgType.NotifyCancel === item.msgType">
      <div class="content">
        <span>{{ item.msg.content }}</span>
      </div>
    </div>
    <!-- 10. 医生评价 -->
    <div
      class="msg"
      v-if="MsgType.CardEva === item.msgType || MsgType.CardEvaForm === item.msgType"
    >
      <evaluate-card :evaluate-doc="item.msg.evaluateDoc"></evaluate-card>
    </div>
  </template>
</template>

<style lang="scss" scoped>
.msg {
  display: flex;
  padding: 15px;
  // 医生消息+图片
  &-from {
    .content {
      max-width: 240px;
      min-width: 52px;
      .time {
        color: var(--cp-tip);
        margin-bottom: 5px;
      }
      .pao {
        padding: 15px;
        background-color: #fff;
        color: var(--cp-text3);
        font-size: 15px;
        border-radius: 8px;
        position: relative;
        &::before {
          content: '';
          position: absolute;
          left: -13px;
          top: 10px;
          width: 13px;
          height: 16px;
          background: #fff;
          border-top-left-radius: 13px 3px;
        }
        &::after {
          content: '';
          position: absolute;
          left: -13px;
          top: 13px;
          width: 13px;
          height: 13px;
          background: var(--cp-bg);
          border-top-right-radius: 13px 13px;
        }
      }
      .van-image {
        max-height: 160px;
        max-width: 160px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--cp-line);
      }
    }
    > .van-image {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 13px;
    }
  }
  // 患者消息+图片
  &-to {
    justify-content: flex-end;
    .content {
      max-width: 240px;
      min-width: 52px;
      .time {
        color: var(--cp-tip);
        margin-bottom: 5px;
        text-align: right;
      }
      .pao {
        padding: 15px;
        background-color: var(--cp-primary);
        color: #fff;
        font-size: 15px;
        border-radius: 8px;
        position: relative;
        &::before {
          content: '';
          position: absolute;
          right: -13px;
          top: 10px;
          width: 13px;
          height: 16px;
          background: var(--cp-primary);
          border-top-right-radius: 13px 3px;
        }
        &::after {
          content: '';
          position: absolute;
          right: -13px;
          top: 13px;
          width: 13px;
          height: 13px;
          background: var(--cp-bg);
          border-top-left-radius: 13px 13px;
        }
      }
      .van-image {
        max-height: 160px;
        max-width: 160px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--cp-line);
      }
    }
    > .van-image {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
      margin-left: 13px;
    }
  }
  &-tip {
    justify-content: center;
    font-size: 12px;
    .content {
      height: 34px;
      line-height: 34px;
      background-color: #fff;
      color: var(--cp-tip);
      font-size: 12px;
      border-radius: 17px;
      padding: 0 16px;
      max-width: 100%;
      .green {
        color: var(--cp-primary);
      }
    }
    &-cancel {
      .content {
        background-color: #ededed;
      }
    }
  }
  &-illness {
    display: block;
    background-color: #fff;
    margin: 15px;
    border-radius: 8px;
    font-size: 12px;
    .patient {
      padding-bottom: 15px;
      margin-bottom: 15px;
      > p {
        &:first-child {
          font-size: 16px;
        }
        &:last-child {
          margin-top: 5px;
          color: var(--cp-tip);
        }
      }
    }
    .van-col {
      &:nth-child(-n + 2) {
        margin-bottom: 5px;
      }
      &:nth-child(2n) {
        color: var(--cp-tip);
      }
    }
  }
  &-recipe {
    padding: 15px;
    .content {
      background-color: #fff;
      border-radius: 8px;
      color: var(--cp-tip);
      font-size: 12px;
      flex: 1;
      .head {
        padding: 15px;
        .head-tit {
          display: flex;
          justify-content: space-between;
          > h3 {
            font-weight: normal;
            font-size: 16px;
            color: var(--cp-text1);
          }
        }
        p {
          margin-top: 5px;
        }
      }
      .body {
        padding: 15px 15px 0 15px;
        &-item {
          display: flex;
          margin-bottom: 15px;
          .durg {
            flex: 1;
            > p {
              &:first-child {
                font-size: 14px;
                color: var(--cp-text1);
                margin-bottom: 5px;
              }
            }
          }
          .num {
            color: var(--cp-text1);
          }
        }
      }
      .foot {
        background-color: var(--cp-plain);
        color: var(--cp-primary);
        font-size: 16px;
        text-align: center;
        height: 42px;
        line-height: 42px;
      }
    }
  }
}
</style>
