// 患病时间选项
const timeOptions = [
  { label: '一周内', value: 1 },
  { label: '一月内', value: 2 },
  { label: '半年内', value: 3 },
  { label: '大于半年', value: 4 },
]
// 是否就诊选项
const flagOptions = [
  { label: '就诊过', value: 0 },
  { label: '没就诊过', value: 1 },
]

// 药品订单状态选项
const medicineOrderStatusOptions = [
  { text: '全部', value: '' },
  { text: '待付款', value: '10' },
  { text: '待发货', value: '11' },
  { text: '待收货', value: '12' },
  { text: '已完成', value: '13' },
  { text: '已取消', value: '14' }
]

export { timeOptions, flagOptions, medicineOrderStatusOptions }
