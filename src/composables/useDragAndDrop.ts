import { ref } from 'vue'

interface DragItem {
  id: number
  type: 'element' | 'text'
  parentId?: number
}

export function useDragAndDrop() {
  const draggedItem = ref<DragItem | null>(null)
  const dragOverTarget = ref<number | null>(null)
  const isDragging = ref(false)

  function startDrag(item: DragItem, event: DragEvent) {
    draggedItem.value = item
    isDragging.value = true

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(item))
    }
  }

  function handleDragOver(targetId: number, event: DragEvent) {
    event.preventDefault()
    dragOverTarget.value = targetId

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function handleDragLeave() {
    dragOverTarget.value = null
  }

  function handleDrop(targetId: number, event: DragEvent) {
    event.preventDefault()

    const item = draggedItem.value
    if (!item || item.id === targetId) {
      resetDrag()
      return
    }

    // 드롭 로직을 여기에 구현
    // 이는 store의 메서드를 호출하여 노드를 이동시키는 로직입니다

    resetDrag()
    return {
      draggedItem: item,
      targetId,
    }
  }

  function resetDrag() {
    draggedItem.value = null
    dragOverTarget.value = null
    isDragging.value = false
  }

  return {
    draggedItem,
    dragOverTarget,
    isDragging,
    startDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDrag,
  }
}
