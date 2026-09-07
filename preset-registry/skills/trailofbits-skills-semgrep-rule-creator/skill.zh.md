---
name: semgrep-rule-creator
description: Creates custom Semgrep rules for detecting security vulnerabilities, bug patterns, and code patterns. Use when writing Semgrep rules or building custom static analysis detections.
allowed-tools: Bash Read Write Edit Glob Grep WebFetch
---
# Semgrep 规则创建器

创建经过适当测试与验证的生产级 Semgrep 规则。

## 何时使用

**理想场景：**
- 为特定 bug 模式编写 Semgrep 规则
- 编写用于检测代码库中安全漏洞的规则
- 为数据流漏洞编写污点模式（taint mode）规则
- 编写用于强制执行编码规范的规则

## 何时不应使用

请勿将此技能用于：
- 运行现有的 Semgrep 规则集
- 不使用自定义规则的通用静态分析（请使用 `static-analysis` 技能）

## 应当拒绝的合理化借口

编写 Semgrep 规则时，请拒绝以下常见的捷径做法：

- **“模式看起来已经很完整了”** → 仍需运行 `semgrep --test --config <rule-id>.yaml <rule-id>.<ext>` 进行验证。未经测试的规则会存在隐藏的误报/漏报。
- **“它能匹配到漏洞场景”** → 匹配到漏洞只完成了一半工作。还需验证安全场景不会被匹配到（误报会破坏信任）。
- **“污点模式对此而言大材小用”** → 如果数据会从用户输入流向危险汇聚点，污点模式比模式匹配的精确度更高。
- **“一个测试就够了”** → 应包含边界情况：不同的编码风格、经过净化的输入、安全的替代写法以及边界条件。
- **“我要先优化模式”** → 应先编写正确的模式，待所有测试通过后再优化。过早优化会导致回归问题。
- **“AST 转储太复杂了”** → AST 恰恰揭示了 Semgrep 解析代码的确切方式。跳过这一步会导致模式遗漏语法变体。

## 反模式

**过于宽泛**——会匹配所有内容，对检测毫无用处：
```yaml
# BAD: Matches any function call
pattern: $FUNC(...)

# GOOD: Specific dangerous function
pattern: eval(...)
```

**测试中缺少安全用例**——会导致未被发现的误报：
```python
# BAD: Only tests vulnerable case
# ruleid: my-rule
dangerous(user_input)

# GOOD: Include safe cases to verify no false positives
# ruleid: my-rule
dangerous(user_input)

# ok: my-rule
dangerous(sanitize(user_input))

# ok: my-rule
dangerous("hardcoded_safe_value")
```

**过于具体的模式**——会遗漏变体：
```yaml
# BAD: Only matches exact format
pattern: os.system("rm " + $VAR)

# GOOD: Matches all os.system calls with taint tracking
mode: taint
pattern-sources:
  - pattern: input(...)
pattern-sinks:
  - pattern: os.system(...)
```

## 严格程度

此工作流程是**严格的**——请勿跳过任何步骤：
- **先阅读文档**：在编写 Semgrep 规则之前，请参阅[文档](#documentation)
- **测试先行是强制要求**：绝不在没有测试的情况下编写规则
- **要求 100% 测试通过**：“大部分测试通过”是不可接受的
- **优化放在最后**：只有在所有测试通过后才简化模式
- **避免泛化模式**：规则必须具体，而不是匹配宽泛的模式
- **优先使用污点模式**：针对数据流漏洞
- **一个 YAML 文件对应一条 Semgrep 规则**：每个 YAML 文件必须只包含一条 Semgrep 规则；不要将多条规则合并在单个文件中
- **禁止泛化规则**：在为特定语言编写 Semgrep 规则时，避免使用通用模式匹配（`languages: generic`）
- **禁止使用 `todook` 和 `todoruleid` 测试标注**：禁止在测试文件中为未来的规则改进使用 `todoruleid: <rule-id>` 和 `todook: <rule-id>` 标注

## 概述

此技能指导创建用于检测安全漏洞和代码模式的 Semgrep 规则。规则的创建采用迭代方式：分析问题、先编写测试、分析 AST 结构、编写规则、迭代直至所有测试通过、优化规则。

**方案选择：**
- **污点模式**（优先）：不可信输入到达危险汇聚点的数据流问题
- **模式匹配**：无数据流要求的简单语法模式

**为什么优先使用污点模式？** 模式匹配只能发现语法，却会遗漏上下文。模式 `eval($X)` 会同时匹配 `eval(user_input)`（有漏洞）和 `eval("safe_literal")`（安全）。污点模式会跟踪数据流，因此只有当不可信数据实际到达汇聚点时才会告警——从而大幅减少注入类漏洞的误报。

**在两种方案之间迭代：** 可以大胆尝试。如果你从污点模式开始但效果不佳（例如污点未按预期传播、误报/漏报过多），就切换到模式匹配。反过来，如果模式匹配在安全场景上产生过多误报，则尝试污点模式。目标是得到一个可用的规则——而不是僵化地固守某一种方案。

**输出结构**——在以 rule-id 命名的目录中恰好包含 2 个文件：
```
<rule-id>/
├── <rule-id>.yaml     # Semgrep rule
└── <rule-id>.<ext>    # Test file with ruleid/ok annotations
```

## 快速入门

```yaml
rules:
  - id: insecure-eval
    languages: [python]
    severity: HIGH
    message: User input passed to eval() allows code execution
    mode: taint
    pattern-sources:
      - pattern: request.args.get(...)
    pattern-sinks:
      - pattern: eval(...)
```

测试文件（`insecure-eval.py`）：
```python
# ruleid: insecure-eval
eval(request.args.get('code'))

# ok: insecure-eval
eval("print('safe')")
```

运行测试（在规则目录下执行）：`semgrep --test --config <rule-id>.yaml <rule-id>.<ext>`

## 快速参考

- 有关命令、模式运算符和污点模式语法，请参阅 [quick-reference.md]({baseDir}/references/quick-reference.md)。
- 有关详细的工作流程和示例，你必须查看 [workflow.md]({baseDir}/references/workflow.md)

## 工作流程

复制此清单并跟踪进度：

```
Semgrep Rule Progress:
- [ ] Step 1: Analyze the Problem
- [ ] Step 2: Write Tests First
- [ ] Step 3: Analyze AST structure
- [ ] Step 4: Write the rule
- [ ] Step 5: Iterate until all tests pass (semgrep --test)
- [ ] Step 6: Optimize the rule (remove redundancies, re-test)
- [ ] Step 7: Final Run
```

## 文档

**必读**：在编写任何规则之前，请使用 WebFetch 阅读以下 7 个 Semgrep 文档链接的**全部**内容：

1. [规则语法](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/rule-syntax.mdx)
2. [模式语法](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/pattern-syntax.mdx)
3. [测试规则](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/testing-rules.mdx)
4. [污点分析](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/taint-mode/overview.mdx)
5. [污点分析高级技巧](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/taint-mode/advanced.mdx)
6. [常量传播](https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/constant-propagation.mdx)
7. [Trail of Bits 测试手册 - Semgrep 章节](https://raw.githubusercontent.com/trailofbits/testing-handbook/refs/heads/main/content/docs/static-analysis/semgrep/10-advanced.md)
