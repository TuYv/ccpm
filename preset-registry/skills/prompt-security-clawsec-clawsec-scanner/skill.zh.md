---
name: clawsec-scanner
version: 0.0.7
description: Automated vulnerability scanner for agent platforms. Performs dependency scanning (npm audit, pip-audit), multi-database CVE lookup (OSV, NVD, GitHub Advisory), SAST analysis (Semgrep, Bandit), and agent-specific static hook inspection for OpenClaw hooks.
homepage: https://clawsec.prompt.security
clawdis:
  emoji: "🔍"
  requires:
    bins: [node, npm, python3, pip-audit, semgrep, bandit, jq, curl]
---
# ClawSec Scanner

面向智能体平台的综合安全扫描器，可自动化执行多维度漏洞检测：

- **依赖扫描**：使用 `npm audit` 和 `pip-audit` 分析 npm 和 Python 依赖，并解析结构化 JSON 输出
- **CVE 数据库集成**：查询 OSV（主要来源）、NVD 2.0 和 GitHub Advisory Database，以丰富漏洞信息
- **SAST 分析**：使用 Semgrep（JavaScript/TypeScript）和 Bandit（Python）执行静态代码分析，以检测硬编码密钥、命令注入、路径遍历和不安全反序列化
- **DAST 框架**：对 OpenClaw hook 元数据和处理器源代码执行面向智能体的静态分析，无需导入或调用目标代码
- **统一报告**：生成包含严重性分类和修复建议的汇总漏洞报告
- **持续监控**：集成 OpenClaw hook，以自动执行定期扫描

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill clawsec-scanner -a openclaw -y
```

## 功能

### 多引擎扫描

该扫描器编排四种互补的扫描类型，以提供全面的漏洞覆盖：

1. **依赖扫描**
   - 以子进程方式执行 `npm audit --json` 和 `pip-audit -f json`
   - 解析结构化输出，以提取 CVE ID、严重性和受影响版本
   - 处理边缘情况：缺少 package-lock.json、零漏洞、JSON 格式错误

2. **CVE 数据库查询**
   - **OSV API**（主要来源）：免费、无需身份验证，并广泛支持多种生态系统（npm、PyPI、Go、Maven）
   - **NVD 2.0**（可选）：需要 API key，以避免 6 秒的速率限制
   - **GitHub Advisory Database**（可选）：通过 OAuth token 使用 GraphQL API
   - 将所有 API 响应规范化为统一的 `Vulnerability` schema

3. **静态分析（SAST）**
   - **Semgrep**（JavaScript/TypeScript）：使用 `--config auto` 或 `--config p/security-audit` 检测安全问题
   - **Bandit**（Python）：利用现有的 `pyproject.toml` 配置
   - 识别：硬编码密钥（API keys、tokens）、命令注入（`eval`、`exec`）、路径遍历、不安全反序列化

4. **动态分析（DAST）**
   - 根据 `HOOK.md` 元数据发现 OpenClaw hook 处理器，并对其执行静态检查
   - 在不导入、转译或调用目标处理器的情况下，验证覆盖范围和源代码级风险信号
   - 注意：传统 Web DAST 工具（ZAP、Burp）不适用于智能体平台——此功能提供面向智能体的测试

### 统一报告

所有扫描类型都会生成一致的 `ScanReport` JSON schema：

```typescript
{
  scan_id: string;         // UUID
  timestamp: string;       // ISO 8601
  target: string;          // Scanned path
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  }
}
```

每个 `Vulnerability` 对象包括：
- `id`：CVE-2023-12345 或 GHSA-xxxx-yyyy-zzzz
- `source`：npm-audit | pip-audit | osv | nvd | github | sast | dast
- `severity`：critical | high | medium | low | info
- `package`：软件包名称（对于 SAST/DAST，则为 'N/A'）
- `version`：受影响的版本
- `fixed_version`：包含修复的首个版本（如有）
- `title`：简短描述
- `description`：完整的公告文本
- `references`：用于获取更多信息的 URL
- `discovered_at`：ISO 8601 时间戳

### OpenClaw 集成

通过 hook 实现自动化持续监控：

- 按可配置的时间间隔运行扫描器（默认：86400s / 24 小时）
- 在 `agent:bootstrap` 和 `command:new` 事件触发时运行
- 将发现结果及严重性摘要发布到 `event.messages` 数组
- 通过 `CLAWSEC_SCANNER_INTERVAL` 环境变量进行速率限制

## 安装

### 前置条件

验证所需的二进制文件是否可用：

```bash
# Core runtimes
node --version  # v20+
npm --version
python3 --version  # 3.10+

