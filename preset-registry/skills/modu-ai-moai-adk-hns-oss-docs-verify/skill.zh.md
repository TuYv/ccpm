---
name: hns-oss-docs-verify
description: >
  Mandatory verify recipe for the oss-docs harness — the runnable exit gate
  every specialist executes before returning: warning-free hugo build,
  sitemap existence, URL-blacklist grep, Mermaid LR/RL direction grep,
  4-locale file-existence and section-count parity, README 4-file heading
  parity, and body-emoji scan. All checks are inlined here because
  docs-i18n-check.sh and gen_menu.py do not exist.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "harness"
  status: "active"
  updated: "2026-07-13"
  tags: "oss-docs,verify,quality-gate,hugo,parity,blacklist"
---
# oss-docs 验证方案（退出门禁）

针对 sprint-contract 各维度的可运行检查。**脚本
`docs-i18n-check.sh` 和 `gen_menu.py` 并不存在——绝不要通过 shell 调用
它们；所有检查均已内联在下方。** 所有检查均为只读；此 Skill
绝不会提交或推送。

## 1. 构建无异常（`build-clean`，必须通过，阈值 1.0）

```bash
cd docs-site && hugo --minify --gc
```

- 必须以 0 退出，且全程**无警告**（任何包含 `WARN`/`ERROR` 的行均视为失败）。

```bash
test -f docs-site/public/sitemap.xml && echo "sitemap OK" || echo "sitemap MISSING"
```

## 2. URL 黑名单（`content-fidelity`）

```bash
grep -rn 'docs\.moai-ai\.dev\|adk\.moai\.com\|adk\.moai\.kr' docs-site/content README*.md
```

- 预期：**无匹配项**。只有 `adk.mo.ai.kr` 有效。注意：模式
  `adk\.moai\.kr` 不会匹配 `adk.mo.ai.kr`（点号位置不同）——
  不会对有效域名产生误报。

## 3. Mermaid 方向（`style-compliance`）

```bash
grep -rn 'flowchart LR\|graph LR\|flowchart RL\|graph RL' docs-site/content
```

- 预期：**无匹配项**（仅允许 TD 的规则；`flowchart TD` / `graph TB` 可通过）。

## 4. 4 个语言区域版本一致性（`locale-parity`，必须通过，阈值 1.0）

文件存在性一致——每个 ko 页面都必须有对应的 en/ja/zh 页面：

```bash
cd docs-site/content && for f in $(cd ko && find . -name '*.md'); do
  for loc in en ja zh; do
    [ -f "$loc/$f" ] || echo "MISSING: $loc/$f"
  done
done
```

以**每个页面**为单位检查章节数量一致性，并对照已检入的基线逐步收紧。

比较目录树总数并不属于一致性检查：不同页面上方向相反的差异会相互抵消，因此某个页面中 ko 比 en 多出的部分，会与另一个页面中 en 比 ko 多出的部分抵消，使总数看起来没有问题。应将每个页面分别与其另外三个对应版本比较。

该门禁是一种**棘轮机制**，而非绝对检查。`docs-site/.locale-parity-baseline`
列出了已经存在差异的页面；任何存在差异但未列入该清单的页面都会导致门禁失败。绝对检查会从首次运行起就在所有已纳入基线的页面上失败，而第一天就失败的门禁最终会被关闭——这比它所取代的薄弱检查更糟。棘轮机制意味着技术债务是明确且可审计的，并且只能逐步减少。

