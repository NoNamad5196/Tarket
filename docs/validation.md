# 공개 MVP 검증 기록

2026-09-12~13, Windows / Node.js 24.12.0 / pnpm 11.19.0.

## 자동 검증

- `pnpm test`: 26개 통과. 입력·윤년·Unicode·한국 자정, 같은 날 결과 유지, 동시 동일 요청 1회 생성, 100회 한도, IP 분당 5회, 실패 호출 차감, 시간 초과와 중단, 잘못된 응답, HTTP 검증을 포함합니다.
- Gemini SDK의 HTTP 요청을 모의 처리해 JSON 스키마 전송, 개인정보 미전송, 숨은 재시도 없음도 확인했습니다.
- Redis REST 어댑터의 명령 구성을 모의 검증했습니다. 동시성·한도 시나리오는 메모리 저장소를 사용했으며 실제 Redis 실행 검증은 아닙니다.
- `pnpm test:server-build`: 컴파일된 ESM API의 import와 GET/POST 체험 발권 통과.
- `pnpm build`: TypeScript strict 검사와 Vite production 빌드 통과.
- `pnpm assets:check`: 메이저 아르카나 22장과 뒷면 1장, ID 매칭, 모두 640×960 WebP·각 250 KB 미만. 전체 약 2.4 MiB.
- 브라우저 번들에서 Gemini SDK, 서버 API 키·HMAC·Redis 토큰 식별자가 포함되지 않는 것을 확인했습니다.

## 이미지와 브라우저

- 최종 사용자가 제공한 참고 이미지에 맞춘 평면 파스텔·금색 선 스타일. 고전 회화와 과도한 광택의 애니메이션 시안은 서비스에 사용하지 않았습니다.
- 원본 23장과 WebP 23장 수를 확인하고 `tarot-contact-sheet.jpg`로 전체 스타일·주요 상징·프레임을 육안 검토했습니다.
- 데스크톱에서 6개 포스터, 체험 모드 표시, 카테고리 선택과 예매 화면 확인.
- 390×844 로컬에서 빈 폼 오류·포커스, 2000-02-29 입력 후 Enter 제출, API 응답 대기, 발권 완료 후 결과 표시를 확인했습니다.
- 공개 사이트에서 320×740 포스터 6장 로드와 24자 이름 발권을 확인했습니다. 결과 카드 이미지가 정상 로드되고 가로 넘침이 없습니다. 스크롤바를 제외한 viewport와 문서 폭이 모두 305px였습니다.
- 실제 발권 중 열기 버튼은 비활성화되며 완료 상태에서 활성화됩니다. 완료 시 종이 transform은 배율 변화 없는 `matrix(1, 0, 0, 1, 0, 0)`입니다.
- 티켓 다시 펼치기 전후 전체 결과 텍스트가 같습니다.
- 다른 운세 예매로 이동해도 24자 이름과 연·월·일이 유지됩니다. 확인 후 테스트 화면은 새로고침하고 임시 viewport 설정을 해제했습니다.
- 동작 줄이기용 CSS와 React 타이머 분기는 유지·검토했습니다. 이번 검증에서는 브라우저의 운영체제 모션 설정을 변경하지 않았습니다.

## 2026-09-13 배포 검증 기록

- 프로젝트: `nonamad5196s-projects/tarket`.
- 공개 주소: https://tarket.vercel.app
- 당시 배포: `dpl_9bxZXLJrz9b8b31M3sV828uWCmHE`.
- 초기 배포의 .ts/.js 서버 import 오류는 `rewriteRelativeImportExtensions`로 수정했습니다. 수정 후 Preview에서 GET/POST 발권을 검증하고 Production에 반영했습니다.
- 공개 GET 상태 200·`mode: demo`, POST 200·`source: demo`, 한국 날짜 2026-09-13, 동일 입력의 전체 JSON 응답 일치, `Cache-Control: no-store`를 확인했습니다.
- 반환된 카드의 공개 WebP URL도 200·`image/webp`였습니다.
- 실제 공개 브라우저에서 입장 → 예매 → API 발권 → 티켓 열기 → 다시 펼치기까지 완료했습니다.

## 나중에 진행할 검증

2026-10-04 기준 Gemini 키와 무료 Upstash Redis 연결, 기존 HMAC 비밀값이 Production에 등록되었고 사용자 요청으로 재배포를 완료했습니다. 실제 AI 발권, Gemini 키의 유효성, 실제 Redis의 원자 연산·48시간 TTL은 아직 검증하지 않았습니다.

