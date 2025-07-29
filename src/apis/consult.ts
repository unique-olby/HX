import type {
  DoctorPage,
  FollowType,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  Image,
  TopDep,
  ConsultOrderPreParams,
  ConsultOrderPreData,
  PartialConsult,
  ConsultOrderItem,
} from '@/types/consult'
import { request } from '@/utils/request'
// 获取文章列表
export const getKnowledgePage = async (params: KnowledgeParams) => {
  const res = await request.get<KnowledgePage>('/patient/home/knowledge', { params })
  // console.log('api', res.data)
  return res
}
// 获取关注医生列表

export async function getFollowDoctor(params: PageParams) {
  const res = await request.get<DoctorPage>('/home/page/doc', { params })
  console.log('api', res)
  return res
}
//关注
export const followDoctor = (id: string, type: FollowType = 'doc') =>
  request.post('/like', { id, type })

//获取科室
export function getAllDep() {
  return request.get<TopDep[]>('/dep/all')
}

//上传病情描述图片
export function uploadImage(file: File) {
  const fd = new FormData()
  console.log('上传图片')
  fd.append('file', file)
  return request.post<any, Image>('/upload', fd)
}

// 拉取预支付订单信息
export function getConsultOrderPre(params: ConsultOrderPreParams) {
  return request.get<ConsultOrderPreData>('/patient/consult/order/pre', { params })
}
// 生成订单
export const createConsultOrder = (data: PartialConsult) =>
  request.post<any, { id: string }>('/patient/consult/order', data)

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (data: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) => {
  const res = request.post<any, { payUrl: string }>('/patient/consult/pay', data)
  console.log('获取支付地址', res)
  return res
}

// 获取问诊订单详情
export function getOrderDetail(orderId: string) {
  return request.get<any, ConsultOrderItem>('/patient/consult/order/detail', {
    params: { orderId },
  })
}
// 评价问诊
export const evaluateConsultOrder = (data: {
  docId: string // 医生ID
  orderId: string // 订单ID
  score: number // 评价星级
  content: string // 评价留言
  anonymousFlag: 0 | 1 // 是否匿名评价：1匿名 0实名
}) => request.post('/patient/order/evaluate', data)

export const getPrescriptionPic = (id: string) =>
  request.get<any, { url: string }>(`/patient/consult/prescription/${id}`)

