---
name: "agent-decision-receipts"
description: "Mint a tamper-evident, post-quantum-signed receipt for a consequential agent action (deploy, delete, pay, grant-access, model decision) so it can be verified later from the certificate alone. Use when an autonomous agent takes a side-effecting action that may need to be proven later, or when satisfying EU AI Act Article 12 record-keeping. Three decisions: whether an action needs a receipt, minting it, verifying it. Signing is delegated to the open-source OpenAgentOntology package. Not after-the-fact log analysis; not a hosted notary; not a legal opinion."
---
# Agent 决策收据

## 概述

日志会说明某个操作已经发生。**收据具有防篡改性**：它会记录由谁、执行了什么操作、依据何种策略，并附有签名，因此之后的任何编辑都会导致签名失效。此技能会为具有重大影响的 Agent 操作签发收据，并且之后仅凭证书即可验证：无需数据库、无需网络，也无需信任签发者。

加密功能不在此技能中实现。它使用的是开源的 **OpenAgentOntology** 收据原语（Apache-2.0），当安装了后量子后端时，该原语会使用 Ed25519 **以及**后量子签名 ML-DSA-65（FIPS 204）+ SLH-DSA（FIPS 205）对每张收据进行签名。此技能属于决策层：何时签发、写入哪些内容、如何验证。只需安装一次，无需为每个技能单独配置加密功能。

**只做三项决策，除此之外别无其他：**

1. **此操作是否需要收据？** — 具有副作用 + 影响重大 + 之后需要可证明 = 是。
2. **签发收据** — 构建操作清单，并使用 OAO 原语对其签名。
3. **验证收据** — 仅凭证书重新计算哈希并检查每一项签名。

此技能**并非用于日志分析。**日志描述已经发生的事情，并且可以被悄无声息地编辑。收据会在执行前或执行时签发，若被编辑则会失效。使用日志进行调试；使用收据作为证据。

此技能**并非托管式公证服务。**它签发的是本地自签名收据，任何人都可以离线验证。跨组织验证（由一个组织向另一个组织提供证明）属于独立的托管服务，不在此处的范围内。

此技能**并非法律意见。**它生成的证据在形式上旨在支持类似 FRE 902(13)/(14) 的认证以及《欧盟人工智能法案》第 12 条的记录保存要求。特定收据能否被采纳，应由法律顾问判断。

## 快速开始

```bash
# Install the open-source receipt primitive (Apache-2.0). Add [pq] for the post-quantum legs.
pip install "openagentontology[pq]"

# 1. Build + validate an action manifest (stdlib only, no crypto, no network)
python scripts/build_action_manifest.py --agent my-deploy-agent --operation deploy \
    --target prod/api --policy "EU AI Act Art 12" --out action.json

# 2. Mint the receipt over it (Ed25519 + post-quantum legs)
python -c "import json,openagentontology.receipt as r; \
  print(json.dumps(r.mint_receipt(json.load(open('action.json')), decision='ACTION_GOVERNED')))" > receipt.json

# 3. Verify from the cert alone (no DB, no network)
python -c "import json,openagentontology.receipt as r; \
  print(r.verify_receipt(json.load(open('receipt.json'))))"
# -> {'ok': True, 'sig_ok': True, ... 'reason': 'verified from the cert alone via: ed25519, ml_dsa, slh_dsa'}
```

> **依赖项说明。**此技能将签名操作委托给 `openagentontology`（Apache-2.0，可选择执行 `pip install` 进行安装）。此处附带的脚本仅使用标准库，不会向代码仓库添加任何依赖项；该软件包由操作者安装（自备库模式）。如果未安装，构建步骤仍然可以正常工作——只有签发和验证需要该软件包。

## 核心工作流程

以下三项决策构成了此技能：判断是否需要收据、签发收据，然后进行验证。

## 决策 1：此操作是否需要凭证？

当操作同时满足以下**三个**条件时，签发凭证：

| 检验项 | 在以下情况下签发…… |
|------|-----------|
| 产生副作用 | 操作会写入、发送、部署、删除、付款、授予访问权限或更改外部状态 |
| 后果重大 | 错误调用会造成经济损失、违反合规要求或伤害他人 |
| 事后可证明 | 某人（审计员、保险公司、监管机构、法院、交易对手）日后可能会问：“智能体做了什么，为什么这样做？” |

