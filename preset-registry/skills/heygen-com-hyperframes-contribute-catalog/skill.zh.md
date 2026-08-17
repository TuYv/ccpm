---
name: contribute-catalog
description: Author a new HyperFrames registry block (caption style, VFX block, transition, lower third) or component (text effect, overlay, snippet) and ship it as an upstream PR to the hyperframes repo. Use ONLY when the user wants to CONTRIBUTE to the public catalog — for in-project caption/transition authoring use the `hyperframes` skill, for installing existing registry items use the `hyperframes-registry` skill.
---
# 为 HyperFrames Registry 做贡献

引导用户从创意构想到为新的 registry 区块或组件合并 PR。

## 工作流程

```
1. Clarify → 2. Scaffold → 3. Build → 4. Validate → 5. Preview → 6. Ship
```

### 第 1 步：明确需求

询问他们正在构建什么。registry 有两种条目类型：

- **区块**（`registry/blocks/`，类型为 `hyperframes:block`）——具有固定尺寸和时长的完整独立合成。字幕样式、VFX 特效、标题卡、下三分之一字幕。
- **组件**（`registry/components/`，类型为 `hyperframes:component`）——没有固定尺寸或时长的可复用代码片段。可适配任意合成尺寸的 CSS 效果、文本处理效果和叠加层。

然后询问：

- 用一句话描述该效果
- 视觉参考（URL、截图或描述）
- 谁会在什么情况下使用它？

### 第 2 步：搭建结构

创建 registry 结构：

**对于区块：**

```
registry/blocks/{block-name}/
  {block-name}.html
  registry-item.json
```

**对于组件：**

```
registry/components/{component-name}/
  {component-name}.html
  registry-item.json
```

**命名约定：**

| 条目名称             | ID 前缀 | ID 示例                |
| ---------------- | --------- | ---------------------- |
| `cap-hormozi`    | `hz`      | `hz-cg-0`, `hz-cw-3`   |
| `cap-typewriter` | `tw`      | `tw-cg-0`, `tw-ch-0-5` |
| `vfx-chrome`     | `vc`      | `vc-canvas`            |

使用 2-3 个字母的前缀。所有元素 ID 都必须使用此前缀，以避免在子合成中发生冲突。

**区块的 registry-item.json：**

```json
{
  "$schema": "https://hyperframes.heygen.com/schema/registry-item.json",
  "name": "{block-name}",
  "type": "hyperframes:block",
  "title": "{Human Title}",
  "description": "{one sentence}",
  "dimensions": { "width": 1920, "height": 1080 }, // adjust: 1080x1920 for portrait/social
  "duration": 10, // adjust for your composition
  "tags": ["{category}", "{subcategory}"],
  "files": [
    {
      "path": "{block-name}.html",
      "target": "compositions/{block-name}.html",
      "type": "hyperframes:composition"
    }
  ]
}
```

**组件的 registry-item.json**（没有 `dimensions` 或 `duration`）：

```json
{
  "$schema": "https://hyperframes.heygen.com/schema/registry-item.json",
  "name": "{component-name}",
  "type": "hyperframes:component",
  "title": "{Human Title}",
  "description": "{one sentence}",
  "tags": ["{category}"],
  "files": [
    {
      "path": "{component-name}.html",
      "target": "compositions/components/{component-name}.html",
      "type": "hyperframes:snippet"
    }
  ]
}
```

### 第 3 步：构建

根据类型应用正确的模板。有关可复制粘贴的起始模板，请参阅 [templates.md](templates.md)。

#### 字幕区块

**不可妥协的字幕规则：**

- 字体：比例字体**最小为 96px**。**等宽字体可使用 64-72px**（字符较宽，因此所需字号较小）。
- 可读性：`-webkit-text-stroke: 2-3px` 或多层 `text-shadow`
- 溢出：对每个组调用 `window.__hyperframes.fitTextFontSize()`
- 卡拉 OK 效果：通过 `tl.to(wordEl, { color/scale }, WORDS[wi].start)` 高亮当前单词
- 强制隐藏：对每个组都使用 `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, g.end)`
- **切勿在与 `tl.set(el, { opacity: 1 })` 相同的位置使用 `tl.from(el, { opacity: 0 })`**——`from` 会覆盖 `set`。请改用 `tl.to`。

