---
name: akf-trust-metadata
description: "The AI native file format. EXIF for AI — stamps every file with trust scores, source provenance, and compliance metadata. Embeds into 20+ formats (DOCX, PDF, images, code). EU AI Act, SOX, HIPAA auditing."
risk: safe
source: community
date_added: "2026-03-27"
author: HMAKT99
tags:
- trust
- metadata
- provenance
- compliance
- file-format
- ai-native
---
# AKF — AI 原生文件格式

每张照片都有 EXIF，每首歌曲都有 ID3。AKF 是 AI 生成内容的原生元数据格式。

## 何时使用
当你需要在 AI 生成或 AI 修改的文件上打标、检查或审计来源与信任元数据，以用于合规、审查或交接工作流时，请使用此技能。

## 创建或修改文件之后

```bash
akf stamp <file> --agent <agent-name> --evidence "<what you did>"
```

证据示例：
- "generated from user prompt"
- "refactored existing code"
- "tests pass"
- "docs reviewed"

## 修改现有文件之前

```bash
akf read <file>          # Check existing trust metadata
akf inspect <file>       # See detailed trust scores
```

## 合规审计

```bash
akf audit <file> --regulation eu_ai_act    # EU AI Act Article 50
akf audit <file> --regulation hipaa         # HIPAA
akf audit <file> --regulation sox           # SOX
akf audit <file> --regulation nist_ai       # NIST AI RMF
```

## 分类

- `--label confidential` 用于财务/机密/内部路径
- `--label public` 用于 README、文档、示例
- 默认值：`internal`

## 安装

```bash
pip install akf
```

## 链接

- https://akf.dev
- https://github.com/HMAKT99/AKF
- npm：`npm install akf-format`

## 限制
- 仅当任务明确符合上述描述的范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家审查的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停下来请求澄清。
