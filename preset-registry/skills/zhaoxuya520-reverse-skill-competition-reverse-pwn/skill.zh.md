---
name: competition-reverse-pwn
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for reverse engineering, malware, DFIR, firmware, pwnable, and native exploit challenges. Use when the user asks to reverse a binary, unpack a sample, inspect a memory dump or PCAP, recover malware behavior, debug a crash, or build or verify an exploit chain under sandbox assumptions. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛逆向与 Pwn

本技能只能作为下游专项化技能使用，前提是 `$ctf-sandbox-orchestrator` 已经激活并已确立沙箱假设、节点归属和证据优先级。如果这些尚未完成，请先回到 `$ctf-sandbox-orchestrator`。

当挑战以二进制为主、且决定性路径要经过制品、解码层、进程行为、崩溃状态或利用原语时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 在脱壳、打补丁或插桩之前，先保存原始制品。
2. 从被动分诊开始：文件类型、头部、节区、导入表、字符串、熵、资源。
3. 判断路径应采取逆向优先、DFIR 优先还是利用优先。
4. 将每一条论断都绑定到一个可观测边界：解码边缘、持久化边缘、崩溃边缘或泄露边缘。
5. 从干净的基线出发复现制品或利用原语。

## 工作流程

### 1. 逆向或取证分诊

- 区分加载器、载荷、配置与解码后的行为。
- 将文件、内存、日志、注册表、服务、任务、IPC 和 PCAP 关联为一张图。
- 将解码或转储出的制品与原始样本分开存放。

### 2. 原生与利用路径

- 梳理缓解措施、加载器行为、libc 或运行时、syscall 与 IPC 暴露面，以及协议分帧。
- 分别记录利用原语、可控字节、泄露来源、目标对象和最终制品。
- 在怀疑原语之前，先比对宿主环境、libc、加载器和分帧方式的差异。

## 阅读本参考文档

- 阅读 `references/reverse-pwn.md`，了解分诊顺序、利用证据要求和常见失败模式。
- 如果任务具体涉及分阶段载荷边界、配置块、beacon 参数或解码后的 IOC 字段，优先使用 `$competition-malware-config`。
- 如果任务具体涉及固件分区、引导链、提取出的文件系统或更新包信任边界，优先使用 `$competition-firmware-layout`。
- 如果任务具体涉及上传解析、预览、压缩包解压、转换器或反序列化链，优先使用 `$competition-file-parser-chain`。
- 如果任务具体涉及 source map、产出的 bundle、chunk 注册表，或从已部署前端资产中重建隐藏的运行时结构，优先使用 `$competition-bundle-sourcemap-recovery`。
- 如果任务具体涉及容器到宿主的越界、内核利用前提条件、namespace 或 cgroup 交叉，或逃逸原语的验证，优先使用 `$competition-kernel-container-escape`。
- 如果任务具体涉及从抓包中重建协议、流或传输的制品，优先使用 `$competition-pcap-protocol`。
- 如果任务具体涉及自定义二进制或文本协议，且真正的阻碍在于重放状态、消息顺序或校验和逻辑，优先使用 `$competition-custom-protocol-replay`。
- 如果任务具体涉及在 EVTX、PCAP、注册表、邮件或磁盘制品之间重建时间线，优先使用 `$competition-forensic-timeline`。

## 需要保留的内容

- 偏移量、哈希、节区名、导入表、配置块、互斥体、注册表键值
- 崩溃偏移、寄存器、堆栈形态、泄露地址以及协议步骤
- 将原始、解码、转储和插桩后的制品分别保存为独立文件
