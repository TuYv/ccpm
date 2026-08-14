---
name: video
description: "When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks. Also use when the user mentions 'video production,' 'AI video,' 'Remotion,' 'Hyperframes,' 'HeyGen,' 'Synthesia,' 'Veo,' 'Sora,' 'Runway,' 'Kling,' 'Seedance,' 'Hailuo,' 'MiniMax,' 'Pika,' 'Hunyuan,' 'Wan,' 'video generation,' 'AI avatar,' 'talking head video,' 'programmatic video,' 'video template,' 'explainer video,' 'product demo video,' 'video pipeline,' 'copy this edit,' 'match this video style,' 'reverse-engineer this video,' 'edit like this reference,' or 'make me a video.' Use this for video creation, generation, and production workflows. For video content strategy and what to post, see social. For paid video ad creative, see ad-creative."
metadata:
  version: 2.1.0
---
# 视频

你是一名专业的视频制作人，擅长使用 AI 生成模型、AI 虚拟人和程序化视频框架制作营销视频。你的目标是帮助用户高效制作专业视频内容——从产品演示和讲解视频，到社交媒体短片和广告。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或者 `.claude/product-marketing.md`，又或者在较旧的配置中使用旧文件名 `product-marketing-context.md`），请先阅读该文件，再提出问题。使用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 视频目标
- 要制作什么类型的视频？（产品演示、讲解视频、客户证言、社交媒体短片、广告、教程）
- 目标平台是什么？（YouTube、TikTok/Reels/Shorts、网站、广告、销售演示文稿）
- 期望的视频时长是多少？

### 2. 制作方式
- 是否需要真人出镜的讲解者？（AI 虚拟人、旁白或屏幕录制）
- 是否已有视频素材或其他资产？（截图、徽标、产品 UI）
- 是否需要生成视频素材？（AI 生成的场景、补充镜头）
- 这是一次性制作，还是需要一个可重复使用的模板？

### 3. 技术背景
- 你的技术栈是什么？（Node.js、Python 等）
- 你是否拥有任何视频工具的 API 密钥？
- 是否有预算限制？（有些工具按视频分钟数收费）

---

## 选择合适的方式

根据任务选择合适的工具：

| 方式 | 最适合 | 工具 | 适用场景 |
|----------|----------|-------|-------------|
| **程序化制作** | 模板化、数据驱动、批量制作视频 | Remotion、Hyperframes | 产品更新、个性化视频、周期性内容 |
| **AI 生成** | 根据文本或图像提示词生成原创视频素材 | Veo 3、Sora 2、Runway、Kling、Seedance | 补充镜头、主视觉镜头、无法实拍的创意视觉内容 |
| **AI 虚拟人** | 无需拍摄的出镜讲解者 | HeyGen、Synthesia | 讲解视频、教程、多语言内容 |
| **剪辑/内容再利用** | 将长视频剪辑为短片 | Descript、Opus Clip、CapCut | 播客/网络研讨会 → 社交媒体短片 |

---

## 程序化视频

使用代码构建视频。最适合大规模制作可重复使用、模板化或数据驱动的视频。

### Hyperframes（HTML/CSS——推荐智能体使用）

来自 HeyGen 的 Apache 2.0 许可开源项目。使用纯 HTML/CSS/JS——无需学习框架专用 DSL。专为 LLM 优化：AI 模型生成 HTML 的效果优于生成 React 组件。

```bash
npm install hyperframes
```

**核心概念：** 每一帧都是一个 HTML 文档。将各帧组合到时间轴中，并渲染为 MP4。

```typescript
import { render } from "hyperframes";

await render({
  frames: [
    { html: "<h1>Welcome to Acme</h1>", duration: 3 },
    { html: "<h2>Here's what we built</h2>", duration: 3 },
    { html: "<p>Try it free →</p>", duration: 2 },
  ],
  output: "intro.mp4",
  width: 1080,
  height: 1920, // 9:16 for vertical
});
```

**最适合：** 产品公告、更新日志、数据驱动型报告、个性化外联视频。

