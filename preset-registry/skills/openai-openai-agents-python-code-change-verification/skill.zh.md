---
name: code-change-verification
description: Run the mandatory verification stack when changes affect runtime code, tests, or build/test behavior in the OpenAI Agents Python repository.
---
# 代码变更验证

## 概述

确保只有在格式化、代码检查、类型检查和测试全部通过后，才将工作标记为完成。当变更影响运行时代码、测试或构建/测试配置时，请使用此技能。对于仅涉及文档或仓库元数据的变更，可以跳过此技能，除非用户要求执行完整检查流程。这是代码审查后的最终关卡：当 `$implementation-final-review` 适用时，在其干净审查条件对稳定的任务差异生效之前，不要调用完整检查流程。

## 快速开始

1. 将此技能保存在 `./.agents/skills/code-change-verification`，以便仓库自动加载。
2. macOS/Linux 上的 Codex：`/usr/bin/env -u OPENAI_API_KEY OPENAI_AGENTS_TEST_IN_CODEX_SANDBOX=1 UV_DEFAULT_INDEX=https://pypi.org/simple bash .agents/skills/code-change-verification/scripts/run.sh`。
3. 其他 macOS/Linux 环境：`env UV_DEFAULT_INDEX=https://pypi.org/simple bash .agents/skills/code-change-verification/scripts/run.sh`。
4. Windows：`powershell -ExecutionPolicy Bypass -File .agents/skills/code-change-verification/scripts/run.ps1`。
5. 脚本会先运行 `make format`，然后以快速失败语义并行运行 `make lint`、`make typecheck` 和 `make tests`。
6. 在并行步骤仍在运行期间，脚本会定期输出心跳更新，以便你确认工作仍在进行。
7. 如果任何命令失败，请修复问题、重新运行脚本并报告失败输出。
8. 只有在所有命令都成功且没有遗留问题时，才能确认完成。

## 启动条件和主机容量

- 在迭代审查期间，只使用针对性测试；如果变更后的类型边界需要静态检查，则只执行范围严格限定的静态检查。将仓库范围的 `make typecheck` 以及完整检查流程中的其余步骤推迟到审查干净后再执行。
- 在启动完整检查流程之前，立即使用现有的只读任务或进程信息，检查同一主机上是否已有其他仓库范围的测试、类型检查、构建、示例运行器或集成命令正在运行。
- 如果发现明确的资源争用，请继续进行审查、修复、证据准备或针对性检查等有用的非重型工作，之后再重新检查。不要创建或等待仓库锁、主机范围的互斥锁或哨兵文件。
- 一旦审查干净、差异稳定且可观察到的主机容量可用，就自动启动。不要要求用户发送 `finalize` 消息来触发。如果无法获取主机遥测信息，不要仅仅因为无法测量容量而阻塞。

## Codex 执行策略

仓库验证及其所有子进程都必须保留在常规 Codex 工作区沙箱中。切勿为验证包装脚本请求提升沙箱权限，也不要在失败后使用更广泛的主机访问权限重试该包装脚本。

在 macOS 上，标记为 `requires_native_macos_sandbox` 的测试需要启动自己的 `sandbox-exec` 进程。Codex 命令会设置 `OPENAI_AGENTS_TEST_IN_CODEX_SANDBOX=1`，这只会在创建嵌套沙箱之前跳过该标记。所有其他测试仍保持启用。普通本地运行和 CI 运行不会设置此变量，因此仍会启用带有该标记的测试。

标记的测试会在一次性、由 GitHub 托管的 macOS 运行器上单独运行。如果该可信运行器不可用，请报告缺少原生 macOS 测试覆盖；不要通过弱化 Codex 沙箱边界来补偿。

## 环境设置

验证脚本假定仓库依赖项已安装。不要在每次验证时都运行 `make sync`；仅在全新检出后、依赖文件发生更改后，或检查开始前依赖解析失败时使用该命令。

在 Linux 上，某些包含原生扩展的 Python 包可能需要 `libffi-dev`、Python 开发头文件或构建工具等系统包。如果由于缺少其中某个包而无法开始验证，请将其视为本地环境设置问题。请尽可能安装缺失的依赖项；否则，应先在 PR 测试计划中报告失败的命令和缺失的依赖项，再在准备妥当的环境中重新运行验证。

## 手动工作流

- 对于全新检出的仓库，或者依赖项尚未安装或已发生更改，请先运行 `make sync`，通过 `uv` 安装开发要求。
- 从仓库根目录运行，先执行 `make format`，然后依次执行 `make lint`、`make typecheck` 和 `make tests`。
- 不要跳过任何步骤；命令失败时，立即停止并修复问题。
- 如果手动运行这些步骤，可以在 `make format` 完成后并行执行 `make lint`、`make typecheck` 和 `make tests`，但只要其中一个失败，就必须立即停止其余步骤。
- 应用修复后，重新运行完整流程，确保各命令按要求的顺序执行。

## 资源

### scripts/run.sh

- 先执行 `make format`，然后从仓库根目录以快速失败语义并行运行 `make lint`、`make typecheck` 和 `make tests`。在并行步骤仍在运行时，它还会定期输出心跳更新。优先使用此入口点，以便在缩短总运行时间的同时保持所要求的执行顺序。

### scripts/run.ps1

- 适用于 Windows 的封装脚本，先执行 `make format`，然后以快速失败语义并行运行其余步骤；在任务仍在运行时，还会定期输出心跳更新。请在 PowerShell 中使用；如果环境需要，请绕过执行策略。