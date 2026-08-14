---
name: upgrading-react-native
description: Upgrades React Native apps to newer versions by applying rn-diff-purge template diffs, updating package.json dependencies, migrating native iOS and Android configuration, resolving CocoaPods and Gradle changes, and handling breaking API updates. Use when upgrading React Native, bumping RN version, updating from RN 0.x to 0.y, or migrating Expo SDK alongside a React Native upgrade.
license: MIT
---
# 升级 React Native

## 概述

涵盖完整的 React Native 升级工作流：通过 Upgrade Helper 获取模板差异、更新依赖项、执行 Expo SDK 相关步骤，以及处理常见陷阱。

## 典型升级顺序

1. **路径选择**：通过 [upgrading-react-native.md][upgrading-react-native] 选择正确的升级路径
2. **差异**：通过 [upgrade-helper-core.md][upgrade-helper-core] 使用 Upgrade Helper 获取规范模板差异
3. **依赖项**：通过 [upgrading-dependencies.md][upgrading-dependencies] 评估并更新第三方软件包
4. **React**：如果 React 已升级，则通过 [react.md][react] 调整 React 版本
5. **Expo**（如适用）：通过 [expo-sdk-upgrade.md][expo-sdk-upgrade] 应用 Expo SDK 层
6. **验证**：通过 [upgrade-verification.md][upgrade-verification] 运行升级后检查

```bash
# Quick start: detect current version and fetch diff
npm pkg get dependencies.react-native --prefix "$APP_DIR"
npm view react-native dist-tags.latest

# Example: upgrading from 0.76.9 to 0.78.2
# 1. Fetch the template diff
curl -L -f -o /tmp/rn-diff.diff \
  "https://raw.githubusercontent.com/react-native-community/rn-diff-purge/diffs/diffs/0.76.9..0.78.2.diff" \
  && echo "Diff downloaded OK" || echo "ERROR: diff not found, check versions"
# 2. Review changed files
grep -n "^diff --git" /tmp/rn-diff.diff
# 3. Update package.json, apply native changes, then install + rebuild
npm install --prefix "$APP_DIR"
cd "$APP_DIR/ios" && pod install
# 4. Validate: both platforms must build successfully
npx react-native build-android --mode debug --no-packager
xcodebuild -workspace "$APP_DIR/ios/App.xcworkspace" -scheme App -sdk iphonesimulator build
```

## 适用场景

以下情况可参考这些指南：
- 将 React Native 应用迁移到较新版本
- 协调 Upgrade Helper 中的原生配置变更
- 验证发行说明中的破坏性变更

## 快速参考

| 文件 | 说明 |
|------|-------------|
| [upgrading-react-native.md][upgrading-react-native] | 路由指南：选择正确的升级路径 |
| [upgrade-helper-core.md][upgrade-helper-core] | Upgrade Helper 核心工作流和可靠性关卡 |
| [upgrading-dependencies.md][upgrading-dependencies] | 依赖项兼容性检查和迁移规划 |
| [react.md][react] | React 和 React 19 升级协调规则 |
| [expo-sdk-upgrade.md][expo-sdk-upgrade] | Expo SDK 专用升级层（按条件应用） |
| [upgrade-verification.md][upgrade-verification] | 升级后验证清单，包括代理设备辅助检查 |
| [monorepo-singlerepo-targeting.md][monorepo-singlerepo-targeting] | Monorepo 和单仓库应用定位及命令作用域限定 |

## 问题 → 技能映射

| 问题 | 从这里开始 |
|---------|------------|
| 需要升级 React Native | [upgrade-helper-core.md][upgrade-helper-core] |
| 需要评估依赖项风险并确定迁移方案 | [upgrading-dependencies.md][upgrading-dependencies] |
| 需要协调 React/React 19 软件包版本 | [react.md][react] |
| 需要先确定工作流路径 | [upgrading-react-native.md][upgrading-react-native] |
| 需要 Expo SDK 专用步骤 | [expo-sdk-upgrade.md][expo-sdk-upgrade] |
| 需要手动或代理辅助的回归验证 | [upgrade-verification.md][upgrade-verification] |
| 需要限定仓库/应用命令的作用域 | [monorepo-singlerepo-targeting.md][monorepo-singlerepo-targeting] |

[upgrading-react-native]: references/upgrading-react-native.md
[upgrade-helper-core]: references/upgrade-helper-core.md
[upgrading-dependencies]: references/upgrading-dependencies.md
[react]: references/react.md
[expo-sdk-upgrade]: references/expo-sdk-upgrade.md
[upgrade-verification]: references/upgrade-verification.md
[monorepo-singlerepo-targeting]: references/monorepo-singlerepo-targeting.md