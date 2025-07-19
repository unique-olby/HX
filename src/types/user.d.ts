//用户相关类型
/**
 *
 */
export type User = {
  account?: string
  avatar?: string
  id?: string
  mobile?: string
  refreshToken: string
  token?: string
}

export type CodeType = 'login' | 'register'

// == add 个人信息 ==
type OmitUser = Omit<User, 'token'>
export type UserInfo = OmitUser & {
  likeNumber: number
  collectionNumber: number
  score: number
  couponNumber: number
  orderInfo: {
    paidNumber: number
    receivedNumber: number
    shippedNumber: number
    finishedNumber: number
  }
}

//家庭档案
export type Patient = {
  id?: string
  name: string
  idCard: string
  defaultFlag: 0 | 1 //是否为默认患者
  gender: 0 | 1 //1男0女
  genderValue?: string
  age?: number
}
// 家庭档案-患者信息列表
export type PatientList = Patient[]