```bash
cd docs-site/content

# Current divergence set: pages whose ko/en/ja/zh H2-and-deeper counts disagree.
# One grep pass over the whole tree — a per-file loop over 143x4 files does not
# finish inside a 2-minute budget.
grep -rc '^#\{2,\} ' ko en ja zh --include='*.md' \
| awk -F: '
    { i=index($1,"/"); loc=substr($1,1,i-1); page=substr($1,i+1)
      n[page,loc]=$2; pages[page]=1 }
    END { for (p in pages)
            if (n[p,"en"]!=n[p,"ko"] || n[p,"ja"]!=n[p,"ko"] || n[p,"zh"]!=n[p,"ko"])
              print p }' \
| sort > /tmp/parity-now.txt

grep -v '^#' ../.locale-parity-baseline | grep -v '^[[:space:]]*$' | sort > /tmp/parity-base.txt

comm -23 /tmp/parity-now.txt /tmp/parity-base.txt   # NEW divergence  -> FAIL
comm -13 /tmp/parity-now.txt /tmp/parity-base.txt   # converged pages -> prune baseline
```

**失败条件（明确）：**第一个 `comm` 输出一个或多个页面路径。此处出现任何输出均为失败——这表示此前已对齐的页面失去了对齐状态，或新添加的页面在未对齐的情况下被提交。请修复该页面，或者（仅在经过审慎决定后）将其添加到基线中；添加一行就意味着承认新增了技术债务。

第二个 `comm` 仅供参考：这些页面已经完成对齐，应从基线中移除，以收紧棘轮机制。不移除不算失败。

缺少对应文件的情况也会在此处显现（其计数为空，因此会产生差异），这与上面的文件存在性检查有所重叠——这种冗余是有意为之。

README 4 文件标题计数对齐：

```bash
grep -c '^## ' README.md README.ko.md README.ja.md README.zh.md
```

- 预期：4 个文件的计数完全相同（H2 顺序也完全相同——
  可使用 `grep '^## ' <file>` 抽查）。

## 5. 正文表情符号扫描（`style-compliance`）

```bash
grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]' docs-site/content --include='*.md' | grep -v '{{<' | head -40
```

- 检查每个匹配项：正文中的表情符号 = 失败（请使用 `{{</* icon */>}}`）；
  保留的排版符号（`→ ← ↓ ✓ ✗`、交接块中的 U+2702）以及
  编排器横幅示例代码块中的品牌表情符号可以保留——
  在标记问题前，请先判断其是否位于代码块上下文中。

## 6. 版本字符串同步（`version-sync`）

版本显示必须与发布版本号一致。从 SSOT 中提取预期版本，
并筛查过期的版本显示：

```bash
grep -E 'version = ' docs-site/hugo.toml    # expected version, e.g. v3.1.1
grep -rn 'Release-v[0-9]' README.md README.ko.md README.ja.md README.zh.md
grep -rn '🗿 v[0-9]' docs-site/content README*.md | grep -v "$(grep -oE 'version = "v[0-9.]+"' docs-site/hugo.toml | grep -oE 'v[0-9.]+')"
```

- 预期：每个 `Release-v…` 徽章和每个 `🗿 v…` 示例都与
  `hugo.toml` 中的版本一致。任何过期的版本显示（徽章、状态行示例、
  更新提示示例 `X ⬆️ Y`、版本列示例）均为 **失败**。
- 历史说明（“在 vX.Y.Z 中引入”“自 v3.0.0 起”
  “在 v3.0.0 中弃用”）不是版本显示——不要将其标记为问题。
- `releaseDate` 必须与 `version` 同时更新（这是 hugo.toml 自身的
  两行约定）。

## 评分映射（冲刺契约）

| 维度 | 检查项 | 阈值 |
|-----------|--------|-----------|
| `locale-parity` | §4（文件存在性检查无问题 + 新增章节计数差异为零 + README 对齐 = 1.0） | 1.0（必须通过） |
| `build-clean` | §1（构建无警告 + 站点地图 = 1.0） | 1.0（必须通过） |
| `style-compliance` | §3 + §5（通过检查项的比例） | 0.95 |
| `content-fidelity` | §2 + 与规范版本相比事实/数字均得到保留 | 0.9 |
| `version-sync` | §6（版本显示 == 发布版本号） | 1.0（必须通过） |

任何必须通过的维度低于阈值都会阻止测试工具运行成功
（`must_pass_ok: false`）——请先修复并重新验证，再交回给
编排器。