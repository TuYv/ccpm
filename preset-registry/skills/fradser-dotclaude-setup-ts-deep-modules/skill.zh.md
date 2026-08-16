---
name: setup-ts-deep-modules
description: Wires dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only through entry-point files. Use when the user wants deep-module enforcement or dependency-cruiser setup.
disable-model-invocation: true
---
# 设置 TS 深模块

让此仓库中的每个包都成为**深模块**：以小型接口封装大量行为。包的公共表面就是它的**入口点**——位于包根目录的文件——而其子文件夹中的所有内容均为隐藏内容。此技能会安装 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 以及确保只能通过入口点访问的规则，然后验证这些规则确实会生效。

关于相关术语（深模块、接口、接缝、深度），请运行 `/mattpocock:codebase-design` 技能——全文均使用其中的语言。

## 此规则所强制的结构

```
src/packages/
  <name>/
    index.ts        ← 入口点（公共）。从外部导入此文件。
    client.ts       ← 另一个入口点。包可以暴露多个入口点。
    lib/            ← 实现：对外部隐藏，内部可自由相互导入。
    tests/          ← 就近放置的测试 + 固件（属于子文件夹，因此是私有的）。
```

公共表面是包的**根目录文件**，而不是某个指定的 `index.ts`。按照约定，实现代码位于 `lib/` 中，测试位于 `tests/` 中，使每个包都具有相同的双文件夹结构。不过，规则本身是通用的：*任何*子文件夹中的*任何*内容都是私有的，因此你永远不需要为了添加文件夹而扩展配置。

共四条规则，级别均为 `error`：

1. **入口点边界**——包外部的代码（应用代码或其他包）只能导入该包的入口点（即其根目录文件），绝不能导入其子文件夹中的任何内容。
2. **包内自由**——包自身的文件可以自由地相互导入。
3. **测试通过入口点访问**——`<pkg>/tests/` 下的文件可以导入任何包的入口点以及自身 `tests/` 中的固件，但绝不能导入任何包子文件夹中的内部内容（即使是自身包的内部内容也不行）。允许跨包集成测试，但不允许深层导入。
4. **禁止循环依赖**——不允许存在依赖循环。

**入口点，而非桶文件。** 因为公共表面是*所有*根目录文件，所以一个包可以暴露多个小型入口点（`index.ts`、`client.ts`、`server.ts`），而不必将所有内容都汇集到一个巨大的 `index.ts` 中。不建议使用重新导出整个子树的桶文件——入口点应保持精简，并将实现隐藏在子文件夹中。

分层（哪些包可以依赖哪些包）是一个*不同的*关注点，因此在配置中保留为带注释的存根，供此仓库自行补充。

## 步骤

### 1. 检测环境

- **包管理器**——存在 `pnpm-lock.yaml` → pnpm，存在 `yarn.lock` → yarn，存在 `bun.lockb` → bun，否则使用 npm。下文中的每条命令都使用该包管理器（`pnpm`/`yarn`/`npm run`/`bunx`）。
- **包根目录**——如果 `src/` 存在，则使用 `src/packages`，否则使用 `packages`。如果仓库已经明显采用了其他约定，请向用户确认选择。
- **现有配置**——检查是否存在 `.dependency-cruiser.*` 文件。如果存在，**不要**覆盖它：将这四条规则和相关选项合并进去，并告知用户你添加了哪些内容。

**完成标准：** 已明确包管理器、包根目录以及现有配置的状态。

### 2. 安装 dependency-cruiser

使用检测到的包管理器将 `dependency-cruiser` 安装为 devDependency。

**完成条件：** `dependency-cruiser` 位于 `devDependencies` 中。

### 3. 编写配置

将 [`dependency-cruiser.config.cjs`](./dependency-cruiser.config.cjs) 复制到仓库根目录，并命名为 `.dependency-cruiser.cjs`。将 `PACKAGES_ROOT` 设置为步骤 1 中检测到的根目录。这些规则基于路径深度且与扩展名无关，因此无需进行其他调整。

