---
name: setup-ts-deep-modules
description: Wire dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only through its entry-point files. User-invoked.
disable-model-invocation: true
---
# 配置 TS Deep Modules

让本仓库中的每个包都成为一个 **deep module**：用小接口承载大量行为。一个包的公开面是它的**入口点**——位于包根目录的文件；子文件夹中的所有内容都是隐藏的。本技能会安装 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 和一组规则，使入口点成为唯一可进入口，并验证这些规则是否生效。

词汇（deep module、interface、seam、depth）请使用 `/codebase-design` skill 的术语并贯穿全文。

## 该规范施加的形态

```
src/packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

公开表面是包的**根文件**——而不是某个指定的 `index.ts`。按惯例，实现在 `lib/` 中，测试在 `tests/`，这样每个包都拥有同样的双文件夹结构。该规则本身是通用的：*任何*子文件夹里的内容都是私有的，因此你永远不需要扩展配置以添加新文件夹。

四条规则，均为 `error`：

1. **入口点边界** — 包外部的代码（应用代码或其他包）只能导入该包的入口点（它的根文件），不能导入其任何子文件夹内容。
2. **包内自由** — 一个包的自身文件可以自由互相导入。
3. **通过入口点进行测试** — `<pkg>/tests/` 下的文件可以导入任何包的入口点及其自身的 `tests/` 夹具，但不能导入任何包的子文件夹内部实现（即使是自身的）。跨包集成测试可以，但深层导入不行。
4. **无循环依赖** — 不允许依赖循环。

**入口点，而不是 barrel。** 因为公开表面是*每一个*根文件，包可以暴露多个小入口点（`index.ts`、`client.ts`、`server.ts`），而不是把一切都通过一个巨大的 `index.ts` 汇总。将子树全部重新导出的 barrel 文件不推荐使用——保持入口点小而精，并将实现隐藏在子文件夹里。

层级关系（哪些包可依赖哪些包）是**另一个**问题，已在本仓库配置中留有注释占位，等待补充。

## Steps

### 1. 检测环境

- **包管理器** — `pnpm-lock.yaml` → pnpm，`yarn.lock` → yarn，`bun.lockb` → bun，否则使用 npm。以下所有命令都按此使用（`pnpm`/`yarn`/`npm run`/`bunx`）。
- **包根目录** — 如果存在 `src/`，则使用 `src/packages`，否则使用 `packages`。如果仓库已有其他明显约定，需先与用户确认选择。
- **现有配置** — 检查是否存在 `.dependency-cruiser.*` 文件。若存在，请勿覆盖：需将四条规则和选项合并进去，并告诉用户新增了哪些内容。

**完成标准：** 包管理器、包根目录和现有配置状态已确定。

### 2. 安装 dependency-cruiser

使用检测到的包管理器，将 `dependency-cruiser` 安装为 `devDependency`。

**完成标准：** `dependency-cruiser` 已在 `devDependencies` 中。

### 3. 编写配置

将 [`dependency-cruiser.config.cjs`](./dependency-cruiser.config.cjs) 复制到仓库根目录，命名为 `.dependency-cruiser.cjs`。将 `PACKAGES_ROOT` 设置为第 1 步检测到的根目录。规则基于路径深度且与扩展名无关，因此无需适配其他内容。

**完成标准：** `.dependency-cruiser.cjs` 存在且 `PACKAGES_ROOT` 正确，四条禁止规则已生效。

### 4. 挂接到检查项

- 添加 `lint:boundaries` 脚本：`depcruise <packages-root>`（或 `depcruise src`）。
- 将其并入仓库的 umbrella 检查命令——即已执行类型检查的命令（例如 `check` / `ci` / `validate`）。不要触碰 `tsconfig` 或添加路径别名。
- 如果不存在 umbrella 命令，则新增 `lint:boundaries` 并告知用户将其加入 CI。

**完成标准：** `lint:boundaries` 已存在，并与 typecheck 在同一条命令中执行。

### 5. 搭建示例包

创建一个已提交的 `<packages-root>/example/` 作为可复制模板：

- `index.ts` — 一个入口点。导出一个委托到内部文件的函数（使该包明显是 *deep*，而不是单纯透传）。
- `lib/impl.ts` — 一个在**子文件夹**中的内部文件，由 `index.ts` 导入，不能从外部直接访问。
- `tests/example.test.ts` — 仅从 `../index`（一个入口点）导入，并对公开函数进行断言。

向用户说明这是可复制或可删除的起始模板。

**完成标准：** 示例包存在，通过根入口点暴露行为，并将 `impl` 隐藏在子文件夹中。

### 6. 证明规则生效

这是整个技能的完成判定条件——如果配置在违规时不报错，则毫无价值。

1. 运行 `lint:boundaries`。在干净示例上必须**通过**。
2. 临时在 `tests/example.test.ts` 中添加一个深度导入（例如 `import { thing } from "../lib/impl"`）。再次运行 `lint:boundaries`，必须因 `tests-through-entrypoints` **失败**。
3. 撤销深度导入。再运行一次，必须**通过**。

**完成标准：** 先看到通过、再看到一次深度导入失败、然后再次通过。若第 2 步未失败，说明规则未接入正确——在结束前先修复。

### 7. 记录规范

在包目录下（`<packages-root>/README.md`）编写 `README.md`，用于说明：`src/packages/<name>/` 的结构（根目录的入口点、`lib/` 存放实现、`tests/` 存放测试）、“仅通过包入口点（其根文件）导入”以及如何运行 `lint:boundaries`。**明确反对 barrel 文件**——应暴露多个小入口点，而不是通过一个 index 重新导出整棵子树。每条内容保持一段文字，覆盖副本模板与四条规则。

随后在仓库的 agent 指引文件中添加**上下文指针**：若存在 `CLAUDE.md` 则加到其中，否则加到 `AGENTS.md`（若两者都不存在则创建 `AGENTS.md`）。一行即可，例如：`Packages are deep modules — see [src/packages/README.md](./src/packages/README.md) before adding or importing one.` 这会让 agent 在使用时先发现边界规则，避免踩坑。

**完成标准：** `<packages-root>/README.md` 存在且明确反对 barrel，且仓库的 `CLAUDE.md`/`AGENTS.md` 链接到了该文档。

## Notes

- 配置中的 `$1` 回溯引用（dependency-cruiser 的分组匹配）使包能访问自身内部实现，而外部无法访问——不要把它们拆成独立的逐包规则。
- 公共与私有由**深度**决定：包的根文件是入口点；子文件夹中的内容是私有。约定的子文件夹是 `lib/`（实现）和 `tests/`，但规则并未硬编码这些名称——任意子文件夹都属于私有，因此新增文件夹无需改配置。添加入口点只需新增一个根文件——不需要 barrel。
- 包是**扁平化**的：根目录下只有一层直接子级。包内实现可以任意深度嵌套；一个包不能包含另一个包。
- 使用 `.cjs`（而非 `.js`），以保证即使在 `"type": "module"` 仓库中 `module.exports` 也能正常工作。
