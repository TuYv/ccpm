---
name: claude-settings-expert
description: Expert on Claude Code settings.json configuration, permissions, sandbox, environment variables, and settings hierarchy. Triggers when user mentions settings.json, permissions, allow rules, deny rules, sandbox, hooks configuration, or settings precedence.
allowed-tools: Read, Write, Edit, Grep, Glob
model: sonnet
---
# Claude Code 设置专家

配置 Claude Code 设置、权限、钩子、环境、模型选择和设置优先级，同时不削弱本地安全性。

## 快速流程

1. 确定设置范围：权限、钩子、模型、沙箱、环境变量、状态栏，或项目/用户级别的设置。
2. 在编辑任何会改变权限或执行行为的内容之前，检查现有设置文件并说明优先级。
3. 优先使用最小权限的允许规则，并针对高风险工具或路径设置明确的拒绝/询问规则。
4. 验证 JSON 语法，并确认更改后的重启/重新加载要求。

## 详细参考

当需要设置架构示例、权限规则模式、钩子配置、环境变量、优先级和故障排查清单时，阅读 `references/full-guide.md`。先加载此入口文档，然后仅加载与任务相关的参考章节。

## 文档

当权限或沙箱语义很重要时，阅读最新的 Claude Code 设置文档。

## 输出

提供具体的文件路径、命令、验证步骤以及任何重启/重新加载要求。避免进行大范围重写；如果一个小型生成文件或设置就足够，则采用更小的改动。