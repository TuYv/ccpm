---
name: fix-ci
description: Diagnoses and fixes failing GitHub Actions checks with gh. Use when CI fails on a pull request and needs logs, focused fixes, and validation.
---
# 修复 CI

1. 使用 `gh pr checks` 读取检查状态，然后用 `gh run view <run-id> --log-failed` 拉取失败作业的日志。通过 `gh` 获取的日志是可复现的；仅在浏览器中查看则不可复现。处于等待状态的检查通常可以再等等，除非失败原因已经明确。

2. 在本地复现。CI 几乎所有内容都通过 Nix 运行，因此失败的步骤会映射到一个 `just` 配方：

   | CI 作业 / 步骤                                   | 本地                                                    |
   | ------------------------------------------------ | ------------------------------------------------------ |
   | `preflight` 或 `Run nix flake check`             | `just check`                                           |
   | `Run Rust tests`（`nix build .#ccusage-tests`）  | `just rust::test`                                      |
   | `JS test`                                        | `just test-node`                                       |
   | `Babashka performance harness test`              | `apps/ccusage/scripts/compare-pr-performance_test.clj` |

   先从能复现失败的最小范围命令开始——例如单个 `cargo test` 过滤器——再使用上面的配方。

3. 修复能解释该检查失败的最小原因，并使用与所修改区域对应的技能：`testing`、`development`、`docs`，或最近的包的 `AGENTS.md`。当失败出在生成的输出或格式上时，应提交该检查所要求的重新生成结果，而不是手工编辑。

4. 使用 `commit` 技能进行提交；manifest 变更及其 lockfile 更新应放在同一个提交中，无关的清理则放在单独的提交中。让 git 钩子照常运行。

5. 推送，然后在合适的时候使用 `create-pr` 发表评论或请求再次审查。
