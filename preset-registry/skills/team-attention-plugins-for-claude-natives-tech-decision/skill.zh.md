---
name: tech-decision
description: This skill should be used when the user asks to "기술 의사결정", "뭐 쓸지 고민", "A vs B", "비교 분석", "라이브러리 선택", "아키텍처 결정", "어떤 걸 써야 할지", "트레이드오프", "기술 선택", "구현 방식 고민", or needs deep analysis for technical decisions. Provides systematic multi-source research and synthesized recommendations.
version: 0.1.0
---
# Tech Decision - 技术决策深度探索

对技术决策进行系统性分析并得出综合性结论的技能。

## 核心原则

**结论先行的产出**：所有报告先呈现结论，然后再提供依据。

## 使用场景

- 库/框架选型（React vs Vue、Prisma vs TypeORM）
- 架构模式决策（Monolith vs Microservices、REST vs GraphQL）
- 实现方式选择（Server-side vs Client-side、Polling vs WebSocket）
- 技术栈决策（语言、数据库、基础设施等）

## 决策工作流

### Phase 1: 问题定义

明确决策主题与背景：

1. **把握主题**：需要决定的是什么？
2. **识别选项**：待比较的选项有哪些？
3. **确立评估标准**：将依据哪些标准进行评估？
   - 性能、学习曲线、生态系统、可维护性、成本等
   - 根据项目特性设定标准优先级
   - 详细标准请参照 **`references/evaluation-criteria.md`**

### Phase 2: 并行信息收集

同时从多个来源收集信息。**必须并行执行**：

```
┌─────────────────────────────────────────────────────────────┐
│  동시 실행 (Task tool로 병렬 실행)                            │
├─────────────────────────────────────────────────────────────┤
│  1. codebase-explorer agent                                 │
│     → 기존 코드베이스 분석, 현재 패턴/제약사항 파악              │
│                                                             │
│  2. docs-researcher agent                                   │
│     → 공식 문서, 가이드, best practices 리서치                │
│                                                             │
│  3. Skill: dev-scan                                         │
│     → 커뮤니티 의견 수집 (Reddit, HN, Dev.to, Lobsters)       │
│                                                             │
│  4. Skill: agent-council                                    │
│     → 다양한 AI 전문가 관점 수집                              │
│                                                             │
│  5. [선택] Context7 MCP                                     │
│     → 라이브러리별 최신 문서 조회                              │
└─────────────────────────────────────────────────────────────┘
```

**执行方法**：

```markdown
# Agents는 Task tool로 병렬 실행
Task codebase-explorer: "분석할 주제와 컨텍스트"
Task docs-researcher: "리서치할 기술/라이브러리"

# 기존 스킬은 Skill tool로 호출
Skill: dev-scan (커뮤니티 의견)
Skill: agent-council (전문가 관점)
```

### Phase 3: 综合分析

基于收集到的信息运行 tradeoff-analyzer agent：

- 整理各选项的 pros/cons
- 按评估标准打分
- 梳理相互冲突的意见
- 评估可信度（基于来源）

### Phase 4: 生成最终报告

使用 decision-synthesizer agent 撰写结论先行的综合报告（详细模板：**`references/report-template.md`**）：

```markdown
# 기술 의사결정 보고서: [주제]

## 결론 (Executive Summary)
**추천: [Option X]**
[1-2문장 핵심 이유]

## 평가 기준 및 가중치
| 기준 | 가중치 | 설명 |
|------|--------|------|
| 성능 | 30% | ... |
| 학습곡선 | 20% | ... |

## 옵션별 분석

### Option A: [이름]
**장점:**
- [장점 1] (출처: 공식 문서)
- [장점 2] (출처: Reddit r/webdev)

**단점:**
- [단점 1] (출처: HN 토론)

**적합한 경우:** [시나리오]

### Option B: [이름]
...

## 종합 비교
| 기준 | Option A | Option B | Option C |
|------|----------|----------|----------|
| 성능 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 학습곡선 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **총점** | **X점** | **Y점** | **Z점** |

## 추천 근거
1. [핵심 근거 1 with 출처]
2. [핵심 근거 2 with 출처]
3. [핵심 근거 3 with 출처]

## 리스크 및 주의사항
- [주의점 1]
- [주의점 2]

## 참고 출처
- [출처 목록]
```

## 使用的资源

### Agents（本插件）

| Agent | 职责 |
|-------|------|
| `codebase-explorer` | 分析现有代码库，识别模式/约束条件 |
| `docs-researcher` | 调研官方文档、指南与 best practices |
| `tradeoff-analyzer` | 整理各选项的 pros/cons，进行对比分析 |
| `decision-synthesizer` | 生成结论先行的最终报告 |

### 现有技能（通过 Skill tool 调用）

| Skill | 用途 | 调用方式 |
|-------|------|-----------|
| `dev-scan` | Reddit、HN、Dev.to 等社区意见 | `Skill: dev-scan` |
| `agent-council` | 收集多位 AI 专家的视角 | `Skill: agent-council` |

### MCP（可选）

- **Context7**：查询各库的最新官方文档

## 快速执行指南

### 1. 简单对比（A vs B）

```
사용자: "React vs Vue 뭐가 나을까?"

실행:
1. Task docs-researcher + Task codebase-explorer (병렬)
2. Skill: dev-scan
3. Task tradeoff-analyzer
4. Task decision-synthesizer
```

### 2. 深度分析（复杂决策）

```
사용자: "우리 프로젝트에 상태관리 라이브러리 뭘 쓸지 고민이야"

실행:
1. Task codebase-explorer (현재 상태 분석)
2. 병렬 실행:
   - Task docs-researcher (Redux, Zustand, Jotai, Recoil 등)
   - Skill: dev-scan
   - Skill: agent-council
3. Task tradeoff-analyzer
4. Task decision-synthesizer
```

### 3. 架构决策

```
사용자: "모놀리스 vs 마이크로서비스 어떻게 해야 할까?"

실행:
1. Task codebase-explorer (현재 규모/복잡도 분석)
2. 병렬 실행:
   - Task docs-researcher (각 아키텍처 best practices)
   - Skill: agent-council (아키텍트 관점)
3. Task tradeoff-analyzer (팀 규모, 배포 복잡도 등 고려)
4. Task decision-synthesizer
```

## 注意事项

1. **提供上下文**：项目特性、团队规模、现有技术栈等背景信息越充分，分析就越准确
2. **确认评估标准**：先确认哪些标准对用户最重要
3. **标注可信度**：对来源不明确或过时的信息要明确标注
4. **结论先行**：始终先呈现结论

## 附加资源

### 参考文件
- **`references/report-template.md`** - 详细报告模板
- **`references/evaluation-criteria.md`** - 评估标准指南
