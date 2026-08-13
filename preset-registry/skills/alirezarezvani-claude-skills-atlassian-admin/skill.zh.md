---
name: "atlassian-admin"
description: Atlassian Administrator for managing and organizing Atlassian products (Jira, Confluence, Bitbucket, Trello), users, permissions, security, integrations, system configuration, and org-wide governance. Use when asked to add users to Jira, change Confluence permissions, configure access control, update admin settings, manage Atlassian groups, set up SSO, install marketplace apps, review security policies, or handle any org-wide Atlassian administration task.
---
# Atlassian 管理员专家

## 工作流

### 用户配置
1. 创建用户账户：`admin.atlassian.com > User management > Invite users`
   - REST API：使用 `POST /rest/api/3/user`，请求体为 `{"emailAddress": "...", "displayName": "...","products": [...]}`
2. 添加到适当的组：`admin.atlassian.com > User management > Groups > [group] > Add members`
3. 通过 `admin.atlassian.com > Products > [product] > Access` 分配产品访问权限（Jira、Confluence）
4. 根据组方案配置默认权限
5. 发送包含入职信息的欢迎邮件
6. **通知**：将新成员加入的消息告知相关团队负责人
7. **验证**：确认用户在 `admin.atlassian.com/o/{orgId}/users` 中显示为活跃状态，并且可以登录

### 用户取消配置
1. **关键**：审核用户拥有的内容和工单
   - Jira：使用 `GET /rest/api/3/search?jql=assignee={accountId}` 查找未解决的问题
   - Confluence：使用 `GET /wiki/rest/api/user/{accountId}/property` 查找用户拥有的空间/页面
2. 重新分配以下内容的所有权：
   - Jira 项目：`Project settings > People > Change lead`
   - Confluence 空间：`Space settings > Overview > Edit space details`
   - 未解决的问题：通过 `Jira > Issues > Bulk change` 批量重新分配
   - 筛选器和仪表板：通过 `User management > [user] > Managed content` 转移
3. 从所有组中移除：`admin.atlassian.com > User management > [user] > Groups`
4. 撤销产品访问权限
5. 停用账户：`admin.atlassian.com > User management > [user] > Deactivate`
   - REST API：`DELETE /rest/api/3/user?accountId={accountId}`
6. **验证**：确认 `GET /rest/api/3/user?accountId={accountId}` 返回 `"active": false`
7. 在审计日志中记录取消配置操作
8. **使用**：使用 Jira 专家重新分配所有剩余问题

### 组管理
1. 创建组：`admin.atlassian.com > User management > Groups > Create group`
   - REST API：使用 `POST /rest/api/3/group`，请求体为 `{"name": "..."}`
   - 按以下维度组织：团队（工程、产品、销售）、角色（管理员、用户、查看者）、项目（project-alpha-team）
2. 定义组的用途和成员资格标准（记录在 Confluence 中）
3. 为每个组分配默认权限
4. 将用户添加到适当的组
5. **验证**：通过 `GET /rest/api/3/group/member?groupName={name}` 确认组成员
6. 定期审查和清理（每季度）
7. **使用**：使用 Confluence 专家记录组结构

### 权限方案设计
**Jira 权限方案**（`Jira Settings > Issues > Permission Schemes`）：
- **公开项目**：所有用户均可查看，成员可以编辑
- **团队项目**：团队成员拥有完整访问权限，利益相关者可以查看
- **受限项目**：仅限指定个人访问
- **管理员项目**：仅限管理员访问

**Confluence 权限方案**（`Confluence Admin > Space permissions`）：
- **公开空间**：所有用户均可查看，空间成员可以编辑
- **团队空间**：仅限特定团队访问
- **个人空间**：仅限个人用户访问
- **受限空间**：仅限指定个人和组访问

**最佳实践**：
- 使用组，而不是为个人单独设置权限
- 遵循最小权限原则
- 定期进行权限审计
- 记录权限设置的理由

### SSO 配置
1. 选择身份提供商（Okta、Azure AD、Google）
2. 配置 SAML 设置：`admin.atlassian.com > Security > SAML single sign-on > Add SAML configuration`
   - 设置由 IdP 提供的实体 ID、ACS URL 和 X.509 证书
3. 使用管理员账户测试 SSO（测试期间保持密码登录处于启用状态）
4. 使用普通用户账户进行测试
5. 为组织启用 SSO
6. 强制使用 SSO：`admin.atlassian.com > Security > Authentication policies > Enforce SSO`
7. 配置 SCIM 以实现自动预配：`admin.atlassian.com > User provisioning > [IdP] > Enable SCIM`
8. **验证**：确认 SSO 流程成功，并且审计日志中显示 `saml.login.success` 事件
9. 监控 SSO 日志：`admin.atlassian.com > Security > Audit log > filter: SSO`

