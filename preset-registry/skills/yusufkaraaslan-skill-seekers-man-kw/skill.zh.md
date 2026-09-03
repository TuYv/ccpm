---
name: golden-man-kw
description: Use when testing the man golden build
---
# Golden_Man_Kw Man Pages 技能

在测试 man golden build 时使用

## 何时使用此技能

当你需要执行以下操作时，使用此技能：
- 了解 golden_man_kw 命令行工具及其选项
- 查询命令语法与使用模式
- 查找常见命令调用的示例
- 查看可用的标志和环境变量
- 通过 SEE ALSO 参照探索相关命令

## 快速命令参考

### git-log

```
git log [<options>] [<revision-range>] [[--] <path>...]
```

### git-diff

```
git diff [<options>] [<commit>] [--] [<path>...]
```

## Man Page 概览

**Man Page 总数：**3

**内容构成：**

- **版本控制**：2 个 man page
- **其他**：1 个 man page

## 常用选项

*从所有 man page 中提取的 3 个选项*

### git-log

- `-p` -- 生成补丁输出。
- `--max-count=<number>` -- 限制输出的提交数量，它与 pathspec 过滤、历史简化以及 --fol... 之间存在微妙的交互

### curl

- `-s, --silent` -- 静默模式。

## 示例

*从 man page 中提取的 3 个示例*

### git-log

显示最近三个提交

```bash
git log -3
```

### git-log

仅含文字说明、不含命令的示例

### curl

获取一个页面

```bash
curl https://example.com
```

## 相关命令（SEE ALSO）

- `git-diff`
- `git-log`
- `gitk`

## 文档统计

- **Man Page 总数**：3
- **选项总数**：3
- **示例总数**：3
- **交叉引用**：3

## 导航

**参考文件：**

- `references/version_control_01.md` -- 版本控制
- `references/other_02.md` -- 其他

完整的参考结构请参见 `references/index.md`。

---

**由 Skill Seekers 生成** | Man Page 抓取器
