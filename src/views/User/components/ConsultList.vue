<script setup lang="ts">
import type { ConsultOrderItem, ConsultOrderPage } from '@/types/consult'
import ConsultItem from './ConsultItem.vue'
import { getConsultOrderList } from '@/apis/consult'
import { ref } from 'vue'
import { ConsultType } from '@/enums'

const props = defineProps<{
  // list: ConsultOrderItem[]
  type: ConsultType
}>()
//获取订单列表实现上拉加载更多
const list = ref<ConsultOrderItem[]>([])
//请求分页参数
const getConsultOrderListParams = {
  current: 1,
  pageSize: 10,
  type: props.type,
}
const loading = ref(false)
const finished = ref(false)

const ConsultOrderList = async () => {
  console.log('执行啊AA')
  const res = await getConsultOrderList(getConsultOrderListParams)
  // 追加数据列表
  list.value.push(...res.rows)
  console.log('列表数据', list.value)
  loading.value = false

  if (list.value.length === res.total) {
    // 数据加载完了
    finished.value = true
  } else {
    //为下一次执行做准备
    getConsultOrderListParams.current++
  }
}
const onLoad = () => {
  ConsultOrderList()
}
const onDelete = (id: string) => {
  // 删除订单
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="consult-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"

    >
      <consult-item :item="item" v-for="item in list" :key="item.id" @on-delete="onDelete" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
