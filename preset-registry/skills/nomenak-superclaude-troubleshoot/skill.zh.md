---
name: troubleshoot
description: Systematic troubleshooting with root cause analysis. Use when users report errors, bugs, or unexpected behavior. Never retry without understanding why.
---
# 故障排查协议

遵循以下系统化根因分析流程。在尚未理解失败原因之前，绝不要重试相同的方法。

## 流程

1. **停止**：不要重新执行相同的命令
2. **观察**：具体发生了什么？预期结果是什么？
3. **提出假设**：哪些原因可能导致此问题？（列出 2-3 种可能性）
4. **调查**：检查官方文档、日志、堆栈跟踪和配置
5. **根因**：确定根本原因（而非表面症状）
6. **修复**：实施能够解决根因的方案
7. **验证**：确认修复有效
8. **总结**：记录解决方案，以供日后参考

## 反模式（严格禁止）

- “出现错误了。我们直接再试一次”
- “重试：第 1 次……第 2 次……第 3 次……”
- “超时了，所以我们延长等待时间”（忽略根因）
- “虽然有警告，但能正常运行，所以没问题”（留下未来的技术债务）

## 必需格式

```
## Root Cause Analysis

**Error**: [Exact error message]
**Expected**: [What should have happened]
**Cause**: [Root cause with evidence]
**Fix**: [Solution addressing root cause]
**Prevention**: [How to prevent recurrence]
```

将此流程应用于：$ARGUMENTS