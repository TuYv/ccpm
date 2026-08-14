---
name: configure
description: Sets up or edits the plugin configuration file interactively. Use on first-time setup, when config is missing, or when the user wants to change settings.
argument-hint: "[setup | edit | show | validate | reset]"
model: sonnet
effort: low
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
  - Glob
---
## 你的任务

**输入**：$ARGUMENTS

根据参数进行路由：
- `setup` 或无参数 → 交互式首次设置
- `edit` → 编辑特定设置
- `show` → 显示当前配置
- `validate` → 检查配置是否存在问题
- `reset` → 删除配置并重新开始

---

# 插件配置 Skill

你帮助用户设置和管理其 `~/.bitwize-music/config.yaml` 配置。

## 配置位置

```
~/.bitwize-music/config.yaml
```

## 命令

### `/configure` 或 `/configure setup`

交互式首次设置。引导用户创建配置。

**步骤：**

1. 检查 `~/.bitwize-music/config.yaml` 是否存在
2. 如果存在，询问用户是要覆盖还是改为编辑
3. 如果创建新配置：
   - 根据需要创建 `~/.bitwize-music/` 目录
   - 以交互方式询问每项必需设置
   - 写入配置文件
   - 验证结果

**需要询问的必需设置：**
1. `artist.name` - “你的艺人/项目名称是什么？”
2. `paths.content_root` - “专辑和项目应存储在哪里？（例如：~/music-projects）”
3. `paths.audio_root` - “母带音频文件应存放在哪里？（例如：~/music-projects/audio）”
4. `paths.documents_root` - “研究文档/PDF 应存放在哪里？（例如：~/music-projects/documents）”

**可选设置：**
5. `artist.genres` - “你的主要音乐类型是什么？（用逗号分隔，或跳过）”
6. `urls.soundcloud` - “SoundCloud 个人资料 URL？（或跳过）”

**第 5 步：覆盖文件目录（可选）**

询问：
> 你可以选择提供一个包含覆盖文件的目录路径。
> 你可以在此处自定义工作流和 Skill，而不会与插件更新发生冲突。
>
> 可以创建的覆盖文件：
>   - CLAUDE.md（自定义工作流指令）
>   - pronunciation-guide.md（艺人姓名、角色名称）
>   - explicit-words.md（自定义露骨词汇列表）
>
> 默认值：~/music-projects/overrides
>
> 输入路径（或按 Enter 使用默认值）：

如果用户提供了路径：
- 添加到配置：`paths.overrides: "[user-path]"`

如果用户按 Enter（接受默认值）：
- 添加到配置：`paths.overrides: "~/music-projects/overrides"`
- 告知用户：“注意：该目录目前不需要存在。当你想进行自定义时再创建覆盖文件即可。”

**第 6 步：专辑创意文件（可选）**

询问：
> 你可以选择提供一个用于记录专辑创意的文件路径。
> 该文件由 /bitwize-music:album-ideas Skill 管理，用于头脑风暴和规划。
>
> 默认值：~/music-projects/IDEAS.md
>
> 输入路径（或按 Enter 使用默认值）：

如果用户提供了路径：
- 添加到配置：`paths.ideas_file: "[user-path]"`

如果用户按 Enter（接受默认值）：
- 添加到配置：`paths.ideas_file: "~/music-projects/IDEAS.md"`
- 告知用户：“注意：该文件目前不需要存在。album-ideas Skill 会在首次使用时创建它。”

**交互示例：**
```
Let's set up your bitwize-music configuration.

What's your artist/project name?
> Neon Circuits

Where should albums and projects be stored?
(This is where your album folders, lyrics, and research will live)
> ~/music-projects

Where should mastered audio files go?
> ~/music-projects/audio

Where should research documents/PDFs go?
> ~/music-projects/documents

What are your primary genres? (comma-separated, or press Enter to skip)
> electronic, synthwave

SoundCloud profile URL? (or press Enter to skip)
> https://soundcloud.com/neon-circuits

Overrides directory path? (press Enter for default: ~/music-projects/overrides)
> [Enter]

Album ideas file path? (press Enter for default: ~/music-projects/IDEAS.md)
> [Enter]

Creating config at ~/.bitwize-music/config.yaml...

✓ Configuration saved!

Your settings:
  Artist: Neon Circuits
  Content: ~/music-projects
  Audio: ~/music-projects/audio
  Documents: ~/music-projects/documents
  Genres: electronic, synthwave
  SoundCloud: https://soundcloud.com/neon-circuits
  Overrides: ~/music-projects/overrides (will be used if created)
  Ideas File: ~/music-projects/IDEAS.md (will be created when first used)

You're ready to start creating albums!
```

### `/configure edit`

