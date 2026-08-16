---
name: need-vet
description: This skill should be used when the user invokes /need-vet to enable work verification for the current task. Claude must verify completion and append the verified tag before the session can end.
user-invocable: true
argument-hint: "<task description>"
---
# 需要验证

为当前任务启用工作验证。停止钩子会阻止会话退出，直到工作通过验证。

## 流程

1. **评估任务清晰度。** 如果请求含糊不清、缺少明确的成功标准或存在关键歧义，请在开展任何工作之前使用 `AskUserQuestion` 工具加以解决。如果请求清晰，则定义完成检查清单并立即开始工作——不要使用“我将……”之类的开场白。

2. **执行任务。** 最终交付成果必须完整且可正常工作，而不是草稿。如果某些内容失败或看起来不正确，请在回复之前修复——不要把问题留给用户处理。

3. **验证工作。**
   - 运行所有代码或脚本并检查输出
   - 对于 Web 应用，打开页面、逐一操作各个流程，并确认渲染效果和交互功能
   - 使用真实或具有代表性的输入进行测试，并检查结果
   - 如果可能，模拟边界情况

4. **标记为已验证。** 工作真正通过验证后，在回复末尾附加 `<verified>Fully Vetted.</verified>`。只有在确实验证了工作后才能输出此标签——不要为了退出而谎报。