활성화 절차: [activation.md](activation.md).

## 2026-10-04 입장 화면 개선

- 커튼을 넓은 벨벳 주름, 상단 드레이프와 금색 극장 테두리로 변경했습니다. 기존 Figma 간판을 재사용합니다.
- 사용자 요청으로 화면의 ‘체험’ 문구를 삭제했습니다. 준비된 해석의 출처는 결과 하단에 중립적인 문장으로 남겼으며 AI 생성으로 표시하지 않습니다.
- 1440×900 및 1366×768 PC 화면에서 가로 넘침과 세로 스크롤 없이 입장 버튼까지 표시되는 것을 확인했습니다. 390×844 모바일과 320px 폭도 검토했습니다.
- Enter 입장, 전환 후 제목으로 포커스 이동을 확인했습니다. 커튼이 열리는 동안 포스터 요소는 0개이고 선택 화면은 마운트되지 않습니다.
- 동작 줄이기 CSS와 100ms 전환 분기를 유지·검토했습니다. 운영체제 모션 설정을 바꾼 실행 검증은 하지 않았습니다.
- `pnpm test` 26개, `pnpm test:server-build`, `pnpm assets:check`, `pnpm build` 통과. 이후 같은 날 사용자 요청으로 아래 Production 배포에 화면 변경을 반영했습니다.
- PC 화면 검토 이미지: [curtain-desktop.jpg](curtain-desktop.jpg).

## 2026-10-04 Production 배포

- 사용자 요청에 따라 Vercel Production 배포와 공개 도메인 반영을 완료했습니다.
- 배포 ID: `dpl_879z6Mtowke4PbrEXtNEeQZjA6KD`.
- 배포 주소: https://tarket-5edkxgr9k-nonamad5196s-projects.vercel.app
- 공개 https://tarket.vercel.app 은 HTTP 200으로 응답했습니다.
- 공개 `GET /api/readings`는 `mode: "gemini"`를 반환했습니다. 이는 환경변수 설정 확인이며 Gemini 호출과 Redis 실행을 검증하지 않습니다.
- 배포 전 `pnpm test` 26개, `pnpm test:server-build`, `pnpm assets:check`를 다시 실행해 통과했습니다.
- 실제 AI 발권과 동일 입력 캐시 재조회는 아직 검증하지 않았습니다.
- 로컬 Vite 개발 서버를 종료했고 5175 포트의 수신 프로세스가 없는 것을 확인했습니다.

## 2026-10-04 GitHub 등록과 최신 배포

- 빈 [NoNamad5196/Tarket](https://github.com/NoNamad5196/Tarket) 저장소에 `main` 브랜치를 만들고 첫 커밋 `fb201097c3b19bff5bf2844e93dd73680bc257c9`를 푸시했습니다.
- 원본과 검토 이미지 등 Git LFS 객체 27개(약 111 MB) 업로드를 완료했습니다. 서비스용 `public/assets/` 이미지는 일반 Git 파일입니다.
- 비밀값 파일, `.vercel/`, 의존성, 빌드 출력과 캐시는 커밋에서 제외했습니다. 스테이징된 소스의 비밀키 시그니처 검사를 통과했습니다.
- `pnpm test` 26개, `pnpm test:server-build`, `pnpm assets:check`, `pnpm build`를 실행해 통과했습니다.
- 기존 `nonamad5196s-projects/tarket` 프로젝트에 CLI로 Production을 배포했습니다. 배포 ID는 `dpl_HEKCjNTht4tc7GzE8YiUJrL9QAYY`, 상태는 `READY`, Git 메타데이터는 위 첫 커밋과 `main`입니다.
- 배포 주소는 https://tarket-jgup3wey4-nonamad5196s-projects.vercel.app 이며 공개 https://tarket.vercel.app 에 반영되었습니다.
- 공개 홈페이지 200, `GET /api/readings` 200·`mode: "gemini"`·`Cache-Control: no-store`, `fool.webp` 200·`image/webp`를 확인했습니다.
- 실제 Gemini 발권과 Redis 통합 동작은 이번에도 검증하지 않았습니다.
- 사용자 본인 인증과 `Tarket` 접근 권한 승인 후 기존 Vercel 프로젝트에 GitHub 저장소를 연결했습니다. 연결 유형 `github`, 저장소 `NoNamad5196/Tarket`, Production 브랜치 `main`을 Vercel API로 확인했습니다.
