<template>
  <MainLayout>
    <template #prompt-text>
      <PromptTextPanel />
    </template>
    <template #tag-block>
      <TagBlockPanel />
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import PromptTextPanel from '@/components/prompt-text/PromptTextPanel.vue'
import TagBlockPanel from '@/components/tag-block/TagBlockPanel.vue'
</script>
