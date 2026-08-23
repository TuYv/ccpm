---
name: migration-guide
description: Turn a breaking change (an API rename, removed flag, changed default, or moved module) into concrete upgrade steps with before/after examples. Use when the user asks how to migrate, upgrade, or adapt to a breaking change.
---
# migration-guide — 为破坏性变更编写升级步骤

编写一份指南，让使用旧版本的用户能够以最小阻力迁移到新版本。

## 明确实际发生的破坏性变更

动笔之前，先识别出准确的破坏性变更。应从差异和历史记录中获取，而不能只依赖描述：
- 对受影响的部分运行 `git diff <old>..<new>`，并对引入该变更的 PR 运行 `gh pr view <n>`。
- 调度研究员（`purpose: explore`），确认新旧版本的确切形式：旧名称/签名/默认值、新名称/签名/默认值，以及是否存在兼容性垫片或弃用过渡期。

切勿凭记忆记录重命名或签名变更——用户会直接复制这些确切的符号。

## 结构

    # 迁移到 <version>

    ## 变更内容
    <一个段落：从用户角度说明变更及其原因>

    ## 升级步骤
    1. <有序、机械化的步骤>

    ## 变更前/后
    ```
    # before
    ...
    # after
    ...
    ```

    ## 如果暂时无法升级
    <弃用过渡期、兼容性垫片或用于选择退出的标志——如果存在>

## 编写步骤

- 确保每个步骤都是机械化且可验证的（例如“将 `--foo` 重命名为 `--bar`”，而不是“更新你的标志”）。用户无需重新通读整份指南即可完成操作。
- 为每项不同的变更展示最精简且真实的变更前后对比。确保示例可以直接复制粘贴。
- 如果不存在自动化迁移路径、必须手动编辑，请明确说明。

## 验证

将完成的指南交给 `reviewer`（`purpose: review`）审核。用户会直接按照迁移指南操作，因此错误的标志名称或步骤会造成高昂代价——在这里进行跨供应商事实核查是值得的。