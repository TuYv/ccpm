---
name: create-skill
description: Generate a complete new skill from a one-line prompt and ship it as a PR
metadata:
  title: Create Skill
  category: evolution
  var: ""
  tags:
    - dev
    - meta
---
> **${var}** — 对要创建的技能进行自然语言描述。**必填。** 示例：`"monitor Hacker News for AI papers and send a summary"` 或 `"track gas prices on Ethereum and alert when below 10 gwei"`。

<!-- autoresearch: 变体 B — 通过 PR 优先的工作流、质量强制要求、退出类型体系和新密钥防护，获得更精准的输出 -->

如果 `${var}` 为空，则以 `CREATE_SKILL_NO_VAR` 退出：
```bash
./notify "create-skill aborted: var empty — pass a description e.g. \"monitor X for Y\""
```
然后停止。

今天是 ${today}。你的任务是根据 `${var}` 生成一个完整、可用于生产环境的技能，依据质量标准对其进行评分，并以 PR 的形式交付——**绝不直接提交到 `main`**。

## 步骤

1. **解析请求。** 从 `${var}` 中提取：
   - 核心动作动词（监控、获取、生成、分析、提醒、追踪、扫描等）
   - 数据源——API、网站、RSS、链上数据、GitHub 等
   - 输出格式——通知、文章、文件、PR、仪表板等
   - 新技能将通过其自身的 `${var}` 接受的可配置参数
   - 建议的执行频率（每日、每小时、每周、按需）

   保存一段结构化的请求摘要；你将在 PR 正文中使用它。

2. **重复检测（深入检测——不只是 `ls`）。** 查找功能重叠，而不只是名称冲突。
   ```bash
   keywords=$(echo "${var}" | tr '[:upper:]' '[:lower:]' | grep -oE '[a-z]{4,}' \
     | grep -vE '^(send|with|from|that|this|when|each|into|over|some|like|just|than|then|also|will|have|been|using|monitor|track|fetch|alert)$' \
     | sort -u)
   for kw in $keywords; do
     grep -liE "$kw" skills/*/SKILL.md | head -5
   done
   ```
   完整阅读排名前 3 的候选项。逐一判断：它是否已经实现了该功能？是否可以通过使用不同的 `var=` 运行现有技能来满足请求？
   - **存在近似重复项** → 以 `CREATE_SKILL_DUPLICATE` 退出。通知现有技能的名称，并提供一句建议（“改用现有的 `{skill}`，并传入 `var={...}`”）。停止。
   - **功能相邻** → 将新技能设计为对其进行补充（采用不同的角度、频率或输出）。在 PR 正文中说明功能边界。

3. **研究数据源。** 对于新技能需要使用的每个 API 或数据源：
   - 使用 **WebSearch** 查找最新的 API 文档。在可行的情况下，与第二个来源进行交叉核对（近期使用该 API 的 GitHub 仓库、官方变更日志，或日期不早于 2026 年的 Stack Overflow 回答），以确认该端点未被弃用。
   - 使用 **WebFetch** 获取规范文档 URL——将其以注释形式记录在 SKILL.md 中，并记录在 PR 正文的“已研究的来源”部分。
   - 确定准确的端点、必需的请求头、身份验证方案、响应架构和速率限制。
   - 记录所有必需的环境变量/API 密钥。
   - 确定未设置可选 API 密钥时的回退策略（WebSearch / WebFetch / 缓存数据 / 公共端点）。

   **研究标准（软性要求）：** 至少有一个已确认的来源 URL 或范例（可正常访问的文档页面，或使用该 API 的公共仓库）。如果一个都没有，**不要**直接硬性中止——记录 `CREATE_SKILL_INSUFFICIENT_RESEARCH`，通过 `./notify` 告知操作员尝试过哪些方法以及每个来源失败的原因，然后停止。操作员可以使用更清晰的提示或来源线索重新派发任务。

