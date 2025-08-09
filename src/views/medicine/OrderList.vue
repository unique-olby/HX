<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import type { OrderDetail } from '@/types/medicine'
import { OrderType } from '@/enums'
import { getMedicalOrderList } from '@/apis/medicine'
import { medicineOrderStatusOptions } from '@/apis/const'
import OwNavBar from '@/components/ow-nav-bar.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const activeStatus = ref('')
const orderList = ref<OrderDetail[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)

// 初始化状态筛选
const initStatusFilter = () => {
  const statusParam = route.query.status as string
  console.log('URL参数status:', statusParam)
  if (statusParam) {
    activeStatus.value = statusParam
    console.log('设置activeStatus为:', activeStatus.value)
  }
}

// 获取订单列表
const getOrderList = async (isRefresh = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      current: page.value.toString(),
      pageSize: pageSize.toString(),
      status: activeStatus.value || undefined,
    }

    console.log('API请求参数:', params)

    const data = (await getMedicalOrderList(params)) as unknown as {
      rows: OrderDetail[]
      total: number
    }

    console.log('API返回数据:', data)

    if (isRefresh) {
      orderList.value = data.rows
      page.value = 1
    } else {
      orderList.value.push(...data.rows)
    }

    total.value = data.total

    // 判断是否加载完成
    if (orderList.value.length >= data.total) {
      finished.value = true
    }
  } catch {
    showToast('获取订单列表失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 状态筛选变化
const onStatusChange = (value: string) => {
  activeStatus.value = value
  orderList.value = []
  page.value = 1
  finished.value = false

  // 更新URL参数
  const query = { ...route.query }
  if (value) {
    query.status = value
  } else {
    delete query.status
  }
  router.replace({ query })

  getOrderList(true)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  finished.value = false
  getOrderList(true)
}

// 上拉加载
const onLoad = () => {
  page.value++
  getOrderList()
}

// 跳转到订单详情
const goToDetail = (orderId: string) => {
  router.push(`/medicine/order/${orderId}`)
}

// 取消订单
const cancelOrder = () => {
  showToast('订单取消成功')
  // 这里应该调用取消订单API
  getOrderList(true)
}

// 确认收货
const confirmReceive = () => {
  showToast('确认收货成功')
  // 这里应该调用确认收货API
  getOrderList(true)
}

// 继续支付
const continuePay = (orderId: string) => {
  router.push(`/medicine/pay/${orderId}`)
}

// 获取状态样式
const getStatusStyle = (status: OrderType) => {
  const statusMap: Record<OrderType, { color: string; bg: string }> = {
    [OrderType.MedicinePay]: { color: '#ff6b35', bg: '#fff7e6' },
    [OrderType.MedicineSend]: { color: '#1989fa', bg: '#e6f3ff' },
    [OrderType.MedicineTake]: { color: '#07c160', bg: '#e6f7e6' },
    [OrderType.MedicineComplete]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.MedicineCancel]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.ConsultPay]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.ConsultWait]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.ConsultChat]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.ConsultComplete]: { color: '#969799', bg: '#f2f3f5' },
    [OrderType.ConsultCancel]: { color: '#969799', bg: '#f2f3f5' },
  }
  return statusMap[status] || { color: '#969799', bg: '#f2f3f5' }
}

onMounted(() => {
  initStatusFilter()
  // 立即获取订单列表，使用当前设置的状态
  getOrderList(true)
})
</script>