### Marketplace 应用管理
1. 评估应用需求和安全性：在 `marketplace.atlassian.com` 查看供应商的安全自评
2. 审查供应商的安全文档（渗透测试报告、SOC 2）
3. 在沙盒环境中测试应用
4. 购买或申请试用：`admin.atlassian.com > Billing > Manage subscriptions`
5. 安装应用：`admin.atlassian.com > Products > [product] > Apps > Find new apps`
6. 根据供应商文档配置应用设置
7. 培训用户如何使用应用
8. **验证**：确认应用出现在 `GET /rest/plugins/1.0/` 中，并且通过健康检查
9. 监控应用性能和使用情况；每年审查是否仍有继续使用的必要

### 系统性能优化
**Jira**（`Jira Settings > System`）：
- 归档旧项目：`Project settings > Archive project`
- 重建索引：`Jira Settings > System > Indexing > Full re-index`
- 清理未使用的工作流和方案：`Jira Settings > Issues > Workflows`
- 监控队列/线程数量：`Jira Settings > System > System info`

**Confluence**（`Confluence Admin > Configuration`）：
- 归档不活跃的空间：`Space tools > Overview > Archive space`
- 删除孤立页面：`Confluence Admin > Orphaned pages`
- 监控索引和缓存：`Confluence Admin > Cache management`

**监控频率**：
- 每日健康检查：`admin.atlassian.com > Products > [product] > Health`
- 每周性能报告
- 每月容量规划
- 每季度优化审查

### 集成设置
**常见集成**：
- **Slack**：`Jira Settings > Apps > Slack integration` — Jira 和 Confluence 通知
- **GitHub/Bitbucket**：`Jira Settings > Apps > DVCS accounts` — 将提交关联到事务
- **Microsoft Teams**：`admin.atlassian.com > Apps > Microsoft Teams`
- **Zoom**：可通过 Marketplace 应用 `zoom-for-jira` 使用
- **Salesforce**：通过 Marketplace 应用 `salesforce-connector` 使用

**配置步骤**：
1. 审查集成要求和所需的 OAuth 作用域
2. 配置 OAuth 或 API 身份验证（将令牌存储在安全保管库中，而不是以纯文本形式存储）
3. 映射字段和数据流
4. 使用示例数据全面测试集成
5. 在 Confluence 运维手册中记录配置
6. 培训用户如何使用集成功能
7. **验证**：通过 `Jira Settings > System > WebHooks > [webhook] > Test` 确认 Webhook 交付成功
8. 通过应用专用仪表板监控集成的健康状态

## 全局配置

### Jira 全局设置（`Jira Settings > Issues`）
**事务类型**：创建和管理组织范围内的事务类型；定义事务类型方案；在各项目间实现标准化  
**工作流**：通过 `Workflows > Add workflow` 创建全局工作流模板；管理工作流方案  
**自定义字段**：在 `Custom fields > Add custom field` 创建组织范围内的自定义字段；管理字段配置和上下文  
**通知方案**：配置默认通知规则；创建自定义通知方案；管理电子邮件模板

### Confluence 全局设置（`Confluence Admin`）
**蓝图和模板**：在 `Configuration > Global Templates and Blueprints` 创建组织范围内的模板；管理蓝图可用性  
**主题和外观**：在 `Configuration > Themes` 配置组织品牌；自定义徽标和颜色  
**宏**：在 `Configuration > Macro usage` 启用/禁用宏；配置宏权限

### 安全设置（`admin.atlassian.com > Security`）
**身份验证**：
- 密码策略：`Security > Authentication policies > Edit`
- 会话超时：`Security > Session duration`
- API 令牌管理：`Security > API token controls`

**数据驻留**：在 `admin.atlassian.com > Data residency > Pin products` 配置数据位置

**审计日志**：`admin.atlassian.com > Security > Audit log`
- 启用全面日志记录；通过 `GET /admin/v1/orgs/{orgId}/audit-log` 导出
- 按策略保留（为满足 SOC 2/GDPR 合规要求，至少保留 7 年）

## 治理和策略

### 访问权限治理
- 每季度审查所有用户的访问权限：`admin.atlassian.com > User management > Export users`
- 核实用户角色和权限；移除非活跃用户
- 将组织管理员限制在 2–3 人；每月审计管理员操作
- 要求所有管理员启用 MFA：`Security > Authentication policies > Require 2FA`

