---
name: golden-man
description: Use when testing the man golden build
---
# Golden_Man Man Pages 技能

在测试 man 黄金构建版本时使用

## 何时使用此技能

当你需要完成以下操作时，请使用此技能：
- 了解 golden_man 命令行工具及其选项
- 查询命令语法与用法模式
- 查找常见命令调用的示例
- 查看可用的标志（flag）和环境变量
- 通过 SEE ALSO 引用探索相关命令

## 快速命令参考

### git-log

```
git log [<options>] [<revision-range>] [[--] <path>...]
```

### git-diff

```
git diff [<options>] [<commit>] [--] [<path>...]
```

## Man 手册页概览

**Man 手册页总数：** 3

**内容构成：**

- **Git**：2 个 man 手册页
- **Curl**：1 个 man 手册页

## 常用选项

*从所有 man 手册页中提取的 3 个选项*

### git-log

- `-p` -- 生成补丁（patch）输出。
- `--max-count=<number>` -- 限制输出的提交数量，与 pathspec 过滤、历史简化以及 --fol... 存在微妙的交互作用……

### curl

- `-s, --silent` -- 静默模式。

## 示例

*从 man 手册页中提取的 3 个示例*

### git-log

显示最近三次提交

```bash
git log -3
```

### git-log

纯文字示例，不含命令

### curl

抓取一个页面

```bash
curl https://example.com
```

## 相关命令（SEE ALSO）

- `git-diff`
- `git-log`
- `gitk`

## 文档统计

- **Man 手册页总数**：3
- **选项总数**：3
- **示例总数**：3
- **交叉引用数**：3

## 导航

**参考文件：**

- `references/git_01.md` -- Git
- `references/curl_02.md` -- Curl

完整的参考结构请参见 `references/index.md`。

---

**由 Skill Seekers 生成** | Man 手册页抓取器
