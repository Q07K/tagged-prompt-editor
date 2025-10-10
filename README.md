<div align="center">
<img src="public\logo.svg" height="100px"/>

<br>

# Tagged Prompt Editor

<b>
태그를 사용하여 구조화된 LLM 프롬프트를 <br>
효율적으로 작성하고 편집하는 웹 애플리케이션
</b>

<br>

[![Demo](https://img.shields.io/badge/Live_Demo-Click_Here-blue)](https://q07k.github.io/tagged-prompt-editor/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-cyan.svg)](https://tailwindcss.com/)

</div>

---

## 프로젝트 소개

프롬프트 엔지니어링의 중요성이 부각되면서 복잡한 지시사항과 데이터를 체계적으로 구성할 필요성이 커지고 있습니다.

**Tagged Prompt Editor**는 텍스트 기반의 원본 코드와 시각적인 블록 UI를 **실시간 양방향으로 동기화**하여 사용자가 가장 편한 방식으로 프롬프트를 설계할 수 있는 환경을 제공합니다.

### 핵심 기능

- **실시간 양방향 동기화**: 텍스트 편집기와 시각적 블록 UI 간의 즉시 동기화
- **인라인 편집**: 블록을 클릭하여 직접 편집 가능
- **태그 자동 완성**: `</`를 입력하면 열려있는 태그 목록을 자동으로 제안
- **키보드 단축키**: Tab 들여쓰기, Ctrl+B/I 마크다운 태그 지원
- **반응형 디자인**: 모바일부터 데스크톱까지 모든 디바이스 지원
- **웹 기반**: 별도 설치 없이 브라우저에서 바로 사용

## 라이브 데모

**[Tagged Prompt Editor 사용하기](https://q07k.github.io/tagged-prompt-editor/)**

## 사용 방법

### 기본 사용법

1. **웹사이트 접속**: [https://q07k.github.io/tagged-prompt-editor/](https://q07k.github.io/tagged-prompt-editor/)
2. **텍스트 입력**: 왼쪽 패널에 XML 태그 형식으로 프롬프트 작성
3. **실시간 확인**: 오른쪽 패널에서 시각적 블록으로 즉시 확인
4. **블록 편집**: 오른쪽 블록을 클릭하여 직접 편집 가능

### 예시

```xml
<instruction>
다음 텍스트를 **한국어로 번역**해주세요.

<context>
이것은 기술 문서의 일부입니다.
</context>

<input>
Hello, this is a sample text for translation.
</input>

<requirements>
- 자연스러운 한국어로 번역
- 기술적 용어는 정확하게 번역
- 문맥을 고려한 번역
</requirements>
</instruction>
```

### 키보드 단축키

- **Tab**: 들여쓰기
- **Shift + Tab**: 내어쓰기
- **Ctrl + B**: 선택된 텍스트를 **굵게** 처리
- **Ctrl + I**: 선택된 텍스트를 _기울임_ 처리
- **</ 입력**: 자동 태그 완성 제안

### 태그 자동 완성

1. 여는 태그를 작성 (예: `<instruction>`)
2. 내용 작성
3. `</`를 입력하면 자동으로 닫는 태그 제안
4. Tab 또는 Enter로 선택

## 개발자용 가이드

### 로컬 환경 설정

```bash
# 저장소 클론
git clone https://github.com/Q07K/tagged-prompt-editor.git
cd tagged-prompt-editor

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 프로젝트 구조

```
src/
├── components/
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── prompt-text/      # 텍스트 편집기 관련
│   └── tag-block/        # 시각적 블록 관련
├── composables/          # Vue 3 컴포지션 함수
├── stores/              # 상태 관리
└── utils/               # 유틸리티 함수
```

## 기술 스택

- **Vue 3** - Composition API 기반 반응형 프레임워크
- **Vite** - 빠른 빌드 도구
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Marked.js** - 마크다운 파싱 및 렌더링

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feat/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing-feature'`)
4. 브랜치에 푸시합니다 (`git push origin feat/amazing-feature`)
5. Pull Request를 생성합니다

## 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 [Issues](https://github.com/Q07K/tagged-prompt-editor/issues)를 통해 연락해주세요.

---

<div align="center">

**이 프로젝트가 유용하다면 스타를 눌러주세요!**

</div>
