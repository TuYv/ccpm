---
name: secure-workflow-guide
description: Guides through Trail of Bits' 5-step secure development workflow. Runs Slither scans, checks special features (upgradeability/ERC conformance/token integration), generates visual security diagrams, helps document security properties for fuzzing/verification, and reviews manual security areas. Use when securing a smart contract end to end rather than hunting one bug, checking a project on every check-in or before deployment, triaging a Slither report, or asking where to start on smart contract security.
---
# 安全工作流指南

## 目的

指导你使用 Trail of Bits 的安全开发工作流——这是一个贯穿开发全过程、用于增强智能合约安全性的 5 步流程。

**使用时机**：每次提交代码时、部署之前，或你需要安全审查时

---

## 5 步工作流

涵盖的安全工作流包括：

### 步骤 1：检查已知安全问题
运行内置 70 多个检测器的 Slither 来发现常见漏洞：
- 按严重程度解析发现的问题
- 结合文件引用解释每个问题
- 推荐修复方案
- 帮助甄别误报

**目标**：干净的 Slither 报告，或有书面记录的甄别结果

### 步骤 2：检查特殊特性
检测并验证适用的特性：
- **可升级性**：slither-check-upgradeability（17 种升级风险）
- **ERC 合规性**：slither-check-erc（6 种常见规范）
- **代币集成**：推荐 token-integration-analyzer 技能
- **安全属性**：针对 ERC20 的 slither-prop

**注意**：仅运行适用于你代码库的检查

### 步骤 3：可视化安全检查
生成 3 张安全图表：
- **继承图**：识别遮蔽（shadowing）和 C3 线性化问题
- **函数摘要**：展示可见性和访问控制
- **变量与授权**：映射哪些角色能够写入状态变量

审查每张图表，排查安全隐患

### 步骤 4：记录安全属性
帮助记录关键安全属性：
- 状态机转换与不变量
- 访问控制要求
- 算术约束与精度
- 外部交互安全
- 标准合规性

然后设置测试：
- **Echidna**：基于属性的模糊测试（含不变量）
- **Manticore**：结合符号执行的形式化验证
- **自定义 Slither 检查**：项目特定的业务逻辑

**注意**：这是对安全性最重要的活动

### 步骤 5：人工审查领域
分析自动化工具会遗漏的领域：
- **隐私**：链上机密、commit-reveal 需求
- **抢跑（Front-running）**：滑点保护、顺序风险、MEV
- **密码学**：弱随机性、签名问题、哈希碰撞
- **DeFi 交互**：预言机操纵、闪电贷、协议假设

在代码库中搜索这些模式并标记风险

有关每个步骤的详细说明、命令和解释，请参阅 [WORKFLOW_STEPS.md](resources/WORKFLOW_STEPS.md)。

---

## 我的工作方式

被调用时，我将：

1. **探索你的代码库**以了解其结构
2. **执行步骤 1**：Slither 安全扫描
3. **检测并执行步骤 2**：特殊特性检查（仅执行适用的部分）
4. **生成步骤 3**：可视化安全图表
5. **指导步骤 4**：安全属性记录
6. **分析步骤 5**：人工审查领域
7. **提供行动计划**：按优先级排序的修复项和后续步骤

会根据以下因素灵活调整：
- 你安装了哪些工具
- 哪些内容适用于你的项目
- 你处于开发的哪个阶段

---

## 合理化借口（不可跳过）

| 合理化借口 | 为什么它是错的 | 必须采取的行动 |
|-----------------|----------------|-----------------|
| “Slither 不可用，我手动检查” | 手动检查会遗漏 70 多种检测器模式 | 安装并运行 Slither，或书面记录其受阻原因 |
| “无法生成图表，我用文字描述架构” | 文字描述不具备可视性——图表能揭示文字遗漏的模式 | 执行 slither --print 命令，生成真正的可视化输出 |
| “未检测到升级，跳过可升级性检查” | 代理和升级往往是隐式的或已在计划中 | 跳过步骤 2 检查之前，先通过代码库搜索验证 |
| “不是代币，跳过 ERC 检查” | 代币可能在没有明显 ERC 继承的情况下被集成 | 跳过之前先检查是否存在代币交互、转账、余额操作 |
| “现在无法设置 Echidna，建议以后再做” | 基于属性的测试属于步骤 4，不是可选项 | 立即记录属性，搭建模糊测试基础设施 |
| “没有 DeFi 交互，跳过预言机/闪电贷检查” | DeFi 模式可能出现在意想不到的地方（价格馈送、外部调用） | 完成步骤 5 人工审查，在代码库中搜索相关模式 |
| “这一步不适用于我的项目” | 未经核实就断言“不适用” = 遗漏漏洞 | 在宣布不适用（N/A）之前，先通过明确的代码库搜索验证 |
| “我不运行工作流，改为提供通用安全建议” | 通用建议无法落地执行，工作流能发现具体问题 | 执行全部 5 个步骤，生成附带 file:line 引用的项目专属发现 |

---

## 输出示例

工作流完成后，你将获得一份涵盖以下内容的综合安全报告：

- **步骤 1**：附带严重程度、文件引用和修复建议的 Slither 发现
- **步骤 2**：特殊特性验证结果（可升级性、ERC 合规性等）
- **步骤 3**：分析继承、函数和状态变量授权的可视化图表
- **步骤 4**：已记录的安全属性和测试设置（Echidna/Manticore）
- **步骤 5**：人工审查发现（隐私、抢跑、密码学、DeFi 风险）
- **行动计划**：附工作量估算的关键/高/中优先级任务
- **工作流检查清单**：全部 5 个步骤的进度

完整的工作流报告示例请参阅 [EXAMPLE_REPORT.md](resources/EXAMPLE_REPORT.md)。

---

## 你将获得什么

**安全报告**：
- 附带严重程度和修复方案的 Slither 发现
- 特殊特性验证结果
- 可视化图表（PNG/PDF）
- 人工审查发现

**行动计划**：
- [ ] 需立即修复的关键问题
- [ ] 需记录的安全属性
- [ ] 需设置的测试（Echidna/Manticore）
- [ ] 需人工审查的领域

**工作流检查清单**：
- [ ] 干净的 Slither 报告
- [ ] 特殊特性已验证
- [ ] 可视化检查已完成
- [ ] 属性已记录
- [ ] 人工审查已完成

---

## 获取帮助

**Trail of Bits 资源**：
- 办公时间（Office Hours）：每周二（[日程安排](https://meetings.hubspot.com/trailofbits/office-hours)）
- Empire Hacking Slack：#crytic 和 #ethereum 频道

**其他安全事项**：
- 切记：安全不仅仅是智能合约的事
- 链下安全（所有者密钥、基础设施）同样关键

---

## 准备开始

准备好后告诉我，我将对你的代码库完整执行一遍工作流！
