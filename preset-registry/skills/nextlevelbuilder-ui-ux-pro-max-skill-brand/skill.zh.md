---
name: brand
description: Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
argument-hint: "[update|review|create] [args]"
metadata:
  author: claudekit
  version: "1.0.0"
---
# 品牌

品牌身份、声音、信息传达、资产管理和一致性框架。

## 使用时机

- 品牌声音定义和内容语调指导
- 视觉识别标准与风格指南开发
- 信息传达框架创建
- 品牌一致性审核与审计
- 资产组织、命名与审批
- 色板管理和排版规范

## 快速开始

**将品牌上下文注入提示词：**
```bash
node scripts/inject-brand-context.cjs
node scripts/inject-brand-context.cjs --json
```

**验证资产：**
```bash
node scripts/validate-asset.cjs <asset-path>
```

**提取/对比颜色：**
```bash
node scripts/extract-colors.cjs --palette
node scripts/extract-colors.cjs <image-path>
```

## 品牌同步工作流

```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
node scripts/sync-brand-to-tokens.cjs
# 3. Verify
node scripts/inject-brand-context.cjs --json | head -20
```

**同步的文件：**
- `docs/brand-guidelines.md` → Source of truth
- `assets/design-tokens.json` → Token definitions
- `assets/design-tokens.css` → CSS variables

## 子命令

| 子命令 | 说明 | 参考 |
|------------|-------------|-----------|
| `update` | 更新品牌身份并同步到所有设计体系 | `references/update.md` |

## 参考资料

| 主题 | 文件 |
|-------|------|
| 语音框架 | `references/voice-framework.md` |
| 视觉识别 | `references/visual-identity.md` |
| 信息传达 | `references/messaging-framework.md` |
| 一致性 | `references/consistency-checklist.md` |
| 指南模板 | `references/brand-guideline-template.md` |
| 资产组织 | `references/asset-organization.md` |
| 颜色管理 | `references/color-palette-management.md` |
| 排版 | `references/typography-specifications.md` |
| 徽标使用 | `references/logo-usage-rules.md` |
| 审批清单 | `references/approval-checklist.md` |

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `scripts/inject-brand-context.cjs` | 提取用于提示词注入的品牌上下文 |
| `scripts/sync-brand-to-tokens.cjs` | 将 brand-guidelines.md 同步到 design-tokens.json/css |
| `scripts/validate-asset.cjs` | 验证资产命名、大小、格式 |
| `scripts/extract-colors.cjs` | 提取并对比颜色与色板 |

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/brand-guidelines-starter.md` | 面向新品牌的完整入门模板 |

## 路由

1. 从 `$ARGUMENTS`（第一个词）解析子命令
2. 加载对应的 `references/{subcommand}.md`
3. 使用剩余参数执行