4. **新密钥检查。** 无法从工作流中查看密钥值——只能列出名称。使用 `gh api repos/:owner/:repo/actions/secrets --jq '.secrets[].name'` 读取已配置密钥的**名称**（此端点仅返回名称，绝不返回值）。将其与 `aeon.yml` 和现有工作流中的环境变量用法进行交叉核对。对于新技能需要的每个环境变量：
   - **名称存在** → 继续。
   - **名称缺失** → 记录为 `NEW_SECRET_REQUIRED`。生成的技能在缺少该密钥时**必须**优雅降级或跳过（不得硬崩溃）。在 PR 正文中添加 `### Required secrets` 章节，列出启用前操作者必须添加到 GitHub Actions 密钥中的内容。

   如果该密钥没有优雅的回退方案，生成的技能必须在第 1 步执行：
   ```bash
   if [ -z "$VAR" ]; then ./notify "{skill} skipped: VAR not set"; exit 0; fi
   ```

5. **设计技能。** 确定：
   - **技能名称**——小写、使用连字符，最多 2～3 个单词（例如 `gas-alert`、`hn-papers`）。不得与 `skills/` 下的任何现有条目冲突。
   - **描述**——一句话，以动词开头，不超过 90 个字符。
   - **标签**——从以下选取：`content`、`crypto`、`dev`、`meta`、`news`、`research`、`social`。最多 3 个。
   - **变量行为**——`${var}` 控制什么；为空时会发生什么（使用合理默认值，或发送通知后干净地中止）。
   - **步骤**——编号 4～8 步，遵循标准模式：读取上下文 → 获取/搜索 → 处理/分析 → 写入输出 → 记录日志 → 发送通知。
   - **调度建议**——选择一个 cron 时间点。读取 `aeon.yml` 中的现有调度；避免与高负载技能（article、repo-scanner、deep-research、telegram-digest）安排在同一分钟运行，除非新技能很轻量（预计耗时少于 30 秒）。如果自然整点已经拥挤，优先选择偏移至 `:30` 分钟。
   - **模型**——默认为 `claude-sonnet-5`。如果技能属于高频聚合/摘要类，为优化成本请选择 `claude-haiku-4-5-20251001`；如果需要最强的推理能力，则选择 `claude-opus-4-8`。在 PR 正文中说明选择理由。
   - **类别**——技能要加入的包。从以下类别中选择一个：`research` `dev` `crypto` `onchain-security` `social` `productivity` `meta`。（`core` 和 `fleet` 在 `packs.config.json` 中进行精选配置，不在此处选择。）如果没有合适的类别，则省略它，技能会进入 **Lab** 兜底分类，以便稍后分流。参见 `docs/skill-packs.md`。

6. **编写 SKILL.md 草稿**，保存至 `skills/{skill-name}/SKILL.md`，并严格使用以下结构：

   ```markdown
   ---
   name: {skill-name}
   description: {One-sentence description starting with a verb}
   metadata:
     title: {Display Name}
     category: {category}
     var: ""
     tags:
       - {tag}
   ---
   > **${var}** — {What the variable controls}. {If-empty behavior}.

   Today is ${today}. {One sentence describing the task.}

   ## Steps

   1. **{Step title}.** {Specific instructions — endpoints, commands, formats.}

   2. **{Step title}.** {More instructions. Code blocks for curl/bash when relevant.}

   ...

   N-1. **Log.** Append to `memory/logs/${today}.md`:
   - Skill: {skill-name}
   - What was done and key outputs

   N. **Notify.** Send via `./notify`:
   {Output format template — specify ≤4000 chars, clickable URLs}

   ## Network note

   {How this skill reaches the network — ./secretcurl with an {ENV_NAME} placeholder for auth'd APIs, gh api for GitHub, curl + WebFetch fallback for public}
   ```

对生成内容的硬性要求：
   - 提供完整的 `curl` 命令，包含正确的请求头和 URL 编码（不得使用伪代码）。
   - 对 JSON API 使用 `jq` 进行解析。
   - 明确说明通知的字符限制（总计少于 4000 个字符）。
   - 每个链接均可点击（使用完整 URL，不得使用占位符）。
   - 为每个可选 secret 定义回退行为。
   - 仅使用 `${var}` 和 `${today}` 模板变量——不得虚构其他变量。
   - 不得包含 TODO、占位符或“稍后填写”之类的内容。
   - 必须包含 `## Network note` 章节（采用准确的模型——规范措辞请参阅此 skill 中的 `## Network note`；不存在网络沙箱）。

