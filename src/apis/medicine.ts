import type {
  OrderPre,
  AddressItem,
  OrderDetail,
  Express,
  MedicineOrderPage,
} from '@/types/medicine.d.ts'
import { request } from '@/utils/request'

// 查询药品订单预支付信息
export const getMedicalOrderPre = (params: { prescriptionId: string }) =>
  request.get<OrderPre>('/patient/medicine/order/pre', { params })

// 获取收货地址列表
export const getAddressList = () => request.get<AddressItem[]>('/patient/order/address')
// 创建药品订单
export const createMedicalOrder = (data: { id: string; addressId: string; couponId?: string }) =>
  request.post<{ id: string }>('/patient/medicine/order', data)
// 获取药品订单详情
export const getMedicalOrderDetail = (id: string) =>
  request.get<OrderDetail>(`/patient/medicine/order/detail/${id}`)
// 获取药品订单物流信息
export const getMedicalOrderLogistics = (id: string) =>
  request.get<Express>(`/patient/order/${id}/logistics`)

// 获取药品订单列表
export const getMedicalOrderList = (params: {
  current: string
  pageSize: string
  status?: string
}) => request.get<MedicineOrderPage>('/patient/medicine/order/mylist', { params })
