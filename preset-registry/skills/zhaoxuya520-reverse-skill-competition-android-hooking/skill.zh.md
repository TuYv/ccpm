---
name: competition-android-hooking
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Android APK hooking, Frida tracing, request-signing recovery, SSL pinning bypass, JNI boundary inspection, and app trust-boundary analysis. Use when the user asks to hook an APK, inspect signer logic, trace Java or native boundaries, bypass pinning or root checks, inspect shared prefs or app databases, or replay accepted mobile requests. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Android Hooking

仅在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未出现这种情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径贯穿 Android 应用的实际运行时信任边界，而不仅仅是静态字符串时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 在打补丁或重签名之前，保留原始 APK、提取出的资源以及反编译输出。
2. 首先从 manifest、导出组件、deeplink、原生库、prefs、本地数据库和内置配置入手。
3. 确定要 hook 的最窄运行时边界：签名器、加密辅助模块、JNI 桥、WebView 桥或请求构造器。
4. 在声称已理解某个信任边界之前，先关联静态证据与动态追踪。
5. 通过最小的 hook 集合复现已签名的请求、被接受的令牌或受门控的分支。

## 工作流程

### 1. Hook 之前的静态分诊

- 梳理包结构、导出的 activity、service、receiver、provider 以及 deeplink 处理器。
- 记录 SSL pinning 逻辑、root 检测、功能开关、令牌存储、shared prefs、SQLite 表以及 protobuf 或 RPC 边界。
- 判断敏感逻辑位于 Java、Kotlin、JNI 还是内置的 WebView 中。

### 2. Hook 最窄的边界

- 优先 hook 请求签名器、加密辅助模块、keystore 访问、protobuf 编码或解码、JNI 编组，而不是宽泛的 UI hook。
- 在真正改变信任的边界处记录明文输入、已签名字符串、请求头、nonce 和输出。
- 如果 pinning 或环境检测阻碍进展，仅进行足以暴露真实请求路径的 patch 或 hook。

### 3. 重放被接受的路径

- 重建能够到达服务端被接受分支的最小序列：本地状态、nonce、请求体、签名和请求头。
- 让 hook 日志、捕获的请求结构以及本地存储路径与同一账号或会话状态保持关联。
- 如果挑战的重心更多在于变换恢复而非 Android 运行时，请切换回更通用的加密或移动端技能。

## 阅读此参考

- 加载 `references/android-hooking.md`，以了解 hook 目标、存储核对清单和证据打包方式。

## 需要保留的内容

- hook 点、类名、JNI 符号、签名器的输入与输出以及 header 名称
- shared prefs、本地数据库行、deeplink、导出组件以及令牌存储路径
- 能证明信任边界的最小可重放请求或分支
