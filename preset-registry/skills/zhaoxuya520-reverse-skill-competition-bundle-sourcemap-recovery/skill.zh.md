---
name: competition-bundle-sourcemap-recovery
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for source maps, build manifests, chunk registries, emitted bundles, obfuscated loader flow, and frontend runtime recovery. Use when the user asks to reconstruct served JavaScript structure, inspect source maps or chunk maps, trace bundle loading, recover hidden routes or APIs from emitted assets, or explain runtime behavior from built frontend artifacts. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Bundle Sourcemap 还原

仅当 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属和证据优先级后，才将本技能作为下游专项使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当运行时真相存在于构建产物、source map、chunk 表或混淆的加载器流程中，而不仅仅存在于已提交到仓库的源代码中时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 从实际服务的产物集合入手：入口 HTML、构建 manifest、引导 bundle、chunk 映射和 source map。
2. 在进行大规模手动反混淆之前，先记录 chunk id、路由 chunk、加载器函数、端点字符串和配置键。
3. 重建能够解释当前哪个产物在执行的最小运行时图。
4. 除非已证明二者一致，否则将实际服务的产物真相与仓库源码分开对待。
5. 重现能够证明决定性行为的最小“产物到运行时”边界。

## 工作流程

### 1. 映射实际服务的产物集合

- 记录入口 HTML、script 标签、预加载提示、manifest 文件、资产映射、chunk 注册表和 source map URL。
- 留意框架特有的产物，例如路由 manifest、客户端引用 manifest 或懒加载器表（如果存在）。
- 将构建生成的文件名、哈希后缀和路由归属保持关联。

### 2. 重建运行时结构

- 跟踪引导代码、chunk 加载器、模块注册表、字符串解码器和懒导入边界。
- 利用 source map、manifest 文件和稳定的符号簇来还原路由名称、API 调用、特性开关和隐藏面板。
- 区分构建时的意图与当前实际服务的 bundle。

### 3. 收敛到决定性的 Bundle 路径

- 将结果压缩为最小序列：实际服务的资产 -> 加载器路径 -> 模块或符号 -> 运行时效果。
- 清楚说明决定性弱点究竟位于 manifest 漂移、chunk 加载、隐藏路由代码、字符串解码，还是过时的源码假设。
- 如果任务从构建产物转向 SSR 或模板强制校验，则交还给更聚焦的 template-render 技能。

## 阅读此参考文档

- 加载 `references/bundle-sourcemap-recovery.md` 以获取产物检查清单、反混淆检查清单和证据打包方法。

## 需要保留的内容

- 实际服务的文件名、chunk id、manifest 条目、source map 路径、还原出的符号和端点字符串
- 能够证明该运行时分支的确切正在执行的 bundle 或模块
- 一条能够达到决定性效果的最小“资产到运行时”序列
