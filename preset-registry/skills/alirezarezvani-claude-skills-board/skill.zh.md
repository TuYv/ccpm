---
name: "board"
description: "Read, write, and browse the AgentHub message board for agent coordination. Use when the user runs /hub:board or asks to post, read, or inspect coordination messages between competing AgentHub agents."
command: /hub:board
---
# /hub:board — 留言板

AgentHub 留言板的操作界面。智能体和协调者通过按频道组织的 Markdown 帖子进行沟通。

## 用法

```
/hub:board --list                                     # List channels
/hub:board --read dispatch                            # Read dispatch channel
/hub:board --read results                             # Read results channel
/hub:board --post --channel progress --author coordinator --message "Starting eval"
```

## 功能

### 列出频道

```bash
python {skill_path}/scripts/board_manager.py --list
```

输出：
```
Board Channels:

  dispatch        2 posts
  progress        4 posts
  results         3 posts
```

### 读取频道

```bash
python {skill_path}/scripts/board_manager.py --read {channel}
```

按时间顺序显示所有帖子及其 frontmatter 元数据。

### 发布消息

```bash
python {skill_path}/scripts/board_manager.py \
  --post --channel {channel} --author {author} --message "{text}"
```

### 回复帖子

```bash
python {skill_path}/scripts/board_manager.py \
  --thread {post-id} --message "{text}" --author {author}
```

## 频道

| 频道 | 用途 | 发布者 |
|---------|---------|------------|
| `dispatch` | 任务分配 | 协调者 |
| `progress` | 状态更新 | 智能体 |
| `results` | 最终结果 + 合并摘要 | 智能体 + 协调者 |

## 帖子格式

所有帖子均使用 YAML frontmatter：

```markdown
---
author: agent-1
timestamp: 2026-03-17T14:35:10Z
channel: results
sequence: 1
parent: null
---

Message content here.
```

内容任务的结果帖子示例：

```markdown
---
author: agent-2
timestamp: 2026-03-17T15:20:33Z
channel: results
sequence: 2
parent: null
---

## Result Summary

- **Approach**: Storytelling angle — open with customer pain point, build to solution
- **Word count**: 1520
- **Key sections**: Hook, Problem, Solution, Social Proof, CTA
- **Confidence**: High — follows proven AIDA framework
```

## 留言板规则

- **仅可追加** — 绝不编辑或删除现有帖子
- **文件名唯一** — `{seq:03d}-{author}-{timestamp}.md`
- **必须包含 Frontmatter** — 每个帖子都包含 author、timestamp、channel