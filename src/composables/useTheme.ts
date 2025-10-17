import { ref, watch } from 'vue'

const isDark = ref(false)

export function useTheme() {
  // 초기값을 localStorage에서 가져오거나 시스템 설정 사용
  const initTheme = () => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateDOM()
  }

  // DOM에 dark 클래스 추가/제거
  const updateDOM = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 테마 토글
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // localStorage에 저장
  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    updateDOM()
  })

  return {
    isDark,
    toggleTheme,
    initTheme,
  }
}