# Scanning tools
pip-audit --version  # Install: uv pip install pip-audit
semgrep --version    # Install: pip install semgrep OR brew install semgrep
bandit --version     # Install: uv pip install bandit

# Utilities
jq --version
curl --version
```

### 选项 A：通过 clawhub（推荐）

```bash
npx clawhub@latest install clawsec-scanner
```

### 选项 B：通过验证进行手动安装

```bash
set -euo pipefail

VERSION="${SKILL_VERSION:?Set SKILL_VERSION (e.g. 0.1.0)}"
INSTALL_ROOT="${INSTALL_ROOT:-$HOME/.openclaw/skills}"
DEST="$INSTALL_ROOT/clawsec-scanner"
BASE="https://github.com/prompt-security/clawsec/releases/download/clawsec-scanner-v${VERSION}"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

# Pinned release-signing public key
# Fingerprint (SHA-256 of SPKI DER): 711424e4535f84093fefb024cd1ca4ec87439e53907b305b79a631d5befba9c8
cat > "$TEMP_DIR/release-signing-public.pem" <<'PEM'
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAS7nijfMcUoOBCj4yOXJX+GYGv2pFl2Yaha1P4v5Cm6A=
-----END PUBLIC KEY-----
PEM

ZIP_NAME="clawsec-scanner-v${VERSION}.zip"

# Download release archive + signed checksums
curl -fsSL "$BASE/$ZIP_NAME" -o "$TEMP_DIR/$ZIP_NAME"
curl -fsSL "$BASE/checksums.json" -o "$TEMP_DIR/checksums.json"
curl -fsSL "$BASE/checksums.sig" -o "$TEMP_DIR/checksums.sig"

# Verify checksums manifest signature
openssl base64 -d -A -in "$TEMP_DIR/checksums.sig" -out "$TEMP_DIR/checksums.sig.bin"
if ! openssl pkeyutl -verify \
  -pubin \
  -inkey "$TEMP_DIR/release-signing-public.pem" \
  -sigfile "$TEMP_DIR/checksums.sig.bin" \
  -rawin \
  -in "$TEMP_DIR/checksums.json" >/dev/null 2>&1; then
  echo "ERROR: checksums.json signature verification failed" >&2
  exit 1
fi

EXPECTED_SHA="$(jq -r '.archive.sha256 // empty' "$TEMP_DIR/checksums.json")"
if [ -z "$EXPECTED_SHA" ]; then
  echo "ERROR: checksums.json missing archive.sha256" >&2
  exit 1
fi

ACTUAL_SHA="$(shasum -a 256 "$TEMP_DIR/$ZIP_NAME" | awk '{print $1}')"
if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
  echo "ERROR: Archive checksum mismatch" >&2
  exit 1
fi

echo "Checksums verified. Installing..."

mkdir -p "$INSTALL_ROOT"
rm -rf "$DEST"
unzip -q "$TEMP_DIR/$ZIP_NAME" -d "$INSTALL_ROOT"

chmod 600 "$DEST/skill.json"
find "$DEST" -type f ! -name "skill.json" -exec chmod 644 {} \;

echo "Installed clawsec-scanner v${VERSION} to: $DEST"
echo "Next step: Run a scan or set up continuous monitoring"
```

## 使用方法

### 按需进行 CLI 扫描

```bash
SCANNER_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-scanner"

# Scan all skills with JSON output
"$SCANNER_DIR/scripts/runner.sh" --target ./skills/ --output report.json --format json

# Scan specific directory with human-readable output
"$SCANNER_DIR/scripts/runner.sh" --target ./my-skill/ --format text

# Check available flags
"$SCANNER_DIR/scripts/runner.sh" --help
```

**CLI Flags:**
- `--target <path>`：要扫描的目录（必需）
- `--output <file>`：将结果写入文件（可选，默认为 stdout）
- `--format <json|text>`：输出格式（默认：json）
- `--check`：验证所有必需的二进制文件是否已安装

### OpenClaw Hook 设置（持续监控）

启用自动定期扫描：

```bash
SCANNER_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-scanner"
node "$SCANNER_DIR/scripts/setup_scanner_hook.mjs"
```

这会创建一个 hook，用于：
- 在 `agent:bootstrap` 和 `command:new` 事件上执行扫描
- 遵循 `CLAWSEC_SCANNER_INTERVAL` 频率限制（默认：86400 秒 / 24 小时）
- 将发现结果及严重性摘要发布到对话中
- 针对高危/严重漏洞推荐修复措施

启用 hook 后重启 OpenClaw 网关，然后运行 `/new` 以触发立即扫描。

### 环境变量

```bash
# Optional - NVD API key to avoid rate limiting (6-second delays without key)
export CLAWSEC_NVD_API_KEY="your-nvd-api-key"

