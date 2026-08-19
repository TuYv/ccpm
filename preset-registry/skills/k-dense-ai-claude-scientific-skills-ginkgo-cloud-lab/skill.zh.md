---
name: ginkgo-cloud-lab
description: Submit and manage protocols on Ginkgo Bioworks Cloud Lab (cloud.ginkgo.bio), a web-based interface for autonomous lab execution on Reconfigurable Automation Carts (RACs). Use when the user wants to run protein expression and purification (cell-free, E. coli, or Pichia), HiBiT or A280 or LabChip quantification, IVT mRNA/circRNA synthesis, thermal shift / developability assays, Echo-MS enzyme or analyte methods, SPR target onboarding, fluorescent pixel art, or otherwise interact with Ginkgo Cloud Lab services. Covers protocol selection, input preparation, pricing, and ordering workflows.
license: MIT license
allowed-tools: Read
metadata:
  version: "2.0"
---
# Ginkgo Cloud Lab

## 概述

Ginkgo Cloud Lab (https://cloud.ginkgo.bio) 提供对 Ginkgo Bioworks 自动化实验室基础设施的远程访问。实验方案在可重构自动化小车（RAC）上执行——这些模块化单元配备机械臂、磁悬浮样品运输系统，以及覆盖 70 多种仪器的工业级软件。

该平台还包括 **EstiMate**，这是一款 AI 代理，可接受人类语言描述的实验方案，并针对目录中未列出的定制工作流返回可行性评估和定价。

目录分为 **表达与纯化**（体外 / 无细胞 / E. coli / Pichia）、**表征与分析**、**方法与靶标接入**以及**特色服务**。选择下面的实验方案，然后阅读其参考文件，了解输入、输出、自动化工作流和订购详情。

## 可用实验方案

### 表达与纯化 - 体外

| 实验方案 | 读出 | 价格 | 周转时间 | 状态 |
|---|---|---|---|---|
| [IVT mRNA/circRNA 合成](references/ivt-rna-synthesis-qpcr.md) | qPCR（mRNA 或 circRNA，384 孔板） | $99/样本 | 最多 12 个工作日 | 已认证 |

### 表达与纯化 - 无细胞（E. coli CFPS）

| 实验方案 | 读出 | 价格 | 周转时间 | 状态 |
|---|---|---|---|---|
| [验证序列表达](references/cell-free-protein-expression-validation.md) | 是否通过判定：滴度 + 纯度（最多 1800 bp） | $39/样本 | 最多 10 天 | 已认证 |
| [优化表达条件](references/cell-free-protein-expression-optimization.md) | 24 种条件下的 DoE | $199/样本 | 最多 11 天 | 已认证 |
| [表达 + 定量（HiBiT）](references/cell-free-protein-expression-hibit.md) | 发光检测，无需纯化 | $39/样本 | 最多 11 天 | 已认证 |
| [表达 + 纯化（A280）](references/cfps-strep-tag-purification-a280.md) | Strep-tag，A280 产量 | $149/样本 | 最多 11 天 | 已认证 |
| [表达 + 纯化 minibinder](references/minibinder-strep-tag-a280.md) | Strep-tag、A280、LabChip | $149/样本 | 最多 11 天 | 已认证 |
| [表达 + 纯化（A280 + LabChip）](references/cfps-expression-purification-quantification.md) | Strep-tag、A280 + 纯度/大小 | $159/样本 | 最多 12 天 | 已认证 |

### 表达与纯化 - E. coli

| 实验方案 | 读出 | 价格 | 周转时间 | 状态 |
|---|---|---|---|---|
| [表达 + 定量（HiBiT）](references/ecoli-protein-expression-hibit.md) | 发光检测（最多 384 个构建体） | $79/样本 | 最多 3 周 | 已认证 |
| [表达 + 纯化（A280）](references/ecoli-protein-expression-histag-a280.md) | His-tag，A280 产量 | $199/样本 | 最多 3 周 | 已认证 |
| [表达 + 纯化 minibinder](references/ecoli-minibinder-expression-histag-a280.md) | His-tag，A280 产量 | $199/样本 | 最多 3 周 | 已认证 |
| [表达 + 纯化（A280 + LabChip）](references/ecoli-expression-purification-quantification.md) | His-tag、A280 + 纯度/大小 | $209/样本 | 最多 3 周 | 已认证 |

### 表达与纯化 - Pichia

| Protocol | Readout | Price | Turnaround | Status |
|---|---|---|---|---|
| [Express + quantify (LabChip)](references/pichia-protein-expression-labchip.md) | 分泌蛋白、大小/纯度（最多 96 个） | $89/样本 | 最多 4 周 | 已认证（新增） |

### 表征与检测

| Protocol | Readout | Price | Turnaround | Status |
|---|---|---|---|---|
| [Express + thermal shift](references/cfps-strep-purification-thermal-shift.md) | SYPRO Orange Tm（Tonset、TM1-3） | $159/样本 | 最多 12 天 | 已认证 |
| [Detect enzymatic products (Echo-MS)](references/echo-ms-cfps-detection.md) | 通过 Echo-MS 检测底物/产物 | $44/样本 | 最多 13 天 | Beta |

### 方法与靶标接入

| Protocol | Readout | Price | Turnaround | Status |
|---|---|---|---|---|
| [Onboard Echo-MS method](references/echo-ms-method-onboarding.md) | 校准曲线、LOD/LOQ | $799/分子 | 最多 3 周 | 已认证 |
| [Onboard SPR target](references/spr-target-onboarding.md) | 经验证的 SPR 捕获方法 | $1,399/靶标 | 最多 4 周 | Beta |

### 专项

| Protocol | Readout | Price | Turnaround | Status |
|---|---|---|---|---|
| [Generate fluorescent pixel art](references/fluorescent-pixel-art-generation.md) | UV 照片、7 色大肠杆菌调色板 | $25/板 | 最多 7 天 | Beta |

**即将推出：**蛋白表达与结合亲和力表征（表达 + 纯化，然后针对靶标筛选结合亲和力）。

## 选择协议

- **需要快速筛查表达能力？**无细胞 HiBiT（$39）或验证序列表达（$39）。
- **需要纯化蛋白 + 产量？**A280 分档（无细胞或大肠杆菌）；添加 LabChip 以检测纯度/大小。
- **困难靶标/膜蛋白/二硫键/辅因子靶标？**无细胞优化（24 条件 DoE）。
- **分泌型或真核靶标？**毕赤酵母表达。
- **筛选从头设计的结合体/微型结合体？**无细胞或大肠杆菌微型结合体分档，然后通过 SPR 接入进行动力学分析。
- **酶活性/生物催化？**Echo-MS 酶学检测（首先接入分析物方法）。
- **稳定性/可开发性排名？**热转移检测。
- **RNA（mRNA/circRNA）？**IVT 合成 + qPCR。

## 通用订购流程

1. 在 https://cloud.ginkgo.bio/protocols 选择协议
2. 配置参数（蛋白质/样本/分子/靶标数量、重复数、板数）
3. 下载协议的输入模板并上传输入文件（序列协议使用 FASTA/CSV/XLSX；像素艺术使用 Design Tool；接入服务使用供应商目录编号）
4. 在 Additional Details 字段中添加任何特殊要求
5. 提供电子邮件、同意协议条款，然后加入购物车/提交，以接收可行性报告和价格报价

对于上面未列出的协议，请使用 **EstiMate** 聊天（https://cloud.ginkgo.bio/estimate）以自然语言描述自定义协议，并接收兼容性评估和定价。

## 身份验证

访问 Ginkgo Cloud Lab：https://cloud.ginkgo.bio。可能需要创建账户或获得机构访问权限。如有访问问题，请联系 Ginkgo：cloud@ginkgo.bio。

## 核心基础设施

- **RACs（可重构自动化小车）：** 配备高精度机械臂和磁悬浮运输系统的模块化机器人单元
- **Catalyst Software：** 负责协议编排、调度、参数配置和实时监控
- **70+ 集成仪器：** Agilent Bravo 液体处理工作站、Beckman/Labcyte Echo 声学分液器、BMG PHERAstar / Tecan Spark 读板仪、Revvity LabChip、Bio-Rad CFX Opus、Nicoya Alto SPR、SciEx Echo-MS、Inheco/Cytomat 培养箱等
- **Nebula：** Ginkgo 位于马萨诸塞州波士顿的自主实验室设施