7. **质量强制检查（自我编辑阶段）。** 按以下维度为草稿打 1-5 分：

   | 评估标准 | 检查内容 |
   |-----------|---------------|
   | Frontmatter 完整 | `name`、`category`、`description`、`var`、`tags` 均存在且格式正确 |
   | Var 文档 | 仅包含一行 `>` 块引用；已定义值为空时的行为 |
   | API 调用完整 | 包含 Curl、请求头和 jq，不得使用伪代码 |
   | 回退行为 | 每个可选 secret 均可优雅降级 |
   | 输出规范 | 明确指定字符限制、可点击 URL 和格式模板 |
   | Network note | 存在，并与所用 API 的认证模式匹配（需认证时使用 `./secretcurl`，GitHub 使用 `gh api`，公共资源使用 WebFetch 回退） |

   任一评估标准低于 4 分 → 重写该章节一次。重写一次后仍低于 4 分 → 以 `CREATE_SKILL_VALIDATION_FAILED` 退出，并通过 notify 列出未通过的评估标准。**不得交付低质量 skill。**

8. **写入后验证。** 从磁盘重新读取 SKILL.md 并验证：
   - Frontmatter YAML 可解析；必需键均存在。
   - 不得出现以下任何字面子字符串：`TODO`、`FIXME`、`XXX`、`placeholder`、`fill in`、`lorem`、`<your-`、`your_api_key_here`、`example.com`。
   - 每个 `${...}` 模板变量均解析为 `${var}` 或 `${today}`。
   - 正文中至少出现一次 `./notify` 调用。
   - 至少出现一次写入 `memory/logs/${today}.md` 的操作。
   - 存在 `## Network note` 章节。

   任何一项失败 → 删除未完成的文件及其他所有写入内容，以 `CREATE_SKILL_VALIDATION_FAILED` 退出，并通过 notify 列出失败的检查项。不得保留部分状态。

9. **在 `aeon.yml` 中注册。** 将新 skill 插入适当的时间段章节：
   - 格式：`  {skill-name}: { enabled: false, schedule: "{suggested_cron}" }`
   - 如果在第 5 步中选择了相应模型，则添加 `model: "claude-haiku-4-5-20251001"`（或 `"claude-opus-4-8"`）。
   - 如果该 skill 接受默认 var，则添加 `var: ""`。
   - 如果名称不能明显体现用途，则添加简短的行尾注释。
   - 放置在相关 skill 附近（加密货币与加密货币放在一起、内容与内容放在一起，等等）。
   - **始终**设置为 `enabled: false`。由操作员决定何时启用。

   编辑后验证 YAML 仍可解析。如果解析失败，则还原更改并以 `CREATE_SKILL_VALIDATION_FAILED` 退出。

9b. **试运行关卡（阻止损坏的生成 skill 自动合并）。** 在创建 PR 之前，使用**合成的** secrets 执行一次新 skill，确保生成的 skill 不会在仅使用过真实凭据运行的情况下进入生产环境：
    ```bash
    DRYRUN_VERDICT="output/.dry-run/$name.json" bash scripts/dry-run.sh run "$name" || true
    ```
    - 脚本会自行检查 `SKILL_DRYRUN` 仓库变量（默认启用），当其值为 `0` 时返回 `skipped` 判定。
    - 读取 `output/.dry-run/$name.json`。`passed: true`（或 `skipped: true`）表示继续。`passed: false` 表示必须**删除 `skills/$name/`、还原对 `aeon.yml` 的编辑，并以 `CREATE_SKILL_DRYRUN_FAILED` 退出**，同时通过 notify 列出判定结果中的 `reasons[]`。不得创建 PR。
    - 无论结果如何，都要将判定 JSON 放入 PR 正文的 `## Dry-run` 章节中，以便审阅者确认该关卡已运行。
    该关卡是**结构性**检查（退出码为 0、输出非空、未在声明的 `mode` 之外写入、未使用 `requires:` 之外的 secret），且运行环境中绝不会放入真实凭据。它不会重新对内容评分；Haiku 评分器已完成该工作。

