---
name: aegisops-ai
description: "Autonomous DevSecOps & FinOps Guardrails. Orchestrates Gemini 3 Flash to audit Linux Kernel patches, Terraform cost drifts, and K8s compliance."
risk: safe
source: community
author: Champbreed
date_added: "2026-03-24"
---
# /aegisops-ai — 自主治理编排器

AegisOps-AI 是一款专业级“Living Pipeline”，
它将高级 AI 推理直接整合到 
SDLC 中。它充当系统级安全、云基础设施成本和 Kubernetes 合规性的
智能看门人。

## 目标

通过以下方式自动化高风险的安全和财务审计：
1. 在 Linux Kernel 补丁中识别基于逻辑的漏洞（UAF、Stale State）。
2. 检测 `terraform plan` 中大规模的“Silent Disaster”成本漂移。
3. 将自然语言安全意图转化为强化后的 K8s manifest。

## 适用场景
- **内核补丁审查：** 审核基于 C 的原始 Git diff，以进行内存安全检查。
- **预应用 IaC 审计：** 分析 `terraform plan` 输出以防止账单激增。
- **集群加固：** 为部署生成“最小权限”`securityContext`。
- **CI/CD 质量门禁：** 通过 GitHub Actions 阻止不符合要求的合并。

## 不适用场景

- **Web 应用逻辑：** 不要用于常规 Web 漏洞（XSS、SQLi）；请使用专用 SAST 扫描器。
- **非 C 内存分析：** 补丁分析器针对 C 逻辑进行了优化；避免用于 Python 或 JS 等高级语言。
- **直接资源变更：** 这是一个*审计器*，而非部署工具。它不会执行 `terraform apply` 或 `kubectl apply`。
- **事后分析：** 如需分析先前 AI 会话失败原因，请使用 `/analyze-project`。

---
## 🤖 生成式 AI 集成

AegisOps-AI 利用 **Google GenAI SDK** 实现“推理路径”，用于自主化的安全与财务审计：

* **神经补丁分析：** 对 Linux Kernel 补丁进行语义代码审查，超越简单模式匹配，理解复杂的内存状态逻辑。
* **智能成本综合：** 通过财务推理模型处理原始 Terraform plan 差异，识别高风险资源扩容与“沉默”财务漂移。
* **自然语言策略映射：** 将人类安全意图转化为语法正确、经过加固的 Kubernetes `securityContext` 配置。

## 🧭 核心模块

### 1. 🐧 内核补丁审阅器（`patch_analyzer.py`）

* **问题：** Linux Kernel 内存安全的人工审查耗时且易出错。
* **解决方案：** Gemini 3 对原始 Git diff 进行“深度推理”审计，以秒级检测关键内存破坏漏洞（UAF、Stale State）。
* **关键输出：** `analysis_results.json`

### 2. 💰 FinOps 与云审计器（`cost_auditor.py`）

* **问题：** 基础设施即代码（IaC）变更可能导致意外的“Silent Disaster”和巨额云账单激增。
* **解决方案：** 分析 `terraform plan` 输出，识别成本异常——例如误将实例从 `t3.micro` 升级到高性能 GPU 实例。
* **关键输出：** `infrastructure_audit_report.json`

### 3. ☸️ K8s 策略加固器（`k8s_policy_generator.py`）

* **问题：** 在 Kubernetes 中实施“最小权限”安全上下文复杂且常被忽视。
* **解决方案：** 将自然语言安全需求转化为可用于生产环境、经过加固的 YAML 清单（只读根文件系统、非 root 强制执行等）。
* **关键输出：** `hardened_deployment.yaml`

## 🛠️ 安装与环境配置

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

在根目录创建 `.env` 文件以安全存储你的凭据：

```bash
printf 'GEMINI_API_KEY=%s\n' "$GEMINI_API_KEY" > .env
```
## 🏁 运行面板

按顺序执行完整代理套件并生成所有安全报告：

```bash
python3 main.py
```
### 模式：过度权限容器

* **指示器：** `allowPrivilegeEscalation: true` 或 root 用户执行。
* **调查：** 将安全意图（例如“仅非 root”）传递给 K8s Hardener 模块。

---

## 💡 最佳实践

* **上下文为王：** 在 Git diff 周围提供至少 5 行上下文，以获得更准确的神经推理。
* **持续门禁：** 在每次基础设施变更前运行 FinOps 审计，而不是之后。
* **人工签核：** 将 AI 结果作为高保真信号使用，但在内核级合并中保留人工复核。

---

## 🔒 安全与安全说明

* **密钥管理：** 在生产环境中为 `GEMINI_API_KEY` 使用 CI/CD 密钥。
* **最小权限：** 首先在预发环境测试“加固”清单，以确保不存在功能回归。

## Links

+ - **仓库：** https://github.com/Champbreed/AegisOps-AI
+ - **文档：** https://github.com/Champbreed/AegisOps-AI#readme

## 限制
- 仅在任务与上述范围明确匹配时使用该 skill。
- 不要将输出视为环境特定验证、测试或专家评审的替代方案。
- 若缺少必要输入、权限、安全边界或成功标准，请停止并请求澄清。
