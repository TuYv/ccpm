---
name: release-plannotator
description: Prepare and execute a Plannotator release — draft release notes with full contributor credit, bump versions across all package files, build in dependency order, and kick off the tag-driven release pipeline. Use this skill whenever the user mentions preparing a release, bumping versions, writing release notes, tagging a release, or publishing. Also trigger when the user says things like "let's ship", "prep a release", "what's changed since last release", or "time to cut a new version".
---
# Plannotator 发布

该流程分为四个阶段。第一阶段（发布说明）是工作量最大的阶段——请先提交草稿供审阅，再继续后续阶段。

## 第一阶段：起草发布说明

这是最重要的阶段。发布说明是每个版本的公开门面，也是社区成员看到自己的贡献得到认可的主要方式。

### 步骤 1：确定范围

1. 查找最新的发布标签：`git tag --sort=-v:refname | head -1`
2. 确定新版本号。如果不清楚，请询问用户（补丁版本、次版本或主版本）。
3. 收集自上一个标签以来的所有变更：
   - 使用 `git log --oneline <last-tag>..HEAD` 获取提交历史
   - 使用 `git log --merges --oneline <last-tag>..HEAD` 获取已合并的 PR
4. 对于每个 PR，使用 `gh pr view <number> --json title,author,body,closedIssues,labels` 获取详细信息。

### 步骤 2：调查贡献者

这至关重要。参与本次发布的每个人都应获得署名——而不仅仅是 PR 作者。

对于每个 PR 及其关联的 issue，收集：
- **PR 作者**——编写代码的人
- **Issue 报告者**——提交错误报告或功能请求的人
- **Issue 评论者**——参与讨论并提供有用背景信息的人
- **讨论发起者**——发起相关 GitHub Discussions 的人
- **功能请求者**——检查关联的 "closes #N" issue 及其作者

通过 `gh` 使用 GitHub API：
```bash
# Get issue details including author
gh issue view <number> --json author,title,body

# Get issue comments to find participants
gh api repos/backnotprop/plannotator/issues/<number>/comments --jq '.[].user.login'

# Get PR review comments
gh api repos/backnotprop/plannotator/pulls/<number>/comments --jq '.[].user.login'
```

### 步骤 3：撰写发布说明

阅读 `references/` 中的参考发布说明，以了解规范的模板结构。这些是以往版本的真实发布说明——请与其语气、结构和详细程度保持一致。

- `release-notes-v0.13.0.md`——大型发布，包含 14 个 PR、3 位首次贡献者，以及“New Contributors”部分和叙述性的“Contributors”部分
- `release-notes-v0.12.0.md`——大型社区发布，包含 14 个 PR，其中 10 个来自外部贡献者，并有详细的叙述性“Contributors”部分
- `release-notes-v0.13.1.md`——小型补丁版本，包含 2 个 PR，没有外部作者，“Community”部分重点介绍 issue 报告者

请注意每份参考说明如何以不同方式处理贡献者署名。选择符合本次发布贡献者构成的模式——包含许多外部 PR 的发布适合使用叙述性的“Contributors”部分；由 issue 报告推动的补丁版本则使用更简洁的“Community”部分。

将文件写入仓库根目录，命名为 `RELEASE_NOTES_v<VERSION>.md`。

#### 结构

1. **X/Twitter 关注链接**——第一行，始终相同：
   ```
   Follow [@plannotator](https://x.com/plannotator) on X for updates
   ```

2. **“错过了近期发布？”可折叠表格**——从上一个版本的发布说明中复制，然后：
   - 将上一个版本（即当前版本所接续的版本）添加为最新一行
   - 保留大约 10–12 行；如有需要，删除最旧的一行
   - 每行：版本链接 + 以逗号分隔的功能亮点（简短短语）