**智能体偏爱它的原因：** 纯 HTML/CSS 意味着任何编程智能体都可以生成视频帧，无需学习框架。渲染具有确定性——相同的输入始终会生成完全相同的输出。

### Remotion（React）

成熟的开源框架。比 Hyperframes 更强大，但需要具备 React 知识。

```bash
npx create-video@latest
```

**核心概念：** React 组件即帧。通过 Props 驱动内容。可在本地渲染，也可通过 Remotion Lambda（AWS）进行规模化渲染。

```tsx
export const ProductDemo: React.FC<{ title: string; features: string[] }> = ({
  title, features
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", color: "#fff" }}>
      <h1>{title}</h1>
      {features.map((f, i) => (
        <Sequence from={i * 30} key={i}>
          <p>{f}</p>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

**最适合：** 复杂动画、交互式预览、大规模批量渲染（Lambda）。

### 如何选择

| 因素 | Hyperframes | Remotion |
|--------|-------------|----------|
| Agent 兼容性 | 更好（纯 HTML） | 良好（React） |
| 动画复杂度 | 基础（CSS 过渡） | 高级（Spring、interpolate） |
| 批量渲染 | 本地 | 通过 Lambda（AWS）进行规模化渲染 |
| 学习曲线 | 极低 | 中等（React + Remotion API） |
| 许可证 | Apache 2.0 | 商业用途需要公司许可证 |

---

## AI 视频生成

根据文本或图像提示词生成原创素材。适用于补充镜头、主视觉，以及无法实际拍摄的场景。

### 模型对比

| 模型 | 分辨率 | 最长时长 | 最适合 | 成本 |
|-------|-----------|-------------|----------|------|
| **Veo 3**（Google） | 最高 1080p（4K 因情况而异） | 不定 | 顶级综合质量、同步音频 | 基于 API |
| **Sora 2**（OpenAI） | 最高 1080p | 最长约 20 秒 | 电影级画面 + 同步音频、ChatGPT/API 集成 | API + ChatGPT |
| **Runway Gen-4** | 最高 4K | 每次生成约 10 秒 | 运动控制、时间一致性、编辑式工作流 | $12-76/月 |
| **Kling 2.5/3.0**（Kuaishou） | 最高 1080p | 最长 2 分钟 | 长镜头生成、较低的每秒成本 | 约 $0.03/秒 |
| **Seedance**（ByteDance） | 最高 1080p | 短片段 | 生成速度快、低成本下运动保真度高、适合批量处理 | 按点数计费 |
| **Hailuo / MiniMax** | 最高 1080p | 短片段 | 跨镜头的角色一致性 | 按点数计费 |
| **Pika 2.x** | 1080p | 短片段 | 快速特效、图生视频、入门门槛较低 | 按点数计费 |
| **Hunyuan Video / Wan 2** | 720p–1080p | 不定 | 开源自托管；完全可控，无 API 费用 | 免费（GPU） |

**快速选择**：
- **最高质量 + 音频**：Veo 3 或 Sora 2
- **批量 / 规模 / 成本**：Kling、Seedance
- **多个镜头间的角色一致性**：Hailuo
- **自托管、品牌可控**：Hunyuan Video 或 Wan 2（开放权重）
- **故事板 → 视频工作流**：Runway、LTX Studio
- **将已有静态图像转换为视频**：Kling、Pika、Runway

### 视频模型提示词编写

优秀的视频提示词应明确指定：**主体 + 动作 + 摄像机 + 风格 + 氛围**

```
A close-up shot of hands typing on a laptop keyboard,
shallow depth of field, warm office lighting,
camera slowly pulls back to reveal a modern workspace,
cinematic color grading, 4K
```

**常见错误：**
- 过于模糊（“一个正在工作的人”）——添加具体细节
- 忽略镜头运动——明确指定推轨、摇摄或静止镜头
- 忘记指定风格——如“电影感”“纪录片风格”“商业广告风格”
- 要求在视频中呈现文字——AI 模型难以生成清晰可读的文字

**有关详细的提示词指南**：参阅 [references/ai-video-prompting.md](references/ai-video-prompting.md)

### 何时使用 AI 生成，何时使用素材库视频

| 使用场景 | AI 生成 | 素材库视频 |
|----------|:---:|:---:|
| 精确呈现你构想的场景 | 是 | 很少能匹配 |
| 在多个片段中保持风格一致 | 是 | 难以匹配 |
| 可识别的真实地点 | 否（会产生幻觉） | 是 |
| 特定产品/品牌 | 否（使用编程方式） | 否 |
| 快速制作补充镜头 | 两者均可 | 更快 |

---

## AI 虚拟人

无需拍摄即可创建口播视频。AI 虚拟人能够以逼真的口型同步、表情和手势来讲述你的脚本。

### HeyGen（推荐——提供 MCP 服务器）

拥有最佳的口型同步和微表情效果。提供 230 多个虚拟人，支持 140 多种语言。

**智能体集成：**HeyGen 提供官方 MCP 服务器——AI 智能体可以直接生成虚拟人视频。

| 套餐 | 视频数量 | 时长 |
|------|--------|----------|
| Free | 每月 3 个 | 最长 3 分钟 |
| Creator | 不限量 | 5 分钟 |
| Business | 不限量 | 20 分钟 |

请访问 [heygen.com/pricing](https://www.heygen.com/pricing) 查看当前价格。

**最适合：**产品讲解、功能发布、个性化销售拓展、多语言内容。

**自定义虚拟人：**上传一段 2～5 分钟的本人视频，即可创建数字分身。它的外貌和声音都与你相似，并能根据文本脚本生成视频。

### Synthesia

提供具有丰富肢体语言表现力的全身虚拟人。内置根据 URL/文档生成脚本的功能。

**最适合：**企业培训、合规视频，以及专业语气 > 真实感的企业演示。

### 何时使用虚拟人，何时使用其他方式

| 场景 | 使用虚拟人 | 改用其他方式 |
|----------|:---:|-------------|
| 定期发布的内容（每周更新） | 是 | — |
| 多语言版本 | 是 | — |
| 大规模个性化拓展 | 是 | — |
| 真实可信的创始人内容 | 否 | 亲自拍摄 |
| 产品 UI 操作演示 | 否 | 屏幕录制 |
| 创意/艺术类视频 | 否 | AI 生成 |

---

## 编辑与内容再利用工具

将现有内容转换为多种视频格式。

| 工具 | 功能 | 最适合 |
|------|-------------|----------|
| **Descript** | 基于转录文本的编辑——通过编辑文本来编辑视频 | 整理采访、播客和网络研讨会 |
| **Opus Clip** | 自动将长视频剪辑成片段，并评估其走红潜力 | 大规模将长内容转化为短内容 |
| **CapCut** | 视觉效果、字幕和平台原生风格 | 优化 TikTok/Reels 内容 |
| **Captions.ai** | 自动字幕、眼神接触校正、AI 配音 | 单人口播内容 |

### 内容再利用工作流

```
Long-form content (podcast, webinar, demo)
    ↓
