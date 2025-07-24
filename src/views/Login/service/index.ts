import { sendMobileCode } from '@/apis/user'
import { showSuccessToast, type FormInstance } from 'vant'
import { onUnmounted, ref, type Ref } from 'vue'

export function useSendCode(mobile:Ref<string>) {
  const code = ref('')
  const time = ref(0)
  const form = ref<FormInstance>()
  let timeId: number
  const send = async () => {
    if (time.value > 0) return
    try {
      await form.value?.validate('mobile')
      const res = await sendMobileCode(mobile.value, 'login')
      console.log('短信验证码', res.data.code)
      showSuccessToast('发送成功')
      time.value = 60
      //倒计时
      timeId = window.setInterval(() => {
        time.value--
        if (time.value <= 0) {
          window.clearInterval(timeId)
        }
      }, 1000)
    } catch (error) {
      console.log(error)
    }
  }

  onUnmounted(() => {
    window.clearInterval(timeId)
  })
  
  return { code, time, form, send }
}
