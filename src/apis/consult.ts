import type { DoctorPage, FollowType, KnowledgePage, KnowledgeParams, PageParams } from '@/types/consult'
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
