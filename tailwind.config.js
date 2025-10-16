/** @type {import('tailwindcss').Config} */

import customColors from './src/assets/theme/colors.js'
import customFontFamily from './src/assets/theme/fontFamily.js'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: customColors,
      fontFamily: customFontFamily,
    },
  },
  plugins: [],
}
