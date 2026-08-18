---
name: brand
description: Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
---
# 品牌

品牌标识、品牌语调、信息传达、资产管理和一致性框架。

## 适用场景

- 品牌语调定义和内容基调指导
- 视觉标识标准和风格指南制定
- 信息传达框架创建
- 品牌一致性审查和审核
- 资产组织、命名和审批
- 调色板管理和字体规范

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

**提取/比较颜色：**
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
- `docs/brand-guidelines.md` → 唯一事实来源
- `assets/design-tokens.json` → 令牌定义
- `assets/design-tokens.css` → CSS 变量

## 子命令

| 子命令 | 描述 | 参考文档 |
|------------|-------------|-----------|
| `update` | 更新品牌标识并同步到所有设计系统 | `references/update.md` |

## 参考文档

| 主题 | 文件 |
|-------|------|
| 语调框架 | `references/voice-framework.md` |
| 视觉标识 | `references/visual-identity.md` |
| 信息传达 | `references/messaging-framework.md` |
| 一致性 | `references/consistency-checklist.md` |
| 指南模板 | `references/brand-guideline-template.md` |
| 资产组织 | `references/asset-organization.md` |
| 颜色管理 | `references/color-palette-management.md` |
| 字体排印 | `references/typography-specifications.md` |
| 徽标使用 | `references/logo-usage-rules.md` |
| 审批检查清单 | `references/approval-checklist.md` |

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `scripts/inject-brand-context.cjs` | 提取品牌上下文以注入提示词 |
| `scripts/sync-brand-to-tokens.cjs` | 将 brand-guidelines.md → design-tokens.json/css 同步 |
| `scripts/validate-asset.cjs` | 验证资产命名、大小和格式 |
| `scripts/extract-colors.cjs` | 提取颜色并与调色板进行比较 |

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/brand-guidelines-starter.md` | 面向新品牌的完整入门模板 |

## 路由

1. 从 `$ARGUMENTS` 解析子命令（第一个单词）
2. 加载对应的 `references/{subcommand}.md`
3. 使用其余参数执行