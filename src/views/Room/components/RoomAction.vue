<script setup lang="ts">
import { uploadImage } from '@/apis/consult'
import OwIcon from '@/components/ow-icon.vue'
import type { Image } from '@/types/consult'
import { showLoadingToast, showToast, type UploaderAfterRead } from 'vant'
import { ref } from 'vue'

const text = ref('')
const img = ref<Image>()
const emit = defineEmits<{
  (e: 'send-text', data: string): void
  (e: 'send-img', data: Image): void
}>()

const props = defineProps<{
  disabled: boolean
}>()
// 处理回车键发送消息
// 把输入的聊天文字 子传父组件
// 父组件再使用websocket.emit方法把聊天文字发送给ws服务器=》聊天内容给医生
const sendText = () => {
  if(props.disabled){
    showToast('代诊状态还不能发消息')
  }
  if (text.value.trim()) {
    emit('send-text', text.value)
    text.value = '' //发送完清空，方便下次发
  }
}

const sendImage: UploaderAfterRead = async (data) => {
  showLoadingToast('上传中')
  if (Array.isArray(data)) return showToast('不能传多张图片')
  if (!data.file) return
  const res = await uploadImage(data.file)
  console.log('聊天上传图片', res)
  emit('send-img',res)
}
</script>

<template>
  <div class="room-action">
    <van-field
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      v-model="text"
      @keyup.enter="sendText"
      :disabled="disabled"
    ></van-field>
    <van-uploader  :after-read="sendImage" :preview-image="false" :disabled="disabled">
      <OwIcon icon-url="consult-img" />
    </van-uploader>
  </div>
</template>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;
  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }
  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
