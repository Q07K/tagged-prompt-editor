<template>
  <div class="tag-element" :class="{ 'tag-element--disabled': isDisabled }">
    <TagBlockHeader
      :tag-name="node.tagName"
      :enabled="node.enabled"
      :disabled="props.disabled ?? false"
      @update:tag="onTagChange"
      @toggle="onToggle"
    />
    <div class="tag-element__children">
      <template v-for="child in node.children" :key="child.id">
        <TagBlockElement
          v-if="child.type === 'element'"
          :node="child"
          :disabled="isDisabled"
        />
        <TagBlockText
          v-else-if="child.content.trim() !== ''"
          :node="child"
          :disabled="isDisabled"
          :autofocus="child.id === pendingChildId"
        />
      </template>
      <TagBlockEmpty
        v-if="isEmpty"
        :disabled="isDisabled"
        @create="handleCreateChild"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { usePromptEditorStore } from '@/stores/promptEditorStore'
import type { PromptElementNode } from '@/utils/tagHelpers'
import { isTextNode } from '@/utils/tagHelpers'
import TagBlockHeader from './TagBlockHeader.vue'
import TagBlockText from './TagBlockText.vue'
import TagBlockEmpty from './TagBlockEmpty.vue'
import colors from '@/assets/theme/colors'

defineOptions({ name: 'TagBlockElement' })

const props = defineProps<{
  node: PromptElementNode
  disabled?: boolean
}>()

const store = usePromptEditorStore()
const pendingChildId = ref<number | null>(null)

const isDisabled = computed(
  () => props.disabled || props.node.enabled === false,
)

// 태그가 비어있는지 판단하는 로직
const isEmpty = computed(() => {
  if (props.node.children.length === 0) return true

  // 모든 자식이 텍스트 노드이고 내용이 비어있거나 공백/줄바꿈만 있는 경우
  return props.node.children.every(
    (child) => isTextNode(child) && child.content.trim() === '',
  )
})

function onTagChange(value: string) {
  store.updateTagName(props.node.id, value)
}

function onToggle(enabled: boolean) {
  store.setNodeEnabled(props.node.id, enabled)
}

function handleCreateChild() {
  const newId = store.appendChildTextNode(props.node.id, '')
  if (newId == null) return
  pendingChildId.value = newId
  void nextTick(() => {
    pendingChildId.value = null
  })
}
</script>

<style scoped>
.tag-element {
  background: v-bind('colors["background-light"] + "10"');
  border: 2px solid rgba(75, 85, 99, 0.2);
  border-radius: 0.75rem;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border-color 0.2s ease;
  position: relative;
  z-index: 1;
}
.dark .tag-element {
  background: v-bind('colors["background-dark"] + "10"');
}

.tag-element:hover {
  border-color: v-bind('colors.primary + "80"');
}

.tag-element--disabled {
  opacity: 0.6;
}

.tag-element__children {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(75, 85, 99, 0.2);
}
</style>