3. **“vX.Y.Z 的新增内容”** — 发布说明的核心部分
   - 以 1-3 句话概括本次发布的主题和范围。说明包含多少个 PR、其中多少来自外部贡献者，以及是否有首次贡献者。
   - 每项主要功能或修复都应有独立的 `###` 小节，其中包括：
     - 描述性标题（不要逐字照搬 PR 标题，应重新表述以提高清晰度）
     - 使用 1-4 个段落说明变更内容及其重要性。表述应具体明确。描述之前存在的问题、此次变更的作用，以及用户会如何感受到该变更。
     - 底部注明贡献信息：PR 链接、使用 `closing [#N]` 标注的关联 issue，以及贡献者署名
   - 次要变更应放在 `### Additional Changes` 下，以带有加粗标题的项目符号列出

4. **安装 / 更新** — 标准区块，从上一版发布说明中读取并原样复用

5. **“变更内容”** — 以项目符号列表列出本次发布中的每个 PR：
   ```
   - feat: descriptive PR title by @author in [#N](url)
   ```

6. **“新贡献者”** — 如果有首次贡献者：
   ```
   - @username made their first contribution in [#N](url)
   ```

7. **“贡献者”或“社区”** — 以叙述形式表彰所有参与者：
   - 对于 PR 作者，用一句话说明他们构建了什么
   - 对于 issue 报告者和评论者，列出他们报告或讨论的内容
   - 在末尾使用项目符号列表集中列出社区 issue 报告者

8. **完整变更日志链接**：
   ```
   **Full Changelog**: https://github.com/backnotprop/plannotator/compare/<prev-tag>...<new-tag>
   ```

#### 写作指南

- **重叙述，轻噪声。** 使用清晰、易读的文字。不要使用营销话术，也不要堆砌变更日志。用平实的语言解释发生了哪些变化，以及读者为什么应该关注。
- **在适合之处使用项目符号。** 枚举独立事项（其他变更、贡献者列表）时使用项目符号列表。解释功能时使用段落。
- **不要使用陈词滥调或流行术语。** 不要说“令人兴奋”“颠覆性”“无缝”或“强大”。只需描述实际发生的事情。
- **不要使用俏皮收尾。** 不要用机智妙语或点睛式总结来结束小节。让功能本身说明其价值。
- **通过实际收益来说明。** 具体、可靠地描述发生了什么变化，以及这对用户意味着什么。不要描绘愿景，也不要夸大宣传，只需说明它能做什么。
- **不要过度使用长破折号。** 每次发布使用一两个即可。如果发现它们连续出现，应重构句子。
- **语法结构很重要。** 变换句式。使用主动语态。采用具体的主语和动词。
- **贡献者标签。** 使用 `@username`，即直接使用 at 提及，不要使用 `[@user](url)` 这样的 Markdown 链接。GitHub 会在发布说明中为直接的 `@mentions` 渲染头像图标。这对于社区认可非常重要。
- **每位贡献者都很重要。** 所有提交 issue、留下对决策产生影响的评论，或参与讨论的人都应被提及。这个项目的社区是其生命力所在。

### 第 4 步：提交审核

将草稿写入仓库根目录下的 `RELEASE_NOTES_v<VERSION>.md`，并告知用户它已准备好接受审核。不要对该文件执行 `git add`，也不要提交它——按照设计，发布说明文件应保持未跟踪状态。在继续进入第 2 阶段之前，等待用户反馈。

---

## 阶段 2：版本升级

更新以下 **7 个文件**中的版本字符串（且仅限这些文件——其他 package.json 文件使用占位版本）：

| 文件 | 字段 |
|------|-------|
| `package.json`（根目录） | `"version"` |
| `apps/opencode-plugin/package.json` | `"version"` |
| `apps/pi-extension/package.json` | `"version"` |
| `apps/hook/.claude-plugin/plugin.json` | `"version"` |
| `apps/copilot/plugin.json` | `"version"` |
| `openpackage.yml`（根目录） | `version:` |
| `packages/server/package.json` | `"version"` |

读取每个文件，确认当前版本符合预期，然后以原子方式更新全部 7 个文件。

不要更新 VS Code 扩展（`apps/vscode-extension/package.json`）的版本——它采用独立的版本管理方式。

