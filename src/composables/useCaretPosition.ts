interface CaretMetrics {
  top: number
  left: number
  height: number
}

const MIRRORED_PROPERTIES = [
  'borderTopWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'boxSizing',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'height',
  'letterSpacing',
  'lineHeight',
  'paddingTop',
  'paddingLeft',
  'paddingBottom',
  'paddingRight',
  'textDecoration',
  'textIndent',
  'textTransform',
  'whiteSpace',
  'wordSpacing',
  'wordWrap',
  'overflowWrap',
  'width',
]

export function getCaretMetrics(
  textarea: HTMLTextAreaElement,
  position: number,
): CaretMetrics {
  const mirror = document.createElement('div')
  const style = window.getComputedStyle(textarea)

  mirror.setAttribute('data-caret-mirror', 'true')
  document.body.appendChild(mirror)

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.overflow = 'auto'
  mirror.style.whiteSpace = 'pre'

  MIRRORED_PROPERTIES.forEach((prop) => {
    const hyphenated = prop.replace(
      /[A-Z]/g,
      (match) => `-${match.toLowerCase()}`,
    )
    const value = style.getPropertyValue(hyphenated)
    mirror.style.setProperty(hyphenated, value)
  })

  mirror.textContent = textarea.value.substring(0, position)
  const span = document.createElement('span')
  span.textContent = '.'
  span.style.visibility = 'hidden'
  mirror.appendChild(span)

  const top =
    span.offsetTop + parseInt(style.borderTopWidth, 10) - textarea.scrollTop
  const left =
    span.offsetLeft + parseInt(style.borderLeftWidth, 10) - textarea.scrollLeft
  const height =
    parseInt(style.lineHeight, 10) || textarea.getBoundingClientRect().height

  document.body.removeChild(mirror)

  return {
    top,
    left,
    height,
  }
}
