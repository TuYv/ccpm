---
name: aegisops-ai
description: "Autonomous DevSecOps & FinOps Guardrails. Orchestrates Gemini 3 Flash to audit Linux Kernel patches, Terraform cost drifts, and K8s compliance."
risk: safe
source: community
author: Champbreed
date_added: "2026-03-24"
---
# /aegisops-ai — 自主治理编排器

AegisOps-AI 是一款专业级的“Living Pipeline”，
可将高级 AI 推理直接集成到
SDLC 中。它充当面向系统级安全、云基础设施成本
与 Kubernetes 合规性的智能门禁。

## 目标

通过以下方式自动化高风险的安全与财务审计：
1. 在 Linux 内核补丁中识别基于逻辑的漏洞（UAF、Stale State）。
2. 检测 Terraform 计划中的大规模“Silent Disaster”成本漂移。
3. 将自然语言安全意图转换为强化后的 K8s manifest。

## 适用场景
- **内核补丁审查：** 审计基于 C 的原始 Git diff 中的内存安全问题。
- **预应用 IaC 审计：** 分析 `terraform plan` 输出以防止账单激增。
- **集群加固：** 为 Deployment 生成“最小权限” securityContext。
- **CI/CD 质量门禁：** 通过 GitHub Actions 阻止不合规的合并。

## 不适用场景

- **Web 应用逻辑：** 不用于常规 Web 漏洞（XSS、SQLi）；请使用专用 SAST 扫描器。
- **非 C 语言内存分析：** 补丁分析器针对 C 逻辑进行了优化；请避免用于 Python、JS 等高级语言。
- **直接资源变更：** 这是一款*审计器*，而非部署工具。它不会执行 `terraform apply` 或 `kubectl apply`。
- **事后分析：** 对于分析先前 AI 会话为何失败，请使用 `/analyze-project`。

---
## 🤖 生成式 AI 集成

AegisOps-AI 利用 **Google GenAI SDK** 实现用于自主安全与财务审计的“Reasoning Path”：

* **神经网络补丁分析：** 对 Linux 内核补丁进行语义代码审查，超越简单模式匹配，理解复杂的内存状态逻辑。
* **智能成本综合：** 通过财务推理模型处理原始 Terraform plan 差异，识别高风险的资源升级和“静默”财务漂移。
* **自然语言策略映射：** 将人工的安全意图转换为语法正确、强化后的 Kubernetes `securityContext` 配置。

## 🧭 核心模块

### 1. 🐧 内核补丁审查器（`patch_analyzer.py`）

* **问题：** 手动审查 Linux 内核内存安全既耗时又容易出错。
* **方案：** Gemini 3 对原始 Git diff 进行“深度推理”审计，在几秒内检测关键内存损坏漏洞（UAF、Stale State）。
* **关键输出：** `analysis_results.json`

### 2. 💰 FinOps 与云审计（`cost_auditor.py`）

* **问题：** 基础设施即代码（IaC）的变更可能导致意外的“Silent Disasters”和大规模云账单飙升。
* **方案：** 分析 `terraform plan` 输出以识别成本异常——例如从 `t3.micro` 误升级为高性能 GPU 实例。
* **关键输出：** `infrastructure_audit_report.json`

### 3. ☸️ K8s 策略加固器（`k8s_policy_generator.py`）

* **问题：** 在 Kubernetes 中实现“最小权限”安全上下文复杂且常被忽视。
* **方案：** 将自然语言安全需求转换为可上线的强化 YAML 清单（只读根文件系统、强制非 root 等）。
* **关键输出：** `hardened_deployment.yaml`

## 🛠️ 安装与环境

### 1. 克隆仓库

```bash
git clone https://github.com/Champbreed/AegisOps-AI.git
cd AegisOps-AI
```
## 2. 安装

```bash
python3 -m venv venv
source venv/bin/activate
pip install google-genai python-dotenv
```
### 3. API 配置

在项目根目录创建 `.env` 文件，用于安全存储
你的凭证：

```bash
printf 'GEMINI_API_KEY=%s\n' "$GEMINI_API_KEY" > .env
```
## 🏁 运行面板

要按顺序执行整套 agent 并生成全部安全报告：

```bash
python3 main.py
```
### 模式：权限过高容器

* **特征：** `allowPrivilegeEscalation: true` 或以 root 用户运行。
* **调查：** 将安全意图（例如“仅非 root”）传递给 K8s Hardener 模块。

---

## 💡 最佳实践

* **上下文为王：** 在 Git diff 周围提供至少 5 行上下文，以提高神经推理准确性。
* **持续门禁：** 在每次基础设施变更前都运行 FinOps 审计，而不是之后再运行。
* **人工签核：** 将 AI 结果作为高保真信号使用，但对内核级合并保持人工在场。

---

## 🔒 安全与安全性说明

* **密钥管理：** 在生产环境中使用 CI/CD secrets 存储 `GEMINI_API_KEY`。
* **最小权限：** 先在预发布环境中测试“加固”清单，以确保无功能回归。

## Links

+ - **Repository**: https://github.com/Champbreed/AegisOps-AI
+ - **Documentation**: https://github.com/Champbreed/AegisOps-AI#readme

## 限制
- 仅在任务明确符合上述范围时使用本 skill。
- 不要将输出视为替代特定环境验证、测试或专家审查的替代品。
- 若缺少必需输入、权限、安全边界或成功标准，请停止并请求澄清。