---

## 阶段 3：构建

按依赖顺序运行构建：

```bash
bun run build:review    # 1. Code review editor (standalone Vite build)
bun run build:hook      # 2. Plan review + hook server (copies review's built HTML into hook dist)
bun run build:opencode  # 3. OpenCode plugin (copies built HTML from hook + review)
bun run build:pi        # 4. Pi extension (chains review → hook → pi internally, safe to run after 1-2)
```

`build:pi` 会在内部串联 review 和 hook，因此在完成步骤 1-2 后，它只会运行 Pi 特有的构建。

继续之前，请验证所有构建均成功完成。

### Pi 一致性检查关卡

构建通过后，检查 Pi 扩展，确保所有服务端导入都能在发布的软件包中正确解析。这样可以在缺失文件发布到 npm 之前发现问题。

1. **检查导入与 `files` 数组。** 从 `index.ts`、`server.ts`、`tool-scope.ts` 以及 `server/` 中的每个文件开始，追踪所有本地导入（以 `./` 或 `../` 开头）。验证每个目标文件都被 `apps/pi-extension/package.json` 的 `files` 数组中的某个模式覆盖。

2. **检查 `vendor.sh` 是否涵盖所有 shared/ai 导入。** 服务端文件中的每个 `../generated/*.js` 导入都必须在 `vendor.sh` 的复制循环中有对应条目。如果向 `packages/shared/` 或 `packages/ai/` 添加了新的共享模块或 AI 模块，并且 Pi 的服务端代码导入了该模块，则必须将其添加到 `vendor.sh`。

3. **试运行打包。** 运行 `cd apps/pi-extension && bun pm pack --dry-run`，并验证输出中包含服务端导入的每个文件。重点检查自上次发布以来新增的所有文件。

4. **快速冒烟测试。** 确认构建后 `generated/` 包含所有预期文件，尤其是所有新增文件（例如，本次发布周期中新增的共享模块）。

如果缺少任何内容，请在进入阶段 4 之前修复。常见修复方法：
- 将文件添加到 `vendor.sh` 的复制循环中
- 将文件或目录添加到 `package.json` 的 `files` 数组中
- 修复导入路径（Pi 使用 `../generated/`，而不是 `@plannotator/shared` 或 `@plannotator/ai`）

---

## 阶段 4：提交、打标签和发布

1. **提交版本升级：**
   ```
   chore: bump version to X.Y.Z
   ```
   仅暂存更新了版本的 7 个文件。不要暂存发行说明文件（按照设计，它不会被跟踪）。

2. **创建并推送标签：**
   ```bash
   git tag vX.Y.Z
   git push origin main
   git push origin vX.Y.Z
   ```
   推送 `v*` 标签会触发发布流水线（`.github/workflows/release.yml`）。

