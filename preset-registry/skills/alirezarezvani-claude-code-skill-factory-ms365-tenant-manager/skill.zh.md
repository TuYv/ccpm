---
name: ms365-tenant-manager
description: Comprehensive Microsoft 365 tenant administration skill for setup, configuration, user management, security policies, and organizational structure optimization for Global Administrators
---
# Microsoft 365 租户管理器

此技能为负责管理租户设置、配置、用户生命周期、安全策略和组织优化的 Microsoft 365 全局管理员提供专家指导和自动化支持。

## 功能

- **租户设置与配置**：初始租户设置、域配置、DNS 记录、服务预配
- **用户与组管理**：用户生命周期管理（创建、修改、禁用、删除）、组创建、许可证分配
- **安全与合规**：条件访问策略、MFA 设置、DLP 策略、保留策略、安全基线
- **SharePoint 与 OneDrive**：站点预配、权限管理、存储配额、共享策略
- **Teams 管理**：团队创建、策略管理、来宾访问、合规设置
- **Exchange Online**：邮箱管理、通讯组、邮件流规则、反垃圾邮件/恶意软件策略
- **许可证管理**：许可证分配、优化、成本分析、使用情况报告
- **报告与审核**：活动报告、审核日志、合规报告、使用情况分析
- **自动化脚本**：为批量操作和重复性任务生成 PowerShell 脚本
- **最佳实践**：Microsoft 推荐配置、安全加固、治理框架

## 输入要求

租户管理任务需要提供：
- **操作类型**：设置、配置、创建、修改、删除、报告、审核
- **资源详细信息**：用户信息、组名称、策略设置、服务配置
- **组织背景**：公司规模、所属行业、合规要求（GDPR、HIPAA 等）
- **当前状态**：现有配置、许可证、用户数量
- **预期结果**：所需的具体目标、要求或变更

接受的格式：
- 管理任务的文本描述
- 包含结构化配置数据的 JSON
- 用于批量用户/组操作的 CSV
- 待审查或修改的现有 PowerShell 脚本

## 输出格式

结果包括：
- **分步说明**：通过管理中心进行手动配置的详细指导
- **PowerShell 脚本**：可直接用于自动化的脚本（包含安全检查）
- **配置建议**：安全与治理最佳实践
- **验证检查清单**：实施前后的验证步骤
- **文档**：以 Markdown 记录变更和配置
- **回滚流程**：在需要时撤销变更的说明
- **合规报告**：安全状况和合规状态

## 使用方法

“按照安全最佳实践，为一家拥有 50 名员工的公司设置新的 Microsoft 365 租户”
“创建 PowerShell 脚本，使用 CSV 文件预配 100 个用户并分配适当的许可证”
“配置条件访问策略，要求所有管理员账户使用 MFA”
“生成过去 90 天内所有非活跃用户的报告”
“为外部协作设置包含安全控制的 Teams 策略”

## 脚本

- `tenant_setup.py`：初始租户配置和服务预配自动化
- `user_management.py`：用户生命周期操作和批量预配
- `security_policies.py`：安全策略配置和合规检查
- `reporting.py`：分析、审核日志和合规报告
- `powershell_generator.py`：为 Microsoft Graph API 和管理模块生成 PowerShell 脚本

## 最佳实践

### 租户设置
1. **首先启用 MFA** - 在添加用户之前，强制实施多重身份验证
2. **配置命名位置** - 为条件访问定义受信任的 IP 范围
3. **设置特权访问** - 使用独立的管理员账户，并启用 PIM（特权身份管理）
4. **域验证** - 在批量创建用户之前添加并验证自定义域
5. **安全基线** - 立即应用 Microsoft Secure Score 建议

### 用户管理
1. **许可证分配** - 使用基于组的许可方式，以满足可扩展性需求
2. **命名约定** - 建立一致的用户主体名称（UPN）和显示名称
3. **生命周期管理** - 实施自动化的入职和离职工作流
4. **来宾访问** - 仅在必要时启用，并设置过期策略
5. **共享邮箱** - 将其用于部门电子邮件，而不是分配许可证

### 安全性与合规性
1. **零信任方法** - 明确验证、采用最小权限访问并假定已发生入侵
2. **条件访问** - 从仅报告模式开始，然后逐步强制实施
3. **数据丢失防护** - 定义敏感信息类型，并在强制实施前测试策略
4. **保留策略** - 在合规要求与存储成本之间取得平衡
5. **定期审核** - 每季度审查权限、许可证和安全设置

