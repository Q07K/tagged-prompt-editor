<template>
  <PromptEditorLayout>
    <template #prompt-text>
      <PromptTextPanel />
    </template>
    <template #tag-block>
      <TagBlockPanel />
    </template>
  </PromptEditorLayout>
</template>

<script setup lang="ts">
import PromptEditorLayout from '@/components/layout/PromptEditorLayout.vue'
import PromptTextPanel from '@/components/prompt-text/PromptTextPanel.vue'
import TagBlockPanel from '@/components/tag-block/TagBlockPanel.vue'
</script>
