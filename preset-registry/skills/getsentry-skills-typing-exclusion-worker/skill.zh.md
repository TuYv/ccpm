---
name: typing-exclusion-worker
description: "Python typing exclusion worker: remove assigned mypy exclusion modules in small scoped batches, fix typing issues, run validation, and produce a structured completion summary. Use when running parallel typing-debt workers or when asked to remove modules from pyproject mypy exclusion overrides."
---
# 类型排除任务执行者

## 目的

安全且可预测地执行一个已分配的类型检查批次：

- 仅从 mypy 排除项中移除已分配的模块，
- 修复范围内暴露出的类型问题，
- 运行所需检查，
- 向管理者/编排器返回格式一致的总结。

## 所需输入

开始前，确认任务提示中包含以下输入：

- worktree/分支名称，
- 要从排除项中移除的确切模块列表，
- 所有权/领域边界，
- 预期的验证命令（如果有自定义）。

如果缺少任何一项，请在编辑前询问。

## 范围规则（硬性约束）

1. 仅从 `pyproject.toml` 的 mypy 排除列表中移除已分配的模块条目。
2. 除非为了通过类型检查/测试而必须修改直接依赖项，否则代码更改应保持在已分配范围内。
3. 除非管理者明确批准，否则不要扩展到其他团队的模块。
4. 避免笼统使用 `# type: ignore`；如果无法避免，请使用范围精确的 `ignore[code]`，并附上简短原因。

## 执行流程

1. **应用排除项更改**

   - 从 `pyproject.toml` 的排除覆盖配置中移除已分配的模块。

2. **对已分配范围运行 mypy**

   - 优先对目标路径运行检查，以便快速获得反馈。
   - 使用显式类型模式修复错误（`isinstance` 类型收窄、准确的返回类型、带类型注解的类属性、关系安全的模型访问）。

3. **运行受影响区域的测试**

   - 对已修改的模块/测试执行针对性的 pytest。
   - 修复回归问题后再继续。

4. **对已更改文件运行 pre-commit**

   - 运行 `pre-commit run --files <changed files>`。
   - 如果钩子自动修复了文件，请重新运行，直至检查通过。

5. **最终验证**
   - 完成最终编辑后，重新运行针对性的 mypy 和测试。
   - 确保未更改任何无关文件。

## Python 类型标注最佳实践

- 优先使用精确类型，而不是 `Any`。
- 访问属性前，先对联合类型进行类型收窄。
- 保持方法重写的签名与基类兼容。
- 当类型推断能力较弱时，为测试/辅助工具中的类属性添加注解。
- 当存根未暴露原始 `*_id` 属性时，使用关系对象（`obj.related`）。

## 所需输出模板

在每个批次结束时返回以下确切结构：

```markdown
## Batch Summary

- Branch/worktree: `<name>`
- Ownership/domain: `<team-or-domain>`

### Modules Removed From Exclusion

- `<module.path.one>`
- `<module.path.two>`

### Files Changed

- `<path>`
- `<path>`

### Key Typing Fixes

- `<short rationale + fix>`
- `<short rationale + fix>`

### Validation

- `mypy`: `<pass/fail + scope>`
- `pre-commit --files`: `<pass/fail>`
- `pytest`: `<pass/fail + scope>`

### Notes

- Remaining blockers: `<none or details>`
- Any new ignore entries: `<none or file + ignore code + reason>`
```

## 停止条件（上报管理者）

出现以下情况时，请停止并报告，而不是扩大范围：

- 修复需要改动其他团队/领域，
- 无法安全解决 `pyproject.toml` 中的排除项冲突，
- 错误数量表明批次过大，应进行拆分。