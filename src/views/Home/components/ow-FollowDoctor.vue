<script setup lang="ts">
import { getFollowDoctor } from '@/apis/consult'
import type { DoctorList } from '@/types/consult'
import { useWindowSize } from '@vueuse/core'
import { onMounted, ref } from 'vue'

const { width } = useWindowSize()
// 获取关注的医生
const list = ref<DoctorList>()
const loadData = async () => {
  const res = await getFollowDoctor({ current: 1, pageSize: 5 })
  list.value = res.rows
  console.log('关注医生', res)
}
onMounted(() => loadData())
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <van-swipe :width="(150 / 375) * width" :show-indicators="false" :loop="false">
        <van-swipe-item v-for="item in list" :key="item.id">
          <owDoctorCard :doctor="item"></owDoctorCard>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  // height: 250px;
  padding-bottom: 20px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
