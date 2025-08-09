<script setup lang="ts">
import { userInfo } from '@/apis/user'
import { useUserStore } from '@/stores'
import type { UserInfo } from '@/types/user'
// 只保留用到的vant方法
import { showConfirmDialog, showSuccessToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const userData = ref<UserInfo | null>(null)
const loading = ref(true) // 加载状态

//获取用户数据
async function getUserInfo() {
  try {
    const res = await userInfo()
    console.log('接口原始响应', res)
    // 直接使用 res，因为 res 本身就是用户数据
    userData.value = res || null
  } catch (error) {
    userData.value = null
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const store = useUserStore()
const router = useRouter()
const logout = () => {
  showConfirmDialog({
    title: '退出确认',
    message: '确定要退出登录吗',
  }).then(() => {
    store.deleteUser()
    showSuccessToast('退出登录成功')
    router.push('/login')
  })
}

//快捷工具
const tools = [
  { label: '我的问诊', path: '/user/consult' },
  { label: '我的处方', path: '/' },
  { label: '家庭档案', path: '/user/patient' },
  { label: '地址管理', path: '/user/address' },
  { label: '我的评价', path: '/' },
  { label: '官方客服', path: '/' },
  { label: '设置', path: '/' },
]
onMounted(() => {
  getUserInfo()
})
</script>

<template>
  <!-- 骨架屏 -->
  <div v-if="loading" class="skeleton-container">
    <div class="skeleton-user-page">
      <!-- 用户信息骨架屏 -->
      <div class="skeleton-user-page-head">
        <div class="skeleton-top">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-name">
            <div class="skeleton-text"></div>
            <div class="skeleton-text-short"></div>
          </div>
        </div>
        <div class="skeleton-stats">
          <div class="skeleton-stat-item" v-for="i in 4" :key="i">
            <div class="skeleton-number"></div>
            <div class="skeleton-label"></div>
          </div>
        </div>
      </div>

      <!-- 订单骨架屏 -->
      <div class="skeleton-order">
        <div class="skeleton-order-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-link"></div>
        </div>
        <div class="skeleton-order-items">
          <div class="skeleton-order-item" v-for="i in 4" :key="i">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text-small"></div>
          </div>
        </div>
      </div>

      <!-- 快捷功能骨架屏 -->
      <div class="skeleton-tools">
        <div class="skeleton-tools-title"></div>
        <div class="skeleton-tool-item" v-for="i in 7" :key="i">
          <div class="skeleton-tool-icon"></div>
          <div class="skeleton-tool-text"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 真实内容 -->
  <div class="user-page" v-else-if="userData">
    <div class="user-page-head">
      <div class="top">
        <van-image round fit="cover" :src="userData.avatar" />
        <div class="name">
          <p>{{ userData.account }}</p>
          <p><van-icon name="edit" /></p>
        </div>
      </div>
      <van-row>
        <van-col span="6">
          <p>{{ userData.collectionNumber }}</p>
          <p>收藏</p>
        </van-col>
        <van-col span="6">
          <p>{{ userData.likeNumber }}</p>
          <p>关注</p>
        </van-col>
        <van-col span="6">
          <p>{{ userData.score }}</p>
          <p>积分</p>
        </van-col>
        <van-col span="6">
          <p>{{ userData.couponNumber }}</p>
          <p>优惠券</p>
        </van-col>
      </van-row>
    </div>
    <!-- 订单 -->
    <div class="user-page-order">
      <div class="head">
        <h3>药品订单</h3>
        <router-link to="/orderList">全部订单 <van-icon name="arrow" /></router-link>
      </div>
      <van-row>
        <van-col span="6" @click="$router.push('/orderList?status=10')" class="order-status-item">
          <van-badge :content="userData.orderInfo?.paidNumber || ''">
            <ow-icon icon-url="user-paid" />
          </van-badge>
          <p>待付款:{{ userData.orderInfo?.paidNumber }}</p>
        </van-col>
        <van-col span="6" @click="$router.push('/orderList?status=11')" class="order-status-item">
          <van-badge :content="userData.orderInfo?.shippedNumber || ''">
            <ow-icon icon-url="user-shipped" />
          </van-badge>
          <p>待发货:{{ userData.orderInfo?.shippedNumber }}</p>
        </van-col>
        <van-col span="6" @click="$router.push('/orderList?status=12')" class="order-status-item">
          <van-badge :content="userData.orderInfo?.receivedNumber || ''">
            <ow-icon icon-url="user-received" />
          </van-badge>
          <p>待收货:{{ userData.orderInfo?.receivedNumber }}</p>
        </van-col>
        <van-col span="6" @click="$router.push('/orderList?status=13')" class="order-status-item">
          <van-badge :content="userData.orderInfo?.finishedNumber || ''">
            <ow-icon icon-url="user-finished" />
          </van-badge>
          <p>已完成:{{ userData.orderInfo?.finishedNumber }}</p>
        </van-col>
      </van-row>
      <!-- //快捷工具 -->
      <div class="user-page-group">
        <h3>快捷功能</h3>
        <van-cell
          :title="item.label"
          is-link
          :to="item.path"
          :border="false"
          v-for="(item, i) in tools"
          :key="i"
        >
          <template #icon><ow-icon :icon-url="`user-tool-0${i + 1}`" /></template>
        </van-cell>
      </div>
      <a class="logout" @click="logout" href="javascript:;">退出登录</a>
    </div>
  </div>

  <div v-else class="loading-container">
    <span>用户信息加载失败</span>
  </div>
</template>

<style lang="scss" scoped>
// 骨架屏样式
.skeleton-container {
  background-color: var(--cp-bg);
  min-height: calc(100vh - 50px);
  padding: 0 15px 65px;
}

.skeleton-user-page-head {
  height: 200px;
  background: linear-gradient(180deg, rgba(44, 181, 165, 0.46), rgba(44, 181, 165, 0));
  margin: 0 -15px;
  padding: 0 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.skeleton-top {
  display: flex;
  padding-top: 50px;
  align-items: center;
}

.skeleton-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-name {
  margin-left: 10px;
  flex: 1;
}

.skeleton-text {
  width: 120px;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-text-short {
  width: 60px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-stats {
  display: flex;
  margin-top: 20px;
}

.skeleton-stat-item {
  flex: 1;
  text-align: center;
}

.skeleton-number {
  width: 40px;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto 8px;
}

.skeleton-label {
  width: 30px;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto;
}

.skeleton-order {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 20px;
}

.skeleton-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.skeleton-title {
  width: 80px;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-link {
  width: 60px;
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-order-items {
  display: flex;
  justify-content: space-between;
}

.skeleton-order-item {
  flex: 1;
  text-align: center;
}

.skeleton-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 50%;
  margin: 0 auto 8px;
}

.skeleton-text-small {
  width: 40px;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto;
}

.skeleton-tools {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.skeleton-tools-title {
  width: 80px;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton-tool-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.skeleton-tool-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-right: 12px;
}

.skeleton-tool-text {
  flex: 1;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 现有样式保持不变
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--cp-bg);
}

.user-page {
  background-color: var(--cp-bg);
  min-height: calc(100vh - 50px);
  padding: 0 15px 65px;
  // 头部
  &-head {
    height: 200px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0.46), rgba(44, 181, 165, 0));
    margin: 0 -15px;
    padding: 0 15px;
    .top {
      display: flex;
      padding-top: 50px;
      align-items: center;
      .van-image {
        width: 70px;
        height: 70px;
      }
      .name {
        padding-left: 10px;
        p {
          &:first-child {
            font-size: 18px;
            font-weight: 500;
          }
          &:last-child {
            margin-top: 10px;
            color: var(--cp-primary);
            font-size: 16px;
          }
        }
      }
    }
    .van-row {
      margin: 0 -15px;
      padding-top: 15px;
      p {
        text-align: center;
        &:first-child {
          font-size: 18px;
          font-weight: 500;
        }
        &:last-child {
          color: var(--cp-dark);
          font-size: 12px;
          padding-top: 4px;
        }
      }
    }
  }
  // 订单
  &-order {
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    .head {
      display: flex;
      justify-content: space-between;
      line-height: 50px;
      padding: 0 15px;
      a {
        color: var(--cp-tip);
      }
    }
    .van-col {
      text-align: center;
      .cp-icon {
        font-size: 28px;
      }
      p {
        font-size: 12px;
        padding-top: 4px;
      }
    }

    .order-status-item {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        opacity: 0.8;
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
  // 分组
  &-group {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    h3 {
      padding-left: 16px;
      line-height: 44px;
    }
    .van-cell {
      align-items: center;
    }
    .cp-icon {
      font-size: 17px;
      margin-right: 10px;
    }
  }
  .logout {
    display: block;
    margin: 20px auto;
    width: 100px;
    text-align: center;
    color: var(--cp-price);
  }
}
</style>