### SharePoint 与 Teams
1. **站点预配** - 使用模板和治理策略
2. **外部共享** - 限制为特定域，并要求进行身份验证
3. **存储管理** - 设置配额，并启用旧内容自动清理
4. **Teams 模板** - 创建标准化的团队结构以确保一致性
5. **来宾生命周期** - 设置过期时间并定期重新认证

### PowerShell 自动化
1. **使用 Microsoft Graph** - 优先使用 Graph API，而不是旧版 MSOnline 模块
2. **错误处理** - 包含 try/catch 块和验证检查
3. **试运行模式** - 执行前使用 -WhatIf 测试脚本
4. **日志记录** - 记录所有操作以形成审计跟踪
5. **凭据管理** - 使用 Azure Key Vault 或托管标识，切勿硬编码

## 常见任务

### 初始租户设置
- 配置公司品牌
- 添加并验证自定义域
- 设置 DNS 记录（MX、SPF、DKIM、DMARC）
- 启用所需服务（Teams、SharePoint、Exchange）
- 创建组织结构（部门、位置）
- 设置默认用户设置和策略

### 用户入职
- 创建用户账户（单个或批量）
- 分配适当的许可证
- 添加到安全组和通讯组
- 配置邮箱和 OneDrive
- 设置多重身份验证
- 预配 Teams 访问权限

### 安全强化
- 启用安全默认值或条件访问
- 配置 MFA 强制实施
- 设置管理员角色分配
- 启用审计日志记录
- 配置反网络钓鱼策略
- 设置 DLP 和保留策略

### 报告与监控
- 活跃用户和许可证使用率
- 安全事件和警报
- 邮箱使用情况和存储空间
- SharePoint 站点活动
- Teams 使用情况和采用率
- 合规性和审计日志

## 限制

- **所需权限**：全局管理员或特定的基于角色的权限
- **API 速率限制**：Microsoft Graph API 对批量操作设有节流限制
- **许可证依赖**：某些功能需要特定的许可证级别（E3、E5）
- **委派限制**：某些任务无法委派给服务主体
- **区域差异**：合规功能可能因地理区域而异
- **混合场景**：本地 Active Directory 集成需要额外配置
- **第三方集成**：外部应用可能需要单独的身份验证和权限
- **PowerShell 先决条件**：需要安装适当的模块（Microsoft.Graph、ExchangeOnlineManagement 等）

## 安全注意事项

### 身份验证
- 切勿在脚本或配置文件中存储凭据
- 使用 Azure Key Vault 管理凭据
- 为自动化实施基于证书的身份验证
- 为管理员账户启用条件访问
- 使用 Privileged Identity Management (PIM) 实现 JIT 访问

### 授权
- 遵循最小权限原则
- 尽可能使用自定义管理员角色，而不是全局管理员
- 定期审查和审核管理员角色分配
- 启用 PIM 以获取临时提升的访问权限
- 将用户账户与管理员账户分开

### 合规性
- 为所有活动启用审核日志记录
- 根据合规要求保留日志
- 为受监管行业配置数据驻留
- 根据需要实施信息屏障
- 定期进行合规评估和报告

## 所需的 PowerShell 模块

要执行生成的脚本，请确保已安装以下模块：
- `Microsoft.Graph`（推荐，现代 Graph API）
- `ExchangeOnlineManagement`（Exchange Online 管理）
- `MicrosoftTeams`（Teams 管理）
- `SharePointPnPPowerShellOnline`（SharePoint 管理）
- `AzureAD` 或 `AzureADPreview`（Azure AD 管理——正在弃用）
- `MSOnline`（旧版，正在弃用——尽可能避免使用）

## 更新与维护

- Microsoft 365 功能和 API 发展迅速
- 定期查看 Microsoft 365 路线图，了解即将发生的变化
- 在部署到生产环境之前，先在非生产租户中测试脚本
- 订阅 Microsoft 365 管理中心消息中心以获取更新
- 将 PowerShell 模块更新到最新版本
- 定期审查安全基线（建议每季度一次）

## 实用资源

- **Microsoft 365 管理中心**：https://admin.microsoft.com
- **Microsoft Graph Explorer**：https://developer.microsoft.com/graph/graph-explorer
- **PowerShell Gallery**：https://www.powershellgallery.com
- **Microsoft Secure Score**：管理中心中的安全态势评估
- **Microsoft 365 合规中心**：https://compliance.microsoft.com
- **Azure AD 条件访问**：身份和访问管理策略