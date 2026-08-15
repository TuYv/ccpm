---
name: repomix-unmixer
description: Extracts files from repomix-packed repositories, restoring original directory structures from XML/Markdown/JSON formats. Activates when users need to unmix repomix files, extract packed repositories, restore file structures from repomix output, or reverse the repomix packing process.
---
# Repomix 解包器

## 概述

此技能可从 Repomix 打包的仓库中提取文件，并恢复其原始目录结构。Repomix 会将整个仓库打包为单个适合 AI 处理的文件（XML、Markdown 或 JSON），而此技能可逆转该过程，将其还原为各个独立文件。

## 何时使用此技能

此技能会在以下情况下激活：
- 解包 Repomix 输出文件（*.xml、*.md、*.json）
- 从已打包的仓库中提取文件
- 从 Repomix 格式恢复原始目录结构
- 审查或验证 Repomix 打包的内容
- 将 Repomix 输出转换回可用文件

## 核心工作流程

### 标准解包流程

使用随附的 `unmix_repomix.py` 脚本，从 Repomix 文件中提取所有文件并恢复原始目录结构：

```bash
python3 scripts/unmix_repomix.py \
  "<path_to_repomix_file>" \
  "<output_directory>"
```

**参数：**
- `<path_to_repomix_file>`：Repomix 输出文件（XML、Markdown 或 JSON）的路径
- `<output_directory>`：提取文件的目标目录（如果不存在则会创建）

**示例：**
```bash
python3 scripts/unmix_repomix.py \
  "/path/to/repomix-output.xml" \
  "/tmp/extracted-files"
```

### 脚本的功能

1. **解析** Repomix 文件格式（XML、Markdown 或 JSON）
2. **提取** 每个文件的路径和内容
3. **创建** 原始目录结构
4. **写入** 每个文件至其原始位置
5. **报告** 提取进度和统计信息

### 输出

该脚本将：
- 创建所有必要的父目录
- 提取所有文件并保持其路径不变
- 打印每个文件的提取进度
- 显示已提取文件的总数

**输出示例：**
```
Unmixing /path/to/skill.xml...
Output directory: /tmp/extracted-files

✓ Extracted: github-ops/SKILL.md
✓ Extracted: github-ops/references/api_reference.md
✓ Extracted: markdown-tools/SKILL.md
...

✅ Successfully extracted 20 files!

Extracted files are in: /tmp/extracted-files
```

## 支持的格式

### XML 格式（默认）

Repomix XML 格式结构：
```xml
<file path="relative/path/to/file.ext">
file content here
</file>
```

该脚本使用正则表达式匹配 `<file path="...">content</file>` 块。

### Markdown 格式

对于使用文件标记的 Markdown 风格 Repomix 输出：
```markdown
## File: relative/path/to/file.ext
```
文件内容
```
```

有关详细的格式规范，请参阅 `references/repomix-format.md`。

### JSON 格式

对于 JSON 风格的 Repomix 输出：
```json
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file content here"
    }
  ]
}
```

## 常见使用场景

### 使用场景 1：解包 Claude Skills

提取以 Repomix 文件形式共享的技能：

```bash
python3 scripts/unmix_repomix.py \
  "/path/to/skills.xml" \
  "/tmp/unmixed-skills"
```

然后审查、验证或安装提取出的技能。

### 使用场景 2：提取仓库以供审查

提取已打包的仓库，以审查其结构和内容：

```bash
python3 scripts/unmix_repomix.py \
  "/path/to/repo-output.xml" \
  "/tmp/review-repo"

# Review the structure
tree /tmp/review-repo
```

### 用例 3：恢复工作文件

将 repomix 备份中的文件恢复到工作目录：

```bash
python3 scripts/unmix_repomix.py \
  "/path/to/backup.xml" \
  "~/workspace/restored-project"
```

## 验证工作流

解包后，验证提取的文件是否正确：

1. **检查文件数量**：验证提取的文件数量是否符合预期
2. **检查结构**：使用 `tree` 或 `ls -R` 检查目录布局
3. **抽查内容**：读取几个关键文件以验证内容完整性
4. **运行验证**：对于技能，使用 skill-creator 验证工具

