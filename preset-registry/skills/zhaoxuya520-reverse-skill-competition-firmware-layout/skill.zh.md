---
name: competition-firmware-layout
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for firmware images, partition tables, boot chains, update packages, extracted filesystems, embedded configs, and device-facing trust boundaries. Use when the user asks to unpack firmware, map partition layout, inspect bootloader or init chains, recover update keys or credentials, trace config loading, or explain how a device surface reaches the decisive artifact. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛固件布局

仅在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当难点在于理解固件镜像的结构、启动、更新方式，以及如何转化为可触达的设备行为时，使用本技能。

除非用户明确要求使用英文，否则请用简体中文回复。

## 快速开始

1. 将原始镜像、提取出的分区、解包的文件系统以及打过补丁的副本作为独立产物分别保存。
2. 在修改任何内容之前，先梳理外层容器、分区表、引导加载程序、内核、rootfs、配置和更新元数据。
3. 按顺序追踪启动链或更新链，而不是直接跳到最有趣的文件。
4. 将密钥、签名、偏移量、分区边界和 init 入口点记录在一条紧凑的证据链中。
5. 从最小的提取路径出发，复现起决定性作用的秘密、分支或可触达的服务。

## 工作流程

### 1. 确立镜像布局

- 识别容器类型、分区头、压缩方式、文件系统类型，以及任何追加或嵌套的镜像。
- 在提取操作改变任何内容之前，先记录偏移量、大小、哈希值、挂载点和分区名称。
- 将引导加载程序、内核、initramfs、rootfs、配置数据块和更新元数据区分为不同的层。

### 2. 追踪启动或更新流程

- 梳理控制流如何从引导加载程序到内核再到 init 和服务，或从更新包到验证器再到安装器。
- 记录每个阶段消耗了哪些凭据、证书、密码、种子或配置文件。
- 区分固件入库时表达的意图与提取出的文件实际支持的运行时行为。

### 3. 归约到决定性路径

- 展示从镜像边界到服务暴露、认证绕过、调试接口、凭据恢复或 flag 产物的最小链路。
- 将提取出的文件系统、派生配置和补丁实验与原始输入分开保存。
- 如果提取之后挑战主要涉及原生崩溃行为或漏洞利用原语，请切换回更宽泛的逆向技能。

## 阅读此参考文档

- 加载 `references/firmware-layout.md`，以获取布局检查清单、启动链检查清单和证据打包方案。

## 需要保留的内容

- 分区偏移量、哈希值、文件系统类型、挂载路径、启动入口点和更新元数据
- 提取出的秘密、配置路径、init 脚本、服务单元，以及与消耗它们的阶段相关联的凭据
- 作为独立产物的原始镜像、提取出的各层、挂载视图和打过补丁的副本
