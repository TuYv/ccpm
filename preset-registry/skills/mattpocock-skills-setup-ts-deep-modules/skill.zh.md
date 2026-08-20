---
name: setup-ts-deep-modules
description: Wire dependency-cruiser into a TypeScript repo so each package is a deep module, with implementation hidden in subfolders and reachable only through its entry-point files. User-invoked.
disable-model-invocation: true
---
# 设置 TS 深模块

将此仓库中的每个包都打造为**深模块**：在小型接口背后封装大量行为。包的公共表面是它的**入口点**（包根目录下的文件），而其子文件夹中的所有内容都被隐藏。此 Skill 会安装 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 以及确保入口点成为唯一访问方式的规则，然后验证这些规则确实会生效。

关于相关术语（深模块、接口、接缝、深度），请使用 `"codebase-design"` 调用 Skill 工具，并在全文中使用其语言体系。

## 此设置强制执行的结构

```
src/packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

公共表面是包的**根目录文件**，而不是某个指定的 `index.ts`。按照约定，实现代码位于 `lib/` 中，测试位于 `tests/` 中，从而使每个包都具有相同的双文件夹结构。不过，规则本身是通用的：*任何*子文件夹中的*任何内容*都是私有的，因此绝不需要通过扩展配置来添加文件夹。

四条规则，全部设为 `error`：

1. **入口点边界**：包外部的代码（应用代码或另一个包）只能导入该包的入口点（即其根目录文件），绝不能导入其子文件夹中的任何内容。
2. **包内自由**：一个包自身的文件可以自由地相互导入。
3. **测试通过入口点访问**：`<pkg>/tests/` 下的文件可以导入任何包的入口点以及自身 `tests/` 中的测试夹具，但绝不能导入任何包子文件夹中的内部实现（甚至不能导入自身的内部实现）。允许跨包集成测试；不允许深层导入。
4. **禁止循环依赖**：不允许存在依赖循环。

**入口点，而非桶文件。** 由于公共表面是*每一个*根目录文件，因此一个包可以公开多个小型入口点（`index.ts`、`client.ts`、`server.ts`），而不必将所有内容都汇集到一个巨大的 `index.ts` 中。不鼓励使用重新导出整个子树的桶文件；应保持入口点小巧，并将实现隐藏在子文件夹中。

分层（哪些包可以依赖哪些包）是一个*不同的*关注点，因此在配置中以注释桩的形式保留，由此仓库自行补充。

## 步骤

### 1. 检测环境

- **包管理器**：`pnpm-lock.yaml` → pnpm，`yarn.lock` → yarn，`bun.lockb` → bun，否则使用 npm。以下每条命令都使用检测到的包管理器（`pnpm`/`yarn`/`npm run`/`bunx`）。
- **包根目录**：如果 `src/` 存在，则使用 `src/packages`，否则使用 `packages`。如果仓库中已经明显采用了其他约定，请向用户确认选择。
- **现有配置**：检查是否存在 `.dependency-cruiser.*` 文件。如果存在，**不要**覆盖它：将这四条规则和相关选项合并进去，并告知用户添加了哪些内容。

**完成标准：** 已确定包管理器、包根目录以及现有配置状态。

### 2. 安装 dependency-cruiser

使用检测到的包管理器将 `dependency-cruiser` 安装为 devDependency。

**完成条件：** `dependency-cruiser` 位于 `devDependencies` 中。

### 3. 编写配置

将 [`dependency-cruiser.config.cjs`](./dependency-cruiser.config.cjs) 复制到仓库根目录，并命名为 `.dependency-cruiser.cjs`。将 `PACKAGES_ROOT` 设置为步骤 1 中检测到的根目录。这些规则基于路径深度且与扩展名无关，因此不需要进行其他调整。

**完成条件：** `.dependency-cruiser.cjs` 已存在，其中包含正确的 `PACKAGES_ROOT`，并且四条禁止规则均已配置。

### 4. 将其接入检查流程

- 添加一个 `lint:boundaries` 脚本：`depcruise <packages-root>`（或 `depcruise src`）。
- 将其整合到仓库的总检查命令中，即已经运行类型检查的命令（例如 `check` / `ci` / `validate` 脚本）。**不要**修改 `tsconfig` 或添加路径别名。
- 如果没有总检查脚本，则添加 `lint:boundaries`，并告知用户将其纳入 CI。

**完成条件：** `lint:boundaries` 已存在，并且与类型检查作为同一命令的一部分运行。

### 5. 搭建示例包的脚手架

创建并提交 `<packages-root>/example/`，作为可复制的模板：

- `index.ts` 是入口点。导出一个委托给内部文件的函数（这样该包显然是*深层*模块，而不是简单的透传层）。
- `lib/impl.ts`：位于**子文件夹**中的内部文件，由 `index.ts` 导入，且无法从外部访问。
- `tests/example.test.ts` **仅**导入 `../index`（一个入口点），并对公共函数进行断言。

告知用户这是一个可以复制或删除的起始模板。

**完成条件：** 示例包已存在，通过根入口点公开其行为，并将 `impl` 隐藏在子文件夹中。

### 6. 验证规则确实生效

这是整个 Skill 的完成标准：无法在出现违规时触发失败的配置毫无价值。

1. 运行 `lint:boundaries`。它必须在干净的示例上**通过**。
2. 临时向 `tests/example.test.ts` 添加一个深层导入（例如 `import { thing } from "../lib/impl"`）。再次运行 `lint:boundaries`；它必须因 `tests-through-entrypoints` 而**失败**。
3. 还原该深层导入。再运行一次，它必须**通过**。

**完成条件：** 你已观察到先通过、在添加深层导入后失败、还原后再次通过。如果步骤 2 没有失败，则说明规则未正确接入，因此必须在完成前修复。

### 7. 记录约定

在 packages 文件夹中编写一个 `README.md`（`<packages-root>/README.md`，与其所管理的 packages 相邻），涵盖：`src/packages/<name>/` 布局（入口点位于根目录，`lib/` 用于实现，`tests/` 用于测试）、“仅通过包的入口点（其根目录文件）进行导入”，以及如何运行 `lint:boundaries`。明确**不鼓励使用桶文件**：应公开多个小型入口点，而不是通过一个 index 重新导出整个子树。内容应精简为一个可复制的代码片段，以及四条规则（每条各用一个段落说明）。

然后，从仓库的智能体指令文件中添加一个指向该文档的**上下文指针**（如果存在 `CLAUDE.md` 则使用它，否则使用 `AGENTS.md`；如果两者都不存在，则创建 `AGENTS.md`）。一行即可，例如：`Packages are deep modules: see [src/packages/README.md](./src/packages/README.md) before adding or importing one.` 这样可以让智能体发现边界规则，而不是在违反规则后才意识到它。

**完成标准：** `<packages-root>/README.md` 已存在并明确不鼓励使用桶文件，且仓库的 `CLAUDE.md`/`AGENTS.md` 包含指向该文件的链接。

## 注意事项

- 配置中的 `$1` 反向引用（dependency-cruiser 的分组匹配）使一个包能够访问其自身内部内容，同时阻止外部访问。不要将它们展开为针对各个包的独立规则。
- 公有与私有由**深度**决定：包根目录中的文件是入口点；子文件夹中的所有内容都是私有的。约定的子文件夹是 `lib/`（实现）和 `tests/`，但规则并未对它们进行硬编码：任何子文件夹都是私有的，因此新增文件夹无需更改配置。添加入口点只需添加一个根目录文件（无需桶文件）。
- 包采用**扁平**结构：根目录下仅允许一层直接子目录。包的内部目录可以任意深度嵌套；一个包内不得包含另一个包。
- 使用 `.cjs`（而不是 `.js`），以确保即使在 `"type": "module"` 仓库中，配置的 `module.exports` 也能正常工作。