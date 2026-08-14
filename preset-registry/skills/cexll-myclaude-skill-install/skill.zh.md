---
name: skill-install
description: Install Claude skills from GitHub repositories with automated security scanning. Triggers when users want to install skills from a GitHub URL, need to browse available skills in a repository, or want to safely add new skills to their Claude environment.
---
# 技能安装

## 概述

从 GitHub 仓库安装 Claude 技能，并通过内置安全扫描防范恶意代码、后门和漏洞。

## 使用时机

当用户执行以下操作时触发此技能：
- 提供 GitHub 仓库 URL 并希望安装技能
- 要求“从 GitHub 安装技能”
- 希望浏览并选择仓库中的技能
- 需要向其 Claude 环境添加新技能

## 工作流程

### 第 1 步：解析 GitHub URL

接受用户提供的 GitHub 仓库 URL。该 URL 应指向包含 `skills/` 目录的仓库。

支持的 URL 格式：
- `https://github.com/user/repo`
- `https://github.com/user/repo/tree/main/skills`
- `https://github.com/user/repo/tree/branch-name/skills`

提取：
- 仓库所有者
- 仓库名称
- 分支（如未指定，默认为 `main`）

### 第 2 步：获取技能列表

使用 WebFetch 工具从 GitHub 获取技能目录列表。

GitHub API 端点格式：
```
https://api.github.com/repos/{owner}/{repo}/contents/skills?ref={branch}
```

解析响应以提取：
- 技能目录名称
- 每个技能都应是包含 SKILL.md 文件的子目录

### 第 3 步：向用户展示技能

使用 AskUserQuestion 工具让用户选择要安装的技能。

设置 `multiSelect: true` 以允许多选。

展示每个技能的：
- 技能名称（目录名称）
- 简短描述（如果 SKILL.md frontmatter 中提供）

### 第 4 步：获取技能内容

对于每个选定的技能，获取技能目录中的所有文件：

1. 获取技能目录的文件树
2. 下载所有文件（SKILL.md、scripts/、references/、assets/）
3. 存储完整的技能内容以进行安全分析

通过 GitHub API 使用 WebFetch：
```
https://api.github.com/repos/{owner}/{repo}/contents/skills/{skill_name}?ref={branch}
```

对于每个文件，获取原始内容：
```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/skills/{skill_name}/{file_path}
```

### 第 5 步：安全扫描

**关键：** 安装前，对每个技能执行全面的安全分析。

从 `references/security_scan_prompt.md` 读取安全扫描提示词模板，并使用该模板分析技能内容。

检查以下问题：
1. **恶意命令执行** - eval、exec、使用 shell=True 的 subprocess
2. **后门检测** - 混淆代码、可疑的网络请求
3. **凭据窃取** - 访问 ~/.ssh、~/.aws、环境变量
4. **未经授权的网络访问** - 向可疑域名发起外部请求
5. **文件系统滥用** - 破坏性操作、未经授权的写入
6. **权限提升** - 尝试使用 sudo、修改系统
7. **供应链攻击** - 安装可疑软件包

输出安全分析，包含：
- 安全状态：SAFE / WARNING / DANGEROUS
- 风险级别：LOW / MEDIUM / HIGH / CRITICAL
- 包含文件位置和严重程度的详细发现
- 建议：APPROVE / APPROVE_WITH_WARNINGS / REJECT

### 步骤 6：用户决定

根据安全扫描结果：

**如果为 SAFE (APPROVE)：**
- 直接继续安装

**如果为 WARNING (APPROVE_WITH_WARNINGS)：**
- 向用户显示安全警告
- 使用 AskUserQuestion 进行确认：“检测到安全警告。是否要继续安装？”
- 选项：“是，仍然安装” / “否，跳过此技能”

**如果为 DANGEROUS (REJECT)：**
- 显示严重安全问题
- 拒绝安装
- 解释该技能为何危险
- 对于严重性为 CRITICAL 的问题，不得提供覆盖选项

### 步骤 7：安装技能

对于获准安装的技能，将其安装到 `~/.claude/skills/`：

1. 创建技能目录：`~/.claude/skills/{skill_name}/`
2. 写入所有技能文件，并保持目录结构
3. 确保文件权限正确（脚本应具有可执行权限）
4. 验证 SKILL.md 存在且具有有效的 frontmatter

使用 Write 工具创建文件。

### 步骤 8：确认

安装完成后，提供摘要：
- 成功安装的技能列表
- 已跳过的技能列表（如有）及其原因
- 位置：`~/.claude/skills/`
- 后续步骤：“这些技能现在已可用。请重启 Claude 或直接使用它们。”

## 使用示例

**用户：**“从 https://github.com/example/claude-skills 安装技能”

**助手：**
1. 从仓库获取技能列表
2. 展示可用技能：“skill-a”、“skill-b”、“skill-c”
3. 用户选择“skill-a”和“skill-b”
4. 对每个技能执行安全扫描
5. skill-a：SAFE——继续安装
6. skill-b：WARNING（发起 HTTP 请求）——请求用户确认
7. 将获准安装的技能安装到 ~/.claude/skills/
8. 确认：“成功安装：skill-a、skill-b”

## 安全说明

- **绝不跳过安全扫描**——安装前始终分析技能
- **保持谨慎**——如有疑问，将其标记为 WARNING 并由用户决定
- **严重问题会阻止安装**——严重性为 CRITICAL 的发现无法被覆盖
- **透明性**——始终向用户展示安全扫描中发现的内容
- **沙箱隔离**——提醒用户，技能以 Claude 的权限运行

## 资源

### references/security_scan_prompt.md

包含详细的安全分析提示词模板，其中包括：
- 要检查的完整安全类别列表
- 输出格式要求
- 安全、可疑和危险技能的分析示例
- APPROVE/REJECT 建议的判定标准

执行安全扫描时加载此文件，以确保分析全面。