---
name: dev-scan
description: 개발 커뮤니티에서 기술 주제에 대한 다양한 의견 수집. "개발자 반응", "커뮤니티 의견", "developer reactions" 요청에 사용. Reddit, HN, Dev.to, Lobsters 등 종합.
version: 1.0.0
---
# Dev Opinions Scan

从多个开发者社区收集并汇总关于特定主题的多样化观点。

## 目的

快速把握技术主题的**多元视角**：
- 正反意见分布
- 一线从业者的经验之谈
- 隐藏的顾虑或优点
- 独特或值得关注的视角

## 数据来源

| 平台 | 方法 |
|----------|--------|
| Reddit | Gemini CLI |
| Hacker News | WebSearch |
| Dev.to | WebSearch |
| Lobsters | WebSearch |

## 执行

### 步骤 1：主题提取

从用户请求中提取核心主题。

示例：
- “开发者们对 React 19 的反应” → `React 19`
- “Bun vs Deno 社区意见” → `Bun vs Deno`

### 步骤 2：并行搜索（单条消息，4 个来源）

**Reddit**（Gemini CLI - WebFetch 被阻止）：
```bash
# 단일 Gemini 호출로 Reddit 검색 (명시적 검색 지시 필수)
gemini -p "Search Reddit for discussions about {TOPIC}. Summarize the main opinions, debates, and insights from developers. Include Reddit post URLs where possible. Focus on: 1) Common opinions 2) Controversies 3) Notable perspectives from experienced developers."
```

**注意事项**：
- `site:reddit.com` 形式不奏效——Gemini 会将其解读为任务请求而非搜索查询
- 必须以 "Search Reddit for..." 的形式给出明确的搜索指令
- 单次调用比并行调用更稳定（避免输出混杂）

**其他来源**（WebSearch，并行）：
```
WebSearch: "{topic} site:news.ycombinator.com"
WebSearch: "{topic} site:dev.to"
WebSearch: "{topic} site:lobste.rs"
```

**关键**：务必在**同一条消息**中并行执行这 4 项搜索。Gemini 为单次调用，WebSearch 为 3 项并行。

### 步骤 3：综合与呈现

分析收集到的数据，提炼出有意义的洞察。

#### 3-1. 观点分类与模式把握

将各来源收集到的观点按以下标准分类：

- **赞成/正面**：支持该技术/工具的观点
- **反对/负面**：顾虑、批评、提出替代方案
- **中立/有条件**：“仅在……情况下”、“与……搭配使用”等有条件的观点
- **基于经验**：基于实际生产环境使用经验的观点

#### 3-2. 提炼共识（Consensus）

识别在多个社区中**反复出现**的观点：

- 同一要点在 2 个以上来源中被提及，则归类为共识
- 尤其是在 Reddit 和 HN 上同时被提及的观点可信度较高
- 优先选取包含具体数据或案例的观点
- 目标：提炼出**至少 5 条以上共识**

#### 3-3. 识别争议点（Controversy）

找出社区之间或社区内部**意见分歧**之处：

- 同一主题上存在截然相反的观点
- 评论区展开热烈讨论的帖子
- "depends on..."、"but actually..." 等反驳较多的主题
- 目标：识别出**至少 3 个以上争议点**

#### 3-4. 筛选值得关注视角（Notable Perspective）

挖掘独特或有深度的洞察：

- 虽与多数意见不同但逻辑依据扎实的观点
- 资深开发者或该领域专家的观点
- 来自实际大型项目经验的洞察
- 他人容易忽略的边缘情况或长期视角
- 目标：筛选出**至少 3 个以上值得关注的视角**

## 输出格式

**核心原则**：所有观点均以行内形式附注出处。不包含无出处的观点。

```markdown
## Key Insights

### Consensus (공통 의견)

1. **[의견 제목]**
   - [구체적인 내용 설명]
   - [추가 맥락이나 예시]
   - Sources: [Reddit](url), [HN](url)

2. **[의견 제목]**
   - [구체적인 내용]
   - Source: [Dev.to](url)

(최소 5개 이상)

---

### Controversy (논쟁점)

1. **[논쟁 주제]**
   - 찬성측: "[인용]" - [Source](url)
   - 반대측: "[인용]" - [Source](url)
   - 맥락: [왜 의견이 갈리는지]

2. **[논쟁 주제]**
   - ...

(최소 3개 이상)

---

### Notable Perspective (주목할 시각)

1. **[인사이트 제목]**
   > "[원문 인용 또는 핵심 문장]"
   - [왜 주목할 만한지 설명]
   - Source: [Platform](url)

2. **[인사이트 제목]**
   - ...

(최소 3개 이상)
```

### 出处标注规则

- **必须行内链接**：每条观点末尾以 `Source: [Platform](url)` 格式附注
- **多个出处**：同一观点在多处被提及时，使用 `Sources: [Reddit](url), [HN](url)`
- **直接引用**：尽可能以 `"..."` 形式引用原文
- **URL 准确性**：仅包含实际可访问的链接（经搜索结果确认的 URL）

## 错误处理

| 情况 | 应对 |
|------|------|
| 无搜索结果 | 跳过该平台，专注于其他来源 |
| Gemini CLI 失败 | 跳过 Reddit，用其余 3 个来源继续 |
| 主题过于新颖 | 提示结果不足，建议相关关键词 |

## 示例

**简单主题**：
```
User: "Tailwind v4 개발자들 반응 어때?"
→ topic: "Tailwind v4"
→ 4개 소스 병렬 검색
→ 종합 인사이트 제공
```

**比较主题**：
```
User: "pnpm vs yarn vs npm 커뮤니티 의견"
→ topic: "pnpm vs yarn vs npm comparison"
→ 4개 소스 병렬 검색
→ 각 도구별 선호도 정리
```

**争议性主题**：
```
User: "Claude Code Plugin 에 대한 개발자들 생각"
→ topic: "Claude Code Plugin tips"
→ 4개 소스 병렬 검색
→ 종합 인사이트 제공
```
