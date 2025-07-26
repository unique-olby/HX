<script setup lang="ts">
import { getAllDep } from '@/apis/consult'
import OwNavBar from '@/components/ow-nav-bar.vue'
import { useConsultStore } from '@/stores'
import type { TopDep } from '@/types/consult'
import { computed, onMounted, ref } from 'vue'

const active = ref(0)
// 获取所有科室
const allDep = ref<TopDep[]>([])
onMounted(async () => {
  const res = await getAllDep()
  allDep.value = res
})
const subDep = computed(() => {
  return allDep.value[active.value]?.child
})
const store = useConsultStore()
</script>

<template>
  <OwNavBar middle="选择科室"></OwNavBar>
  <!-- 2. 极速问诊-选择科室 -->
  <div class="consult-dep-page">
    <cp-nav-bar title="选择科室" />
    <div class="wrapper">
      <!-- 一级科室 -->
      <van-sidebar v-model="active">
        <van-sidebar-item v-for="top in allDep" :title="top.name" :key="top.id" />
      </van-sidebar>
      <!-- 二级科室 -->
      <div class="sub-dep">
        <router-link v-for="sub in subDep" :key="sub.id" to="/consult/illness" @click="store.setDep(sub.id)">{{
          sub.name
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.consult-dep-page {
  padding-top: 46px;
}

.wrapper {
  height: calc(100vh - 46px);
  overflow: hidden;
  display: flex;
  .sub-dep {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    > a {
      display: block;
      padding: 14px 30px;
      color: var(--cp-dark);
    }
  }
}
</style>
