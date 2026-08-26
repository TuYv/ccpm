---
name: harness-skill-creator
description: Use when bootstrapping or tightening the smallest harness-oriented skill from an existing repository, workflow, evaluation corpus, or harness-analysis chain. Trigger for meta skills, reusable harness workflows, Qoder/Codex plugin skill sets, skill blueprints, and harness-analysis-like skills that need evidence-backed references, validation gates, and qodercli forward-tests.
---
# Harness Skill 创建器

创建最小的 skill，使另一个 agent 能够在具备证据、验证和明确归属的情况下，重复执行一项 harness 工作。

## 工作流

1. 确定源、目标和宿主：规范的 `skills/<name>/`、`.agents/skills/` wrapper，或两者兼有。
2. 在设计之前检查源链：入口 `SKILL.md`、第一跳引用、脚本、验证器、模板、规范、测试、插件清单，以及任何真实的 smoke evidence。
3. 在完成首次盘点后加载 `references/bootstrap-patterns.md`。使用它来提取模式，而不是产品特定的规则。
4. 起草最小可行 skill 映射：
   - skill 名称和触发句
   - skill 负责的一项工作
   - 要在 `skills/<skill-name>/` 下创建的文件，通常是 `SKILL.md` 加一个 reference
   - 证据边界和验证命令
   - forward-test prompt 以及通过/失败门槛
5. 在可用时，使用系统的 `skill-creator` helper 初始化新的规范 skill。仅针对稳定的重复自动化添加 `scripts/`；不要将临时评估 prompt 放入运行时脚本。
6. 将 `SKILL.md` 编写为 router。将触发条件放入 frontmatter 的 `description` 中，保持正文简短，并将详细规则路由到第一跳 reference。
7. 先进行本地验证，再进行 forward-test。将 qodercli 输出视为模型证据；由本地验证器和文件检查决定通过/失败。

## 设计门槛

- 在目标流程证明存在多个可复用阶段之前，优先使用一个 skill，而不是阶段树。
- 复制归属结构，而不是产品名称、分支策略、私有命令或源特定的团队路由。
- 当工作流由插件共享时，将 `.agents/skills/` 保持为 wrapper 或 mirror；规范判断应归属于根目录下的 `skills/`。
- 除非用户明确要求且源证据支持，否则不要添加安装、网络、服务器、迁移或更改依赖的命令。
- 优先使用可移植的 Node/Python 验证器或目标自有命令。不要默认将仅适用于 Unix 的 `grep`/`find` 检查作为生成的验证门槛。
- 在仅有附件或无工具的 forward-test 中，绝不要输出工具调用标记、shell 探测或检查计划；必要时返回 skill 映射，并将 `status: "insufficient-evidence"`。
- forward-test 的 `files` 是由 `skills/<skill-name>/...` 路径组成的字符串数组，而不是对象。
- 如果生成的 skill 无法通过 `quick_validate.py <skill-dir>`，不要将其描述为可用。
- 每次 forward-test 之后，验证模型获准读取或写入的每个仓库的 git status 或文件清单。

## 验证

针对创建的 skill 运行最窄且最有用的门槛：

```bash
python3 <skill-creator-root>/scripts/quick_validate.py <skill-dir>
qodercli --cwd <neutral-dir> --plugin-dir <harness-root> -p "<forward-test prompt>"
qodercli plugin validate <harness-root>
```

拒绝缺少 frontmatter、过时的占位符、损坏的链接、不受支持的命令、仅适用于源的假设、伪工具调用或宽泛的报告。