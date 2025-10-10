export const INITIAL_PROMPT = `<help-prompt>
태그로 프롬프트를 구성하고 편집하는 도구입니다.
  <keyboard-shortcuts>
  기본적인 markdown 편집 기능을 지원합니다.

  - **굵게**: \`**텍스트**\` 또는 ctrl + b
  - *기울임꼴*: \`*텍스트*\` 또는 ctrl + i
  - \`코드\`: \`텍스트\` 또는 ctrl + e
  </keyboard-shortcuts>
  <auto-complete>
  자동 완성 기능을 지원합니다.
  - 태그 자동 완성: \`</\` 입력 시 태그 목록이 나타납니다.
  </auto-complete>
</help-prompt>
<help-visual-block>
  <tag-title>
    태그 제목을 클릭하여 수정할 수 있습니다.
  </tag-title>
  <tag-content>
    태그 내용을 클릭하여 수정할 수 있습니다.
  </tag-content>
  <tag-toggle>
    태그 표시/숨기기 토글 버튼입니다.
    태그를 숨길 시 복사된 Prompt 또한 해당 태그 프롬프트가 숨겨집니다.
  </tag-toggle>
</help-visual-block>`
