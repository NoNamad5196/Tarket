# Tarket

보라색 작은 영화관에서 오늘의 타로를 한 장의 티켓으로 발권하는 한국어 웹앱입니다.

공개 주소: **https://tarket.vercel.app**

React 19 · TypeScript · Vite 8 · Tailwind 4 · Vercel Functions · Gemini · Upstash Redis.

## 현재 상태

2026-10-04 한국 시간, 사용자 요청에 따라 Vercel Production을 배포했습니다. 공개 주소는 HTTP 200으로 응답하고 `GET /api/readings`는 `mode: "gemini"`를 반환합니다. PC·모바일 입장 커튼 개선, 커튼이 열린 뒤 포스터 표시, 화면의 `체험` 문구 제거가 공개 배포에 반영되었습니다.

Gemini 호출, 응답 검증, Redis 캐시와 한도 관리는 구현되어 있습니다. Vercel Production에 `GEMINI_API_KEY`와 `TICKET_HMAC_SECRET`을 민감한 환경변수로 저장했고, 무료 Upstash Redis `tarket-readings`를 연결해 Redis REST 환경변수를 등록했습니다. 배포에는 이 설정이 반영되었지만 실제 AI 발권은 아직 검증하지 않았습니다. 상태 API는 설정 존재 여부만 확인하므로 키의 유효성·모델 권한과 실제 Gemini·Redis 통합 동작을 증명하지 않습니다.

## 실행과 검증

Node.js 24와 pnpm 11.19.0을 사용합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm test:server-build
pnpm assets:check
pnpm build
```

개발 주소는 http://127.0.0.1:5175 입니다. 기존 서버가 있으면 중복 실행하지 않습니다. 개발 서버는 배포와 같은 API 핸들러를 제공합니다. `pnpm preview`는 정적 파일만 제공하므로 발권까지 확인하려면 `pnpm dev` 또는 Vercel을 사용합니다. `dist`만 정적 호스팅에 올리면 API는 동작하지 않습니다.

로컬 비밀값은 `.env.local`에 등록합니다. `.env.example`을 참고하고 비밀값에 `VITE_` 접두사를 붙이지 마세요.

## 발권 동작

- 커튼 → 6개 운세 선택 → 이름·양력 생일 입력 → 서버 해석 → 앞쪽 슬롯에서 종이가 아래로 배출 → 결과 티켓.
- 한국 날짜 기준으로 같은 입력·운세·날짜의 카드와 결과가 유지됩니다. 이름 공백·한글 Unicode·날짜 0 채움을 정규화합니다.
- 서버가 22장 중 카드를 선택하고 Gemini는 그 카드와 분야를 해석합니다. 카드 이름과 이미지 정보는 모델이 정하지 않습니다.
- 신규 AI 호출은 서비스 전체 하루 100회, IP별 분당 5회입니다. 캐시 재조회는 제외합니다. 실패한 호출도 횟수에 포함하며 자동 재시도하지 않습니다.
- Redis 원자 연산으로 동일 요청의 동시 생성을 막습니다. 결과는 48시간, 요청 잠금은 45초 보관합니다. Gemini 제한 시간은 20초입니다.
- 키 미등록 시 미리 준비한 해석을 사용합니다(API의 `demo` 모드). 키가 있는데 저장소·비밀값이 없거나 서비스에 장애가 나면 오류를 표시하고 입력을 유지합니다.
- 모바일, 키보드 입력, 긴 이름, 동작 줄이기 설정을 지원합니다. 로그인·결제·보관함·공유는 범위에 포함하지 않습니다.

## API와 개인정보

`GET /api/readings` → `{ mode: "demo" | "gemini" | "unavailable" }`.

`POST /api/readings`는 문자열 필드 `{ name, year, month, day, category }`를 받습니다. `{ cardId, source, category, date, serial, result }`를 반환하며 이름·생일은 응답에 포함하지 않습니다. 오류는 `{ code, message, retryAfter? }`입니다. 잘못된 입력 400, 동일 발권 진행 중 409, 한도 초과 429, AI·저장소·설정 장애 5xx로 처리합니다. 모든 API 응답은 `Cache-Control: no-store`입니다.

이름·생년월일은 서버 요청 처리 중에만 사용합니다. Redis에는 HMAC 식별자와 해석만 저장합니다. Gemini에는 카드의 상징·분야·날짜만 보냅니다. 한도 관리용 IP 식별자도 날짜별 HMAC으로 처리합니다. 원문 이름·생일·IP와 공급자 응답을 애플리케이션 로그에 쓰지 않습니다. 브라우저 입력은 React 메모리에만 유지되며 새로고침하면 사라집니다. 타로는 재미와 성찰을 위한 상징적 해석이며 사주 계산이나 미래 예측 모델은 아닙니다.

## 카드 이미지

최종 사용자 참고 이미지의 평면 색면·파스텔·금색 윤곽선 방향으로 독창적인 카드 22장과 뒷면 1장을 제작했습니다. 번호와 이름은 이미지에 넣지 않고 HTML로 표시합니다. 실시간 이미지 생성은 하지 않습니다.

- `artwork/tarot/originals/`: 최종 PNG 원본 23장, 배포 업로드 제외.
- `artwork/tarot/prompts.json`: built-in ImageGen으로 사용한 최종 프롬프트 세트.
- `public/assets/tarot/`: 실제 서비스용 640×960 WebP 23장, 합계 약 2.4 MiB.
- `docs/tarot-contact-sheet.jpg`: 전체 카드 검토 이미지.

원본 변경 후 `pnpm assets:prepare`와 `pnpm assets:check`를 실행합니다.

## 운영

`src/lib/cards.ts`가 카드 정보와 이미지 연결의 기준입니다. `server/`가 발권·Gemini·Redis를 담당하고 `api/readings.ts`가 Vercel 진입점입니다. TypeScript의 `rewriteRelativeImportExtensions`를 유지해야 서버 배포의 .ts import가 .js로 변환됩니다. `pnpm test:server-build`로 컴파일된 API의 실제 모듈 해석까지 검사합니다.

현재 Production은 Gemini 발권 경로를 선택합니다. 실제 Gemini 발권·캐시 재조회 검증은 별도로 남아 있습니다. 최신 배포는 `dpl_879z6Mtowke4PbrEXtNEeQZjA6KD`이며, [배포 주소](https://tarket-5edkxgr9k-nonamad5196s-projects.vercel.app)와 공개 주소에 반영했습니다.

[AI 활성화 절차](docs/activation.md) · [검증 기록](docs/validation.md)

원본 [Figma Make Tarket](https://www.figma.com/make/aNDDBPartVIOgpNHOdTBNT/Markdown-Reader)의 영화관·커튼·수정구슬·발권기를 유지하고 서버 발권과 새 카드 그림을 추가했습니다.
