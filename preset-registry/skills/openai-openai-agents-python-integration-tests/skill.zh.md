---
name: integration-tests
description: Run the packaged OpenAI Agents Python SDK integration tests from clean wheel and source-distribution environments. Use for release readiness, live OpenAI regression checks, package import compatibility, optional-extra validation, or when asked to run integration tests after examples-auto-run.
---
# 集成测试

## 概述

针对 `uv build` 生成的确切 wheel 和源代码发行包运行面向发布的集成测试套件。运行器会将这两个制品安装到隔离环境中，并验证受支持的导入、可选 extras、OpenAI 模型适配器、托管工具、Realtime 和语音工作流。

## 执行要求

- 全新的隔离环境会从 PyPI 下载可选依赖项，并连接到已配置的 API 提供商。
- 当执行环境要求批准软件包下载或已配置的提供商连接时，请求提升命令执行权限（`sandbox_permissions=require_escalated`）。在将连接故障归类为 SDK 回归之前，先使用所需的网络权限重试。

## 发布工作流

从仓库根目录运行以下命令：

```bash
env UV_DEFAULT_INDEX=https://pypi.org/simple \
  OPENAI_AGENTS_INTEGRATION_STRICT=1 \
  OPENAI_AGENTS_INTEGRATION_EXTERNAL_PROVIDERS=1 \
  OPENAI_AGENTS_INTEGRATION_DIRECT_PROVIDERS=0 \
  make integration-tests-release
```

- 当调用 `$integration-tests` 时，如果未提出范围更窄的请求，则默认使用发布配置。
- 使用 OpenRouter 作为标准的多提供商网关。仅当用户明确请求额外的凭证矩阵时，才添加提供商专用的直接连接。
- 使用现有的 `OPENAI_API_KEY` 和 `OPENROUTER_API_KEY` 值，且不要将其打印出来。发布目标会强制执行严格模式，因此缺少必需的服务配置时会失败，而不是跳过。
- 该命令会重新构建 wheel 和源代码发行包、创建隔离的虚拟环境、检查公共导入和可选依赖项、运行面向发布的实时测试套件，并针对这两个制品执行本地 Docker 安全契约。
- 在执行此技能的过程中，不要运行监视模式、修改源文件、创建分支、提交、推送或创建拉取请求。

## 配对发布验证

当用户请求同时执行两项发布前检查时，先运行 `$examples-auto-run`，并遵循该技能要求的逐示例行为验证。然后运行上述命令，并分别报告示例和集成测试的结果。仅调用 `$integration-tests` 不会隐式启动示例测试套件。

## 聚焦命令

仅当用户明确要求缩小运行范围时，才使用聚焦目标：

```bash
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-packaging
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-security
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-core
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-providers
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-hosted
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-realtime
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-voice
env UV_DEFAULT_INDEX=https://pypi.org/simple make integration-tests-extras
```

对于最低受支持的 Python 软件包边界，请使用：

```bash
env UV_DEFAULT_INDEX=https://pypi.org/simple \
  OPENAI_AGENTS_INTEGRATION_PYTHON=3.10 \
  make integration-tests-packaging
```

夜间和手动配置文件包含额外的特定能力检查或成本更高的检查。仅在明确要求时运行它们；默认使用已配置的 OpenRouter 矩阵，只有在明确选择时才包含直连提供商。

## 报告

报告每个隔离环境最终的通过、失败、跳过和取消选择数量。如果命令失败，请明确指出具体的配置文件、包环境、失败的测试以及可据此采取行动的错误信息。将产品回归问题与凭证缺失、托管功能不受支持、依赖项安装失败以及执行环境限制区分开来。