---
name: feature-flags
description: Gate a Sentry feature behind a FlagPole feature flag. Use when adding a feature flag, registering a flag in temporary.py, checking a flag from Python or the frontend, enabling a flag in tests, or asking where FlagPole rollout config lives. Trigger on "add a feature flag", "gate this behind a flag", "register a flag", "features.has", "api_expose", "OrganizationFeature", "ProjectFeature", "FlagPole".
---
# 功能标志（FlagPole）

新功能应通过功能标志进行控制。

1. **注册**标志，位置在 `src/sentry/features/temporary.py`：

   ```python
   manager.add("organizations:my-feature", OrganizationFeature, FeatureHandlerStrategy.FLAGPOLE, api_expose=True)
   ```

   如果前端需要检查该标志，请使用 `api_expose=True`。对于项目级标志，请使用 `ProjectFeature` 和 `projects:` 前缀。

2. **Python 检查**：

   ```python
   if features.has("organizations:my-feature", organization, actor=user):
   ```

3. **前端检查**（需要 `api_expose=True`）：

   ```typescript
   organization.features.includes('my-feature');
   ```

4. **测试**：

   ```python
   with self.feature("organizations:my-feature"):
       ...
   ```

5. **发布**：FlagPole 的 YAML 配置位于 `sentry-options-automator` 仓库中，而不在此处。

6. **移除**：发布完成后，该标志会按照固定的三个 PR 顺序移除 — 参见 `remove-option-or-flag` skill。

完整文档请参见 https://develop.sentry.dev/feature-flags/。