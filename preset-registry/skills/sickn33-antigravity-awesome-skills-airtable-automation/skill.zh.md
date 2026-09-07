---
name: airtable-automation
description: "Automate Airtable tasks via Rube MCP (Composio): records, bases, tables, fields, views. Always search tools first for current schemas."
risk: critical
source: community
date_added: "2026-02-27"
---
# 通过 Rube MCP 实现 Airtable 自动化

通过 Rube MCP 使用 Composio 的 Airtable 工具包自动执行 Airtable 操作。

## 前提条件

- 必须已连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `airtable` 建立的 Airtable 活动连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前的工具 schema

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 能够响应来验证 Rube MCP 是否可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并指定工具包 `airtable`
3. 如果连接状态不是 ACTIVE，请按照返回的授权链接完成 Airtable 授权
4. 在运行任何工作流之前，确认连接状态显示为 ACTIVE

## 核心工作流

### 1. 创建和管理记录

**何时使用**：用户想要创建、读取、更新或删除记录

**工具调用顺序**：
1. `AIRTABLE_LIST_BASES` - 发现可用的 base [前置条件]
2. `AIRTABLE_GET_BASE_SCHEMA` - 查看表结构 [前置条件]
3. `AIRTABLE_LIST_RECORDS` - 列出/筛选记录 [可选]
4. `AIRTABLE_CREATE_RECORD` / `AIRTABLE_CREATE_RECORDS` - 创建记录 [可选]
5. `AIRTABLE_UPDATE_RECORD` / `AIRTABLE_UPDATE_MULTIPLE_RECORDS` - 更新记录 [可选]
6. `AIRTABLE_DELETE_RECORD` / `AIRTABLE_DELETE_MULTIPLE_RECORDS` - 删除记录 [可选]

**关键参数**：
- `baseId`：Base ID（以 'app' 开头，例如 'appXXXXXXXXXXXXXX'）
- `tableIdOrName`：表 ID（以 'tbl' 开头）或表名
- `fields`：将字段名映射到值的对象
- `recordId`：用于更新/删除的记录 ID（以 'rec' 开头）
- `filterByFormula`：用于筛选的 Airtable 公式
- `typecast`：设为 true 可启用自动类型转换

**注意事项**：
- pageSize 上限为 100；使用 offset 分页；在页面之间更改筛选条件可能导致行被跳过或重复
- CREATE_RECORDS 每次请求的硬性上限为 10 条记录；更大的导入需分批处理
- 字段名区分大小写，必须与 schema 完全一致
- 字段名错误时返回 422 UNKNOWN_FIELD_NAME；权限问题返回 403
- 遇到 INVALID_MULTIPLE_CHOICE_OPTIONS 时可能需要设置 typecast=true

### 2. 搜索和筛选记录

**何时使用**：用户想要使用公式查找特定记录

**工具调用顺序**：
1. `AIRTABLE_GET_BASE_SCHEMA` - 验证字段名和类型 [前置条件]
2. `AIRTABLE_LIST_RECORDS` - 使用 filterByFormula 查询 [必需]
3. `AIRTABLE_GET_RECORD` - 获取完整的记录详情 [可选]

**关键参数**：
- `filterByFormula`：Airtable 公式（例如 `{Status}='Done'`）
- `sort`：排序对象组成的数组
- `fields`：要返回的字段名数组
- `maxRecords`：所有页面的记录总数上限
- `offset`：上一次响应中的分页游标

**注意事项**：
- 公式中的字段名必须用 `{}` 包裹，且必须与 schema 完全一致
- 字符串值必须加引号：应写 `{Status}='Active'`，而不是 `{Status}=Active`
- 语法错误或字段不存在时返回 422 INVALID_FILTER_BY_FORMULA
- Airtable 速率限制：每个 base 约每秒 5 个请求；遇到 429 时按 Retry-After 处理

### 3. 管理字段和 schema

**何时使用**：用户想要创建或修改表字段

**工具调用顺序**：
1. `AIRTABLE_GET_BASE_SCHEMA` - 查看当前 schema [前置条件]
2. `AIRTABLE_CREATE_FIELD` - 创建新字段 [可选]
3. `AIRTABLE_UPDATE_FIELD` - 重命名字段/修改字段描述 [可选]
4. `AIRTABLE_UPDATE_TABLE` - 更新表元数据 [可选]

