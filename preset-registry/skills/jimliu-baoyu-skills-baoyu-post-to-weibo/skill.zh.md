---
name: baoyu-post-to-weibo
description: Posts content to Weibo (微博). Supports regular posts with text, images, and videos, and headline articles (头条文章) with Markdown input via Chrome CDP. Use when user asks to "post to Weibo", "发微博", "发布微博", "publish to Weibo", "share on Weibo", "写微博", or "微博头条文章".
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-weibo
    requires:
      anyBins:
        - bun
        - npx
---
# 发布到微博

通过真实 Chrome 浏览器将文本、图片、视频和长文发布到微博（绕过反机器人检测）。

## 脚本目录

**重要**：所有脚本都位于此 skill 的 `scripts/` 子目录中。

**Agent 执行说明**：
1. 将此 SKILL.md 文件所在的目录路径确定为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 将本文档中的所有 `{baseDir}` 替换为实际路径
4. 解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果可用 `npx` → `npx -y bun`；否则建议安装 bun

**脚本参考**：
| 脚本 | 用途 |
|--------|---------|
| `scripts/weibo-post.ts` | 普通帖子（文本 + 图片） |
| `scripts/weibo-article.ts` | 头条文章发布（Markdown） |
| `scripts/copy-to-clipboard.ts` | 将内容复制到剪贴板 |
| `scripts/paste-from-clipboard.ts` | 发送真实粘贴按键 |

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md — 找到的第一个文件优先：

| 优先级 | 路径 | 作用域 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | 用户主目录 |

如果没有找到，则使用默认设置。

**EXTEND.md 支持**：默认 Chrome 配置文件

## 前置条件

- Google Chrome 或 Chromium
- `bun` 运行时
- 首次运行：手动登录微博（会保存会话）

---

## 普通帖子

文本 + 图片/视频（总计最多 18 个文件）。发布到微博首页。

```bash
${BUN_X} {baseDir}/scripts/weibo-post.ts "Hello Weibo!" --image ./photo.png
${BUN_X} {baseDir}/scripts/weibo-post.ts "Watch this" --video ./clip.mp4
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<text>` | 帖子内容（位置参数） |
| `--image <path>` | 图片文件（可重复） |
| `--video <path>` | 视频文件（可重复） |
| `--profile <dir>` | 自定义 Chrome 配置文件 |

**注意**：脚本会打开浏览器并填入内容。用户检查后手动发布。

---

## 头条文章（头条文章）

发布到 `https://card.weibo.com/article/v3/editor` 的长篇 Markdown 文章。

```bash
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md --cover ./cover.jpg
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<markdown>` | Markdown 文件（位置参数） |
| `--cover <path>` | 封面图片 |
| `--title <text>` | 覆盖标题（最多 32 个字符，超出时截断） |
| `--summary <text>` | 覆盖摘要（最多 44 个字符，超出时自动重新生成） |
| `--profile <dir>` | 自定义 Chrome 配置文件 |

**Frontmatter**：YAML front matter 支持 `title`、`summary`、`cover_image`。

**字符限制**：
- 标题：最多 32 个字符（超出时截断并显示警告）
- 摘要/导语：最多 44 个字符（超出时根据内容自动重新生成）

**Markdown-to-HTML**：将 markdown 转换为 HTML 时不要传递任何 `--theme` 参数。使用默认主题（不提供 theme 参数）。

**文章工作流程**：
1. 打开 `https://card.weibo.com/article/v3/editor`
2. 点击“写文章”按钮，等待编辑器变为可编辑状态
3. 填写标题（验证 32 字符限制）
4. 填写摘要/导语（验证 44 字符限制）
5. 通过粘贴将 HTML 内容插入 ProseMirror 编辑器
6. 逐个替换图片占位符（复制图片 → 选择占位符 → 粘贴）

**成文检查**：所有图片插入后，脚本会自动验证：
- 编辑器内容中剩余的 `WBIMGPH_` 占位符
- 预期图片数量与实际图片数量

如果检查失败（输出中出现警告），请在用户发布前告知其具体问题。

---

## 帖子类型选择

除非用户明确指定帖子类型：
- **Markdown 文件**（`.md`）→ **头条文章**（头条文章）
- **纯文本** / 带图片的文本 → **普通帖子**

## 故障排除

### Chrome 调试端口未就绪

如果脚本失败并显示 `Chrome debug port not ready` 或 `Unable to connect`，请仅终止 CDP Chrome 实例（同时具有 `--remote-debugging-port` 和 baoyu-skills 配置文件的实例），然后重试：

```bash
pkill -f "remote-debugging-port.*baoyu-skills/chrome-profile" 2>/dev/null; sleep 2
```

**重要**：绝不要终止所有 Chrome 进程（`pkill -f "Google Chrome"`）。只能终止使用 baoyu-skills 配置文件目录、由 CDP 启动的 Chrome 实例。用户可能正开着普通 Chrome 窗口。

**注意**：遇到此错误时，应自动执行此操作——终止 CDP Chrome 实例，然后在不询问用户的情况下重试命令。

## 备注

- 首次运行：需要手动登录（会话会持久化）
- 所有脚本只会将内容填入浏览器，用户必须手动审核并发布
- 跨平台：macOS、Linux、Windows

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和支持的选项请参见**偏好设置**部分。