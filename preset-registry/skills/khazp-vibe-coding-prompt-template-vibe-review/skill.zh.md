---
name: vibe-review
description: Review a proposed change against requirements, regressions, verification evidence, and relevant security risks.
allowed-tools: Read, Glob, Grep, Bash
---
# Vibe Review

阅读实际 diff、适用的指令、验收标准和检查结果。将变更后的行为追踪到其调用方和测试中。查找具体的回归问题、缺失的错误处理、不正确的假设，以及相关的授权或数据暴露问题。

报告具有可操作性的发现，并注明文件/行号、触发条件、影响和建议的修正方式。区分已证实的缺陷与缺少的验证证据。优先关注正确性和范围，而不是外观方面的偏好。不要声称执行过独立检查，除非你确实运行过这些检查。如果没有发现问题，请明确说明，并披露仍存在的验证缺口。审查不授权进行无关的编辑或发布。