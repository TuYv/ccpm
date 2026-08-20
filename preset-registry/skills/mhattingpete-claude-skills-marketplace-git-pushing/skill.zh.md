---
name: git-pushing
description: Stage, commit, and push git changes with conventional commit messages. Use when user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work. Also activates when user says "push changes", "commit and push", "push this", "push to github", or similar git workflow requests.
---
# Git 推送工作流

暂存所有更改，创建符合约定式提交规范的提交，并推送到远程分支。

## 使用时机

当用户有以下行为时自动激活：
- 明确要求推送更改（“推送这个”“提交并推送”）
- 提到将工作保存到远程仓库（“保存到 github”“推送到远程仓库”）
- 完成一项功能并希望分享
- 使用“把这个推上去吧”或“提交这些更改”等表达

## 工作流

**始终使用脚本**——不要手动使用 git 命令：

```bash
bash skills/git-pushing/scripts/smart_commit.sh
```

使用自定义消息：
```bash
bash skills/git-pushing/scripts/smart_commit.sh "feat: add feature"
```

脚本会处理：暂存、生成约定式提交消息、添加 Claude 页脚，以及使用 -u 标志进行推送。