<template>
  <div class="order-list-page">
    <OwNavBar middle="我的订单" />

    <!-- 状态筛选 -->
    <div class="status-filter">
      <van-tabs v-model:active="activeStatus" @change="onStatusChange" sticky>
        <van-tab
          v-for="option in medicineOrderStatusOptions"
          :key="option.value"
          :name="option.value"
          :title="option.text"
        />
      </van-tabs>
    </div>

    <!-- 订单列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="order-item" v-for="order in orderList" :key="order.id">
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <h3>优医药房</h3>
              <span class="order-no">订单号：{{ order.orderNo }}</span>
            </div>
            <div class="order-status" :style="{ color: getStatusStyle(order.status).color }">
              {{ order.statusValue }}
            </div>
          </div>

          <!-- 药品列表 -->
          <div class="medicine-list">
            <div
              class="medicine-item"
              v-for="medicine in order.medicines"
              :key="medicine.id"
              @click="goToDetail(order.id)"
            >
              <img class="medicine-img" :src="medicine.avatar" :alt="medicine.name" />
              <div class="medicine-info">
                <div class="medicine-name">
                  <span class="name">{{ medicine.name }}</span>
                  <span class="quantity">x{{ medicine.quantity }}</span>
                </div>
                <div class="medicine-specs">
                  <van-tag v-if="medicine.prescriptionFlag === 1" type="primary"> 处方药 </van-tag>
                  <span class="specs">{{ medicine.specs }}</span>
                </div>
                <div class="medicine-price">￥{{ medicine.amount }}</div>
                <div class="medicine-usage" v-if="medicine.usageDosag">
                  {{ medicine.usageDosag }}
                </div>
              </div>
            </div>
          </div>

          <!-- 订单金额 -->
          <div class="order-amount">
            <span>共{{ order.medicines.length }}件商品</span>
            <span class="amount">实付款：￥{{ order.actualPayment }}</span>
          </div>

          <!-- 订单操作 -->
          <div class="order-actions">
            <van-button
              v-if="order.status === OrderType.MedicinePay"
              type="primary"
              size="small"
              @click="continuePay(order.id)"
            >
              继续支付
            </van-button>
            <van-button
              v-if="order.status === OrderType.MedicinePay"
              plain
              size="small"
              @click="cancelOrder()"
            >
              取消订单
            </van-button>
            <van-button
              v-if="order.status === OrderType.MedicineTake"
              type="primary"
              size="small"
              @click="confirmReceive()"
            >
              确认收货
            </van-button>
            <van-button
              v-if="order.status === OrderType.MedicineTake"
              plain
              size="small"
              @click="goToDetail(order.id)"
            >
              查看物流
            </van-button>
            <van-button
              v-if="order.status === OrderType.MedicineComplete"
              plain
              size="small"
              @click="goToDetail(order.id)"
            >
              再次购买
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.order-list-page {
  padding-top: 46px;
  min-height: calc(100vh - 46px);
  background-color: var(--cp-bg);
}

.status-filter {
  background-color: #fff;
  margin-bottom: 10px;

  :deep(.van-tabs__wrap) {
    padding: 0 15px;
  }

  :deep(.van-tab) {
    font-size: 14px;
  }

  :deep(.van-tabs__line) {
    background-color: var(--cp-primary);
  }
}

.order-item {
  background-color: #fff;
  margin: 10px 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;

  .order-info {
    h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 5px 0;
    }

    .order-no {
      font-size: 12px;
      color: var(--cp-tip);
    }
  }

  .order-status {
    font-size: 14px;
    font-weight: 500;
  }
}

.medicine-list {
  padding: 0 15px;
}

.medicine-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .medicine-img {
    width: 80px;
    height: 70px;
    border-radius: 4px;
    object-fit: cover;
  }

  .medicine-info {
    flex: 1;
    margin-left: 15px;

    .medicine-name {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .name {
        flex: 1;
        font-size: 15px;
        font-weight: 500;
        line-height: 1.4;
      }

      .quantity {
        font-size: 14px;
        color: var(--cp-tip);
        margin-left: 10px;
      }
    }

    .medicine-specs {
      margin-bottom: 8px;

      .van-tag {
        margin-right: 8px;
      }

      .specs {
        font-size: 12px;
        color: var(--cp-tag);
      }
    }

    .medicine-price {
      font-size: 16px;
      color: var(--cp-price);
      font-weight: 500;
      margin-bottom: 5px;
    }

    .medicine-usage {
      font-size: 12px;
      color: var(--cp-tip);
      background-color: var(--cp-bg);
      padding: 4px 8px;
      border-radius: 4px;
      line-height: 1.4;
    }
  }
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fafafa;

  span {
    font-size: 14px;
    color: var(--cp-tip);

    &.amount {
      font-size: 16px;
      color: var(--cp-price);
      font-weight: 500;
    }
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #f5f5f5;

  .van-button {
    min-width: 80px;
  }
}

:deep(.van-list) {
  padding-bottom: 20px;
}

:deep(.van-pull-refresh) {
  min-height: calc(100vh - 46px - 44px);
}
</style>