3. **流水线会处理其余所有事项：**
   - 运行测试
   - 为 6 个平台交叉编译二进制文件（macOS ARM64/x64、Linux x64/ARM64、Windows x64/ARM64）
   - 编译粘贴服务二进制文件（同样的 6 个平台）
   - 在无需凭据的作业中打包两个 npm 软件包
   - 下载固定版本且经过校验和验证的 Syft 和 Grype 二进制文件；在所有待发布对象均已生成后，生成覆盖整个发布版本的 CycloneDX SBOM，并验证其是否符合架构
   - 强制使用仓库自有且不含任何抑制规则的 Grype 配置，最多重试三次官方数据库更新，要求使用有效且处于活跃状态、版本为 schema-v6、更新时间不超过 120 小时且没有待处理更新的数据库，并将机器可读的扫描、数据库及策略证据保存为工作流构件
   - 拒绝扫描器端忽略的每一项匹配，然后在进行任何证明或发布之前，阻止存在 CISA KEV 漏洞或可修复的 Critical 级别发现结果，且这些结果被分类为已发布/运行时或适用性未知。High 级别、仅开发环境以及无修复方案的 Critical 级别发现结果仅用于报告，但仍保留在证据中
   - 通过 `actions/attest-build-provenance` 为全部 12 个二进制文件生成 SLSA 构建来源证明（通过 Sigstore 签名并记录在 Rekor 中）
   - 使用独立的官方 `actions/attest` SBOM 路径，通过同一 GitHub OIDC/Sigstore 服务，将 CycloneDX 断言绑定到全部 12 个二进制文件和两个 npm tarball。这是一项清单证明，不能替代 SLSA 或 npm 来源证明
   - 创建 GitHub Release，并附上所有二进制文件、SHA256 辅助文件、带版本号的 CycloneDX SBOM 及其 SHA256 辅助文件
   - 将 `@plannotator/opencode` 和 `@plannotator/pi-extension` 发布到 npm，并附带来源证明

   **SBOM 范围：**公开文档是由 Syft 生成的发布版本级清单，涵盖该单体仓库中锁定的构建输入和依赖项。本文档有意不将其描述为二进制文件运行时内容的精确清单。覆盖率测试发现，Bun 独立可执行文件会对 Syft 隐藏已打包的 JavaScript 依赖项元数据。OpenCode tarball 同样不透明；Pi tarball 只能通过嵌套的 package-lock 文件呈现部分信息。相关范围和限制也嵌入在 CycloneDX 元数据中。

   **例外：**目前不存在有效的生产环境例外文件。如果未来某个发布基线需要例外，请勿添加宽泛的忽略规则。应添加一份经过仓库审核的 OpenVEX 文档，并通过 `PLANNOTATOR_RELEASE_VEX` 显式接入；每条声明必须精确匹配一个软件包 URL 和漏洞 ID，并包含 `not_affected` 状态、OpenVEX 理由、影响说明、HTTPS 证据、负责人、创建日期和到期日期。策略测试会拒绝已过期、格式错误、范围过宽及不匹配的记录。

   **关于不可变发布的说明：**该仓库已启用 GitHub Immutable Releases，因此一旦推送 `v*` 标签并创建发布版本，标签→提交和标签→资产的绑定关系便会永久固定。你无法通过删除并重新创建标签来“修复”有问题的发布版本——必须发布新版本。发布说明仍可编辑（参见第 5 步），但其他所有内容均会被锁定。

4. **监控流水线：**
   观察发布工作流运行，直至其完成：
   ```bash
   gh run list --workflow=release.yml --limit=1
   gh run view <run-id> --log
   ```
   验证：
   - 所有作业均通过，包括 `release-security`、`attest`、`release` 和 `npm-publish`
   - `release-security-evidence` 记录了 Syft/Grype 版本、活动数据库的架构/构建/校验和/更新状态、所有 Grype 匹配项，以及 `ACCEPT` 策略决策
   - GitHub Release 已创建，其中包含所有二进制制品、SHA256 辅助文件、带版本号的 `plannotator-X.Y.Z-release-sbom.cdx.json` 及其 `.sha256` 辅助文件
   - npm 包已成功发布（使用 `npm view @plannotator/opencode version` 和 `npm view @plannotator/pi-extension version` 检查）

   拉取请求可以证明生成流程、架构/哨兵验证、数据库策略、Grype 评估、最小权限作业配置以及所有报告制品均正常。GitHub OIDC 签发、发布到制品证明服务以及最终发布资产的发布，仅会针对真正符合条件的 `v*` 标签运行。在此控制措施落地后的首次发布中，请先完成以下有明确范围的仅标签验证，再宣布部署完成：

   在为首次发布添加标签之前，请更新位于 `https://docs.plannotator.ai/open-source/start/installation#pin-or-verify-a-release` 的规范 Mintlify 页面，加入 README 中的 SBOM 范围/限制、Grype 策略、下载/校验和命令，以及两个谓词验证命令。`apps/marketing/src/content/docs/` 下的旧版 Astro 文件仅用于重定向/已弃用，并非公共文档来源。确认线上 Mintlify 页面已包含这些内容；不要让其发布滞后于已交付的控制措施。

   ```bash
   tag=vX.Y.Z
   version="${tag#v}"
   gh release download "$tag" --pattern 'plannotator-linux-x64*' --pattern "plannotator-${version}-release-sbom.cdx.json*" --dir /tmp/plannotator-release-verify
   (cd /tmp/plannotator-release-verify && sha256sum --check plannotator-linux-x64.sha256)
   (cd /tmp/plannotator-release-verify && sha256sum --check "plannotator-${version}-release-sbom.cdx.json.sha256")

   gh attestation verify /tmp/plannotator-release-verify/plannotator-linux-x64 \
     --repo backnotprop/plannotator \
     --source-ref "refs/tags/$tag" \
     --signer-workflow backnotprop/plannotator/.github/workflows/release.yml \
     --predicate-type https://slsa.dev/provenance/v1

   gh attestation verify /tmp/plannotator-release-verify/plannotator-linux-x64 \
     --repo backnotprop/plannotator \
     --source-ref "refs/tags/$tag" \
     --signer-workflow backnotprop/plannotator/.github/workflows/release.yml \
     --predicate-type https://cyclonedx.org/bom
   ```

   此外，使用 `gh attestation verify --format json --jq '.[0].verificationResult.statement.predicate'` 提取经证明的 CycloneDX 谓词，使用 `jq -S` 对它和下载的发布 SBOM 进行规范化，然后使用 `cmp` 比较两者。如果下载了已发布的确切 tarball，也要以相同方式验证一个 npm tarball 主体。将任何仅在标签验证中发现的差异记录为发布阻断项，并发布新版本，而不是修改不可变发布。

