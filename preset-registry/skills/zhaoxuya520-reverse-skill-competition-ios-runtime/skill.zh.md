---
name: competition-ios-runtime
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for IPA runtime analysis, Frida hooks, Objective-C or Swift method tracing, Keychain inspection, SSL pinning bypass, URL scheme handling, and iOS request-signing recovery. Use when the user asks to hook an IPA, trace Objective-C or Swift runtime behavior, inspect Keychain or plist state, bypass pinning, analyze deeplinks or universal links, or replay accepted iOS requests. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 iOS 运行时

只有在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点所有权和证据优先级之后，才可将本技能作为下游的专门化技能使用。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径贯穿实际运行中的 iOS 信任边界，而不仅仅是静态字符串或 plist 值时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将原始 IPA、解包得到的 bundle 以及任何解密或重签名副本作为独立产物保存。
2. 在进行大范围运行时 hook 之前，先从 `Info.plist`、entitlements、URL scheme、框架、Keychain 使用情况以及本地应用存储入手。
3. 选择能证明行为的最窄运行时边界：签名器、信任评估器、Keychain 访问器、Objective-C 或 Swift 方法，或网络请求构建器。
4. 在声称已理解信任路径之前，先将静态 bundle 证据与实时 hook 输出进行关联。
5. 从最小的 hook 集合出发，复现被接受的请求、令牌或门控分支。

## 工作流程

### 1. 静态 iOS 排查

- 梳理 bundle 结构、`Info.plist`、entitlements、URL scheme、通用链接（universal links）、内嵌框架以及 app group 路径。
- 记录可能的信任边界：请求签名器、设备绑定、证书校验、越狱检测、Keychain 访问，或本地缓存加载。
- 注意敏感逻辑位于 Objective-C、Swift、内嵌框架，还是随包打包的 Web 界面中。

### 2. Hook 运行时边界

- 优先 hook 请求构建器、加密辅助函数、信任评估器、Keychain 读取或 Objective-C 选择器，而非大范围的 UI 处理器。
- 在会改变服务器接受结果的边界处，记录明文输入、请求头、nonce、已签名字符串以及输出。
- 只对 pinning 或环境检查做足以暴露真实请求路径的最小限度修补或绕过。

### 3. 重放被接受的路径

- 重建最小的有状态序列：本地令牌、设备标识符、请求体、签名、请求头以及信任检查。
- 让 hook 日志、bundle 路径、plist 键和本地存储产物始终对应同一会话或账户状态。
- 如果任务的重心转变为变换恢复而非 iOS 运行时，请切换回更宽泛的加密或移动技能。

## 阅读此参考文档

- 加载 `references/ios-runtime.md`，以获取 hook 目标、存储检查清单和证据打包内容。

## 需要保留的内容

- bundle 路径、entitlements、plist 键、选择器、类名、hook 点和头文件名
- Keychain 条目、本地数据库或 plist 路径、URL scheme 以及 app group 存储位置
- 能够证明 iOS 信任边界的最小可重放请求或分支
