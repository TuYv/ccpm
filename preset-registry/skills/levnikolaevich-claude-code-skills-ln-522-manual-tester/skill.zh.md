---
name: ln-522-manual-tester
description: "Performs manual testing of Story AC via executable bash scripts in tests/manual/. Use when Story implementation needs hands-on AC verification."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**强制阅读：** 加载 `references/ci_tool_detection.md`——其中包含 bash/curl/Puppeteer 脚本的紧凑输出标志、pipefail 和失败产物策略。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、git 分支、看板、用户 | 要处理的 Story |

**解析方式：** Story 解析链。
**状态筛选器：** To Review

# 手动测试员

**类型：** L3 Worker

在运行中的代码上手动验证 Story AC，并为质量门禁报告结构化结果。

## 目的与范围
- 在目标项目的 `tests/manual/` 文件夹中创建可执行测试脚本。
- 通过 bash/curl（API）或 puppeteer（UI）运行由 AC 驱动的检查。
- 永久保存脚本以用于回归测试（不得使用临时文件）。
- 通过配置的跟踪器提供方（`addComment`）记录结果，包括每个 AC 的通过/失败情况及脚本路径。
- 不得更改状态或创建任务。

## 使用时机
- 当 Story 在进行自动化规划之前需要对验收标准进行实际验证时使用
- Story 中存在研究评论「## 测试研究：」（来自 ln-521）
- Story 中所有实现任务的状态均为 Done

## 测试设计原则

### 1. 快速失败——不允许静默失败

**关键：** 只要有任何标准未满足，测试就必须立即返回 1（失败）。

**绝不使用：** 对验证失败使用 `print_status "WARN" + return 0`、在没有显式标志的情况下优雅降级，或使用隐藏错误的静默回退。

**例外（可以使用 WARN）：** 不影响正确性的信息性警告、可选功能（需在注释中明确说明理由）、基础设施问题（例如开发环境中缺少 Nginx）。

### 2. 基于预期结果的测试——黄金标准

**关键：** 测试必须将实际结果与**预期参考文件**进行比较，不得采用启发式方法或算法检查。

**目录结构：**
```
tests/manual/NN-feature/
├── samples/               # Input files
├── expected/              # Expected output files (REQUIRED!)
│   └── {base_name}_{source_lang}-{target_lang}.{ext}
└── test-*.sh
```

**仅在以下情况可接受启发式方法：** 动态/非确定性数据（时间戳、UUID、令牌——比较前进行规范化；键顺序不固定的 JSON——使用 `jq --sort-keys`）。

### 3. 结果存储

测试结果保存在 `tests/manual/results/` 中（持久化，位于 .gitignore 中）。命名方式：`result_{ac_name}.{ext}` 或 `response_{ac_name}.json`。测试完成后可检查这些文件以进行调试。

### 4. 预期文件生成

创建预期文件：
1. 使用当前实现运行测试
2. 检查 `results/` 文件夹中的输出
3. 如果正确：使用适当的命名将其复制到 `expected/` 文件夹
4. 如果不正确：先修复实现，然后再复制

**重要：** 绝不能盲目地将结果复制为预期文件。必须始终先验证其正确性。

## 工作流

### 阶段 0：解析输入

**强制阅读：** 加载 `references/input_resolution_pattern.md`

1. **解析 storyId：** 按照指南运行 Story 解析链（状态筛选器：[To Review]）。

### 阶段 1：设置测试/手动测试结构
1) **阅读 `docs/project/infrastructure.md`** — 获取端口分配、服务端点和基础 URL。**阅读 `docs/project/runbook.md`** — 获取 Docker 命令、测试前置条件和环境设置
2) 检查项目根目录中是否存在 `tests/manual/` 文件夹
3) 如果不存在，则创建以下结构：
   - `tests/manual/config.sh` — 共享配置（BASE_URL、辅助函数、颜色）
   - `tests/manual/README.md` — 文件夹文档（参见下方的 README.md 模板）
   - `tests/manual/test-all.sh` — 用于运行所有测试套件的主脚本（参见下方的 test-all.sh 模板）
   - `tests/manual/results/` — 测试输出文件夹（添加到 `.gitignore`）
4) 如果项目的 `.gitignore` 中尚未包含 `tests/manual/results/`，则将其添加进去
5) 如果已存在，则读取现有的 `config.sh` 以复用设置（BASE_URL、令牌）

### 阶段 2：创建用户故事测试脚本
1) 获取用户故事，将 AC 解析为 Given/When/Then 列表（预计 3-5 项）
   - **检查研究评论**（来自 ln-521-test-researcher）— 将研究发现纳入测试用例
