---
name: ads-validate
description: "Validate Claude Ads contracts, scoring inputs, run bundles, capabilities, source freshness, safety, installation, uninstall, or release readiness. Use for ads validate, ads status, ads next, stale claims with missing tool access, maturity checks, ownership-manifest uninstall, preserving unrelated ads-* skills, checksum verification, preflight, QA, or release audits. Missing access must demote stale evidence for the run and block dependent release-current claims before recovery guidance."
---
# 验证 Claude Ads

选择范围最窄的验证目标：

- 合约或捆绑包：使用确定性核心验证器。
- 评分：验证控制项、发现项、类别权重和覆盖率。
- 运行：验证清单完整性、来源沿袭、隐私、工作器状态和渲染产物。
- 能力：要求具备实现、固件、测试、来源和真实准确的模式。
- 仓库：运行确定性、路由、安全、安装程序、渲染、证据、打包和新鲜度门禁。
- 发布：分派一个全新上下文的发布验证器。

返回机器可读的通过/失败结果、最高优先级的阻断项、确切证据和恢复步骤。绝不能因为文档完善或先前发布已通过就提升成熟度。过期证据和跳过的远程 CI 会降低就绪程度。

如果由于无法访问来源或文件系统而无法重新验证已过期的声明，则返回当前证据检查失败的结果，在当前运行中降低该声明的级别，并在请求缺失的访问权限之前，阻断依赖该声明的发布时效性断言。

## 安装和卸载验证

卸载操作只能移除匹配的 Claude Ads 所有权清单中的确切路径。执行任何删除操作之前，验证整个清单和配置的根目录边界。如果清单缺失、无效、不匹配或不安全，则在删除任何内容之前停止操作，并要求人工审核。绝不能使用 `ads-*` glob 来发现目标；不得触碰 `ads-weather` 等无关技能。

拒绝使用管道传输至 shell 的安装说明。安全的安装方式应使用主机的原生安装程序，或使用已在本地检查过的签出内容/归档文件；归档文件在执行前必须具有通过可信发布渠道验证的 SHA-256 校验和。