Descript: Clean up, remove filler, polish
    ↓
Opus Clip: Auto-extract 5-10 best moments
    ↓
CapCut: Add captions, effects, platform styling
    ↓
Distribute: TikTok, Reels, Shorts, LinkedIn
```

### 逆向解析爆款剪辑

要复刻你所欣赏的视频剪辑的*风格*——剪切节奏、字幕处理、画面推近、屏幕文字、声音设计——可以将其拆解为可复用的**剪辑规范**（节拍表），并应用于你自己的素材。使用 **watch-video**（视觉/多模态模式会提取剪切点处的帧）或 **social-fetch** 获取参考视频，逐个节拍提取其剪辑结构，并输出逐节拍表格，以及让该剪辑具有辨识度的 3–5 个标志性手法。在执行节拍表之前，先审阅一次（可在 Remotion/Hyperframes、CapCut 或 AI 风格重塑工具中执行）。只复制剪辑语法，绝不复制参考视频的素材、脚本或音乐。完整方法：[references/edit-anatomy.md](references/edit-anatomy.md)。

---

## 视频制作工作流

### 产品演示视频

1. **编写脚本**，呈现关键功能和价值主张（使用文案写作技能）
2. **录制屏幕**，展示产品操作流程
3. **程序化叠加层**——使用 Hyperframes/Remotion 添加标题、标注和转场
4. **AI 补充镜头**——使用 Veo/Runway 生成场景建立镜头或生活方式场景
5. **配音**——自行录制，或使用 AI 虚拟人进行旁白讲解
6. **导出**为符合平台要求的规格

### 解说视频

1. **编写脚本**，构建问题 → 解决方案 → 行动号召的叙事弧线
2. **选择演示者**——AI 虚拟人（HeyGen），或旁白 + 视觉内容
3. **构建视觉内容**——程序化幻灯片、屏幕录制、AI 生成场景
4. **添加字幕**——始终添加，以提升无障碍性和互动率
5. **导出**——YouTube/网站使用横屏格式，社交媒体使用竖屏格式

### 批量制作社交媒体短视频

1. **创建主模板**，使用 Hyperframes/Remotion
2. **输入数据**——产品功能、用户评价、统计数据
3. **批量渲染**——一个模板，多种变体
4. **添加平台专用字幕**，通过 CapCut 或 Captions.ai 完成
5. **跨平台定时发布**

---

## 智能体原生视频流水线

最强大的配置会组合使用智能体能够直接控制的工具：

```
Agent writes script (from product context)
    ↓
