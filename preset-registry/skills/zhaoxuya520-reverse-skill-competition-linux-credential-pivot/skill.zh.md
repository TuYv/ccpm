---
name: competition-linux-credential-pivot
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Linux credential artifacts, service tokens, SSH material, cloud and container secrets, socket-level trust, and host-to-host pivot chains. Use when the user asks to trace Linux auth artifacts, accepted token or key replay, socket or service-account trust edges, sudo or capability abuse, or explain lateral movement across Linux challenge nodes. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Linux 凭据跳转

仅在 `$ctf-sandbox-orchestrator` 已处于活动状态并已确立沙箱假设、节点所有权和证据优先级之后，才将此技能作为下游专门化技能使用。如果尚未发生这种情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性优势在于 Linux 凭据材料以及这些材料被接受的位置时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将凭据存储与被接受的权限区分开。
2. 在得出结论之前，先记录用户、进程、命名空间、套接字、密钥文件以及服务信任边界。
3. 将工件恢复、重放路径和最终能力保持在同一条链中。
4. 区分本地提权与横向主机跳转。
5. 复现一条从工件到被接受访问的最小路径。

## 工作流程

### 1. 映射凭据与信任工件

- 记录 SSH 密钥、agent 套接字、kubeconfig、云令牌、服务账户机密、环境变量、配置文件以及进程内存线索。
- 记录 sudoers 规则、capabilities、setuid 二进制文件、systemd unit 上下文以及命名空间边界。
- 使每个工件都与其所有者、作用域和预期的接受服务保持关联。

### 2. 证明重放与跳转

- 展示密钥、令牌、套接字或机密在何处被接受：SSH、API、Unix 套接字、容器运行时或控制平面端点。
- 记录目标主机、协议、主体以及产生的会话或权限。
- 区分身份验证成功与有用的能力提升。

### 3. 精简为决定性的 Linux 跳转链

- 压缩为：已恢复的工件 -> 被接受的重放路径 -> 跳转主机或权限转换 -> 最终能力。
- 说明根本原因是密钥管理薄弱、令牌泄漏、套接字信任、sudo 或 capability 滥用，还是命名空间越界。
- 如果该链跳转进入内核漏洞利用边界，请移交给内核容器逃逸技能。

## 阅读此参考

- 加载 `references/linux-credential-pivot.md`，以获取工件清单、重放矩阵和证据打包内容。

## 需要保留的内容

- 工件路径、所有者、作用域、接受服务以及产生的主体
- 确切的跳转顺序，包括协议和目标主机或命名空间
- 一条可证明能力提升的最小可重放链