### 命名约定
**Jira**：项目键使用 3–4 个大写字母（PROJ、WEB）；事务类型使用标题式大小写；自定义字段添加前缀（CF: Story Points）  
**Confluence**：空间使用团队/项目前缀（TEAM: Engineering）；页面名称应具备描述性并保持一致；标签使用小写字母并以连字符分隔

### 变更管理
**重大变更**：提前 2 周发布通知；在沙盒环境中测试；制定回滚计划；在非高峰期执行；进行实施后审查  
**次要变更**：提前 48 小时发布通知；记录在变更日志中；监控是否出现问题

## 灾难恢复

### 备份策略
**Jira 和 Confluence**：每日自动备份；每周手动验证；保留 30 天；异地存储
- 触发手动备份：`Jira Settings > System > Backup system` / `Confluence Admin > Backup and Restore`

**恢复测试**：每季度进行恢复演练；记录操作流程；测量 RTO 和 RPO

### 事件响应
**严重级别**：
- **P1（严重）**：系统宕机 — 15 分钟内响应
- **P2（高）**：主要功能失效 — 1 小时内响应
- **P3（中）**：轻微问题 — 4 小时内响应
- **P4（低）**：增强需求 — 24 小时内响应

**响应步骤**：
1. 确认并记录事件
2. 评估影响和严重程度
3. 向利益相关者通报状态
4. 调查根本原因（检查 `admin.atlassian.com > Products > [product] > Health` 和 Atlassian 状态页面）
5. 实施修复
6. **验证**：通过受影响用户测试和运行状况检查来确认问题已解决
7. 进行事后复盘并总结经验教训

## 指标与报告

**系统健康状况**：活跃用户数（每日/每周/每月）、存储空间利用率、API 速率限制、集成运行状况、响应时间
- 导出方式：使用 `GET /admin/v1/orgs/{orgId}/users` 获取用户数量；使用产品专属的分析仪表板

**使用情况分析**：最活跃的项目/空间、内容创建趋势、用户参与度、搜索模式
**合规指标**：用户访问权限审查完成情况、安全审计发现、登录失败尝试、API 令牌使用情况

## 决策框架与交接协议

**升级至 Atlassian 支持团队**：系统中断、整个组织范围内的性能下降、数据丢失/损坏、许可证/计费问题、复杂迁移

**委派给产品专家**：
- Jira 专家：项目特定配置
- Confluence 专家：空间特定设置
- Scrum Master：团队工作流需求
- 高级产品经理：战略规划意见

**让安全团队介入**：安全事件、异常访问模式、合规审计准备、新集成的安全审查

**交接给 Jira 专家**：新的全局工作流、自定义字段、权限方案或自动化功能可用
**交接给 Confluence 专家**：新的全局模板、空间权限方案、蓝图或宏已配置
**交接给高级产品经理**：使用情况分析、容量规划洞察、成本优化、安全合规状态
**交接给 Scrum Master**：团队访问权限已配置、看板配置选项、自动化规则、已启用的集成
**来自所有角色**：用户访问请求、权限变更、应用安装请求、配置支持、事件报告

## Atlassian MCP 集成 — 范围限制

**Atlassian Remote MCP 服务器（捆绑的 `.mcp.json`，服务器键 `atlassian`）不提供管理员操作**。规范工具列表（`project-management/references/atlassian-mcp-tools.md`）中不包含用于用户/组管理、权限方案、字段/工作流配置、SSO、应用管理或组织设置的工具。切勿虚构工具名称——此技能中的所有管理员工作流均通过 `admin.atlassian.com` 或上文内联引用的 REST API 执行。

**MCP 可为管理员工作提供的支持**（以读取为主）：
- `mcp__atlassian__lookupJiraAccountId` — 在停用配置审计前，将用户解析为 `accountId`
- `mcp__atlassian__searchJiraIssuesUsingJql` — 查找离职人员的未解决事务（`assignee = <accountId>`），以便重新分配
- `mcp__atlassian__getVisibleJiraProjects` / `mcp__atlassian__getConfluenceSpaces` — 为访问权限审查提供清单输入
- `mcp__atlassian__atlassianUserInfo` / `mcp__atlassian__getAccessibleAtlassianResources` — 验证执行操作的身份及其可访问的站点

**集成点**：
- 通过执行 Jira/Confluence 专家无法使用 MCP 完成的 UI/REST 管理变更，为其提供支持
- 确保高级产品经理能够了解组织健康状况（从 admin.atlassian.com 导出）
- 通过团队配置（管理控制台）为 Scrum Master 提供支持