有关详细的验证流程，请参阅 `references/validation-workflow.md`，尤其是解包 Claude 技能时。

## 重要原则

### 始终指定输出目录

始终提供输出目录，以免弄乱当前工作目录：

```bash
# Good: Explicit output directory
python3 scripts/unmix_repomix.py \
  "input.xml" "/tmp/output"

# Avoid: Default output (may clutter current directory)
python3 scripts/unmix_repomix.py "input.xml"
```

### 使用临时目录进行检查

先提取到临时目录中进行检查：

```bash
# Extract to /tmp for review
python3 scripts/unmix_repomix.py \
  "skills.xml" "/tmp/review-skills"

# Review the contents
tree /tmp/review-skills

# If satisfied, copy to final destination
cp -r /tmp/review-skills ~/.claude/skills/
```

### 覆盖前进行验证

切勿在未经检查的情况下直接提取到重要目录：

```bash
# Bad: Might overwrite existing files
python3 scripts/unmix_repomix.py \
  "repo.xml" "~/workspace/my-project"

# Good: Extract to temp, review, then move
python3 scripts/unmix_repomix.py \
  "repo.xml" "/tmp/extracted"
# Review, then:
mv /tmp/extracted ~/workspace/my-project
```

## 故障排除

### 未提取任何文件

**问题**：脚本执行完成，但未提取任何文件。

**可能的原因：**
- 文件格式错误（不是 repomix 文件）
- 不支持该 repomix 格式版本
- 文件路径模式不匹配

**解决方案：**
1. 验证输入文件是否为 repomix 输出文件
2. 检查格式（XML/Markdown/JSON）
3. 手动检查文件结构
4. 有关格式的详细信息，请参阅 `references/repomix-format.md`

### 权限错误

**问题**：无法写入输出目录。

**解决方案：**
```bash
# Ensure output directory is writable
mkdir -p /tmp/output
chmod 755 /tmp/output

# Or use a directory you own
python3 scripts/unmix_repomix.py \
  "input.xml" "$HOME/extracted"
```

### 编码问题

**问题**：提取的文件中特殊字符显示为乱码。

**解决方案：**
该脚本默认使用 UTF-8 编码。如果问题仍然存在：
- 检查原始 repomix 文件的编码
- 验证文件是否正确创建
- 报告问题并提供具体的字符示例

### 路径已存在

**问题**：提取路径中已存在文件。

**解决方案：**
```bash
# Option 1: Use a fresh output directory
python3 scripts/unmix_repomix.py \
  "input.xml" "/tmp/output-$(date +%s)"

# Option 2: Clear the directory first
rm -rf /tmp/output && mkdir /tmp/output
python3 scripts/unmix_repomix.py \
  "input.xml" "/tmp/output"
```

## 最佳实践

1. **解压到临时目录** - 始终先解压到 `/tmp` 或类似目录中进行初步检查
2. **核对文件数量** - 检查解压出的文件数量是否符合预期
3. **检查结构** - 使用 `tree` 检查目录布局后再使用
4. **检查内容** - 抽查几个文件，确保内容完整无损
5. **使用验证工具** - 对于技能，在拆分后使用 skill-creator 进行验证
6. **保留原始文件** - 保留原始 repomix 文件作为备份

## 资源

### scripts/unmix_repomix.py

主要拆分脚本，其功能包括：
- 解析 repomix XML/Markdown/JSON 格式
- 使用正则表达式提取文件路径和内容
- 自动创建目录结构
- 将文件写入其原始位置
- 报告提取进度和统计信息

该脚本完全独立，仅需要 Python 3 标准库。

### references/repomix-format.md

全面介绍 repomix 文件格式的文档，包括：
- XML 格式结构和示例
- Markdown 格式模式
- JSON 格式模式
- 文件路径编码规则
- 内容提取模式
- 格式版本差异

处理特定格式的问题或支持新版 repomix 时，请加载此参考资料。

### references/validation-workflow.md

针对提取内容的详细验证流程，包括：
- 文件数量核对步骤
- 目录结构验证
- 内容完整性检查
- 使用 skill-creator 工具进行技能专项验证
- 质量保证检查清单

当用户需要验证拆分后的技能或核实提取质量时，请加载此参考资料。