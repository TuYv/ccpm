---
name: ralph-specum-index
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-index`, or explicitly asks Ralph Specum in Codex to generate or refresh index artifacts.
metadata:
  surface: helper
  action: index
---
# Ralph Specum 索引

使用此技能为现有代码库生成可搜索的索引规格说明。

## 契约

- 索引输出存放在 `specs/.index/` 目录下
- 对 `index.md`、组件规格说明和外部规格说明使用稳定的 Ralph 模板
- 使组件条目和外部条目保持确定性，并便于进行 diff 对比

## 操作

1. 解析用户给定的范围，例如路径、类型、排除项、快速模式、演练模式或强制模式。
2. 扫描所请求的代码区域，识别控制器、服务、模型、辅助模块、迁移文件或类似的项目结构。
3. 生成或更新：
   - `specs/.index/index.md`
   - `specs/.index/components/*.md`
   - `specs/.index/external/*.md`
4. 保持输出结果的确定性，以便启动、调研和分诊环节能够复用它们。
5. 仅在用户要求或明显相关时，才包含外部 URL、MCP 端点或已安装的技能。
6. 在演练模式下，报告将要创建的内容，但不写入文件。

## 响应交接

- 更新索引后，列出发生变化的文件，并简要总结索引的覆盖范围。
- 以恰好一个明确的选项提示作为结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to research`
- 将 `continue to research` 视为对更新后的索引产物的批准。