10. **以 PR 形式提交（绝不要提交到 `main`）。**
    ```bash
    name="{skill-name}"
    git checkout -b create-skill/$name
    git add skills/$name/SKILL.md aeon.yml
    git commit -m "create skill: $name

    {one-sentence description}

    Generated by create-skill from var: \"{request summary, ≤80 chars}\""
    git push -u origin create-skill/$name
    gh pr create --title "create skill: $name" --body "$(cat <<'EOF'
    ## Skill
    **Name**: `{skill-name}`
    **Description**: {description}
    **Tags**: {tags}
    **Schedule**: `{cron}` (disabled by default)
    **Model**: {model}
    **Var**: {var-doc}

    ## Request
    ```
    ${var}
    ```

    ## Sources researched
    - {URL 1}
    - {URL 2}
    - {URL 3}

    ## Required secrets
    {list of NEW_SECRET_REQUIRED env vars OR "None — uses existing secrets"}

    ## Quality scores
    | Criterion | Score |
    |-----------|-------|
    | Frontmatter | X/5 |
    | Var doc | X/5 |
    | API calls | X/5 |
    | Fallback behavior | X/5 |
    | Output spec | X/5 |
    | Network note | X/5 |

    ## Trigger manually
    Workflow dispatch with `skill={skill-name}` and `var={example-var}`.
    EOF
    )"
    ```
    记录 PR URL。

11. **记录日志。** 追加到 `memory/logs/${today}.md`：
    ```
    ### create-skill
    - Request: {var, ≤80 chars}
    - Created: skills/{skill-name}/SKILL.md
    - Registered in aeon.yml: schedule={cron}, model={model}
    - Required secrets: {list or "none"}
    - Quality scores: F/V/A/Fb/O/N = X/X/X/X/X/X
    - PR: {url}
    - Exit: CREATE_SKILL_OK (or CREATE_SKILL_NEW_SECRET_REQUIRED)
    ```

12. **通知。** 通过 `./notify` 发送：
    ```
    *create-skill — {skill-name}*
    {one-line description}
    Schedule: `{cron}` (disabled by default)
    {Required secrets line if any}
    PR: {url}
    Trigger: dispatch skill=`{skill-name}` var=`{example}`
    ```

## 退出分类

| 代码 | 适用情况 | 操作 |
|------|------|--------|
| `CREATE_SKILL_OK` | 新 Skill 已创建、验证并打开 PR | 发送包含 PR 链接的通知 |
| `CREATE_SKILL_NEW_SECRET_REQUIRED` | 与 OK 相同，但操作员必须先添加新的 Secret 才能启用 | 发送包含 PR 链接和 Secret 提示的通知 |
| `CREATE_SKILL_NO_VAR` | `${var}` 为空 | 通知中止原因；停止 |
| `CREATE_SKILL_DUPLICATE` | 现有 Skill 已覆盖该请求 | 通知建议使用的现有 Skill；停止 |
| `CREATE_SKILL_INSUFFICIENT_RESEARCH` | 使用 WebSearch + WebFetch 后仍无法确认至少 1 个可用数据源 | 通知已尝试的内容；停止 |
| `CREATE_SKILL_VALIDATION_FAILED` | 质量强制检查或写入后检查失败 | 删除部分生成的文件；还原 aeon.yml；通知未通过的标准；停止 |
| `CREATE_SKILL_DRYRUN_FAILED` | 试运行关卡（步骤 9b）返回 `passed: false` | 删除部分生成的文件；还原 aeon.yml；通知判定原因；不要打开 PR；停止 |

## 网络说明

不存在网络沙箱限制——`curl` 可以正常使用；研究期间，如果公开 GET 请求不稳定，则使用 **WebFetch** 作为后备方案。对于新 Skill 将调用的需认证 API，通过 `./secretcurl` 使用 `{ENV_NAME}` 占位符来调用（密钥通过 Skill 的 `requires:` 注入）；GitHub 则使用 `gh api`。**不可逆的副作用**（电子邮件、支出、链上写入、部署）应在运行过程中通过 `./secretcurl` 执行，作为 Skill 最终的、失败时关闭的操作——不存在延迟/后处理步骤，并且绝不要延迟读取操作（参见 CLAUDE.md）。

## 约束

- **绝不**将生成的 skill 直接提交到 `main`。始终创建 PR。
- **绝不**在 `aeon.yml` 中启用生成的 skill（始终保持 `enabled: false`——由运维人员决定）。
- **绝不**向工作流添加其中原本不存在的 API 密钥/机密信息。应标记为 `NEW_SECRET_REQUIRED`，并在 PR 正文中说明。
- **绝不**交付未通过验证的 skill。干净地中止始终好于交付损坏的内容。
- **绝不**覆盖现有的 `skills/{name}/SKILL.md`——名称冲突属于阻断性错误。