2) 判断是 API 还是 UI（API → curl，UI → puppeteer）。**如果是 UI：** **强制阅读：** 加载 `references/puppeteer_patterns.md`
3) 创建测试文件夹结构：
   - `tests/manual/{NN}-{story-slug}/samples/` — 输入文件（如果需要）
   - `tests/manual/{NN}-{story-slug}/expected/` — 预期输出文件（确定性测试必需）
4) 生成测试脚本：`tests/manual/{NN}-{story-slug}/test-{story-slug}.sh`
   - 使用适当的模板：TEMPLATE-api-endpoint.sh（直接调用）或 TEMPLATE-document-format.sh（异步任务）
   - 文件头：用户故事 ID、AC 列表、前置条件
   - 为每个 AC 以及边界/错误情况创建测试函数
   - 针对预期文件进行**基于 diff 的验证**（主要方式）
   - 将结果保存到 `tests/manual/results/`
   - 包含耗时信息的汇总表
5) 将脚本设为可执行（`chmod +x`）

### 阶段 3：更新文档
1) 更新 `tests/manual/README.md`：
   - 将新测试添加到“可用测试套件”表格中
   - 包含用户故事 ID、覆盖的 AC、运行命令
2) 更新 `tests/manual/test-all.sh`：
   - 在 SUITES 数组中添加对新脚本的调用
   - 保持执行顺序（先执行 00-setup，然后执行编号测试套件）

### 阶段 4：执行并报告

**强制阅读：** 加载 `references/test_result_format_v1.md`

1) 重新构建 Docker 容器（不使用缓存），并确保其处于健康状态
2) 运行生成的脚本并捕获输出
3) 解析结果（通过/失败数量）
4) 使用 `addComment` 发布跟踪器评论（遵循 test_result_format_v1.md），其中包含：
   - AC 矩阵（每个 AC 的通过/失败状态）
   - 脚本路径：`tests/manual/{NN}-{story-slug}/test-{story-slug}.sh`
   - 重新运行命令：`cd tests/manual && ./{NN}-{story-slug}/test-{story-slug}.sh`

## 关键规则
- 脚本必须保存到项目的 `tests/manual/` 中，而不是临时文件中。
- 测试前重新构建 Docker；如果重新构建/运行后状态不健康，则判定失败。
- 脚本注释和跟踪器评论应与用户故事使用相同的语言（EN/RU）。
- 不进行修复或状态变更；只提供证据和结论。
- 脚本必须是幂等的（可随时重新运行）。

## 运行时摘要产物

**强制阅读：** 加载 `references/test_planning_summary_contract.md`、`references/test_planning_worker_runtime_contract.md`

运行时配置：
- 系列：`test-planning-worker`
- 工作器：`ln-522`
- 摘要类型：`test-planning-worker`
- 协调器使用的载荷字段：`worker`、`status`、`warnings`、`manual_result_path`

调用规则：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传入 `runId` 和准确的 `summaryArtifactPath`
- 在给出最终结果之前，始终先写入经过验证的摘要

测试脚本始终放在 `tests/manual/` 中，绝不能放在项目根目录。

### 监控器集成（Claude Code 2.1.98+）

**强制阅读：** 加载 `references/monitor_integration_pattern.md`

运行预计耗时超过 30 秒的测试脚本时：
`Monitor(command="bash tests/manual/{suite}/test-{slug}.sh 2>&1", timeout_ms=300000, description="manual test: {slug}")`

后备方案：如果 Monitor 不可用（Bedrock/Vertex），则使用 `Bash(run_in_background=true)`。


## 完成标准
- [ ] `tests/manual/` 结构已存在（如果缺失，则创建 config.sh、README.md、test-all.sh、results/）。
- [ ] 已将 `tests/manual/results/` 添加到项目 `.gitignore`。
- [ ] 已在 `tests/manual/{NN}-{story-slug}/test-{story-slug}.sh` 创建测试脚本。
- [ ] 已创建 `expected/` 文件夹，并且每个确定性 AC 至少有 1 个预期文件。
- [ ] 脚本使用基于 **diff 的验证** 与预期文件进行比对（而非启发式判断）。
- [ ] 脚本将结果保存到 `tests/manual/results/` 以便调试。
- [ ] 脚本可执行且具有幂等性。
- [ ] 已更新 **README.md**，在“Available Test Suites”表格中加入新的测试套件。
- [ ] 已更新 **test-all.sh**，在 SUITES 数组中加入对新脚本的调用。
- [ ] 应用已重新构建并处于运行状态；测试已执行。
- [ ] 已发布结论和跟踪器评论，其中包含脚本路径和重新运行命令。

## 脚本模板

