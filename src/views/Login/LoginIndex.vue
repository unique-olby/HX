<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import NavBar from '@/components/ow-nav-bar.vue'
import { codeRules, mobileRules, passwordRules } from '@/utils/formRules'
import { showSuccessToast, Toast, type FormInstance, showToast } from 'vant'
import { loginByPassword, loginByMobile, sendMobileCode } from '@/apis/user'
import { useUserStore } from '@/stores'
import { useSendCode } from '@/views/Login/service/index'
import type { User, CodeType } from '@/types/user'
import router from '@/router'
import { useRoute } from 'vue-router'
//是否为密码登录还是验证码登录
const isPass = ref(true)
const route = useRoute()
const agree = ref(false)
const canSeePwd = ref(false)
const store = useUserStore()

const mobile = ref('')
const password = ref('')
const { code, time, form, send } = useSendCode(mobile)
//登录
const login = async () => {
  if (!agree.value) {
    showToast('请勾选我同意')
  }
  try {
    const res = isPass.value
      ? await loginByPassword(mobile.value, password.value)
      : await loginByMobile(mobile.value, code.value)
    store.setUser(res)
    router.push((route.query.returnUrl as string) || '/user')
  } catch (error) {
    console.log('登录不成功', error)
  }
}
</script>

<template>
  <NavBar middle="登录" right="注册" @click-right="$router.push('/register')"></NavBar>
  <div class="login">
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- == form 表单 == -->
    <van-form autocomplete="off" @submit="login">
      <van-field
        v-model="mobile"
        name="mobile"
        :rules="mobileRules"
        autocomplete="off"
        placeholder="请输入手机号"
        type="tel"
      ></van-field>
      <van-field
        v-if="isPass"
        :rules="passwordRules"
        v-model="password"
        placeholder="请输入密码"
        :type="canSeePwd ? 'text' : 'password'"
      >
        <template #button
          ><ow-icon
            @click="canSeePwd = !canSeePwd"
            :icon-url="`login-eye-${canSeePwd ? 'on' : 'off'}`"
          ></ow-icon
        ></template>
      </van-field>
      <van-field v-model="code" :rules="codeRules" v-else placeholder="短信验证码">
        <template #button>
          <span :class="{ active: time > 0 }" @click="send">{{
            time > 0 ? `${time}秒后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit">登 录</van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  padding-top: 46px;
  &-head {
    padding: 30px 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  .van-form {
    padding: 0 14px;
    .cp-cell {
      height: 52px;
      padding: 14px 16px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .van-checkbox {
        a {
          color: var(--cp-primary);
          padding: 0 5px;
        }
      }
    }
  }
}
</style>
