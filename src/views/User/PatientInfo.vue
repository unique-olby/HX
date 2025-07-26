<script setup lang="ts">
import { addPatient, deletePatient, editPatient, getPatientList } from '@/apis/user'
import type { Patient, PatientList } from '@/types/user'
import { computed, onMounted, ref } from 'vue'
import owNavBar from '@/components/ow-nav-bar.vue'
import { Toast, showConfirmDialog, showToast } from 'vant'
import Validator from 'id-validator'
import { useRoute, useRouter } from 'vue-router'
import { useConsultStore } from '@/stores/modules/consult'
const list = ref<PatientList>([])

//默认患者信息
const defaultPatient = ref<Patient>({
  name: '',
  idCard: '',
  defaultFlag: 0,
  gender: 1,
})
const patientAdd = ref<Patient>({ ...defaultPatient.value })
const show = ref(false)

const loadList = async () => {
  const res = await getPatientList()
  console.log('患者列表', res)
  list.value = res
  // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
  if (isSel.value && list.value.length) {
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    if (defPatient) patientId.value = defPatient.id
    else patientId.value = list.value[0].id
  }
}

const remove = async () => {
  if (patientAdd.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: `您确定要删除${patientAdd.value.name}患者信息吗？`,
    })
    await deletePatient(patientAdd.value.id)
    show.value = false
    loadList()
    showToast('删除成功')
  }
}
const isDefaultPatient = computed({
  get: () => patientAdd.value.defaultFlag === 1,
  set: (val: boolean) => {
    patientAdd.value.defaultFlag = val ? 1 : 0
  },
})

const showPopup = (item?: Patient) => {
  if (item) {
    const { id, gender, name, idCard, defaultFlag } = item
    patientAdd.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 新增时，重置为新对象，避免和 defaultPatient.value 产生引用关系
    patientAdd.value = { ...defaultPatient.value }
  }
  show.value = true
}

const closePopup = () => {
  show.value = false
}

const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 },
]

const submit = async () => {
  const validator = new Validator()
  if (!validator.isValid(patientAdd.value.idCard)) return showToast('身份证格式错误')
  const { sex } = validator.getInfo(patientAdd.value.idCard)
  if (patientAdd.value.gender !== sex) return showToast('性别和身份证不符')
  try {
    console.log('可以新增患者了', patientAdd.value)
    patientAdd.value.id ? await editPatient(patientAdd.value) : await addPatient(patientAdd.value)
    closePopup()
    loadList()
    showToast({ type: 'success', message: '保存成功' })
  } catch (error) {
    console.log(error)
  }
}
// 存储选中的性别
const gender = ref(1)
onMounted(() => {
  loadList()
})

const route = useRoute()
//判断是否为选择患者还是编辑家庭档案
const isSel = computed(() => {
  return route.query.isSel === '1'
})
// 存储点击选中患者ID作为标识
const patientId = ref<string>()
const selectedPatient = (item: Patient) => {
  if (isSel.value) {
    patientId.value = item.id
  }
}
// 记录患者ID跳转到待支付页面
const store = useConsultStore()
const router = useRouter()
const next = async () => {
  if (!patientId.value) return showToast('请选择问诊患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<template>
  <div class="patient-page">
    <owNavBar :middle="isSel ? '选择患者' : '家庭档案'" />
    <!-- 头部选择提示 -->
    <div class="patient-change" v-if="isSel">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectedPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1******$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon"><ow-icon @click="showPopup(item)" icon-url="user-edit" /></div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" @click="showPopup()">
        <ow-icon icon-url="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
      <div class="patient-next" v-if="isSel">
        <van-button  type="primary" @click="next" round block>下一步</van-button>
      </div>
    </div>

    <!-- 新增弹出层 -->
    <VanPopup v-model:show="show" position="bottom" class="patient-popup">
      <owNavBar
        :middle="patientAdd.id ? '编辑患者' : '新增患者'"
        right="保存"
        :back="closePopup"
        @click-right="submit"
      ></owNavBar>
      <!-- 新增患者表单 -->
      <van-form autocomplete="off" class="popup-content">
        <van-field v-model="patientAdd.name" label="真实姓名" placeholder="请输入真实姓名" />
        <van-field v-model="patientAdd.idCard" label="身份证号" placeholder="请输入身份证号" />
        <van-field label="性别">
          <!-- 单选按钮组件 -->
          <template #input>
            <owRadioBtn :options="options" v-model="patientAdd.gender"></owRadioBtn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="isDefaultPatient" round />
          </template>
        </van-field>
      </van-form>
      <van-action-bar v-if="patientAdd.id">
        <van-action-bar-button @click="remove" type="danger" text="删除"></van-action-bar-button>
      </van-action-bar>
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