### README.md（每个项目仅创建一次）

```markdown
# Manual Testing Scripts

> **SCOPE:** Bash scripts for manual API testing. Complements automated tests with CLI-based workflows.

## Quick Start

```bash
cd tests/manual
./00-setup/create-account.sh  # (if auth required)
./test-all.sh                 # Run ALL test suites
```

## Prerequisites

- Docker containers running (`docker compose ps`)
- jq installed (`apt-get install jq` or `brew install jq`)

## Folder Structure

```
tests/manual/
├── config.sh          # Shared configuration (BASE_URL, helpers, colors)
├── README.md          # This file
├── test-all.sh        # Run all test suites
├── 00-setup/          # Account & token setup (if auth required)
│   ├── create-account.sh
│   └── get-token.sh
└── {NN}-{topic}/      # Test suites by Story
    └── test-{slug}.sh
```

## Available Test Suites

<!-- Add new test suites here when creating new tests -->

| Suite | Story | AC Covered | Run Command |
|-------|-------|------------|-------------|
| — | — | — | — |

## Adding New Tests

1. Create script in `{NN}-{topic}/test-{slug}.sh`
2. **Update this README** (Available Test Suites table)
3. **Update `test-all.sh`** (add to SUITES array)
```

### test-all.sh（每个项目仅创建一次）

```bash
#!/bin/bash
# =============================================================================
# Run all manual test suites
# =============================================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "=========================================="
echo "Running ALL Manual Test Suites"
echo "=========================================="

check_jq
check_api

# Setup (if exists)
[ -f "$SCRIPT_DIR/00-setup/create-account.sh" ] && "$SCRIPT_DIR/00-setup/create-account.sh"
[ -f "$SCRIPT_DIR/00-setup/get-token.sh" ] && "$SCRIPT_DIR/00-setup/get-token.sh"

# Test suites (add new suites here)
SUITES=(
    # "01-auth/test-auth-flow.sh"
    # "02-translation/test-translation.sh"
)

PASSED=0; FAILED=0
for suite in "${SUITES[@]}"; do
    echo ""
    echo "=========================================="
    echo "Running: $suite"
    echo "=========================================="
    if "$SCRIPT_DIR/$suite"; then
        ((++PASSED))
        print_status "PASS" "$suite"
    else
        ((++FAILED))
        print_status "FAIL" "$suite"
    fi
done

echo ""
echo "=========================================="
echo "TOTAL: $PASSED suites passed, $FAILED failed"
echo "=========================================="
[ $FAILED -eq 0 ] && exit 0 || exit 1
```

### config.sh（每个项目仅创建一次）

```bash
#!/bin/bash
# Shared configuration for manual testing scripts
export BASE_URL="${BASE_URL:-http://localhost:8080}"
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export NC='\033[0m'

print_status() {
    local status=$1; local message=$2
    case $status in
        "PASS") echo -e "${GREEN}[PASS]${NC} $message" ;;
        "FAIL") echo -e "${RED}[FAIL]${NC} $message" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "INFO") echo -e "[INFO] $message" ;;
    esac
}

check_jq() {
    command -v jq &> /dev/null || { echo "Error: jq required"; exit 1; }
}

check_api() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" 2>/dev/null)
    if [ "$response" != "200" ]; then
        echo "Error: API not reachable at $BASE_URL"
        exit 1
    fi
    print_status "INFO" "API reachable at $BASE_URL"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR
```

### 测试脚本模板

**参见：** [references/templates/](references/templates/)

| 模板 | 使用场景 | 位置 |
|----------|----------|----------|
| template-api-endpoint.sh | API 端点测试（不含异步任务） | [template-api-endpoint.sh](references/templates/template-api-endpoint.sh) |
| template-document-format.sh | 文档/文件处理（包含异步任务） | [template-document-format.sh](references/templates/template-document-format.sh) |

**快速开始：**
```bash
cp references/templates/template-api-endpoint.sh {NN}-feature/test-{feature}.sh      # Endpoint tests
cp references/templates/template-document-format.sh {NN}-feature/test-{format}.sh    # Document tests
```

## 参考文件
- 脚本格式参考：prompsit-api `tests/manual/`（生产环境示例）
- AC 格式：`references/templates/test_task_template.md`（或目标项目中的本地 `docs/templates/`）
- 基于风险的上下文：`references/risk_based_testing_guide.md`
- 研究结果：ln-521-test-researcher 会在 Story 上创建“## 测试研究”评论
- Puppeteer 模式：`references/puppeteer_patterns.md`
- 测试结果格式：`references/test_result_format_v1.md`

---
**版本：** 1.0.0
**最后更新：** 2026-01-15