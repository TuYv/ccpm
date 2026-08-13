---
name: "board-meeting"
description: "Multi-agent board meeting protocol for strategic decisions. Runs a structured 6-phase deliberation: context loading, independent C-suite contributions (isolated, no cross-pollination), critic analysis, synthesis, founder review, and decision extraction. Use when the user invokes /cs:boardroom, calls a board meeting, or wants structured multi-perspective executive deliberation on a strategic question."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: c-level
  domain: board-protocol
  updated: 2026-03-05
  frameworks: 6-phase-board, two-layer-memory, independent-contributions
---
# 董事会会议协议

结构化的多智能体审议机制，可防止群体迷思、记录少数意见，并形成清晰、可执行的决策。

## 关键词
董事会会议、高管审议、战略决策、最高管理层、多智能体、/cs:boardroom、创始人审查、决策提取、独立观点

## 调用
`/cs:boardroom [topic]` — 例如 `/cs:boardroom Should we expand to Spain in Q3?`

---

## 六阶段协议

### 阶段 1：收集背景信息
1. 加载 `~/.claude/company-context.md`
2. 从 `~/.claude/decisions/approved/` 加载第 2 层已批准的决策 **（仅限第 2 层——绝不加载原始记录）**
3. 重置会话状态——不得受先前对话影响
4. 展示议程及已激活的角色 → 等待创始人确认

**幕僚长根据主题选择相关角色**（并非每次都激活全部 14 个角色）：
| 主题 | 激活角色 |
|-------|----------|
| 市场扩张 | CEO、CMO、CFO、CRO、COO |
| 产品方向 | CEO、CPO、CTO、CMO |
| 招聘/组织 | CEO、CHRO、CFO、COO（工程招聘时加上 VPE） |
| 定价 | CMO、CFO、CRO、CPO |
| 技术 | CTO、CPO、CFO、CISO |
| 合同/投资条款清单/法律风险敞口 | GC、CEO、CFO |
| 数据战略/训练数据权利 | CDO、CAIO、GC、CISO |
| AI 战略/模型选择/AI 风险 | CAIO、CTO、CDO、CFO |
| 留存/流失/客户成功 | CCO、CRO、CPO |
| 工程交付/DORA/团队结构 | VPE、CTO、CHRO、CFO |

---

### 阶段 2：独立陈述（相互隔离）

**不得相互影响。每个智能体都必须在看到其他智能体的输出之前运行。**

顺序：调研（如需要）→ CMO → CFO → CEO → CTO → COO → CHRO → CRO → CISO → CPO → GC → CDO → CAIO → CCO → VPE（仅限已激活的角色）

**推理方法：** CEO：思维树（3 种未来情景）| CFO：思维链（展示计算过程）| CMO：递归思维（草拟→批判→完善）| CPO：第一性原理 | CRO：思维链（销售管线计算）| COO：逐步推演（流程图）| CTO：ReAct（调研→分析→行动）| CISO：基于风险（P×I）| CHRO：同理心 + 数据 | GC：基于风险（条款风险敞口）| CDO：决策驱动（这些数据将推动什么决策）| CAIO：评估优先（没有评估，就不发布）| CCO：留存至上（GRR 优先于 NRR）| VPE：吞吐量优先（周期时间计算）

**陈述格式（最多 5 个要点，需自行验证）：**
```
## [ROLE] — [DATE]

Key points (max 5):
• [Finding] — [VERIFIED/ASSUMED] — 🟢/🟡/🔴
• [Finding] — [VERIFIED/ASSUMED] — 🟢/🟡/🔴

Recommendation: [clear position]
Confidence: High / Medium / Low
Source: [where the data came from]
What would change my mind: [specific condition]
```

每个智能体在陈述前需自行验证：来源归属、假设审计、置信度评分。不得出现未标记的主张。

---

### 阶段 3：批判性分析
高管导师同时接收阶段 2 的全部输出。其角色是对抗性审查者，而非综合归纳者。

检查清单：
- 哪些地方智能体过于轻易地达成了一致？（可疑的共识 = 危险信号）
- 哪些假设被共同采用，却未经验证？
- 会议中缺少了谁？（客户的声音？一线运营人员？）
- 有什么风险无人提及？
- 哪个智能体超出了自身的专业领域？

---

### 阶段 4：综合
幕僚长使用**董事会会议输出**格式（定义见 `../agent-protocol/SKILL.md`）提交结果：
- 待决策事项（一句话）
- 各方观点（每个参与角色一行）
- 共识点 / 分歧点
- 批评者观点（令人不适的真相）
- 建议决策 + 行动项（负责人、截止日期）
- 由你决定（如果创始人不同意，可选择的方案）

---

### 阶段 5：人工介入 ⏸️

**完全停止。等待创始人。**

```
⏸️ FOUNDER REVIEW — [Paste synthesis]

Options: ✅ Approve | ✏️ Modify | ❌ Reject | ❓ Ask follow-up
```

**规则：**
- 用户的修正优先于智能体的提议。不得反驳。不得说“但是 CFO 说过……”
- 30 分钟无操作 → 自动关闭为“待审核”
- 可随时使用 `/cs:boardroom resume` 重新打开

---

### 阶段 6：决策提取
创始人批准后：
- **第 1 层：** 写入完整记录 → `~/.claude/decisions/raw/YYYY-MM-DD-<slug>.md`
- **第 2 层：** 写入已批准的决策记录 → `~/.claude/decisions/approved/YYYY-MM-DD-<slug>.md`，并追加到索引 `~/.claude/decisions/approved/decisions.md`
- 将被否决的提议标记为 `[DO_NOT_RESURFACE]`
- 向创始人确认已记录的决策数量、已跟踪的行动项数量以及已添加的标记数量

---

## 记忆结构

使用规范的双层决策记忆（参见 `../agent-protocol/SKILL.md` → “决策记忆（规范布局）”）：

```
~/.claude/decisions/
├── raw/YYYY-MM-DD-<slug>.md        # Layer 1 — full transcripts (never auto-loaded)
├── raw/archive/YYYY/               # Raw transcripts after 90 days
├── approved/YYYY-MM-DD-<slug>.md   # Layer 2 — founder-approved records (Phase 1 loads these)
└── approved/decisions.md           # Layer 2 index — append-only
```

**未来的会议仅加载第 2 层。** 绝不加载第 1 层。这可以防止产生虚假的共识。

迁移：早期版本可能遗留了 `memory/board-meetings/` 文件夹；读取该文件夹以获取历史记录，但应将新的会议记录和决策写入 `~/.claude/decisions/`。

---

## 失败模式快速参考
| 失败模式 | 修复方法 |
|---------|-----|
| 群体思维（所有人意见一致） | 以隔离方式重新运行阶段 2；强制提出“最有力的反对论点” |
| 分析瘫痪 | 最多保留 5 个要点；即使置信度为低，也必须给出建议 |
| 纠结细枝末节 | 记录为异步行动项；回到主要议程 |
| 角色越界（CFO 进行产品决策） | 由批评者指出；从综合结果中排除 |
| 层级污染 | 阶段 1 仅加载 `~/.claude/decisions/approved/`——硬性规则 |

---

## 参考资料
- `templates/meeting-agenda.md` — 议程格式
- `templates/meeting-minutes.md` — 最终输出格式
- `references/meeting-facilitation.md` — 冲突处理、时间安排、失败模式