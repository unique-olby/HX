//全局组件类型声明
import navBar from '@/components/ow-nav-bar.vue'
import owIcon from '@/components/ow-icon.vue'
import owRadioBtn from '@/components/ow-radio-btn.vue'
import owKnowlegeList from '@/views/Home/components/ow-knowlegeList.vue'
import owKnowlegeCard from '@/views/Home/components/ow-knowlegeCard.vue'
import owDoctorCard from '@/views/Home/components/ow-DoctorCard.vue'
declare module 'vue' {
  interface GlobalComponents {
    navBar: typeof navBar
    owIcon: typeof owIcon
    owRadioBtn: typeof owRadioBtn
    owKnowlegeList: typeof owKnowlegeList
    owKnowlegeCard: typeof owKnowlegeCard
    owDoctorCard: typeof owDoctorCard
  }
}
