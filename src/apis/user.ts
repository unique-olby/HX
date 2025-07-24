import type { User, CodeType, UserInfo, PatientList, Patient } from '@/types/user'
import { request } from '@/utils/request'

// 密码登录
export const loginByPassword = async (mobile: string, password: string) => {
  const res = await request.post<User>('/login/password', { mobile, password })
  return res
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
  return res
}

//获取个人信息
export function userInfo() {
  return request.get<UserInfo>('/patient/myUser')
}
//获取患者信息列表
export function getPatientList() {
  return request.get<PatientList>('/patient/mylist')
}
//添加患者信息
export function addPatient(patient: Patient) {
  console.log('添加患者接口')
  return request.post('/patient/add', patient)
}
//编辑患者信息
export function editPatient(patient: Patient) {
  console.log('编辑患者接口')
  return request.put('/patient/update', patient)
}
// 删除患者信息
export function deletePatient(id: string) {
  request.delete(`/patient/del/${id}`)
}
