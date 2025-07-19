import type { User, CodeType, UserInfo, PatientList } from '@/types/user'
import { request } from '@/utils/request'

// 密码登录
export const loginByPassword = async (mobile: string, password: string) => {
  const res = await request.post<User>('/login/password', { mobile, password })
  return res.data
}
//发送验证码
export const sendMobileCode = (mobile: string, type: CodeType) => {
  return request.get<{ code: string }>('/code', {
    params: {
      mobile,
      type,
    },
  })
}
//短信登录
export const loginByMobile = async (mobile: string, code: string) => {
  const res = await request.post<User>('/login', {
    mobile,
    code,
  })
  return res.data
}

//获取个人信息
export function userInfo() {
  return request.get<UserInfo>('/patient/myUser')
}
//获取家庭档案
export function getPatientList() {
  return request.get<PatientList>('/patient/mylist')
}
