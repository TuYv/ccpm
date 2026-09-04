---
name: plan
description: "Use this skill when the user needs to turn an idea into a buildable spec, write a project scope, create feature requirements, or define an MVP. Covers quick feature specs (10-15 min) for immediate AI builds and full project scopes (1-2 hours) for planning and contractor estimates."
---
# 范围

将想法转化为 AI 工具可以执行、利益相关者可以评估的规格说明。

## 何时使用此技能

- 开始任何新功能或新产品时
- 在雇用开发者或估算成本之前  
- 当 AI 反复做出错误的东西时（规格不清晰）
- 当利益相关者需要审阅范围和预算时

## 选择你的方法

**快速功能规格（10-15 分钟）**
- 适用于：单一功能、迭代、新增内容
- 提供给：AI 工具（Claude Code、Lovable、Replit）直接构建
- 参见：[QUICK-SPEC.md](QUICK-SPEC.md)

**完整项目范围（1-2 小时）**
- 适用于：新产品、重大版本发布、利益相关者审阅
- 提供给：外包开发者、团队成员、预算规划
- 参见：[PROJECT-SCOPE.md](PROJECT-SCOPE.md)

---

## 快速功能规格工作流

使用此清单并完成每个部分：

```
Feature Spec Progress:
- [ ] Write what users will do (2-3 sentences)
- [ ] Show what it looks like (reference, screenshot, or description)
- [ ] Define happy path (3-5 steps)
- [ ] List edge cases (2-4 scenarios)
- [ ] Specify out of scope items
- [ ] Save to docs/specs/YYYY-MM-DD-feature-name.md
```

### 第 1 部分：用户将要做什么

用 2-3 句话描述用户的操作和结果。

**模板：**
```
Users can [ACTION] to [OUTCOME].
When they [DO THIS], they see [WHAT HAPPENS].
If [EDGE CASE], then [WHAT HAPPENS].
```

**示例：**
```
Users sign up with email/password, receive confirmation email, and log in to 
see their dashboard. They can reset forgotten passwords via email link.
```

### 第 2 部分：它长什么样

只选择一种：
- **参考应用：** “登录方式像 Linear——极简、居中、邮箱/密码/按钮”
- **截图/
