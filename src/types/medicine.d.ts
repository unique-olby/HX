import type { Medical } from './room'
// 药品预订单数据
export type OrderPre = {
  id: string
  couponId: string
  pointDeduction: number
  couponDeduction: number
  payment: number
  expressFee: number
  actualPayment: number
  medicines: Medical[]
}
// 地址信息
export type Address = {
  id: string
  mobile: string
  receiver: string
  province: string
  city: string
  county: string
  addressDetail: string
}

// 收货地址
export type AddressItem = Address & {
  isDefault: 0 | 1
  postalCode: string
}
