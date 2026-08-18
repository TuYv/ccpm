---
name: genvm-lint
description: Validate GenLayer intelligent contracts with the GenVM linter.
allowed-tools:
  - Bash
  - Read
---
# GenVM Lint

验证智能合约的安全性、正确性以及 SDK 合规性。

## 设置

需要 `genvm-linter`（样板项目的 `requirements.txt` 中已包含）：

```bash
pip install genvm-linter
```

## 工作流

**始终在测试前运行 lint。** 编写或修改合约后运行 `genvm-lint check`。在运行测试前修复所有错误。

```bash
genvm-lint check contracts/my_contract.py
```

`check` 会在一次运行中同时执行 lint（AST 安全检查）和 validate（SDK 语义检查）。

## 命令

### check（推荐）
```bash
genvm-lint check contracts/my_contract.py
genvm-lint check contracts/my_contract.py --json  # 机器可读的输出
```

### lint（仅执行快速 AST 检查，约 50ms）
```bash
genvm-lint lint contracts/my_contract.py
```

可捕获：
- 禁止导入（`os`、`sys`、`subprocess`、`random` 等）
- 非确定性模式（直接使用 `float`）
- 合约头部结构问题

### validate（SDK 语义检查，约 200ms）
```bash
genvm-lint validate contracts/my_contract.py
```

验证：
- SDK 中存在的类型（`TreeMap`、`DynArray`、`Address` 等）
- 装饰器是否正确应用（`@gl.public.view`、`@gl.public.write`）
- 存储字段是否具有有效类型（不允许使用 `dict`/`list`）
- 方法签名是否正确

### schema（提取 ABI）
```bash
genvm-lint schema contracts/my_contract.py
genvm-lint schema contracts/my_contract.py --json
genvm-lint schema contracts/my_contract.py --output abi.json
```

### typecheck（Pyright/Pylance）
```bash
genvm-lint typecheck contracts/my_contract.py
genvm-lint typecheck contracts/my_contract.py --json
genvm-lint typecheck contracts/my_contract.py --strict
```

运行 Pyright，并自动配置 SDK 路径。可捕获类型不匹配、缺少属性和未定义变量。

### download（预下载 GenVM 构件）
```bash
genvm-lint download                    # 最新版本
genvm-lint download --version v0.2.12  # 指定版本
genvm-lint download --list             # 显示缓存内容
```

## 输出格式

### 人类可读（默认）
```
✓ Lint passed (3 checks)
✓ Validation passed
  Contract: MyContract
  Methods: 8 (5 view, 3 write)
```

### JSON（`--json`）
```json
{"ok":true,"lint":{"ok":true,"passed":3},"validate":{"ok":true,"contract":"MyContract","methods":8,"view_methods":5,"write_methods":3,"ctor_params":2}}
```

## 退出代码

- `0` — 所有检查均已通过
- `1` — 发现 lint 或验证错误
- `2` — 找不到合约文件
- `3` — SDK 下载失败

## Agent 工作流

迭代修复 lint 错误时：
1. 运行 `genvm-lint check contract.py --json`
2. 解析 JSON 中的具体错误
3. 修复合约中的每个错误
4. 重新运行 check，直到 `"ok": true`
5. 继续进行测试