# Optional - GitHub OAuth token for Advisory Database queries
export GITHUB_TOKEN="ghp_your_token_here"

# Optional - Scanner hook interval in seconds (default: 86400 / 24 hours)
export CLAWSEC_SCANNER_INTERVAL="86400"

# Optional - Allow unsigned advisory feed during development (from clawsec-suite)
export CLAWSEC_ALLOW_UNSIGNED_FEED="1"
```

## 架构

### 模块化设计

每种扫描类型都是一个独立模块，可以单独运行，也可以作为统一扫描的一部分运行：

```
scripts/runner.sh              # Orchestration layer
├── scan_dependencies.mjs      # npm audit + pip-audit
├── query_cve_databases.mjs    # OSV/NVD/GitHub API queries
├── sast_analyzer.mjs          # Semgrep + Bandit static analysis
├── dast_runner.mjs            # Static hook inspection orchestration
└── dast_hook_executor.mjs     # Static hook source inspection helper

lib/
├── report.mjs                 # Result aggregation and formatting
├── utils.mjs                  # Subprocess exec, JSON parsing, error handling
└── types.ts                   # TypeScript schema definitions

hooks/clawsec-scanner-hook/
├── HOOK.md                    # OpenClaw hook metadata
└── handler.ts                 # Periodic scan trigger
```

### 允许失败理念

扫描器优先保障可用性，而不是严格传播失败：

- 网络失败 → 输出部分结果，并记录警告
- 工具缺失 → 跳过该扫描类型，继续执行其他扫描
- JSON 格式错误 → 解析有效部分，并记录错误
- API 频率限制 → 实施指数退避，并回退到其他来源
- 未发现漏洞 → 输出包含空数组的成功报告

**会立即退出的严重失败：**
- 目标路径不存在
- 没有可用的扫描工具（所有 bin 均缺失）
- 检测到并发扫描（存在锁文件）

### 子进程执行模式

所有外部工具都作为子进程运行，并输出结构化 JSON：

```javascript
import { spawn } from 'node:child_process';

// Example: npm audit execution
const proc = spawn('npm', ['audit', '--json'], {
  cwd: targetPath,
  stdio: ['ignore', 'pipe', 'pipe']
});

// Handle non-zero exit codes gracefully
// npm audit exits 1 when vulnerabilities found (not an error!)
proc.on('close', code => {
  if (code !== 0 && stderr.includes('ERR!')) {
    // Actual error
    reject(new Error(stderr));
  } else {
    // Vulnerabilities found or success
    resolve(JSON.parse(stdout));
  }
});
```

## 故障排除

### 常见问题

**“Missing package-lock.json”警告**
- `npm audit` 需要锁文件才能运行
- 在目标目录中运行 `npm install` 以生成锁文件
- 如果 `npm audit` 失败，扫描器会继续执行其他扫描类型

**“NVD API rate limit exceeded”**
- 设置 `CLAWSEC_NVD_API_KEY` 环境变量
- 不使用 API 密钥时：请求之间会强制等待 6 秒
- OSV API 作为主要来源使用（无速率限制）

**“pip-audit not found”**
- 安装：`uv pip install pip-audit` 或 `pip install pip-audit`
- 验证：`which pip-audit`
- 如果安装在非标准位置，请将其添加到 PATH

**“Semgrep binary missing”**
- 安装：`pip install semgrep` 或 `brew install semgrep`
- 需要 Python 3.8+ 运行时
- 替代方案：使用 Docker 镜像 `returntocorp/semgrep`

**“DAST static coverage finding”**
- DAST 测试框架不会执行目标 hook 处理程序。
- JavaScript 和 TypeScript hook 文件会作为源代码读取，并报告为 `info` 级别的静态覆盖率发现。
- 在决定某个 hook 是否需要更深入的沙箱测试时，请手动检查列出的静态信号。

**“Concurrent scan detected”**
- 锁文件存在：`/tmp/clawsec-scanner.lock`
- 等待正在运行的扫描完成，或手动删除锁文件
- 防止可能产生不一致结果的扫描重叠执行

### 验证

检查扫描器是否正常工作：

```bash
# Verify required binaries
./scripts/runner.sh --check

# Run unit tests
node test/dependency_scanner.test.mjs
node test/cve_integration.test.mjs
node test/sast_engine.test.mjs
node test/dast_harness.test.mjs

# Validate skill structure
python ../../utils/validate_skill.py .

