---
name: promissory
description: Assault non-green product promises per the PROMISSORY runbook. Use when the user says /promissory, asks to flip/advance/assault product promises, wants the next non-green promise target selected and worked, or wants a fleet wave dispatched at the promise backlog. Modes - no args = supervisor (rank pool, dispatch or work top targets); a promiseId arg = assault that specific promise (owner-directed override); a number N = dispatch a wave of N fleet workers.
---
# PROMISSORY — 非绿色承诺攻坚

规范且始终保持最新的流程位于
`docs/fable/2026-07-01-promissory-nongreen-assault-runbook.md`（仓库根目录）。
**每次调用时都必须首先完整阅读该文档**——此技能只是启动器，
而非规则本身。如果技能与运行手册存在冲突，以运行手册为准。

## 参数解析

- **无参数** → 监督者模式：对目标池进行排序，然后派遣一波
  舰队（如果舰队容量已就绪），或亲自攻坚排名最高的
  目标。
- **一个 promiseId**（例如 `khala_code.forum_hotbar.v1`）→ 针对该承诺的
  单目标模式。这是所有者的明确指示：它会覆盖
  运行手册中“已被其他工作映射”的排除规则（在认领议题中
  注明此覆盖）。
- **一个数字 N**（例如 `10`）→ 监督者模式，派遣一波 N 个
  舰队工作器，处理排名前 N 的未认领目标。
- 其他任何内容（例如 `throughline: mobile` 这样的活动提示）→
  视为仅对本次运行的评分有效的临时主线覆盖。

## 记分板（强制要求，开始和结束时均须输出）

在**任何工作开始之前**打印注册表记分板，并在
**运行结束后再次打印**，以便用户看到状态变化。根据
规范源计算（从 openagents 仓库根目录运行一次性脚本）：

```sh
bun -e "
const { publicProductPromisesDocument } = await import('./apps/openagents.com/workers/api/src/product-promises.ts');
const d = publicProductPromisesDocument();
const c = {};
for (const p of d.promises) c[p.state] = (c[p.state] ?? 0) + 1;
console.log('registry', d.version, '| total', d.promises.length, '|', JSON.stringify(c));
"
```

- **开始记分板：** 注册表版本、记录总数、每种状态
  （green / yellow / red / planned / degraded / withdrawn）的数量，以及
  所选目标及其当前状态。
- **结束记分板：** 从已合并的 `main` 重新计算相同的数量，
  以“之前 → 之后”的差异形式呈现——明确列出本次运行期间
  状态或阻塞项集合发生变化的每条记录（例如
  “`foo.v1` planned → yellow。`bar.v1` 清除了 3 个阻塞项中的 2 个，但仍为
  red”），以及 `NEEDS_OWNER.md` 中新的“所有者决策就绪”数量。
- 在舰队/波次模式下，监督者在波次开始时打印一次开始记分板，
  并在最后一次收尾合并后打印结束记分板。长时间运行的波次还应在
  每个 PR 落地时输出中间记分板。

## 操作摘要（详细信息和确切规则见运行手册）

1. **快照 + 排序。** 通过
   `apps/openagents.com/workers/api/src/product-promises.ts` 中的
   `publicProductPromisesDocument()` 加载注册表（上面的
   记分板脚本已经执行了此操作——复用其输出）。应用
   资格筛选器（运行手册 §2——包括*避开已被开放议题/史诗任务/路线图通道
   映射的承诺*：PROMISSORY 搜寻的是隐藏和被忽视的目标，
   除非用户指定了特定目标）和评分公式（§3，按主线加权。当前活动：
   Khala Code 发布）。
2. **原子化认领。** 每次认领一个 promiseId。GitHub 议题标题为
   `PROMISSORY: <promiseId>`——先搜索开放的和最近关闭的议题。
   出现竞争时，议题编号较小者胜出（§4）。
3. **攻坚阶梯**（§5）：审计记录 → 将每个 blockerRef 分解为
   BUILD / EVIDENCE / OWNER / EXTERNAL → 在从干净的 `origin/main`
   创建的新工作树中完整实现，并提供测试和可解引用的证据 → 按照
   并发安全编辑协议（§7），在同一个 PR 中更新注册表记录 + 一条注释 +
   版本递增 → 验证（记录自身的验证、相关测试套件、`check:deploy`、
   承诺测试固定项）→ 合并到 `main`、关闭议题、将受所有者决策限制的
   遗留项写入工作区 `NEEDS_OWNER.md`、释放认领、获取下一个目标。
4. **舰队派遣**（监督者/波次模式）：使用运行手册 §8 中固定的
   `$PYLON khala request --workflow codex_agent_task` 模板（或等效的
   `khala_fleet` MCP），每个目标分配一个工作器；每次收尾时，都用
   下一个排名最高的未认领目标补充空闲槽位；按照
   `docs/fable/EXECUTION.md` 维护派遣账本并执行精确的令牌行验证。

## 硬性护栏（即使时间紧迫也绝不能违反）

- **绝不将承诺状态改为绿色**——绿色状态必须由所有者签署确认，
  并以回执为先。成功指标是*已准备好供所有者决策*：承诺距离绿色状态
  只差所有者的一项操作，并集中记录在 `NEEDS_OWNER.md` 中。
- 仅当记录自身的 `verification` 标准已满足且附有引用证据时，才可将 planned→yellow / red→yellow。鼓励如实降级。
- 绝不通过削弱门禁/测试/策略来清除阻塞项。绝不编辑绿色数量测试的固定值来掩盖失败。绝不扩大公开文案的范围。
- 每个声明/PR 仅对应一个承诺。注册表编辑仅可涉及你的记录 + 一条注释 + 版本常量。
- 始终使用隔离的工作进程主目录。绝不触碰 `~/.codex` 或正在使用的
  `~/.claude`。仅使用可安全公开的提示词和证据。