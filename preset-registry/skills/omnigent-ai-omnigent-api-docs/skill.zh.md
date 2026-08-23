---
name: api-docs
description: Document a module or public API surface (functions, classes, CLI commands, endpoints) from the code itself. Use when the user asks for API reference, to document a module, or to write usage docs for a public interface.
---
# api-docs — 根据代码记录公共 API 表面

生成与代码完全一致的参考文档；内容应源自源代码，而不是基于对 API“可能”行为的假设。

## 阅读 API 表面

确定需要记录的公共表面（模块、类、CLI 命令组或一组端点）。然后让研究员仔细阅读：
- 将任务分派给研究员（`purpose: explore`），要求其枚举公共入口点，并报告每个入口点的实际签名、参数、默认值、返回结构和抛出的错误，同时提供 file:line 证据。
- 相比文字描述，优先以代码声明（签名、类型提示、文档字符串、默认值）为准。公共与私有的区分遵循项目约定（例如前导下划线，或 `__all__` / 导出列表）。

## 结构

对于每个入口点：

    ### `<name>(<signature>)`

    <用一行概述其作用>

    **参数**
    - `<name>`（`<type>`，默认值 `<value>`）— <含义>

    **返回值** — `<type>`：<含义>

    **抛出** — `<Error>`：<触发条件>

    **示例**
    ```
    <最小且可运行的用法>
    ```

## 编写入口点文档

- 摘要保持为一行；将详细信息放在参数和示例部分。
- 按参数在签名中出现的顺序记录每个公共参数，包括默认值。
- 为每个入口点提供一个确实能基于所记录签名运行的最小示例。
- 除非用户提出要求，否则不要记录私有/内部辅助项；参考文档描述的是契约，而不是代码导览。

## 验证

签名、默认值和错误类型的变化最快，因此将完成的参考文档交由 `reviewer`（`purpose: review`）检查，以确认每个签名和默认值都与当前代码一致。