**关键参数**：
- `name`：字段名
- `type`：字段类型（singleLineText、number、singleSelect 等）
- `options`：与类型相关的选项（选择字段的 choices、数字字段的 precision）
- `description`：字段描述

**注意事项**：
- UPDATE_FIELD 只能更改名称/描述，无法更改类型/选项；需创建替代字段并进行迁移
- 计算字段（formula、rollup、lookup）无法通过 API 创建
- 类型选项缺失或格式错误时返回 422

### 4. 管理评论

**何时使用**：用户想要查看或添加记录上的评论

**工具调用顺序**：
1. `AIRTABLE_LIST_COMMENTS` - 列出记录上的评论 [必需]

**关键参数**：
- `baseId`：Base ID
- `tableIdOrName`：表标识符
- `recordId`：记录 ID（17 个字符，以 'rec' 开头）
- `pageSize`：每页评论数（最大 100）

**注意事项**：
- 记录 ID 必须恰好为 17 个字符并以 'rec' 开头

## 常用模式

### Airtable 公式语法

**比较**：
- `{Status}='Done'` - 等于
- `{Priority}>1` - 大于
- `{Name}!=''` - 非空

**函数**：
- `AND({A}='x', {B}='y')` - 两个条件同时满足
- `OR({A}='x', {A}='y')` - 任一条件满足
- `FIND('test', {Name})>0` - 包含文本
- `IS_BEFORE({Due Date}, TODAY())` - 日期比较

**转义规则**：
- 值中的单引号：需写成两个（`{Name}='John''s Company'`）

### 分页

- 设置 `pageSize`（最大 100）
- 检查响应中的 `offset` 字符串
- 将 `offset` 原样传递给下一个请求
- 在页面之间保持筛选/排序/视图稳定

## 已知注意事项

**ID 格式**：
- Base ID：`appXXXXXXXXXXXXXX`（17 个字符）
- 表 ID：`tblXXXXXXXXXXXXXX`（17 个字符）
- 记录 ID：`recXXXXXXXXXXXXXX`（17 个字符）
- 字段 ID：`fldXXXXXXXXXXXXXX`（17 个字符）

**批量限制**：
- CREATE_RECORDS：每次请求最多 10 条
- UPDATE_MULTIPLE_RECORDS：每次请求最多 10 条
- DELETE_MULTIPLE_RECORDS：每次请求最多 10 条

## 快速参考

| 任务 | 工具 Slug | 关键参数 |
|------|-----------|------------|
| 列出 base | AIRTABLE_LIST_BASES | （无） |
| 获取 schema | AIRTABLE_GET_BASE_SCHEMA | baseId |
| 列出记录 | AIRTABLE_LIST_RECORDS | baseId, tableIdOrName |
| 获取记录 | AIRTABLE_GET_RECORD | baseId, tableIdOrName, recordId |
| 创建记录 | AIRTABLE_CREATE_RECORD | baseId, tableIdOrName, fields |
| 批量创建记录 | AIRTABLE_CREATE_RECORDS | baseId, tableIdOrName, records |
| 更新记录 | AIRTABLE_UPDATE_RECORD | baseId, tableIdOrName, recordId, fields |
| 批量更新记录 | AIRTABLE_UPDATE_MULTIPLE_RECORDS | baseId, tableIdOrName, records |
| 删除记录 | AIRTABLE_DELETE_RECORD | baseId, tableIdOrName, recordId |
| 创建字段 | AIRTABLE_CREATE_FIELD | baseId, tableIdOrName, name, type |
| 更新字段 | AIRTABLE_UPDATE_FIELD | baseId, tableIdOrName, fieldId |
| 更新表 | AIRTABLE_UPDATE_TABLE | baseId, tableIdOrName, name |
| 列出评论 | AIRTABLE_LIST_COMMENTS | baseId, tableIdOrName, recordId |

## 何时使用
此技能适用于执行概述中所述的工作流或操作。

## 限制
- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止操作并请求澄清。
