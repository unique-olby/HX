<script setup lang="ts">
import { createMedicalOrder, getAddressList, getMedicalOrderPre } from '@/apis/medicine'
import OwNavBar from '@/components/ow-nav-bar.vue'
import type { AddressItem, OrderPre } from '@/types/medicine'
import { showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// 1. 获取药品预订单信息和地址信息
const orderPre = ref<OrderPre>()
const address = ref<AddressItem>()
const isAgree = ref(false)
const loading = ref(false)
const orderId = ref('')
const showPaySheet = ref(false)
const payCallbackUrl = computed(() => `${window.location.origin}/medicine/pay/result`)
const submit = async () => {
  if (!isAgree.value) return showToast('请同意支付协议')
  if (!address.value?.id) return showToast('请选择收货地址')
  if (!orderPre.value?.id) return showToast('未找到处方')
  // 1. 没有生成订单ID
  if (!orderId.value) {
    loading.value = true
    try {
      const res = await createMedicalOrder({
        id: orderPre.value?.id,
        addressId: address.value?.id,
      })
      orderId.value = res.id
      // 打开支付抽屉
      showPaySheet.value = true
    } finally {
      loading.value = false
    }
  } else {
    // 2. 已经生成
    showPaySheet.value = true
  }
}
onMounted(async () => {
  console.log('OrderPay onMounted 被调用', Date.now())
  console.log('=== 开始调用 getMedicalOrderPre ===')
  const res = await getMedicalOrderPre({ prescriptionId: route.query.id as string })
  console.log('=== getMedicalOrderPre 完成 ===', res)
  console.log('=== 开始调用 getAddressList ===')
  const addRes = await getAddressList()
  console.log('=== getAddressList 完成 ===', addRes)
  orderPre.value = res
  // 设置收货地址
  if (addRes.length) {
    const defAddress = addRes.find((item) => item.isDefault === 0)
    if (defAddress) address.value = defAddress
    else address.value = addRes[0]
  }
})
</script>
<template>
  <div class="order-pay-page" v-if="orderPre && address">
    <OwNavBar middle="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <span>{{ address.province + address.city + address.county }}</span>
      </p>
      <p class="detail">{{ address.addressDetail }}</p>
      <p>
        {{ address.receiver }}
        {{ address.mobile.replace(/^(\d{3})(?:\d{4})(\d{4})$/, '\$1****\$2') }}
      </p>
    </div>
    <div class="order-medical">
      <div class="head">
        <h3>优医药房</h3>
        <small>优医质保 假一赔十</small>
      </div>
      <div class="item van-hairline--top" v-for="med in orderPre.medicines" :key="med.id">
        <img class="img" :src="med.avatar" alt="" />
        <div class="info">
          <p class="name">
            <span>{{ med.name }}</span>
            <span>x{{ med.quantity }}</span>
          </p>
          <p class="size">
            <van-tag v-if="med.prescriptionFlag === 1">处方药</van-tag>
            <span>{{ med.specs }}</span>
          </p>
          <p class="price">￥{{ med.amount }}</p>
        </div>
        <div class="desc">{{ med.usageDosag }}</div>
      </div>
    </div>
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell title="实付款" :value="`￥${orderPre.actualPayment}`" class="price" />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox v-model="isAgree">我已同意<a href="javascript:;">支付协议</a></van-checkbox>
    </div>
    <van-submit-bar
      :price="orderPre.actualPayment * 100"
      button-text="立即支付"
      button-type="primary"
      text-align="left"
      @click="submit"
      :loading="loading"
    ></van-submit-bar>
  </div>
  <OwPaySheet
    v-model:show="showPaySheet"
    :order-id="orderId"
    :actual-payment="orderPre?.actualPayment"
    :pay-callback="payCallbackUrl"
  />
</template>
<style lang="scss" scoped>
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

.order-medical {
  background-color: #fff;
  padding: 0 15px;
  .head {
    display: flex;
    height: 54px;
    align-items: center;
    > h3 {
      font-size: 16px;
      font-weight: normal;
    }
    > small {
      font-size: 13px;
      color: var(--cp-tag);
      margin-left: 10px;
    }
  }
  .item {
    display: flex;
    flex-wrap: wrap;
    padding: 15px 0;
    .img {
      width: 80px;
      height: 70px;
      border-radius: 2px;
      overflow: hidden;
    }
    .info {
      padding-left: 15px;
      width: 250px;
      .name {
        display: flex;
        font-size: 15px;
        margin-bottom: 5px;
        > span:first-child {
          width: 200px;
        }
        > span:last-child {
          width: 50px;
          text-align: right;
        }
      }
      .size {
        margin-bottom: 5px;
        .van-tag {
          background-color: var(--cp-primary);
          vertical-align: middle;
        }
        span:not(.van-tag) {
          margin-left: 10px;
          color: var(--cp-tag);
          vertical-align: middle;
        }
      }
      .price {
        font-size: 16px;
        color: #eb5757;
      }
    }
    .desc {
      width: 100%;
      background-color: var(--cp-bg);
      border-radius: 4px;
      margin-top: 10px;
      padding: 4px 10px;
      color: var(--cp-tip);
    }
  }
}
.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 30px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
