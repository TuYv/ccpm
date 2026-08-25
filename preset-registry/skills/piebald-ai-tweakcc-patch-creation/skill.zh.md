---
name: patch-creation
description: Create and register new patches for tweakcc. Use when adding new customizations to Claude Code.
---
# 创建和注册补丁

## 概述

补丁是应用于 Claude Code 的 `cli.js`（或原生二进制文件）的代码修改。每个补丁都会在压缩后的代码中查找特定模式，并替换或注入新的行为。

## 创建新补丁

### 1. 创建补丁文件

创建 `src/patches/myPatch.ts`：

````typescript
// Please see the note about writing patches in ./index

import { showDiff } from './index';

/**
 * Description of what this patch does.
 *
 * CC X.Y.Z:
 * ```diff
 *  // Show before/after of the code change
 * -oldCode
 * +newCode
 * ```
 */
export const writeMyPatch = (
  file: string,
  configValue: string // Add parameters as needed
): string | null => {
  // Pattern to find in minified code
  // IMPORTANT: Use [$\w]+ for identifiers (not \w+) because $ is valid in JS identifiers
  // IMPORTANT: Start patterns with a boundary char (,;}{) for HIGH performance (e.g. 1.5s -> 30ms)
  const pattern = /,somePattern([$\w]+)/;

  const match = file.match(pattern);

  if (!match || match.index === undefined) {
    console.error('patch: myPatch: failed to find pattern');
    return null;
  }

  const replacement = `,newCode${match[1]}`;

  const startIndex = match.index;
  const endIndex = startIndex + match[0].length;

  const newFile =
    file.slice(0, startIndex) + replacement + file.slice(endIndex);

  showDiff(file, newFile, replacement, startIndex, endIndex);

  return newFile;
};
````

### 2. 添加配置类型（如果补丁可配置）

编辑 `src/types.ts` —— 添加到 `MiscConfig`，或创建一个新的接口：

```typescript
export interface MiscConfig {
  // ... existing fields ...
  myNewSetting: string | null; // null = disabled
}
```

### 3. 添加默认值

编辑 `src/defaultSettings.ts`：

```typescript
misc: {
  // ... existing fields ...
  myNewSetting: null,  // or a sensible default
},
```

### 4. 在 index.ts 中注册

编辑 `src/patches/index.ts`：

**4a. 添加导入：**

```typescript
import { writeMyPatch } from './myPatch';
```

**4b. 添加补丁定义（在 `PATCH_DEFINITIONS` 数组中）：**

```typescript
{
  id: 'my-patch',
  name: 'My patch',
  group: PatchGroup.FEATURES,  // or ALWAYS_APPLIED, MISC_CONFIGURABLE
  description: 'What this patch does for the user',
},
```

**4c. 添加补丁实现（在 `patchImplementations` 对象中）：**

```typescript
'my-patch': {
  fn: c => writeMyPatch(c, config.settings.misc!.myNewSetting!),
  condition: !!config.settings.misc?.myNewSetting,
},
```

### 5. 添加 UI（可选）

编辑 `src/ui/components/MiscView.tsx`，为该设置添加切换开关或输入框。

## 关键文件

| 文件                             | 用途                                            |
| -------------------------------- | ----------------------------------------------- |
| `src/patches/*.ts`               | 单个补丁的实现                                   |
| `src/patches/index.ts`           | 补丁注册表、定义和应用逻辑                       |
| `src/types.ts`                   | 配置类型定义（`MiscConfig` 等）                  |
| `src/defaultSettings.ts`         | 所有设置的默认值                                 |
| `src/ui/components/MiscView.tsx` | 杂项设置的 UI                                    |

## 注册检查清单

添加新 patch 时，请更新以下位置：

- [ ] `src/patches/myPatch.ts` - 创建包含导出函数的 patch 文件
- [ ] `src/types.ts` - 添加配置类型（如果可配置）
- [ ] `src/defaultSettings.ts` - 添加默认值（如果可配置）
- [ ] `src/patches/index.ts`：
  - [ ] 导入 patch 函数
  - [ ] 添加到 `PATCH_DEFINITIONS` 数组（id、name、group、description）
  - [ ] 添加到 `patchImplementations` 对象（fn、condition）
- [ ] `src/ui/components/MiscView.tsx` - 添加 UI 控件（可选）

## Patch 分组

- `PatchGroup.ALWAYS_APPLIED` - 始终应用的核心 patch
- `PatchGroup.MISC_CONFIGURABLE` - 用户可配置的杂项设置
- `PatchGroup.FEATURES` - 可启用/禁用的功能 patch

## 模式编写技巧

1. **使用 `[$\w]+` 表示标识符** - 不要使用 `\w+`，因为 `$` 是有效的 JS 标识符，并且在压缩代码中很常见

2. **以边界字符开头编写模式** - 在开头使用 `,`、`;`、`{`、`}`，可以显著加快匹配速度（可将 1.5s 减少到 30ms）

3. **不要使用 `\b` 表示单词边界** - 它不会将 `$` 视为单词字符，因此 `\b[$\w]+` 无法匹配 `,$=`

4. **谨慎提取函数体** - 需要完整函数时，通过统计花括号来找到匹配的 `}`

5. **使用 `showDiff()` 进行调试** - 始终调用它来记录 patch 所做的更改

6. **失败时返回 `null`** - 让 patch 系统知道 patch 无法应用

7. **处理多个 CC 版本** - 代码模式可能会因版本不同而变化；必要时尝试多个模式

## 示例：简单的切换开关 Patch

```typescript
// Bypass a feature flag check
const pattern = /function [$\w]+\(\)\{return [$\w]+\("my_feature_flag"/;
const match = file.match(pattern);

if (!match || match.index === undefined) {
  console.error('patch: myPatch: failed to find feature flag');
  return null;
}

const insertIndex = match.index + match[0].indexOf('{') + 1;
const insertion = 'return true;';

const newFile =
  file.slice(0, insertIndex) + insertion + file.slice(insertIndex);

showDiff(file, newFile, insertion, insertIndex, insertIndex);
return newFile;
```

## 示例：替换值

```typescript
// Replace a hardcoded value
const pattern = /(someConfig=)\d+(;)/;
const match = file.match(pattern);

if (!match || match.index === undefined) {
  console.error('patch: myPatch: failed to find config value');
  return null;
}

const replacement = match[1] + newValue + match[2];
const startIndex = match.index;
const endIndex = startIndex + match[0].length;

const newFile = file.slice(0, startIndex) + replacement + file.slice(endIndex);

showDiff(file, newFile, replacement, startIndex, endIndex);
return newFile;
```

## 测试

1. 运行 `npm run build` 进行编译
2. 运行 `npx tweakcc --apply` 应用 patch
3. 检查控制台输出，确认 patch 成功或失败
4. 运行 Claude Code 验证行为