---
name: help
description: Shows available skills, common workflows, and quick reference for the plugin. Use when the user asks for help, what skills are available, or how to do something.
model: haiku
allowed-tools: []
---
## bitwize-music 插件帮助

以清晰、有条理的格式向用户显示此帮助信息。

---

### 入门指南

**初次使用此插件？**
- `/bitwize-music:tutorial` - 交互式引导专辑创作
- `/bitwize-music:configure` - 设置配置文件
- `/bitwize-music:about` - 了解 bitwize 和此插件

**继续现有工作：**
- `/bitwize-music:resume <album-name>` - 查找专辑并查看状态/后续步骤

---

### 按类别划分的技能

**专辑与曲目创作**
- `/bitwize-music:album-ideas` - 跟踪和管理专辑创意
- `/bitwize-music:promote-idea` - 将待处理创意转换为完整专辑（一次完成）
- `/bitwize-music:new-album` - 创建具有目录结构的新专辑
- `/bitwize-music:album-conceptualizer` - 设计专辑概念和曲目列表架构
- `/bitwize-music:lyric-writer` - 撰写/审阅歌词，修正韵律
- `/bitwize-music:lyric-refiner` - 多轮润色歌词并增强专辑连贯性
- `/bitwize-music:suno-engineer` - Suno 技术提示词设计和流派选择
- `/bitwize-music:genre-creator` - 向资料库添加新的流派文档

**研究与来源**
- `/bitwize-music:researcher` - 主要研究协调与事实核查
- `/bitwize-music:document-hunter` - 自动搜索/下载文档
- `/bitwize-music:researchers-legal` - 法庭文件、起诉书
- `/bitwize-music:researchers-gov` - DOJ/FBI/SEC 发布的信息
- `/bitwize-music:researchers-tech` - 项目历史、变更日志
- `/bitwize-music:researchers-journalism` - 调查性报道
- `/bitwize-music:researchers-security` - 恶意软件分析、CVE
- `/bitwize-music:researchers-financial` - SEC 申报文件、市场数据
- `/bitwize-music:researchers-historical` - 档案、时间线
- `/bitwize-music:researchers-biographical` - 个人背景
- `/bitwize-music:researchers-primary-source` - 推文、博客、论坛
- `/bitwize-music:researchers-verifier` - 质量控制、引用验证
- `/bitwize-music:verify-sources` - 人工来源验证关卡（生成前必须完成）

**质量控制**
- `/bitwize-music:lyric-reviewer` - 生成前质量控制关卡（14 项检查清单）
- `/bitwize-music:pronunciation-specialist` - 扫描发音风险
- `/bitwize-music:explicit-checker` - 验证露骨内容标记
- `/bitwize-music:plagiarism-checker` - 检查歌词中是否有与现有歌曲相匹配的短语
- `/bitwize-music:voice-checker` - 检测歌词和文案中的 AI 写作模式
- `/bitwize-music:pre-generation-check` - 最终生成前检查点（6 个关卡）
- `/bitwize-music:validate-album` - 验证专辑结构和路径

**制作与发行**
- `/bitwize-music:album-art-director` - 视觉概念和 AI 绘图提示词
- `/bitwize-music:mix-engineer` - 母带处理前对各分轨音频进行润色
- `/bitwize-music:mastering-engineer` - 音频母带处理指导
- `/bitwize-music:promo-director` - 生成用于社交媒体的宣传视频
- `/bitwize-music:promo-writer` - 生成针对特定平台的社交媒体文案
- `/bitwize-music:promo-reviewer` - 发布前审阅和润色宣传文案
- `/bitwize-music:cloud-uploader` - 将宣传视频上传至 Cloudflare R2 或 AWS S3
- `/bitwize-music:sheet-music-publisher` - 将音频转换为乐谱
- `/bitwize-music:release-director` - 协调发行与分发

