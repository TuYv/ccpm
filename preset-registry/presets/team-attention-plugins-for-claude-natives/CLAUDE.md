# Dev

Developer workflow tools for Claude Code.

## Skills

- `/dev-scan` - 개발 커뮤니티에서 다양한 의견 수집 (Reddit, HN, Dev.to, Lobsters)
- `/tech-decision` - 기술 의사결정 깊이 탐색 (라이브러리 선택, 아키텍처 결정, 구현 방식 비교)

## Agents

- `codebase-explorer` - 기존 코드베이스 분석, 패턴/제약사항 파악
- `docs-researcher` - 공식 문서, 가이드, best practices 리서치
- `tradeoff-analyzer` - 옵션별 pros/cons 정리, 비교 분석
- `decision-synthesizer` - 두괄식 최종 보고서 생성

## 사용 예시

### 기술 의사결정
```
"React vs Vue 뭐가 나을까?"
"상태관리 라이브러리 뭐 쓸지 고민이야"
"모놀리스 vs 마이크로서비스 어떻게 해야 할까?"
```

tech-decision 스킬이 활성화되면:
1. codebase-explorer로 현재 코드 분석
2. docs-researcher로 공식 문서 리서치
3. dev-scan으로 커뮤니티 의견 수집
4. agent-council로 전문가 관점 수집
5. tradeoff-analyzer로 비교 분석
6. decision-synthesizer로 두괄식 최종 보고서 생성
