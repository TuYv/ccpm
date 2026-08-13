---
name: tdd-guide
description: Comprehensive Test Driven Development guide for engineering subagents with multi-framework support, coverage analysis, and intelligent test generation
---
# TDD 指南——面向工程团队的测试驱动开发

一项全面的测试驱动开发技能，可跨多种语言和测试框架提供智能测试生成、覆盖率分析、框架集成和 TDD 工作流指导。

## 功能

### 测试生成
- **根据需求生成测试用例**：将用户故事、API 规范和业务需求转换为可执行的测试用例
- **创建测试桩**：生成具有恰当命名、导入和初始化/清理逻辑的测试函数脚手架
- **生成测试夹具**：为各种场景创建真实的测试数据、模拟对象和夹具

### TDD 工作流支持
- **指导红-绿-重构**：通过验证逐步指导完成 TDD 循环
- **建议缺失的场景**：识别未经测试的边缘情况、错误条件和边界场景
- **审查测试质量**：分析测试隔离性、断言质量、命名约定和可维护性

### 覆盖率与指标分析
- **计算覆盖率**：解析 LCOV、JSON 和 XML 覆盖率报告，以获取行、分支和函数覆盖率
- **识别未经测试的路径**：查找没有测试覆盖的代码路径、分支和错误处理程序
- **推荐改进措施**：针对覆盖率缺口和测试质量提供按优先级排列的建议（P0/P1/P2）

### 框架集成
- **多框架支持**：Jest、Pytest、JUnit、Vitest、Mocha、RSpec 适配器
- **生成样板代码**：创建包含正确导入、describe 块和最佳实践的测试文件
- **配置测试运行器**：设置测试配置、覆盖率工具和 CI 集成

### 综合指标
- **测试覆盖率**：行、分支和函数覆盖率以及缺口分析
- **代码复杂度**：圈复杂度、认知复杂度和可测试性评分
- **测试质量**：每个测试的断言数量、隔离性评分、命名质量和测试异味检测
- **测试数据**：边界值分析、边缘情况识别和模拟数据生成
- **测试执行**：耗时分析、慢速测试检测和不稳定性检测
- **缺失的测试**：未覆盖的边缘情况、错误处理缺口和缺失的集成场景

## 输入要求

该技能支持**自动格式检测**，可灵活处理输入：

### 源代码
- **语言**：TypeScript、JavaScript、Python、Java
- **格式**：直接提供文件路径或粘贴代码块
- **检测**：根据语法和导入自动检测语言/框架

### 测试工件
- **覆盖率报告**：LCOV (.lcov)、JSON (coverage-final.json)、XML (cobertura.xml)
- **测试结果**：JUnit XML、Jest JSON、Pytest JSON、TAP 格式
- **格式**：文件路径或原始覆盖率数据

### 需求（可选）
- **用户故事**：功能的文本描述
- **API 规范**：OpenAPI/Swagger、REST 端点、GraphQL 模式
- **业务需求**：验收标准、业务规则

### 输入方式
- **选项 A**：提供文件路径（技能将读取文件）
- **选项 B**：直接复制粘贴代码/数据
- **选项 C**：混合使用以上两种方式（自动检测）

## 输出格式

该 Skill 提供针对你的环境优化的**上下文感知输出**：

### 代码文件
- **测试文件**：生成具有规范结构的测试（Jest/Pytest/JUnit/Vitest）
- **夹具**：测试数据文件、模拟对象、工厂函数
- **模拟**：模拟实现、存根函数、测试替身

### 报告
- **Markdown**：丰富的覆盖率报告、建议和质量分析（Claude Desktop）
- **JSON**：机器可读的指标、用于 CI/CD 集成的结构化数据
- **终端友好**：适用于 Claude Code CLI 的简化输出

### 智能默认设置
- **桌面端/应用**：包含表格、代码块和清晰视觉层级的丰富 Markdown
- **CLI**：简洁、终端友好的格式，具有清晰的章节划分
- **CI/CD**：用于自动化处理的 JSON 输出

### 渐进式披露
- **优先提供摘要**：高层级概览（<200 个 token）
- **按需提供详情**：可获取完整分析（500-1000 个 token）
- **按优先级排列**：P0（关键）→ P1（重要）→ P2（锦上添花）

## 使用方法

### 基本用法
```
@tdd-guide

I need tests for my authentication module. Here's the code:
[paste code or provide file path]

Generate comprehensive test cases covering happy path, error cases, and edge cases.
```

### 覆盖率分析
```
@tdd-guide

Analyze test coverage for my TypeScript project. Coverage report: coverage/lcov.info

Identify gaps and provide prioritized recommendations.
```

### TDD 工作流
```
@tdd-guide

Guide me through TDD for implementing a password validation function.

Requirements:
- Min 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special char
- No common passwords
```

### 多框架支持
```
@tdd-guide

Convert these Jest tests to Pytest format:
[paste Jest tests]
```

## 脚本

### 核心模块

- **test_generator.py**：根据需求和代码智能生成测试用例
- **coverage_analyzer.py**：解析并分析覆盖率报告（LCOV、JSON、XML）
- **metrics_calculator.py**：计算全面的测试和代码质量指标
- **framework_adapter.py**：多框架适配器（Jest、Pytest、JUnit、Vitest）
- **tdd_workflow.py**：红-绿-重构工作流指导和验证
- **fixture_generator.py**：生成真实的测试数据和夹具
- **format_detector.py**：自动检测语言和框架

### 实用工具

