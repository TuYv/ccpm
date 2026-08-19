---
name: baoyu-compress-image
description: Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", or reduce image file size.
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-compress-image
    requires:
      anyBins:
        - bun
        - npx
---
# 图像压缩器

使用可用的最佳工具压缩图像（sips → cwebp → ImageMagick → Sharp）。

## 脚本目录

脚本位于 `scripts/` 子目录中。`{baseDir}` = 此 SKILL.md 所在的目录路径。解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | 图像压缩 CLI |

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md — 使用找到的第一个文件：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-compress-image/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-compress-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-compress-image/EXTEND.md` | 用户主目录 |

如果未找到任何文件，则使用默认设置。

**EXTEND.md 支持**：默认格式、默认质量、保留原文件偏好。

## 用法

```bash
${BUN_X} {baseDir}/scripts/main.ts <input> [options]
```

## 选项

| 选项 | 简写 | 描述 | 默认值 |
|--------|-------|-------------|---------|
| `<input>` | | 文件或目录 | 必填 |
| `--output` | `-o` | 输出路径 | 相同路径，新扩展名 |
| `--format` | `-f` | webp、png、jpeg | webp |
| `--quality` | `-q` | 质量 0-100 | 80 |
| `--keep` | `-k` | 保留原文件 | false |
| `--recursive` | `-r` | 处理子目录 | false |
| `--json` | | JSON 输出 | false |

## 示例

```bash
# 单个文件 → WebP（替换原文件）
${BUN_X} {baseDir}/scripts/main.ts image.png

# 保留 PNG 格式
${BUN_X} {baseDir}/scripts/main.ts image.png -f png --keep

# 递归处理目录
${BUN_X} {baseDir}/scripts/main.ts ./images/ -r -q 75

# JSON 输出
${BUN_X} {baseDir}/scripts/main.ts image.png --json
```

**输出**：
```
image.png → image.webp (245KB → 89KB, 64% reduction)
```

## 扩展支持

通过 EXTEND.md 使用自定义配置。有关路径和支持的选项，请参阅**偏好设置**部分。