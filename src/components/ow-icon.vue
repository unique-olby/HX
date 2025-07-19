<script setup lang="ts">
defineProps<{
  iconUrl: string
}>()
</script>

<template>
  <svg aria-hidden="true" class="icon">
    <use :href="`#icon-${iconUrl}`"></use>
  </svg>
</template>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
}
</style>
