<script setup lang="ts">
import { getMedicalOrderLogistics } from '@/apis/medicine'
import type { Express } from '@/types/medicine'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import carImg from '@/assets/car.png'
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
// 获取物流信息
const express = ref<Express>()
const route = useRoute()
let map: any = null // 声明为组件级别变量

const getExpress = async () => {
  const res = await getMedicalOrderLogistics(route.params.id as string)
  express.value = res
}

// v2.0 需要配置安全密钥jscode
//将来高德地图会校验密钥
onMounted(async () => {
  // 先获取物流信息
  await getExpress()

  window._AMapSecurityConfig = {
    securityJsCode: '0ea2c54516b63149fef7d8d94abcc9e8',
  }

  try {
    const AMap = await AMapLoader.load({
      key: '6928eb7c9045a51181abbfa424356932',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.Driving'],
    })

    console.log('AMap', AMap)
    map = new AMap.Map('map', {
      viewMode: '2D',
      zoom: 11,
      center: [116.397428, 39.90923],
    })
    // 添加车辆标记的函数
    const addCarMarker = () => {
      if (express.value?.currentLocationInfo) {
        const carMarker = new AMap.Marker({
          icon: carImg,
          position: [
            parseFloat(express.value.currentLocationInfo.longitude),
            parseFloat(express.value.currentLocationInfo.latitude),
          ],
          anchor: 'center', // 设置基于坐标点显示的位置
        })
        map.add(carMarker)

        // 3s后，定位到货车，放大地图
        setTimeout(() => {
          map.setFitView([carMarker])
          map.setZoom(10)
        }, 3000)
      }
    }
    // 检查是否有物流信息
    if (express.value?.logisticsInfo && express.value.logisticsInfo.length >= 2) {
      // 创建驾车路线规划实例
      const driving = new AMap.Driving({
        map: map,
        policy: AMap.DrivingPolicy.LEAST_TIME,
        showTraffic: false,
      })

      // 安全地获取起点和终点，不修改原数组
      const logisticsInfo = [...express.value.logisticsInfo]
      const start = logisticsInfo[0]
      const end = logisticsInfo[logisticsInfo.length - 1]
      const waypoints = logisticsInfo
        .slice(1, -1)
        .map((item) => [parseFloat(item.longitude), parseFloat(item.latitude)])

      console.log('起点:', start)
      console.log('终点:', end)
      console.log('途径点:', waypoints)

      // 根据起终点名称规划驾车导航路线
      driving.search(
        [parseFloat(start.longitude), parseFloat(start.latitude)],
        [parseFloat(end.longitude), parseFloat(end.latitude)],
        {
          waypoints: waypoints,
        },
        (status, result) => {
          console.log('路线规划结果:', status, result)
          if (status === 'complete') {
            console.log('绘制驾车路线完成')
            // 路线绘制完成后，添加车辆标记
            addCarMarker()
          } else {
            console.error('获取驾车数据失败：' + result)
          }
        },
      )
    } else {
      console.log('没有物流坐标信息，使用默认路线')
      // 如果没有物流信息，使用默认坐标
      const driving = new AMap.Driving({
        map: map,
        policy: AMap.DrivingPolicy.LEAST_TIME,
        showTraffic: false,
      })

      driving.search(
        [116.397428, 39.90923], // 起点（北京天安门）
        [116.407428, 39.91923], // 终点（北京附近）
        (status, result) => {
          console.log('路线规划结果:', status, result)
          if (status === 'complete') {
            console.log('绘制驾车路线完成')
            // 路线绘制完成后，添加车辆标记
            addCarMarker()
          } else {
            console.error('获取驾车数据失败：' + result)
          }
        },
      )
    }
  } catch (e) {
    console.log('地图加载失败:', e)
  }
})

onUnmounted(() => {
  map?.destroy()
})
</script>

<template>
  <div class="order-logistics-page">
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ express?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">{{ express?.statusValue }}——预计{{ express?.estimatedTime }}送达</p>
        <p class="predict">
          <span>{{ express?.name }}</span>
          <span>{{ express?.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in express?.list" :key="item.id">
          <p class="status" v-if="item.statusValue">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