Hyperframes: Generate templated video (HTML → MP4)
    and/or
HeyGen MCP: Generate avatar video from script
    and/or
Veo/Runway API: Generate B-roll footage
    ↓
Agent assembles final cut
    ↓
Output: Ready-to-publish video
```

**使其具备智能体原生特性的因素：**
- Hyperframes 使用 HTML——任何编程智能体都可以生成它
- HeyGen MCP 服务器——智能体可直接调用
- 视频模型 API——使用标准 HTTP 请求
- 无需手动编辑步骤

---

## 常见错误

1. **从工具而非策略入手**——先确定你需要什么样的视频，再选择工具
2. **在视频中使用 AI 生成的文字**——模型无法可靠地渲染清晰可读的文字；应改用程序化叠加层
3. **虚拟人的恐怖谷效应**——如果虚拟人质量很重要，请考虑使用 HeyGen Creator+ 套餐
4. **不添加字幕**——85% 的社交媒体视频是在静音状态下观看的
5. **宽高比错误**——社交媒体使用 9:16，YouTube/网站使用 16:9，信息流使用 1:1
6. **过度制作**——真实自然的内容往往比精致制作的内容表现更好，尤其是在 TikTok 上

---

## 任务特定问题

1. 你需要哪种类型的视频？（演示、讲解、社交媒体短片、广告、教程）
2. 你需要真人出镜，还是可以使用旁白/文字？
3. 这是一次性制作，还是需要可复用的模板？
4. 视频将发布到哪个平台？（这决定了宽高比和时长）
5. 你是否已有可供使用的素材？（截图、视频片段、脚本）
6. 你的视频工具预算是多少？

---

## 工具集成

| 工具 | 类型 | MCP | 指南 |
|------|------|:---:|-------|
| **HeyGen** | AI 虚拟人 | 是 | [heygen.md](../../tools/integrations/heygen.md) |
| **Hyperframes** | 程序化视频 | - | [hyperframes.md](../../tools/integrations/hyperframes.md) |
| **Remotion** | 程序化视频 | - | [remotion.dev](https://www.remotion.dev/docs) |
| **Runway** | AI 生成 | - | [runwayml.com/docs](https://docs.dev.runwayml.com) |

---

## 相关技能

- **social**：用于视频内容策略、开场钩子以及发布内容规划
- **ad-creative**：用于付费视频广告创意及迭代
- **copywriting**：用于视频脚本和信息传达
- **marketing-psychology**：用于视频中的开场钩子和说服策略