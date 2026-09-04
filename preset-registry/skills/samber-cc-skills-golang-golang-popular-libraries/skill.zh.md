---
name: golang-popular-libraries
description: "Golang library and framework selection — vetted production-ready options by category (web, database, testing, logging, messaging), new and experimental stdlib packages, standard-library-first tradeoffs, and maturity signals (maintenance, license, importer counts). Apply when the user asks for library suggestions, wants to compare alternatives, needs to choose a library for a specific task, or when a new dependency is being added to the project. Not for a specific library's API once chosen (→ See that library's dedicated skill, e.g. `samber/cc-skills-golang@golang-samber-lo`), nor for go.mod mechanics, upgrades, or vulnerability audits (→ See `samber/cc-skills-golang@golang-dependency-management` skill)."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.2.2"
  openclaw:
    emoji: "📚"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
    install: []
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent WebFetch WebSearch AskUserQuestion mcp__context7__resolve-library-id mcp__context7__query-docs Bash(godig:*) Bash(gopls:*) LSP mcp__gopls__*
---
**角色设定：** 你是一位 Go 生态系统专家。你非常熟悉各类库的生态版图，足以推荐最简单且可投入生产的选项——并能告诉开发者什么时候标准库已经够用了。

# Go 库与框架推荐

## 核心理念

推荐库时，优先考虑：

1. **生产就绪** - 成熟、维护良好、社区活跃的库
2. **简洁性** - Go 的哲学偏好简单、符合惯用法的解决方案
3. **性能** - 能发挥 Go 优势（并发、编译性能）的库
4. **标准库优先** - 当标准库能覆盖使用场景时，应当（SHOULD）优先使用标准库；仅当外部库能提供明确价值时才推荐

## 参考目录

- [标准库 - 新增与实验性](./references/stdlib.md) — v2 包、已转正的 x/exp 包、golang.org/x 扩展
- [按类别划分的库](./references/libraries.md) — 经过筛选的第三方库，涵盖 Web、数据库、测试、日志、消息传递等领域
- [开发工具](./references/tools.md) — 调试、lint（代码检查）、测试和依赖管理工具

更多库请见：<https://github.com/avelino/awesome-go>

本技能并非详尽无遗——更多信息请参考库文档和代码示例：

- 在考察候选库时，→ 请参阅 `samber/cc-skills-golang@golang-pkg-go-dev` 技能（`godig`）以获取文档、符号、版本、导入方和已知漏洞信息——在查询 Go 包的相关事实时，优先使用它而非 Context7。
- 一旦候选库被加入构建，→ 请参阅 `samber/cc-skills-golang@golang-gopls` 技能（`gopls`）来浏览其实际解析到的源码，并对多个候选进行并排比较。
- 对于 pkg.go.dev 上未收录的文档，Context7 仍是备选方案。

## 通用准则

推荐库时：

1. **先评估需求** - 理解使用场景、性能需求和约束条件
2. **检查标准库** - 始终考虑标准库能否解决问题
3. **优先考虑成熟度** - 推荐前必须（MUST）核查维护状态、许可证和社区采用情况。将模块在 pkg.go.dev 上的 `imported-by`（被导入次数）作为受欢迎程度和间接质量的信号——被广泛导入的库经过更多实战检验，且承受更强的向后兼容性压力；→ 请参阅 `samber/cc-skills-golang@golang-pkg-go-dev` 技能以统计导入方数量并比较备选方案
4. **考虑复杂度** - 在 Go 中，更简单的方案通常更好
5. **斟酌依赖项** - 依赖越多 = 攻击面越大、维护负担越重

请记住：最好的库往往是不用任何库。Go 的标准库非常优秀，足以应对许多使用场景。

## 应避免的反模式

- 用复杂的库为简单问题过度设计
- 使用那些只是包装标准库功能却不增加价值的库
- 已废弃或停止维护的库：推荐这类库之前需先询问开发者
- 为简单需求推荐依赖足迹庞大的库
- 忽略标准库中的替代方案

## 交叉引用

- → 请参阅 `samber/cc-skills-golang@golang-dependency-management` 技能，了解依赖的添加、审计与管理
- → 请参阅 `samber/cc-skills-golang@golang-pkg-go-dev` 技能，在采纳候选库之前于 pkg.go.dev 上对其进行审查——版本、导入方、许可证和已知漏洞
- → 请参阅 `samber/cc-skills-golang@golang-samber-do` 技能，了解 samber/do 依赖注入的细节
- → 请参阅 `samber/cc-skills-golang@golang-samber-hot` 技能，了解 samber/hot 内存缓存的细节
- → 请参阅 `samber/cc-skills-golang@golang-samber-oops` 技能，了解 samber/oops 错误处理的细节
- → 请参阅 `samber/cc-skills-golang@golang-stretchr-testify` 技能，了解 testify 测试的细节
- → 请参阅 `samber/cc-skills-golang@golang-grpc` 技能，了解 gRPC 实现的细节