只读、可逆、无关紧要的操作**不**需要凭证。为所有操作签发凭证会淹没有效信号；完全不签发凭证，则真正关键的那次调用将无法得到证明。

高信号触发条件（默认签发）：`deploy`、`delete`、`pay`/`wire`/`refund`、`grant_access`、`export`/`egress`、`approve`/`deny` 理赔申请，以及高风险 AI 系统中任何会影响个人的模型决策。

## 决策 2：签发凭证

操作清单可以是描述智能体所执行操作的任何 ASCII 安全字典。其中有四个键是**必需的**——如果缺少任何一个，`build_action_manifest.py` 都会拒绝该清单（退出码 2）。另外两个键会自动添加：

| 键 | 是否必需？ | 承载的内容 |
|-----|-----------|-----------------|
| `agent_id` | **必需** | 执行操作的智能体 |
| `operation` | **必需** | 动词（部署 / 删除 / 付款 / 决策 / ……） |
| `target` | **必需** | 操作所针对的对象 |
| `policy` | **必需** | 管辖该操作的规则（例如 "EU AI Act Art 12"、"internal change-control"） |
| `inputs_hash` | 自动添加 | `--inputs` 的哈希，因此无需以明文形式存储完整载荷（省略 `--inputs` 时，默认为空输入的哈希） |
| `decision_label` | 自动添加 | 凭证的决策标签（默认为 `ACTION_GOVERNED`） |

`mint_receipt(manifest, decision=...)` 会将完整清单哈希到凭证证据中，对规范化正文进行签名，并返回包含以下内容的凭证：`evidence_hash`、`signature_b64`（Ed25519），以及在安装 `[pq]` 后提供的 `ml_dsa_signature_b64` + `slh_dsa_signature_b64`。每个签名分支都对相同的字节进行签名；验证其中任意一个即可证明真实性。

> 完整的凭证模式和采用后量子方案的理由，请参阅 [references/receipt-fields.md](references/receipt-fields.md)。

## 决策 3：验证凭证

`verify_receipt(receipt)` 会重新计算 `sha256(canonical(evidence))`，将其与 `evidence_hash` 比较，然后检查其具有相应后端支持的每个签名分支。它会返回 `{ok, hash_ok, sig_ok, legs, reason}`。对操作中任何位置的单个字节进行编辑都会导致 `hash_ok` 失败；伪造签名则会导致对应分支验证失败。验证仅需要凭证本身——无需回调签发方。

正是这一属性使其能够成为证据：即使审查者不信任签发方，也仍然可以完全离线地确认凭证完好无损且真实可信。

## 反模式

- **为日志而非决策签发凭证。** 为事后写入的日志行签发凭证不能证明任何事情。应在操作发生时，针对操作本身签发凭证。
- **将签名密钥与凭证存放在一起。** 如果密钥泄露，签名便毫无意义。应像对待任何签名密钥一样对待该密钥；切勿将其提交到代码库。
- **在后量子签名分支可用时仍仅使用 Ed25519。** 凭证是长期留存的证据。使用后量子签名分支（ML-DSA-65 + SLH-DSA）一次性完成签名，这样，即使未来的量子计算机能够破解 Ed25519，凭证仍然可以验证。请安装 `[pq]`。
- **在清单中放入原始机密或 PII。** 清单会被哈希到证据中，并且可以从凭证中恢复。应承载哈希（`inputs_hash`），而不是明文。
- **声称其“可采纳”。** 这种证据的设计旨在*支持*类似 FRE 902(13)/(14) 的认证。是否可采纳由法院决定，不应由工具自行宣称。
- **在缺少加密功能时伪造签名。** 该原语会改为显式发出 `unsigned` 标志。绝不能将未签名的凭证冒充为已签名凭证。

## 交叉引用

- `ra-qm-team/skills/eu-ai-act-specialist/` — 确定 AI 系统的风险等级及第 12 条规定的义务；本技能会生成这些义务所要求的逐操作记录。
- `ra-qm-team/skills/iso42001-specialist/` — AI 管理体系控制措施；回执是这些控制措施所要求的逐决策证据。
- OpenAgentOntology (Apache-2.0)：本技能所驱动的开放式回执原语 — `pip install "openagentontology[pq]"`。