**文件管理**
- `/bitwize-music:import-track` - 将曲目 .md 文件移动到专辑位置
- `/bitwize-music:import-audio` - 将音频文件移动到专辑位置
- `/bitwize-music:import-art` - 将专辑封面放置到正确位置
- `/bitwize-music:rename` - 重命名专辑或曲目（会更新 slug 和所有路径）
- `/bitwize-music:clipboard` - 将曲目歌词/提示词复制到剪贴板

**工作流与状态**
- `/bitwize-music:session-start` - 运行会话启动流程
- `/bitwize-music:next-step` - 获取建议的下一步操作
- `/bitwize-music:album-dashboard` - 可视化专辑进度仪表板

**系统与维护**
- `/bitwize-music:configure` - 编辑插件配置
- `/bitwize-music:setup` - 检测环境并安装插件依赖项
- `/bitwize-music:health-check` - 检查 venv 和 Skill 注册状态
- `/bitwize-music:test` - 运行自动化测试
- `/bitwize-music:help` - 显示此帮助信息（你正在查看！）
- `/bitwize-music:about` - 关于 bitwize 和此插件

---

### 常用工作流

**创建新专辑：**
1. `/bitwize-music:new-album <name> <genre>` - 创建结构（如果创意位于 `IDEAS.md` 中，也可以使用 `/bitwize-music:promote-idea "<idea title>"`）
2. 完成 7 个规划阶段的问题（概念、声音方向等）
3. 为每首曲目创作歌词
4. 生成前运行 `/bitwize-music:lyric-reviewer`
5. 在 Suno 中生成，并记录结果
6. 使用 `/bitwize-music:mix-engineer` 润色分轨，然后使用 `/bitwize-music:mastering-engineer` 进行母带处理
7. [可选] 使用 `/bitwize-music:promo-director` 生成宣传视频
8. [可选] 使用 `/bitwize-music:cloud-uploader` 上传到云端
9. 使用 `/bitwize-music:release-director` 发布

**真实故事专辑（包含研究）：**
1. 使用研究类 Skill 收集资料来源
2. 所有资料来源在制作前都必须由人工核实
3. 将曲目状态从 `❌ Pending` 更新为 `✅ Verified (DATE)`
4. 然后继续进行歌词创作和生成

**继续现有工作：**
1. `/bitwize-music:resume <album-name>` - 获取详细状态
2. 按照建议的后续步骤操作

---

### 快速提示

- **配置文件：** `~/.bitwize-music/config.yaml`（始终读取此文件以获取路径）
- **发音：** 对难读的单词使用音标式拼写（参见发音指南）
- **露骨内容：** 对以下词语使用标记：fuck、shit、bitch、cunt、cock、dick、pussy 等
- **母带目标：** 流媒体平台采用 -14 LUFS、-1.0 dBTP
- **宣传视频：** 在母带处理后生成，用于社交媒体的 15 秒竖屏视频（9:16）
- **曲目状态流程：** 未开始 → 进行中 → 已生成 → 最终版
- **专辑状态流程：** 概念 → 进行中 → 已完成 → 已发布

---

### 关键文档

- **CLAUDE.md** - 主要工作流说明
- **README.md** - 项目概述
- `${CLAUDE_PLUGIN_ROOT}/reference/suno/` - Suno V5 指南、发音说明和技巧
- `${CLAUDE_PLUGIN_ROOT}/reference/workflows/` - 详细工作流步骤
- `${CLAUDE_PLUGIN_ROOT}/reference/mastering/` - 音频母带处理文档
- `${CLAUDE_PLUGIN_ROOT}/templates/` - 新内容模板
- `${CLAUDE_PLUGIN_ROOT}/skills/[skill-name]/SKILL.md` - 各个 Skill 的文档

---

### 获取帮助

- 随时使用此技能：`/bitwize-music:help`
- 查看教程：`/bitwize-music:tutorial`
- 查看状态：`/bitwize-music:resume <album-name>`
- 询问 Claude：“我接下来应该做什么？”以获取指导