<script setup lang="ts">
import { getPatientList } from '@/apis/user'
import type { Patient, PatientList } from '@/types/user'
import { onMounted, ref } from 'vue'
import owNavBar from '@/components/ow-nav-bar.vue'
const list = ref<PatientList>([])

const loadList = async () => {
  const { data } = await getPatientList()
  console.log('患者列表', data)
  list.value = data
}

const show = ref(false)
const showPopup = () => {
  show.value = true
}

const closePopup = () => {
  show.value = false
}

const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 },
]
// 存储选中的性别
const gender = ref(1)
onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar title="家庭档案" />
    <!-- 头部选择提示 -->
    <div class="patient-change" v-if="false">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div class="patient-item" v-for="item in list" :key="item.id">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1******$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon"><ow-icon icon-url="user-edit" /></div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" @click="showPopup">
        <ow-icon icon-url="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 患者选择下一步 -->
    <div class="patient-next" v-if="false">
      <van-button type="primary" round block>下一步</van-button>
    </div>
    <!-- 新增弹出层 -->
    <VanPopup v-model:show="show" position="bottom" class="patient-popup">
      <owNavBar middle="新增患者" right="保存" :back="closePopup"></owNavBar>
      <!-- 新增患者表单 -->
      <div class="popup-content">
        <!-- 这里是表单内容，之前的12415测试内容已替换为实际表单结构 -->
        <owRadioBtn  v-model="gender" :options="options"></owRadioBtn>
        <div class="form-item">
          <label>姓名</label>
          <input type="text" placeholder="请输入姓名" />
        </div>
        <div class="form-item">
          <label>身份证号</label>
          <input type="text" placeholder="请输入身份证号" />
        </div>
        <!-- 其他表单字段 -->
      </div>
    </VanPopup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
}

.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}

.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}

.patient-list {
  padding: 15px;
}

.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;

  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }

  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }

  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}

.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}

.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}

/* 新增弹出层样式 */
::v-deep() {
  .patient-popup {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .ow-nav-bar {
      /* 确保导航栏固定在顶部 */
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .popup-content {
      /* 添加与页面主体相同的顶部内边距，避免内容被导航栏遮挡 */
      padding: 46px 15px 15px;
      /* 使用flex-grow让内容区域占据剩余空间 */
      flex-grow: 1;
      /* 允许内容区域滚动 */
      overflow-y: auto;
    }
  }
}

/* 表单样式 */
.form-item {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    color: var(--cp-text2);
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--cp-border);
    border-radius: 4px;
    box-sizing: border-box;
  }
}
</style>
