---
name: binary-ninja-reverse
description: Use for authorized binary analysis in Binary Ninja, including HLIL/MLIL/LLIL inspection, strings/imports/exports, cross-references, types, patch review, Python API automation, and optional Binary Ninja MCP or localhost HTTP integration.
---
# Binary Ninja 逆向工程

在以下情况使用 Binary Ninja：用户明确选择它、其 IL（中间表示）对数据流分析有实质性帮助，或 IDA/Ghidra/radare2 的结果需要独立交叉核验时。

## 安全启动

1. 在对目标执行操作前，先确认仓库的案件范围已就绪。
2. 在 `skills/tool-index.md` 中检查 `binaryninja`；Binary Ninja 是商业软件，必须凭有效的 Vector 35 许可证手动安装。
3. 应用补丁或保存数据库更改时，在副本上操作。
4. 在将发现提升为结论之前，记录导入/导出、入口点、体系结构以及文件哈希。

## 选择集成方式

- **GUI 或 Python API：** 当 Binary Ninja 已打开或用户希望直接交互式分析时优先使用。
- **社区 MCP 桥接：** 仅在明确请求且已审查第三方插件边界后使用。保持 Binary Ninja HTTP 监听器位于 `127.0.0.1:9009`；默认不要开启网络暴露。
- **后备方案：** 当 Binary Ninja 不可用或其许可证/API 无法打开目标时，使用 `ghidra-reverse`、`ida-reverse` 或 `radare2`。

经过审查的社区集成是 [`fosdickio/binary_ninja_mcp`](https://github.com/fosdickio/binary_ninja_mcp)，GPL-3.0 许可证，插件元数据版本 `1.1.0`，最低 Binary Ninja 构建版本 `4000`。该仓库不是 Vector 35 的官方组件。本技能已于 2026-09-03 针对提交 `8c5134ee46e2bf44f9a4d846bd971c3e39b3e306` 进行过核验。

通过其 Plugin Manager 或从已审查的源安装 Binary Ninja 侧组件。对于 MCP stdio 桥接，请固定已发布的桥接版本，而不要使用未加版本约束的包：

```text
npx -y binary-ninja-mcp@1.0.0 --host 127.0.0.1 --port 9009
```

仅在用户所选的 MCP 客户端中注册该命令。在 Binary Ninja 处于运行状态、已打开某个二进制文件、且 localhost 插件端点有响应之前，该桥接不算就绪。

## 分析工作流

1. 枚举已打开的二进制文件并选择目标视图。
2. 捕获二进制状态、入口点、段（segment）、导入、导出以及代表性字符串。
3. 在孤立解读某个函数之前，先追踪其调用点和交叉引用。
4. 使用 HLIL 获取可读逻辑，使用 MLIL SSA 进行数据流分析，并在提升过程丢失指令级行为时使用 LLIL/反汇编。
5. 增量地应用名称、注释和类型；在证据中保留原始地址。
6. 将字节补丁、函数原型更改和文件写入都视为变更操作。仅在收到请求时执行，并保留原始工件。
7. 用第二证据来源或另一个反汇编器交叉核验高影响力结论。

实用的 MCP 能力类别包括：二进制/视图选择、`list_imports`、`list_exports`、`list_strings`、`decompile_function`、`get_il`、调用者/被调用者、交叉引用、类型、注释、重命名以及字节补丁。应动态发现实际可用的工具列表，而不是假设每个上游函数都存在。

## 输出

报告具体地址、函数名、IL 层级、支持的字符串/导入、置信度以及复现步骤。保持仓库其余部分使用的证据 → 发现 → 路径（Evidence → Finding → Path）链条。
