<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
  >
    <div class="toggle-track" :class="{ 'toggle-track--active': isDark }">
      <div class="toggle-thumb" :class="{ 'toggle-thumb--active': isDark }">
        <!-- 달 아이콘 (다크모드) -->
        <img v-if="isDark" class="toggle-icon" :src="moonIcon" alt="moon" />
        <!-- 해 아이콘 (라이트모드) -->
        <img v-else class="toggle-icon" :src="sunIcon" alt="sun" />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import sunIcon from '@/assets/icons/sun.svg'
import moonIcon from '@/assets/icons/moon.svg'
import colors from '@/assets/theme/colors'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 1rem;
}

.toggle-track {
  width: 3rem;
  height: 1.5rem;
  background-color: v-bind('colors["secondary-light"]');
  border-radius: 0.75rem;
  position: relative;
  transition: background-color 0.3s ease;
}

.toggle-track--active {
  background-color: v-bind('colors["primary"]');
}

.toggle-thumb {
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-thumb--active {
  transform: translateX(1.5rem);
}

.toggle-icon {
  width: 0.75rem;
  height: 0.75rem;
  filter: brightness(0) saturate(100%) invert(50%) sepia(12%) saturate(149%)
    hue-rotate(177deg) brightness(95%) contrast(89%);
  transition: filter 0.3s ease;
}

.dark .toggle-track {
  background-color: v-bind('colors["secondary-dark"]');
}

.dark .toggle-track--active {
  background-color: v-bind('colors["primary"]');
}
</style>
