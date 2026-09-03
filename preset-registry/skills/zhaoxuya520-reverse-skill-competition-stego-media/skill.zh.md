---
name: competition-stego-media
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for image, audio, video, document, and container steganography. Use when the user asks to inspect metadata, alpha or palette channels, LSBs, thumbnails, appended trailers, QR fragments, transcoding artifacts, or recover a hidden payload from media without blind brute force. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛隐写媒体

仅在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化来使用。如果这些尚未发生，请先返回 `$ctf-sandbox-orchestrator`。

当挑战位于媒体容器、隐藏通道或附加载荷之中，而非传统的加密数据块时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 在猜测隐藏层之前，先确认真实的容器类型、尺寸、时长、编解码器和分块布局。
2. 在开展更深入的信号域工作之前，先检查元数据、缩略图、附属文件和追加的尾部数据。
3. 依据证据对候选通道进行排序：alpha 通道、调色板、LSB、变换域残差、帧顺序或容器空余空间。
4. 将每个提取出的层单独保存，使变换链保持可复现。
5. 在隐藏载荷被复现时停止，而不是仅在怀疑其存在时停止。

## 工作流程

### 1. 确立容器真相

- 检查文件头、分块表、EXIF 或文档元数据、容器索引、缩略图以及文件大小异常。
- 将声明的格式与实际观察到的结构进行对比，以发现多态文件、追加的归档或格式错误的尾部数据。
- 记录看起来有希望的确切偏移量、帧编号或通道边界。

### 2. 检查候选通道

- 检查 alpha 通道、调色板顺序、RGB 或 YUV 平面、LSB、频谱图特征、文档对象流或视频帧差分。
- 优先采用由证据驱动的尝试，而不是暴力尝试每一种变换。
- 记录载荷是纯字节、另一个媒体层、压缩数据还是加密数据块。

### 3. 重建隐藏载荷路径

- 保持链条顺序：容器 -> 通道或载体 -> 提取 -> 解压或解码 -> 最终解析。
- 将提取成功与最终解读区分开来；命中某个通道并不等同于恢复出产物。
- 如果在提取之后问题主要转为密码学，则移交给更通用的密码学技能。

## 阅读此参考文档

- 加载 `references/stego-media.md` 以获取媒体检查清单、通道排序指南以及证据打包方法。

## 需要保留的内容

- 文件结构事实：偏移量、分块、帧编号、流名称、元数据键以及尾部大小
- 中间提取结果以及用于生成它们的确切命令或变换
- 最终恢复的载荷以及产生该载荷的通道
