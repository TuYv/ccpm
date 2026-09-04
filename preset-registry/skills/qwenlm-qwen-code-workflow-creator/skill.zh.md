---
name: workflow-creator
description: Create or update reusable Dynamic Workflow JavaScript files under .qwen/workflows. Use when the user asks to create, save, edit, or reuse a Dynamic Workflow, including requests started from the Web Shell Workflows page.
---
# 工作流创建器

为当前工作区创建和维护已保存的 Dynamic Workflows。

## 边界

- 本技能管理由 `workflow` 工具使用、并以 `/<name>` 斜杠命令形式暴露的 `.qwen/workflows/<name>.js` 文件。
- 不要创建或编辑 `qwen-workflow-design/*.yaml`；那些 Task Flow 定义属于另一项不同的功能。
- 默认使用项目作用域。仅当用户明确要求跨项目共享的工作流时，才写入 `~/.qwen/workflows`。

## 工作流程

1. 检查当前任务以及任何与所请求名称同名的现有工作流。仅当目标、顺序或写入范围存在实质性歧义时才提问。
2. 选择一个仅包含字母、数字和连字符的小写名称。它必须以字母开头，且最多 41 个字符。
3. 创建一个涵盖所请求的阶段、依赖关系和最终结果的最小脚本。不要添加投机性的分支、重试或代理。
4. 读回已保存的文件，验证其名称、元数据、阶段顺序、依赖流程和最终返回值。除非用户还要求运行，否则不要执行它。
5. 报告保存路径和斜杠命令。在 Web Shell 中，告诉用户返回 Workflows 界面，如果“Saved”标签页已经打开，则刷新该标签页。

## 脚本契约

- 以字面形式的元数据声明开头：

```js
export const meta = {
  name: 'Release readiness',
  description: 'Inspect, validate, and summarize a release candidate',
};
```

- 使用 `workflow` 工具文档中说明的沙箱全局变量：`phase(title)`、`log(message)`、`agent(prompt, options?)`、`parallel(thunks)`、`pipeline(items, ...stages)`、`workflow(nameOrRef, args?)`、`args` 和 `budget`。
- 脚本不能导入模块，也不能直接访问文件系统、shell、环境变量或网络。把所需的读取和操作放入显式的代理提示中。
- 给每个代理一个完整、限定范围的提示和一个简洁的 `label`。说明它是否可以编辑文件。
- 用 `parallel([() => agent(...), () => agent(...)])` 表达真正的并发。不要把已经启动的 promise 传给 `parallel`。
- 让有依赖关系的工作保持顺序执行，并显式传递先前的结果。
- 把可变的用户输入放进 `args`，而不是硬编码一次性的值。
- 每条成功路径都要以显式 `return` 最终结果结束。末尾的表达式不算是返回值。
- 不要使用 `node --check` 做验证：合法的工作流脚本可能包含顶层的 `await` 和 `return`，因为运行时会将它们包装在一个异步函数中。

## 更新

- 编辑现有工作流时，保留与本次改动无关的行为和元数据。
- 不要用不同的设计覆盖现有工作流，除非用户请求了该更新。
- 不要删除或重命名工作流，除非用户明确提出要求。
