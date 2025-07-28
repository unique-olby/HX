<script setup lang="ts">
import { uploadImage } from '@/apis/consult'
import OwNavBar from '@/components/ow-nav-bar.vue'
import OwRadioBtn from '@/components/ow-radio-btn.vue'
import { useConsultStore } from '@/stores'
import type { ConsultIllness, Image } from '@/types/consult'
import {
  showConfirmDialog,
  showToast,
  type UploaderAfterRead,
  type UploaderFileListItem,
} from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { timeOptions, flagOptions } from '@/apis/const'

// 表单变量
const form = ref<ConsultIllness>({
  illnessDesc: '',
  illnessTime: undefined,
  consultFlag: undefined,
  pictures: [],
})
const onAfterRead: UploaderAfterRead = (item) => {
  // 排除多图上传数组的情况
  if (Array.isArray(item)) return
  // 非空判断
  if (!item.file) return
  // 开始上传 => 单图上传
  // 通过 status 属性可以标识上传状态，uploading 表示上传中，failed 表示上传失败，done 表示上传完成
  item.status = 'uploading'
  item.message = '上传中...'
  uploadImage(item.file)
    .then((res) => {
      // const Image = [{id: res.id, url:res.url}]
      // form.value.pictures = Image;
      item.status = 'done'
      item.message = undefined
      // 给 item 加上 url 是为了删除可以根据 url 进行删除
      item.url = res.url
      form.value.pictures?.push(res)
    })
    .catch(() => {
      item.status = 'failed'
      item.message = '上传失败'
    })
}
const onDeleteImg = (item: UploaderFileListItem) => {
  // 删除已经上传图片
  form.value.pictures = form.value.pictures?.filter((pic) => pic.url !== item.url)
}
//下一步按钮禁用判断
const disabled = computed(
  () =>
    !form.value.illnessDesc ||
    !form.value.illnessTime ||
    // 说明：选择就诊过consultFlag的值为0,会有隐式转换
    form.value.consultFlag === undefined,
)
//下一步
const store = useConsultStore()
const router = useRouter()
const next = () => {
  // if(disabled.value){
  //   showToast('请将信息填写完整，再下一步')
  // }
  store.setIllness(form.value)
  router.push('/user/patient?isSel=1')
  //   isSel=1 作为参数传递给 /user/patient 页面。
  // 在 /user/patient 页面里，可以通过路由获取这个参数，用来区分页面的不同状态或行为。
}
onMounted(() => {
  if (store.consult.illnessDesc) {
    showConfirmDialog({
      title: '提示',
      message: '你之前有填写的描述记录，需要回现吗？',
      closeOnPopstate: false,
    })
      .then(() => {
        // 确认
        const { illnessDesc, illnessTime, consultFlag, pictures } = store.consult
        form.value = { illnessDesc, illnessTime, consultFlag, pictures }
      })
      .catch(() => {
        showToast('已取消恢复数据')
      })
  }
})
</script>

<template>
  <div class="consult-illness-page">
    <OwNavBar middle="图文问诊" />
    <!-- 1. 医生提示 -->
    <div class="illness-tip van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <div class="info">
        <p class="tit">在线医生</p>
        <p class="tip">请描述你的疾病或症状、是否用药、就诊经历，需要我听过什么样的帮助</p>
        <p class="safe"><cp-icon name="consult-safe" /><span>内容仅医生可见</span></p>
      </div>
    </div>
    <!-- 2. 病情描述-表单 -->
    <div class="illness-form">
      <!-- 病情描述-基本情况 -->
      <van-field
        v-model="form.illnessDesc"
        type="textarea"
        rows="3"
        placeholder="请详细描述您的病情，病情描述不能为空"
      ></van-field>
      <div class="item">
        <p>本次患病多久了？</p>
        <OwRadioBtn v-model="form.illnessTime" :options="timeOptions" />
      </div>
      <div class="item">
        <p>此次病情是否去医院就诊过？</p>
        <OwRadioBtn v-model="form.consultFlag" :options="flagOptions" />
      </div>
      <!-- 病情描述-图片上传 -->
      <div class="illness-img">
        <van-uploader
          :after-read="onAfterRead"
          upload-icon="photo-o"
          upload-text="上传图片"
          v-model="form.pictures"
          max-count="9"
          :max-size="5 * 1024 * 1024"
        ></van-uploader>
        <p class="tip">上传内容仅医生可见,最多9张图,最大5MB</p>
      </div>
      <van-button :disabled="disabled" @click="next" type="primary" block round>下一步</van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-illness-page {
  padding-top: 46px;
}
.illness-tip {
  display: flex;
  padding: 15px;
  .img {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }
  .info {
    flex: 1;
    padding-left: 12px;
    .tit {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .tip {
      padding: 12px;
      background: var(--cp-bg);
      color: var(--cp-text3);
      font-size: 13px;
      margin-bottom: 10px;
    }
    .safe {
      font-size: 10px;
      color: var(--cp-text3);
      display: flex;
      align-items: center;
      .cp-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}
.illness-form {
  padding: 15px;
  .van-field {
    padding: 0;
    &::after {
      border-bottom: none;
    }
  }
  .item {
    > p {
      color: var(--cp-text3);
      padding: 15px 0;
    }
  }
}
.illness-img {
  padding-top: 16px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  .tip {
    font-size: 12px;
    color: var(--cp-tip);
  }
  ::v-deep() {
    .van-uploader {
      &__preview {
        &-delete {
          left: -6px;
          top: -6px;
          border-radius: 50%;
          background-color: var(--cp-primary);
          width: 20px;
          height: 20px;
          &-icon {
            transform: scale(0.9) translate(-22%, 22%);
          }
        }
        &-image {
          border-radius: 8px;
          overflow: hidden;
        }
      }
      &__upload {
        border-radius: 8px;
      }
      &__upload-icon {
        color: var(--cp-text3);
      }
    }
  }
}
.van-button {
  font-size: 16px;
  margin-bottom: 30px;
  &.disabled {
    opacity: 1;
    background: #fafafa;
    color: #d9dbde;
    border: #fafafa;
  }
}
</style>