如果出现任何失败，请先调查日志并向用户报告，然后再重试。

5. **替换发布说明：**
   发布上线并验证完成后，使用已起草的发布说明替换自动生成的说明正文：
   ```bash
   gh release edit vX.Y.Z --notes-file RELEASE_NOTES_v<VERSION>.md
   ```

---

## 检查清单

创建标签前，请验证：
- [ ] 所有 7 个版本文件的版本号均已一致更新
- [ ] 发布说明已起草并完成审查
- [ ] `bun run build:review` 执行成功
- [ ] `bun run build:hook` 执行成功
- [ ] `bun run build:opencode` 执行成功
- [ ] `bun run build:pi` 执行成功（或已完成 Pi 专用构建步骤）
- [ ] 版本更新已提交
- [ ] Pi 一致性门禁已通过（导入、`vendor.sh`、试运行打包）
- [ ] 没有过期的构建产物（使用干净构建且无缓存问题——如果依赖项发生变化，请先运行 `bun install`）
- [ ] PR 安全的 `release-security` 作业已生成符合架构且哨兵项完整的 SBOM，并使用最新数据库通过了 Grype 策略检查
- [ ] 暂存区中不存在扫描器二进制文件、数据库、生成的 SBOM/报告、凭据或 `DO_NOT_COMMIT` 内容
- [ ] 对于首次启用 SBOM 的发布，规范的 Mintlify 安装/验证页面包含 README 中的 SBOM 范围、策略、校验和、SLSA 及 CycloneDX 命令（不要改为编辑已弃用的 Astro 文档）

创建标签后，请验证：
- [ ] 发布工作流已完成，且 `release-security`、`attest`、`release` 和 `npm-publish` 均为绿色状态
- [ ] GitHub Release 已创建，并包含所有二进制文件、旁车文件、SBOM 和 SBOM 旁车文件
- [ ] 至少一个原生二进制文件通过了显式的 SLSA 和 CycloneDX 谓词检查，且检查已固定到相应标签和签名者工作流
- [ ] 下载的 SBOM 校验和验证通过，且规范 JSON 与已证明的谓词一致
- [ ] `release-security-evidence` 显示数据库为最新/活动状态，且策略决策已被接受
- [ ] npm 软件包已按正确版本发布
- [ ] 两个软件包的 npm 可信发布来源证明仍然可见
- [ ] 已通过 `gh release edit` 替换发布说明