---
name: debug
description: Troubleshoot and debug issues. Use when the user reports an error, a test failure, unexpected behavior, or asks to investigate why something isn't working.
allowed-tools: Bash, Read, Grep, Glob
---
# Debug

帮助诊断并排查所描述的问题或最近的错误。

## 步骤

1. **理解问题**
   - 阅读提到的所有错误信息或堆栈跟踪
   - 如果问题描述含糊不清，提出澄清性问题
   - 检查可能导致该问题的近期 git 变更：`git diff HEAD~3`

2. **复现**
   - 如果存在失败的测试，运行它以查看确切的错误
   - 如果是运行时问题，尝试用最少的步骤复现

3. **调查**
   - 利用堆栈跟踪或错误信息找到相关的源文件
   - 追踪导致错误的代码路径
   - 检查常见问题：
     - 变量名或函数名中的拼写错误
     - 类型错误或缺少类型转换
     - 缺少导入或依赖
     - 竞态条件或异步问题
     - 环境差异（缺少环境变量、路径错误）
     - 破坏了原有假设的近期变更

4. **提出假设并验证**
   - 说明你认为的根本原因是什么
   - 在代码中寻找支持或反驳该假设的证据
   - 如有需要，添加有针对性的日志来缩小问题范围

5. **报告发现**
   - 根本原因解释（为什么会出错，而不仅仅是哪里出了错）
   - 建议的修复方案，包含具体的代码改动
   - 如何在未来预防类似问题

除非被明确要求，否则不要进行任何修改——先诊断和解释。用户应自行决定是否修复以及如何修复。

$ARGUMENTS