- **complexity_analyzer.py**：圈复杂度和认知复杂度分析
- **test_quality_scorer.py**：测试质量评分（隔离性、断言、命名）
- **missing_test_detector.py**：识别未经测试的路径和缺失的场景
- **output_formatter.py**：上下文感知的输出格式化（桌面端与 CLI）

## 最佳实践

### 测试生成
1. **从需求开始**：在查看实现之前，根据用户故事编写测试
2. **测试行为，而非实现**：关注代码做什么，而不是如何实现
3. **单一断言重点**：每个测试应验证一种特定行为
4. **描述性名称**：测试名称读起来应当像规范一样

### TDD 工作流
1. **红灯**：首先编写失败的测试
2. **绿灯**：编写能让测试通过的最少代码
3. **重构**：在保持测试通过的同时改进代码
4. **重复**：进行小步迭代，频繁提交

### 覆盖率目标
1. **力争达到 80% 以上**：作为大多数项目的行覆盖率基准
2. **关键路径达到 100%**：身份验证、支付、数据验证必须完全覆盖
3. **分支覆盖率同样重要**：仅有行覆盖率是不够的
4. **不要操纵指标**：专注于有意义的测试，而不是覆盖率数字

### 测试质量
1. **测试相互独立**：每个测试都应能独立运行
2. **快速执行**：将每个单元测试的执行时间控制在 100ms 以内
3. **确定性**：测试应始终产生相同的结果
4. **清晰的失败信息**：断言消息应说明具体出了什么问题

### 框架选择
1. **Jest**：JavaScript/TypeScript 项目（React、Node.js）
2. **Pytest**：Python 项目（Django、Flask、FastAPI）
3. **JUnit**：Java 项目（Spring、Android）
4. **Vitest**：基于现代 Vite 的项目

## 多语言支持

### TypeScript/JavaScript
- 框架：Jest、Vitest、Mocha、Jasmine
- 运行器：Node.js、Karma、Playwright
- 覆盖率工具：Istanbul/nyc、c8

### Python
- 框架：Pytest、unittest、nose2
- 运行器：pytest、tox、nox
- 覆盖率工具：coverage.py、pytest-cov

### Java
- 框架：JUnit 5、TestNG、Mockito
- 运行器：Maven Surefire、Gradle Test
- 覆盖率工具：JaCoCo、Cobertura

## 局限性

### 适用范围
- **专注于单元测试**：主要针对单元测试进行了优化（集成测试需要采用不同的模式）
- **仅限静态分析**：无法执行测试或衡量代码的实际行为
- **语言支持**：对 TypeScript、JavaScript、Python、Java 的支持最佳（对其他语言的支持有限）

### 覆盖率分析
- **依赖报告**：需要已有的覆盖率报告（无法从头生成覆盖率）
- **格式支持**：仅支持 LCOV、JSON、XML（其他格式需要转换）
- **解读语境**：需要人工判断覆盖率数字是否有实际意义

### 测试生成
- **基础质量**：生成的测试仅提供脚手架，需要人工审查和完善
- **复杂逻辑**：高级业务逻辑和集成场景需要手动设计测试
- **模拟策略**：mock/stub 策略应与项目模式保持一致

### 框架集成
- **需要配置**：测试运行器需要正确设置（此技能不会修改 package.json 或 pom.xml）
- **版本兼容性**：生成的代码面向较新的稳定版本（Jest 29+、Pytest 7+、JUnit 5+）

### 不应使用此技能的情况
- **E2E 测试**：使用专门的 E2E 工具（Playwright、Cypress、Selenium）
- **性能测试**：使用 JMeter、k6 或 Locust
- **安全测试**：使用 OWASP ZAP、Burp Suite 或专注于安全的工具
- **手动测试**：某些场景需要人工探索性测试

## 工作流示例

### 工作流 1：根据需求生成测试
```
Input: User story + API specification
Process: Parse requirements → Generate test cases → Create test stubs
Output: Complete test files ready for implementation
```

### 工作流 2：提高覆盖率
```
Input: Coverage report + source code
Process: Identify gaps → Suggest tests → Generate test code
Output: Prioritized test cases for uncovered code
```

### 工作流 3：通过 TDD 开发新功能
```
Input: Feature requirements
Process: Guide red-green-refactor → Validate each step → Suggest refactorings
Output: Well-tested feature with clean code
```

### 工作流 4：框架迁移
```
Input: Tests in Framework A
Process: Parse tests → Translate patterns → Generate equivalent tests
Output: Tests in Framework B with same coverage
```

## 集成点

### CI/CD 集成
- 解析 CI 构件中的覆盖率报告
- 生成覆盖率徽章和报告
- 未达到覆盖率阈值时使构建失败
- 持续跟踪覆盖率趋势

### IDE 集成
- 为选中的代码生成测试
- 保存时运行覆盖率分析
- 高亮显示未经测试的代码路径
- 为测试缺口提供快速修复建议

### 代码审查
- 验证 PR 中的测试覆盖率
- 检查测试质量标准
- 识别缺失的测试场景
- 在合并前提出改进建议

## 版本支持

- **Node.js**：16+（Jest 29+、Vitest 0.34+）
- **Python**：3.8+（Pytest 7+）
- **Java**：11+（JUnit 5.9+）
- **TypeScript**：4.5+

## 相关技能

此技能适合与以下技能配合使用：
- **code-review**：在审查期间验证测试质量
- **refactoring-assistant**：在重构期间维护测试
- **ci-cd-helper**：将覆盖率集成到流水线中
- **documentation-generator**：生成测试文档