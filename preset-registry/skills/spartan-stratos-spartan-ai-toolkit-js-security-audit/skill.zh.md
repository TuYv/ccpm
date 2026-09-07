---
name: js-security-audit
description: Audit JS/TS projects against NPM Security Guidelines covering project setup, dependency hygiene, CI/CD pipeline, Dependabot, and incident response. Use when reviewing package.json or lockfiles, adding or upgrading npm dependencies, setting up CI security gates, hardening a new repo, or responding to a compromised package.
allowed_tools:
  - Read
  - Glob
  - Grep
  - Bash
---
# JS 安全审计

对一个 JS/TS 项目（npm、yarn 或 pnpm）执行覆盖 5 个领域的安全审计。输出按领域划分的通过/失败报告，并附带 file:line 引用。

## 何时使用

- 新仓库加固——验证 `.npmrc`、lockfile、2FA、精确版本锁定
- 审查新增或升级依赖的 PR
- 搭建 CI 安全门禁（`npm ci --ignore-scripts`、lockfile-lint、审计门禁）
- 供应链攻击消息传出后（Axios 2026 年 3 月、Shai-Hulud 等）
- 生产部署前的周期性安全审查

## 流程

> 完整的 MUST/SHOULD/SHOULDN'T 清单见 `audit-checklist.md`。
> SAST ESLint 模板和规则表见 `eslint-security.md`。
> 遭入侵依赖的 5 步响应流程见 `incident-playbook.md`。
> npm/yarn/pnpm 的等价命令与工具见 `package-manager.md`。

先通过检查存在哪个 lockfile 来检测包管理器：`package-lock.json`（npm）、`yarn.lock`（yarn）、`pnpm-lock.yaml`（pnpm）。使用 `package-manager.md` 中对应的命令。

### 1. 项目设置
检查 `.npmrc`、lockfile 是否存在、版本锁定、`.gitignore`、作用域包。

### 2. 依赖卫生
运行审计、扫描 lockfile diff 查找意外出现的包、检查 `latest` 标签和琐碎依赖。

### 3. CI/CD 流水线
验证使用 `npm ci` 而非 `npm install`、带选择性 rebuild 白名单的 `--ignore-scripts`、审计门禁、lockfile-lint、按 SHA 锁定的 actions、SBOM、ESLint 安全配置。

### 4. Dependabot
检查 `.github/dependabot.yml`、告警路由、针对 critical/high 级别的 P1 SLA、分组配置。

### 5. 事件响应准备
验证团队是否有成文的处置手册、IOC 监控、凭据轮换操作手册。

## 交互风格

- 从 lockfile 检测包管理器，不默认为 npm
- 先标记关键发现（遭入侵的包、缺失的审计门禁、仓库中的密钥），再报告警告
- 每项发现都引用文件路径或配置键
- 每项发现都附带修复代码片段——而不只是“去修好它”
- 区分 MUST（阻止合并）、SHOULD（下个迭代）与 SHOULDN'T（反模式）

## 规则

- **Critical（关键）**——仓库中的密钥、缺失 lockfile、生产依赖中的 `latest` 标签、CI 中没有 `npm audit` 门禁、发布者未启用 2FA
- **Warning（警告）**——缺失 `.npmrc` 加固、没有 Dependabot 配置、不生成 SBOM、缺少 ESLint 安全配置
- **Info（提示）**——没有 `npq` 安装前审查、没有 Socket.dev/Snyk 集成

## 易踩的坑

- **AI 幻觉出的包名。** Claude（以及其他 LLM）有时会推荐 npm 上并不存在的包——攻击者会注册这些名字并植入恶意软件。安装前务必在 `npmjs.com` 上核实该包，尤其是来自聊天建议的不常见包名。
- **在 CI 中 `npm install` 与 `npm ci` 的区别很重要。** 当 lockfile 与 `package.json` 不一致时，`npm install` 会重写 lockfile，悄悄拉入新版本；`npm ci` 则会让构建失败。CI 必须使用 `ci`。
- **`--ignore-scripts` 也会拦截合法的包。** `esbuild`、`sharp`、`prisma`、`bcrypt` 需要它们的 postinstall 脚本来下载二进制文件或生成客户端。应使用 `--ignore-scripts` 然后 `npm rebuild <allowlist>`——并为白名单中的每个包记录其存在理由。
- **GitHub Actions 按 SHA 锁定，而不是按标签。** `actions/checkout@v4` 跟随标签，而标签可以被重新指向恶意代码（确实发生过）。使用完整的 40 字符 SHA，并以注释标明对应标签。
- **Lockfile diff 是供应链的金丝雀。** 一个为了修正拼写错误却新增 200 个传递依赖的 PR，或者把已有包的解析 URL 从 `registry.npmjs.org` 改走的 PR，都是危险信号——合并前先调查。
- **`min-release-age` 是 npm v11+ 的功能。** 在更旧的 npm 上，将其列为 SHOULD 项即可，不要因此判定审计失败。
- **认证代码中使用 Math.random() 属于 Critical，而非 Warning。** 用 `Math.random()` 生成的验证码、会话令牌、密码重置令牌都是可预测的。强制使用 `crypto.randomInt()`。Notion 指南将此列为来自 c0x12c 代码库的真实发现。
- **不允许以“减少噪音”为由禁用 Dependabot。** 正确做法是对次要/补丁版本更新做分组，而不是屏蔽告警。

## 推荐的权限白名单

本技能需要 `Bash` 来运行 `npm audit` 等相关命令。为避免每次审计都弹出确认提示，请将以下内容加入你的 `~/.claude/settings.json`（或项目级 `.claude/settings.json`）：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm audit:*)",
      "Bash(npm outdated:*)",
      "Bash(npm explain:*)",
      "Bash(npm list:*)",
      "Bash(npm view:*)",
      "Bash(yarn npm audit:*)",
      "Bash(yarn outdated:*)",
      "Bash(yarn why:*)",
      "Bash(pnpm audit:*)",
      "Bash(pnpm outdated:*)",
      "Bash(pnpm why:*)",
      "Bash(npx lockfile-lint:*)",
      "Bash(npx npq:*)"
    ]
  }
}
```

这样可以让审计命令静默执行，而其他所有操作（写入、删除等）仍需通过提示确认。

## 输出

生成一份审计报告：

```
## JS Security Audit: {repo}

### Overall: Pass | Fail

| Area               | Status   | Critical | Warnings | Info |
|--------------------|----------|----------|----------|------|
| Project Setup      | Pass     | 0        | 1        | 0    |
| Dependency Hygiene | Fail     | 1        | 0        | 0    |
| CI/CD Pipeline     | Pass     | 0        | 2        | 1    |
| Dependabot         | Warning  | 0        | 1        | 0    |
| Incident Response  | Info     | 0        | 0        | 1    |

### Critical Findings
- **[Dependency Hygiene]** `lodash` pinned to `latest` in package.json:24
  - Fix: Replace with exact version `"lodash": "4.17.21"`
  - Reason: `latest` resolves at install time, defeating lockfile guarantees

### Warnings
- **[Project Setup]** `.npmrc` missing `ignore-scripts=true`
  - File: `.npmrc:1`
  - Fix: Add `ignore-scripts=true` and use `npm rebuild` for allowlisted packages

### Remediation Priority
1. Fix critical findings before merging
2. Address warnings in next sprint
3. Info items as time permits
```
