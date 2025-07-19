//全局组件类型声明
import navBar from '@/components/ow-nav-bar.vue'
import owIcon from '@/components/ow-icon.vue'
import owRadioBtn from '@/components/ow-radio-btn.vue'
declare module 'vue' {
  interface GlobalComponents {
    navBar: typeof navBar
    owIcon: typeof owIcon
    owRadioBtn: typeof owRadioBtn
  }
}