**完成条件：** `.dependency-cruiser.cjs` 已存在，其中的 `PACKAGES_ROOT` 正确，并且包含四条禁止规则。

### 4. 将其接入检查流程

- 添加 `lint:boundaries` 脚本：`depcruise <packages-root>`（或 `depcruise src`）。
- 将其整合到仓库的总检查命令中，即已经运行 typecheck 的命令（例如 `check` / `ci` / `validate` 脚本）。**不要**修改 `tsconfig` 或添加路径别名。
- 如果没有总检查脚本，则添加 `lint:boundaries`，并告知用户将其纳入 CI。

**完成条件：** `lint:boundaries` 已存在，并且会作为与 typecheck 相同命令的一部分运行。

### 5. 搭建示例包的脚手架

创建并提交 `<packages-root>/example/`，将其作为可复制的模板：

- `index.ts` — 入口点。导出一个委托给内部文件的函数（从而让该包明显是*深层*模块，而不是简单的透传）。
- `lib/impl.ts` — 位于**子文件夹**中的内部文件，由 `index.ts` 导入，无法从外部访问。
- `tests/example.test.ts` — **仅**导入 `../index`（入口点），并对公开函数进行断言。

告知用户这是一个可以复制或删除的起始模板。

**完成条件：** 示例包已存在，通过根入口点公开其行为，并将 `impl` 隐藏在子文件夹中。

### 6. 证明规则确实生效

这是整个 skill 的完成标准——无法在违规时触发失败的配置毫无价值。

1. 运行 `lint:boundaries`。它必须在干净的示例上**通过**。
2. 临时向 `tests/example.test.ts` 添加一个深层导入（例如 `import { thing } from "../lib/impl"`）。再次运行 `lint:boundaries`——它必须因 `tests-through-entrypoints` 而**失败**。
3. 还原该深层导入。再次运行——它必须重新**通过**。

**完成条件：** 你已观察到先通过、在添加深层导入后失败、还原后再次通过。如果步骤 2 没有失败，则说明规则未正确接入——请在完成前修复。

### 7. 记录约定

在 packages 文件夹中编写 `README.md`（`<packages-root>/README.md`）——与其所管理的 packages 相邻——内容应涵盖：`src/packages/<name>/` 布局（根目录中放置入口点，`lib/` 用于实现，`tests/` 用于测试）、“仅通过包的入口点（其根目录文件）进行导入”，以及如何运行 `lint:boundaries`。明确**不鼓励使用桶文件**——应公开多个小型入口点，而不是通过单个 index 重新导出整个子树。内容保持精简，仅包含可复制的片段，以及分别用一个段落说明的四条规则。

然后从仓库的 agent 指令文件中添加一个指向该文件的**上下文指针**——如果存在 `CLAUDE.md`，则使用它，否则使用 `AGENTS.md`（如果两者都不存在，则创建 `AGENTS.md`）。一行即可，例如：`Packages are deep modules — see [src/packages/README.md](./src/packages/README.md) before adding or importing one.` 这能让 agent 主动发现边界规则，而不是在违反规则后才碰壁。

**完成标准：** `<packages-root>/README.md` 已存在并明确不建议使用桶文件，且仓库的 `CLAUDE.md`/`AGENTS.md` 中包含指向该文件的链接。

## 注意事项

- 配置中的 `$1` 反向引用（dependency-cruiser 的分组匹配）使包可以访问自身内部实现，同时阻止外部访问——不要将它们展开为按包分别定义的规则。
- 公共与私有由**目录深度**决定：包根目录中的文件是入口点；子文件夹中的所有内容都是私有的。约定的子文件夹是 `lib/`（实现）和 `tests/`，但规则并未将它们硬编码——任何子文件夹都是私有的，因此新增文件夹永远不需要修改配置。添加入口点只需添加根目录文件——无需桶文件。
- 包采用**扁平结构**：根目录下只有一层直属子项。包的内部结构可以任意深度嵌套；但包中不得包含另一个包。
- 使用 `.cjs`（而不是 `.js`），以确保即使在 `"type": "module"` 仓库中，配置里的 `module.exports` 也能正常工作。