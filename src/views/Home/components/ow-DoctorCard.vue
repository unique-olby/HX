<script lang="ts" setup>
import { followDoctor } from '@/apis/consult'
import type { Doctor } from '@/types/consult'
import { useFollow } from '@/views/Home/service/index'
import { ref } from 'vue'

const { loading, follow } = useFollow()
defineProps<{
  doctor: Doctor
}>()
</script>
<template>
  <div class="doctor-card">
    <van-image round :src="doctor.avatar" />
    <p class="name">{{ doctor?.name }}</p>
    <p>{{ doctor?.hospitalName }} {{ doctor?.depName }}</p>
    <p>{{ doctor?.positionalTitles }}</p>
    <van-button :loading="loading" @click="follow(doctor)" round size="small" type="primary">{{
      doctor.likeFlag === 1 ? '已关注' : '关注'
    }}</van-button>
  </div>
</template>
<style scoped lang="scss">
.doctor-card {
  width: 135px;
  // height: 190px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 11px 0px rgba(229, 229, 229, 0.2);
  text-align: center;
  padding: 15px;
  margin-left: 15px;
  display: inline-block;
  box-sizing: border-box;
  > .van-image {
    width: 58px;
    height: 58px;
    vertical-align: top;
    border-radius: 50%;
    margin: 0 auto 8px;
  }
  > p {
    margin-bottom: 0;
    font-size: 11px;
    color: var(--cp-tip);
    &.name {
      font-size: 13px;
      color: var(--cp-text1);
      margin-bottom: 5px;
    }
  }
  > .van-button {
    padding: 0 12px;
    height: 28px;
    margin-top: 8px;
    width: 72px;
  }
}
</style>
