---
name: review
description: Interactive markdown review with web UI. Use when user says "review this", "check this plan", "피드백", "검토해줘" or specifies a file path to review.
allowed-tools:
  - mcp__interactive_review__start_review
  - Read
---
# 交互式审阅技能

该技能会打开一个交互式 Web UI，用户可以通过复选框和评论来审阅内容。

## 工作原理

1. 确定内容来源：
   - **如果用户指定了文件路径**：使用 `Read` 工具获取文件内容
   - **如果用户直接提供了内容**：直接按原样使用该内容
   - **其他情况**：从对话中收集最近的相关内容
2. 使用该内容调用 `mcp__interactive_review__start_review`
3. 浏览器窗口会自动打开并显示审阅 UI
4. 用户逐项审阅：
   - 勾选/取消勾选以批准/拒绝
   - 添加可选的评论
5. 用户点击 Submit
6. 处理反馈并作出相应回应

## 内容来源（按优先级排序）

1. **明确的文件路径**：用户说 "review /path/to/file.md" 或 “이 파일 리뷰해줘： README.md”
   - 使用 `Read` 工具读取该文件并使用其内容
2. **直接提供的内容**：用户提供或引用要审阅的特定内容
   - 直接使用所提供的内容
3. **对话上下文**：从最近的对话中提取相关内容
   - 最近讨论过的计划、文档、代码等

## 用法

当用户想要审阅内容时：

```
# If file path is specified, read it first:
Read({ "file_path": "/path/to/file.md" })

# Then start the review:
mcp__interactive_review__start_review({
  "content": "<content from file or conversation>",
  "title": "<descriptive title>"
})
```

## 处理结果

该工具会返回包含审阅项的 JSON。请根据以下情况处理每一项：

| checked | comment | 操作 |
|---------|---------|--------|
| true | 空 | 已批准 - 按计划继续 |
| true | 有文本 | 已批准并附有备注 - 请考虑该反馈 |
| false | 有文本 | 已拒绝 - 根据评论进行修改 |
| false | 空 | 已拒绝 - 移除该项或重新考虑 |

## 示例流程

用户："Review this implementation plan"

1. 从最近的输出中提取方案内容
2. 使用该内容调用 start_review
3. 等待用户反馈（工具会阻塞直至提交）
4. 呈现反馈摘要
5. 询问用户是想继续执行已批准的项，还是修改被拒绝的项

## 回复模板

收到反馈后：

```
## Review Summary

**Approved**: X items
**Needs revision**: Y items

### Items requiring changes:
- [Item]: [User's comment]

Would you like me to:
1. Proceed with approved items
2. Revise the rejected items based on feedback
3. Both - revise then proceed
```