编辑特定设置，无需重新创建整个配置。

**步骤：**
1. 读取现有配置
2. 显示当前值
3. 询问用户想要更改什么
4. 仅更新该项设置
5. 验证并保存

**示例：**
```
Current configuration:

  artist.name: Neon Circuits
  paths.content_root: ~/music-projects
  paths.audio_root: ~/music-projects/audio
  paths.documents_root: ~/music-projects/documents
  artist.genres: [electronic, synthwave]
  urls.soundcloud: https://soundcloud.com/neon-circuits

What would you like to change?
```

### `/configure show`

以易读的格式显示当前配置。

**步骤：**
1. 读取 `~/.bitwize-music/config.yaml`
2. 在格式化表格中显示所有设置
3. 标注缺失的必需设置

**输出示例：**
```
bitwize-music Configuration
Location: ~/.bitwize-music/config.yaml

┌─────────────────────┬────────────────────────────────────┐
│ Setting             │ Value                              │
├─────────────────────┼────────────────────────────────────┤
│ artist.name         │ Neon Circuits                      │
│ artist.genres       │ electronic, synthwave              │
│ paths.content_root  │ ~/music-projects                   │
│ paths.audio_root    │ ~/music-projects/audio             │
│ paths.documents_root│ ~/music-projects/documents         │
│ paths.overrides     │ ~/music-projects/overrides         │
│ paths.ideas_file    │ ~/music-projects/IDEAS.md          │
│ urls.soundcloud     │ https://soundcloud.com/neon-circuits│
│ generation.service  │ suno                               │
└─────────────────────┴────────────────────────────────────┘

✓ All required settings present
```

### `/configure validate`

检查配置是否存在问题。

**检查项：**
1. 配置文件存在
2. 所有必需字段均已提供
3. 路径有效（目录已存在或可以创建）
4. YAML 中没有语法错误

**输出示例：**
```
Validating ~/.bitwize-music/config.yaml...

✓ Config file exists
✓ artist.name: Neon Circuits
✓ paths.content_root: ~/music-projects (exists)
✓ paths.audio_root: ~/music-projects/audio (exists)
✓ paths.documents_root: ~/music-projects/documents (will be created)
✓ paths.overrides: ~/music-projects/overrides (will be used if created)
✓ paths.ideas_file: ~/music-projects/IDEAS.md (will be created when first used)
✓ generation.service: suno

All checks passed!
```

或存在问题时：
```
Validating ~/.bitwize-music/config.yaml...

✓ Config file exists
✓ artist.name: Neon Circuits
✗ paths.content_root: not set (required)
✓ paths.audio_root: ~/music-projects/audio
✗ paths.documents_root: /invalid/path (directory doesn't exist)

2 issues found. Run /configure edit to fix.
```

### `/configure reset`

删除配置，并可选择重新开始。

**步骤：**
1. 确认用户确实想要重置
2. 将现有配置备份到 `config.yaml.bak`
3. 删除 `~/.bitwize-music/config.yaml`
4. 询问用户是否想要立即运行设置流程

**示例：**
```
⚠️  This will delete your configuration at ~/.bitwize-music/config.yaml

Current config will be backed up to config.yaml.bak

Are you sure you want to reset? (yes/no)
```

如果是：
```
✓ Backed up to ~/.bitwize-music/config.yaml.bak
✓ Deleted ~/.bitwize-music/config.yaml

Config has been reset.

Would you like to set up a new config now? (yes/no)
```

---

## 配置模板

创建新配置时，请使用以下结构：

```yaml
# bitwize-music Plugin Configuration
# Generated by /configure

artist:
  name: "{artist_name}"
  genres:
    - "{genre1}"
    - "{genre2}"

paths:
  content_root: "{content_root}"
  audio_root: "{audio_root}"
  documents_root: "{documents_root}"
  overrides: "{overrides}"
  ideas_file: "{ideas_file}"

urls:
  soundcloud: "{soundcloud_url}"

generation:
  service: suno
```

---

## 边界情况

### 配置存在，但不是有效的 YAML
- 备份现有文件：`config.yaml.bak`
- 提议创建全新的配置

### 目录不存在
- 提议创建该目录："目录 ~/music-projects 不存在。是否创建？"

### 用户提供相对路径
- 扩展为绝对路径：`./projects` → `/Users/name/projects`
- 或使用 `~` 前缀：`~/projects`

---

## 请记住

- **保留原始大小写**——如果用户说的是 "bitwize"，就写 "bitwize"，而不是 "Bitwize"
- 显示路径时始终展开 `~`
- 如果目录不存在，则在获得许可后创建
- 覆盖现有配置前先进行备份
- 进行任何更改后都要验证
- 保持友好，并解释每项设置的作用