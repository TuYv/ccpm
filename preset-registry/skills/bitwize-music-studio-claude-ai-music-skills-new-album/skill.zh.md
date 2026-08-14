---
name: new-album
description: Creates a new album with the correct directory structure and templates. Use IMMEDIATELY when the user says 'make a new album' or similar, before any discussion.
argument-hint: <album-name> <genre>
model: haiku
allowed-tools:
  - Read
  - Bash
  - Write
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

创建一个包含所有必需文件和模板的新专辑目录结构。

---

# 新建专辑 Skill

你根据配置创建完整的专辑目录结构。

## 第 1 步：解析参数

预期格式：
- `<album-name> <genre>` — 标准专辑
- `<album-name> documentary <genre>` — 真实故事/纪录片专辑（创建 RESEARCH.md + SOURCES.md）

示例：
- `sample-album electronic`
- `my-new-album hip-hop`
- `protest-songs folk`
- `the-heist documentary hip-hop`

有效流派：`${CLAUDE_PLUGIN_ROOT}/genres/` 下存在对应目录的任意流派。使用 slug 格式（小写、以连字符分隔）— 例如 `deep-house`、`crust-punk`、`k-pop`、`hip-hop`。

要检查流派是否有效，请验证 `${CLAUDE_PLUGIN_ROOT}/genres/{genre}/README.md` 是否存在。

**解析逻辑：**
1. 如果有 3 个参数且第二个是 `documentary`：album = arg1，genre = arg3，documentary = true
2. 如果有 2 个参数：album = arg1，genre = arg2，documentary = false
3. 如果有 2 个参数且两者都不匹配有效的流派 slug：请求用户澄清
4. 如果只有 1 个参数或没有参数：询问用户

**解析后，如果未设置 documentary 标志，请询问：**
“这是纪录片/真实故事专辑吗？（这会添加研究和来源模板。）”

如果缺少参数，请询问：
```
Usage: /new-album <album-name> <genre>
       /new-album <album-name> documentary <genre>

Example: /new-album sample-album electronic
         /new-album the-heist documentary hip-hop
         /new-album night-drive deep-house

Genre must match a directory under genres/ (use slug form: deep-house, crust-punk, etc.)
```

## 第 2 步：通过 MCP 创建专辑

调用 `create_album_structure(album_slug, genre, documentary)` — 通过一次调用创建包含模板的完整目录结构。

- 在 `{content_root}/artists/{artist}/albums/{genre}/{album-name}/` 创建内容目录
- 将专辑模板复制为 README.md
- 创建包含模板的 `tracks/` 和 `promo/` 目录
- 对于纪录片专辑（`documentary: true`）：还会创建 RESEARCH.md 和 SOURCES.md
- 返回 `{created: bool, path: str, files: [...]}`
- 如果该专辑 slug 已存在于任意流派下（slug 全局唯一），则返回错误，并指出现有流派和路径

**注意**：不会创建 Audio 和 documents 目录（这些目录会在 import-audio/import-art 需要时创建）。

## 第 3 步：确认

报告：
```
Created album: {album-name}
Location: {album_path}

Files created:
- README.md (album template)
- tracks/ (empty, ready for track files)
- promo/ (social media copy templates)

Next steps:
  Option 1 - Interactive (Recommended):
    Run /bitwize-music:album-conceptualizer to design your album concept
    through the 7 Planning Phases.

  Option 2 - Manual:
    1. Edit README.md with your album concept
    2. Create tracks with /import-track or manually in tracks/

Tip: For OST/soundtrack albums with a mix of vocal and instrumental
tracks, the album-conceptualizer will ask about the vocal/instrumental
split per track. Set `instrumental: true` in track frontmatter for
instrumental tracks — they skip the lyrics workflow and go directly
to /bitwize-music:suno-engineer.
```

## 错误处理

**配置文件缺失：**
```
Error: Config not found at ~/.bitwize-music/config.yaml
Run /configure to set up.
```

**无效的流派：**
```
Error: Invalid genre "{genre}"

No genre directory found at genres/{genre}/. Use a valid genre slug (e.g. hip-hop, deep-house, grindcore).
Check genres/INDEX.md for the full list.
```

**专辑已存在（无论属于哪个流派——slug 在全局范围内必须唯一）：**
```
Error: Album slug '{album-name}' already exists under genre '{existing-genre}': {existing_path}

Album slugs are unique across all genres — choose a different name, or
rename the existing album with /bitwize-music:rename.
```

**未找到模板：**
```
Error: Templates not found. Is the plugin installed correctly?
Expected at: ${CLAUDE_PLUGIN_ROOT}/templates/
```

---

## 示例

```
/new-album sample-album electronic
```

配置内容如下：
```yaml
paths:
  content_root: ~/bitwize-music
artist:
  name: bitwize
```

结果：
```
Created album: sample-album
Location: ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/

Files created:
- README.md (album template)
- tracks/ (empty, ready for track files)

Next steps:
  Option 1 - Interactive (Recommended):
    Run /bitwize-music:album-conceptualizer to design your album concept
    through the 7 Planning Phases.

  Option 2 - Manual:
    1. Edit README.md with your album concept
    2. Create tracks with /import-track or manually in tracks/
```

---

## 真实故事专辑

如果用户提到这是一张纪录片式或真实故事专辑：

```
/new-album the-heist documentary hip-hop
```

调用 `create_album_structure(album_slug, genre, documentary=true)` 会自动根据模板创建 RESEARCH.md 和 SOURCES.md。

报告：
```
Created album: the-heist (documentary)
Location: ~/bitwize-music/artists/bitwize/albums/hip-hop/the-heist/

Files created:
- README.md (album template)
- RESEARCH.md (research template)
- SOURCES.md (sources template)
- tracks/ (empty, ready for track files)
```

---

## 常见错误

### ❌ 不要：手动创建目录

**错误：**
```bash
# Manual mkdir, config reading, template copying
cat ~/.bitwize-music/config.yaml
mkdir -p ~/music-projects/artists/bitwize/albums/...
cp templates/album.md ...
```

**正确：**
```
# Single MCP call handles everything
create_album_structure(album_slug, genre, documentary)
```

MCP 工具会自动读取配置、解析路径、创建目录并复制模板。

### ✅ 应当：使用具体的流派 slug

只要某个流派在 `genres/` 下有对应目录，就是有效的。请使用最符合要求的具体流派：

```bash
/new-album my-album boom-bap        # has its own genre directory
/new-album my-album deep-house      # specific subgenre
/new-album my-album grindcore       # specific subgenre
/new-album my-album hip-hop         # broad category also works
```