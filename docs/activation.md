# Gemini 실제 발권 활성화

사용자 요청에 따라 2026-10-04 Vercel Production 배포를 완료했습니다. 등록된 키·Redis 설정으로 Gemini 발권 경로가 선택되며, 실제 AI 발권과 Redis 통합 동작 검증은 아직 남아 있습니다.

## 현재 확인 상태 — 2026-10-04 (한국 시간)

- 공개 https://tarket.vercel.app 은 HTTP 200으로 응답하고 `GET /api/readings`는 `mode: "gemini"`를 반환했습니다. 이 응답은 설정 확인이며 실제 발권 성공을 뜻하지 않습니다.
- 최신 Production 배포는 `dpl_879z6Mtowke4PbrEXtNEeQZjA6KD`입니다. [배포 주소](https://tarket-5edkxgr9k-nonamad5196s-projects.vercel.app)를 공개 도메인에 반영했습니다.
- 사용자가 Upstash 동의를 완료했다고 알린 뒤 `tarket-readings` 무료 Redis를 생성하고 Tarket에 연결했습니다. `vercel integration list`에서 `Available` 상태와 `tarket` 프로젝트 연결을 확인했습니다.
- 생성 시 `plan=free`, `primaryRegion=hnd1`, `eviction=false`, `prodPack=false`, `autoUpgrade=false`를 지정했습니다. 자동 유료 전환을 요청하지 않았습니다.
- `vercel env ls production`에서 암호화된 `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL`, `TICKET_HMAC_SECRET` 등록을 확인했습니다. Redis 변수는 Production·Preview·Development에 연결되었고, HMAC 비밀값은 Production에 있습니다. 등록된 비밀값을 출력하거나 로컬로 가져오지 않았습니다.
- 사용자가 제공한 키를 민감한 `GEMINI_API_KEY` Production 환경변수로 저장했고, Vercel CLI의 등록 성공 응답을 확인했습니다. 저장 후 Gemini를 호출하지 않았으므로 키 유효성·모델 권한·할당량은 검증하지 않았습니다. `GEMINI_MODEL`은 선택 사항이며, 미등록 시 코드의 기본 모델을 사용합니다.
- 공개 UI에 커튼 개선과 `체험` 문구 제거를 반영했습니다. 키 미등록 환경에서 미리 준비한 해석을 사용할 경우 결과 하단의 `미리 준비한 카드 해석을 담은 티켓입니다.` 안내를 유지합니다.
- `pnpm test` 26개와 `pnpm test:server-build`가 통과했습니다. 이는 모의 Gemini·Redis 테스트 및 컴파일된 API의 체험 발권 확인이며, 실제 Gemini·Redis 통합 검증은 아닙니다.

키·Redis 등록과 Production 배포는 완료했습니다. 실제 Gemini 호출 성공, 동일 입력의 캐시 재조회, 실제 Redis의 원자 연산과 TTL은 검증 전입니다. 로컬 개발 서버는 종료했으며 공개 서비스는 Vercel에서 제공합니다.

## 저장소와 키 등록

1. 계정 소유자가 [Vercel Upstash 동의 화면](https://vercel.com/nonamad5196s-projects/~/integrations/accept-terms/upstash?source=cli)에서 필요한 약관 동의를 완료합니다. 사용자가 완료했다고 알렸으며, 이후 저장소 생성·연결 명령이 성공했습니다.
2. 무료 Redis 생성·연결은 아래 명령으로 완료했습니다. 기존 `tarket-readings`를 재사용하며 다시 만들지 않습니다. 자동 유료 전환과 캐시 강제 퇴거는 끈 설정으로 요청했습니다.

```bash
vercel integration add upstash/upstash-kv --name tarket-readings --plan free --metadata primaryRegion=hnd1 --metadata eviction=false --metadata prodPack=false --metadata autoUpgrade=false --no-env-pull
```

3. 코드가 지원하는 저장소 변수는 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` 또는 연동이 자동 등록하는 `KV_REST_API_URL` / `KV_REST_API_TOKEN`입니다. 직접 설정한다면 쓰기 권한 토큰을 사용합니다.
4. [Google AI Studio](https://aistudio.google.com/api-keys)에서 발급한 키의 `GEMINI_API_KEY` Production 등록은 완료했습니다. 이후 갱신이 필요하면 [Tarket 환경변수 설정](https://vercel.com/nonamad5196s-projects/tarket/settings/environment-variables)을 사용합니다. 키를 코드나 대화에 붙여 넣지 않습니다.
5. 모델 기본값은 `gemini-3.1-flash-lite`입니다. 변경하려면 서버 변수 `GEMINI_MODEL`을 설정합니다. 계정에 모델 호출 권한과 할당량이 있어야 합니다.

`TICKET_HMAC_SECRET`은 Production에 이미 민감한 환경변수로 등록했습니다. 같은 날의 결과 일관성을 위해 임의로 변경하지 않습니다. Preview에서 실제 AI를 시험하려면 Preview에도 Gemini·Redis·32자 이상 무작위 HMAC 비밀값이 필요합니다. 결과 캐시는 환경별로 분리되고 같은 Redis를 연결하면 일일 예산은 공유합니다.

## 이후 변경 배포와 남은 검증

이후 코드나 환경변수를 변경할 때 아래 배포 절차를 사용합니다. 현재 Production 배포는 완료되었으므로 검증만을 위해 재배포할 필요는 없습니다.

```bash
pnpm test
pnpm test:server-build
pnpm assets:check
pnpm build
vercel deploy --target preview --yes
# Preview 검증 후 Production 환경변수로 배포
vercel deploy --prod --yes
```

환경변수 변경은 재배포 후 반영됩니다. Preview에 Gemini 키가 없으면 Preview는 미리 준비한 해석을 사용하는 `demo` 모드로 유지됩니다.

- 공개 `GET /api/readings`가 `mode: "gemini"`를 반환해야 합니다. 이 응답은 환경변수의 유무와 HMAC 길이만 검사하므로, 연결 정상 여부는 아래 실제 발권으로 따로 검증합니다.
- 가상 입력으로 실제 1회 발권해 `source: "gemini"`, 카드·이미지 일치와 한국어 해석을 확인합니다.
- 같은 입력의 재발권에서 전체 결과·번호가 같고 Gemini 호출 횟수가 늘지 않는지 확인합니다.
- 실제 Redis의 별도 테스트 키로 원자 예약과 48시간 TTL을 검증합니다. 운영 일일 카운터를 테스트로 소진하지 않습니다.
- 로그에 이름·생일·프롬프트·키가 기록되지 않는지 확인합니다.

현재 자동 테스트는 Gemini 응답과 저장소를 모의 구현해 검증합니다. 실제 Gemini·Redis 통합 검증은 위 발권·캐시 확인을 수행한 뒤에만 완료로 기록합니다.

## 장애 대응

- `NOT_CONFIGURED`: Redis와 HMAC 환경변수를 확인합니다.
- `AI_UNAVAILABLE` / `AI_TIMEOUT`: 모델 권한·API 할당량·서비스 상태를 확인합니다.
- `DAILY_LIMIT`: 한국 시간 자정 이후 신규 발권이 가능합니다. 기존 캐시는 재조회할 수 있습니다.
- `READING_UNAVAILABLE`: Redis 연결·용량을 확인합니다.

입력은 브라우저에 유지됩니다. 필요하면 Gemini 키 환경변수를 제거하고 재배포하여 미리 준비한 해석을 사용하는 `demo` 모드로 전환할 수 있습니다. 장애를 미리 준비한 해석으로 자동 대체하지 않습니다.