# Scan test fixtures (should detect known vulnerabilities)
./scripts/runner.sh --target test/fixtures/ --format text
```

## 开发

### 运行测试

```bash
# All tests (vanilla Node.js, no framework)
for test in test/*.test.mjs; do
  node "$test" || exit 1
done

# Individual test suites
node test/dependency_scanner.test.mjs  # Dependency scanning
node test/cve_integration.test.mjs     # CVE database APIs
node test/sast_engine.test.mjs         # Static analysis
node test/dast_harness.test.mjs        # DAST static hook inspection
```

### 代码检查

```bash
# JavaScript/TypeScript
npx eslint . --ext .ts,.tsx,.js,.jsx,.mjs --max-warnings 0

# Python (Bandit already configured in pyproject.toml)
ruff check .
bandit -r . -ll

# Shell scripts
shellcheck scripts/*.sh
```

### 添加自定义 Semgrep 规则

在 `.semgrep/rules/` 中创建自定义规则：

```yaml
rules:
  - id: custom-security-rule
    pattern: dangerous_function($ARG)
    message: Avoid dangerous_function - use safe_alternative instead
    severity: WARNING
    languages: [javascript, typescript]
```

更新 `scripts/sast_analyzer.mjs` 以包含自定义规则：

```javascript
const proc = spawn('semgrep', [
  'scan',
  '--config', 'auto',
  '--config', '.semgrep/rules/',  // Add custom rules
  '--json',
  targetPath
]);
```

## 与 ClawSec Suite 集成

扫描器可以独立运行，也可以作为 ClawSec 生态系统的一部分运行：

- **clawsec-suite**：可安装和管理 clawsec-scanner 的元技能
- **clawsec-feed**：用于恶意技能检测的安全公告源（互补）
- **openclaw-audit-watchdog**：基于 Cron 的审计自动化（类似模式）

安装完整的 ClawSec 套件：

```bash
npx clawhub@latest install clawsec-suite
# Then use clawsec-suite to discover and install clawsec-scanner
```

## 安全注意事项

### 扫描器安全性

- 扫描器代码中不包含硬编码的机密信息
- API 密钥仅从环境变量中读取（绝不记录日志或提交）
- 子进程参数使用数组，以防止 shell 注入
- 对所有外部工具输出进行解析时使用 try/catch 错误处理

### 漏洞优先级排序

**应立即处理严重/高危级别的发现：**
- 依赖项中的已知漏洞（CVSS 9.0+）
- 代码中的硬编码 API 密钥或凭据
- 命令注入漏洞
- 未经验证的路径遍历

**中危/低危级别的发现**可在正常的迭代周期内处理：
- 不存在已知漏洞的过时依赖项
- 缺少安全标头
- 使用弱加密算法

**信息级发现**仅供参考：
- 使用已弃用的 API
- linter 标记的代码质量问题

## 路线图

### v0.0.4（当前版本）
- [x] 依赖项扫描（npm audit、pip-audit）
- [x] CVE 数据库集成（OSV、NVD、GitHub Advisory）
- [x] SAST 分析（Semgrep、Bandit）
- [x] 静态 OpenClaw hook 检查，用于执行 DAST，而无需执行目标代码
- [x] 统一的 JSON 报告
- [x] OpenClaw hook 集成

### 未来增强功能
- [ ] 自动修复（依赖项升级、代码修复）
- [ ] SARIF 输出格式，以集成 GitHub Code Scanning
- [ ] 用于长期跟踪漏洞的 Web 仪表板
- [ ] 用于在发现高危问题时阻止 PR 的 CI/CD GitHub Action
- [ ] 容器镜像扫描（Docker、OCI）
- [ ] 基础设施即代码扫描（Terraform、CloudFormation）
- [ ] 全面的代理工作流 DAST（需要更深入的平台集成）

## 参与贡献

发现安全问题？请私下发送邮件至 security@prompt.security 进行报告。

如需提出功能请求和报告 bug，请在以下地址创建 issue：
https://github.com/prompt-security/clawsec/issues

## 许可证

AGPL-3.0-or-later

完整文本请参阅仓库根目录中的 LICENSE 文件。

## 资源

- **ClawSec 主页**：https://clawsec.prompt.security
- **文档**：https://clawsec.prompt.security/scanner
- **GitHub 仓库**：https://github.com/prompt-security/clawsec
- **OSV API 文档**：https://osv.dev/docs/
- **NVD API 文档**：https://nvd.nist.gov/developers/vulnerabilities
- **Semgrep Registry**：https://semgrep.dev/explore
- **Bandit 文档**：https://bandit.readthedocs.io/