**逐字符动画**（打字机、字符扰乱）：

- 将每个字符包装在 `<span>` 中，并使用 ID `{prefix}-ch-{group}-{char}`
- 根据单词时间戳计算出的时间间隔，通过 `tl.set` 实现错开效果
- 光标/装饰元素：按时间间隔使用 `tl.set`——不要使用 CSS 动画（无法跳转定位）

**定位变体：**

- 居中：`display: flex; align-items: center; justify-content: center;`
- 下三分之一：`position: absolute; bottom: 100px; left: 0; width: 100%; text-align: center;`
- 左对齐：`position: absolute; bottom: 100px; left: 120px; text-align: left;`

#### VFX 块（Three.js）

- 使用 CDN 上的 `three@0.147.0`（全局脚本）
- `tl.eventCallback("onUpdate", renderScene); renderScene();`——不要使用 requestAnimationFrame
- 状态代理模式：GSAP 为普通 JS 对象设置动画，渲染函数读取该对象
- 使用带种子的 PRNG（`mulberry32`）实现随机性

#### 所有类型

- `data-composition-id` 必须与 `window.__timelines["id"]` 匹配
- 所有元素 ID 都必须以块缩写作为前缀
- `gsap.timeline({ paused: true })`——始终保持暂停
- 不得使用 `Math.random()`，不得使用 `Date.now()`

### 第 4 步：验证

```bash
hyperframes lint                    # 0 errors required
hyperframes validate --no-contrast  # 0 console errors required
```

### 第 5 步：预览

```bash
# Render preview video
hyperframes render -o preview.mp4

# Snapshot for visual QA
hyperframes snapshot --at "1.0,3.0,5.0,7.0"

# Publish to hyperframes.dev for review
npx hyperframes publish
```

**目录预览图**——目录卡片使用位于 `docs/images/catalog/{kind}/{name}.png` 的 PNG（其中 `{kind}` 为 `blocks` 或 `components`）。从快照生成该图片，然后：

- **HeyGen 内部贡献者：**运行 `scripts/upload-docs-images.sh`（需要 AWS 配置文件 `engineering-767398024897`）
- **外部贡献者：**将预览 MP4 附加到 PR 描述中。维护者会在合并前生成并上传目录图片。

### 第 6 步：发布

**所有步骤均为必需。缺少任意一步都会导致目录条目损坏。**

`{kind}` 为 `blocks` 或 `components`，具体取决于你在第 1 步中构建的内容。

```bash
# 1. Create branch
git checkout -b feat/registry-{name}

# 2. Format HTML
npx oxfmt registry/{kind}/{name}/*.html

# 3. Update registry/registry.json — add entry to the "items" array:
#    { "name": "{name}", "type": "hyperframes:block" }  (or "hyperframes:component")

# 4. Generate catalog docs page
npx tsx scripts/generate-catalog-pages.ts

# 5. Publish to hyperframes.dev so reviewers can preview
npx hyperframes publish

# 6. Stage everything
git add registry/{kind}/{name}/ registry/registry.json docs/catalog/

# 7. Commit
git commit -m "feat(registry): add {name} — {one sentence}"

# 8. Push and open PR with hyperframes.dev link
git push origin feat/registry-{name}
gh pr create --title "feat(registry): {name}" --body "preview: {hyperframes.dev-url}"
```

**如果你没有 GitHub 账户：**你需要一个账户才能创建 PR。请前往 https://github.com/signup 注册，然后运行 `gh auth login`。

## 质量门槛

- [ ] `hyperframes lint` → 0 个错误
- [ ] `hyperframes validate` → 0 个控制台错误
- [ ] `npx oxfmt --check` 通过
- [ ] `registry/registry.json` 已更新并添加新条目
- [ ] 已运行 `scripts/generate-catalog-pages.ts`（文档页面已生成）
- [ ] 已运行 `npx hyperframes publish`（认领你的项目 URL）
- [ ] 预览 MP4 已附加至 PR（外部），或目录 PNG 已上传（内部）
- [ ] 所有 ID 均唯一且带有前缀