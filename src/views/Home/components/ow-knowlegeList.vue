<script setup lang="ts">
import { getKnowledgePage } from '@/apis/consult'
import type { KnowledgeList, KnowledgeParams, KnowledgeType } from '@/types/consult'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  type: KnowledgeType
}>()

//加载状态
const loading = ref(false)
const finished = ref(false)

const list = ref<KnowledgeList>([])
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10,
})
const onLoad = async () => {
  // 加载更多
  const res = await getKnowledgePage(params.value)
  console.log('文章列表', res)
  list.value.push(...(res.rows || []))
  if (params.value.current >= res.pageTotal) {
    finished.value = true
  } else {
    params.value.current++
  }
  loading.value = false
}
onMounted(() => {
  onLoad()
})
</script>

<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <owKnowlegeCard v-for="(item, i) in list" :item="item"></owKnowlegeCard>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px; /* 添加左右边距 */

  /* 确保列表内容有合适的间距 */
  :deep(.van-list) {
    padding: 0;
  }

  /* 为每个卡片添加底部间距 */
  :deep(.ow-knowlege-card) {
    margin-bottom: 12px;
  }
}
</style>
