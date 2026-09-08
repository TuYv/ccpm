---
name: ai-models
description: Latest AI models reference - Claude, OpenAI, Gemini, Eleven Labs, Replicate
when-to-use: When choosing models, comparing capabilities, or referencing model specs
user-invocable: true
effort: low
---
# AI 模型参考 Skill


**最后更新：2025 年 12 月**

## 理念

**为任务选择合适的模型。** 更大不一定更好，应使模型能力与任务需求相匹配。请权衡成本、延迟和准确性。

## 模型选择矩阵

| 任务 | 推荐模型 | 原因 |
|------|-------------|-----|
| 复杂推理 | Claude Opus 4.5, o3, Gemini 3 Pro | 准确性最高 |
| 快速聊天/补全 | Claude Haiku, GPT-4.1 mini, Gemini Flash | 低延迟、成本低 |
| 代码生成 | Claude Sonnet 4.5, Codestral, GPT-4.1 | 代码能力强 |
| 视觉/图像 | Claude Sonnet, GPT-4o, Gemini 3 Pro | 多模态 |
| 嵌入 | text-embedding-3-small, Voyage | 成本效益高 |
| 语音合成 | Eleven Labs v3, OpenAI TTS | 听起来自然 |
| 图像生成 | FLUX.2, DALL-E 3, SD 3.5 | 风格各异 |

---

## Anthropic (Claude)

### 文档
- **API 文档**：https://docs.anthropic.com
- **模型概览**：https://docs.anthropic.com/en/docs/about-claude/models/overview
- **定价**：https://www.anthropic.com/pricing

### 最新模型（2025 年 12 月）

```typescript
const CLAUDE_MODELS = {
  // Flagship - highest capability
  opus: 'claude-opus-4-5-20251101',

  // Balanced - best for most tasks
  sonnet: 'claude-sonnet-4-5-20250929',

  // Previous generation (still excellent)
  opus4: 'claude-opus-4-6',
  sonnet4: 'claude-sonnet-5',

  // Fast & cheap - high volume tasks
  haiku: 'claude-haiku-4-5-20251001',
} as const;
```

### 用法
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello, Claude!' }
  ],
});
```

### 模型选择
```
claude-opus-4-5-20251101 (Opus 4.5)
├── Best for: Complex analysis, research, nuanced writing
├── Context: 200K tokens
├── Cost: $5/$25 per 1M tokens (input/output)
└── Use when: Accuracy matters most

claude-sonnet-4-5-20250929 (Sonnet 4.5)
├── Best for: Code, general tasks, balanced performance
├── Context: 200K tokens
├── Cost: $3/$15 per 1M tokens
└── Use when: Default choice for most applications

claude-haiku-4-5-20251001 (Haiku 4.5)
├── Best for: Classification, extraction, high-volume
├── Context: 200K tokens
├── Cost: $1/$5 per 1M tokens
└── Use when: Speed and cost matter most
```

---

## OpenAI

### 文档
- **API 文档**：https://platform.openai.com/docs
- **模型**：https://platform.openai.com/docs/models
- **定价**：https://openai.com/pricing

### 最新模型（2025 年 12 月）

```typescript
const OPENAI_MODELS = {
  // GPT-5 series (latest)
  gpt5: 'gpt-5.2',
  gpt5Mini: 'gpt-5-mini',

  // GPT-4.1 series (recommended for most)
  gpt41: 'gpt-4.1',
  gpt41Mini: 'gpt-4.1-mini',
  gpt41Nano: 'gpt-4.1-nano',

  // Reasoning models (o-series)
  o3: 'o3',
  o3Pro: 'o3-pro',
  o4Mini: 'o4-mini',

  // Legacy but still useful
  gpt4o: 'gpt-4o',           // Still has audio support
  gpt4oMini: 'gpt-4o-mini',

  // Embeddings
  embeddingSmall: 'text-embedding-3-small',
  embeddingLarge: 'text-embedding-3-large',

  // Image generation
  dalle3: 'dall-e-3',
  gptImage: 'gpt-image-1',

  // Audio
  tts: 'tts-1',
  ttsHd: 'tts-1-hd',
  whisper: 'whisper-1',
} as const;
```

### 用法
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat completion
const response = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

// With vision
const visionResponse = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image_url', image_url: { url: 'https://...' } },
      ],
    },
  ],
});

// Embeddings
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Your text here',
});
```

### 模型选择
```
o3 / o3-pro
├── Best for: Math, coding, complex multi-step reasoning
├── Context: 200K tokens
├── Cost: Premium pricing
└── Use when: Hardest problems, need chain-of-thought

gpt-4.1
├── Best for: General tasks, coding, instruction following
├── Context: 1M tokens (!)
├── Cost: Lower than GPT-4o
└── Use when: Default choice, replaces GPT-4o

gpt-4.1-mini / gpt-4.1-nano
├── Best for: High-volume, cost-sensitive
├── Context: 1M tokens
├── Cost: Very low
└── Use when: Simple tasks at scale

o4-mini
├── Best for: Fast reasoning at low cost
├── Context: 200K tokens
├── Cost: Budget reasoning
└── Use when: Need reasoning but cost-conscious
```

---

## Google (Gemini)

### 文档
- **API 文档**: https://ai.google.dev/docs
- **模型**: https://ai.google.dev/gemini-api/docs/models/gemini
- **定价**: https://ai.google.dev/pricing

### 最新模型（2025 年 12 月）

```typescript
const GEMINI_MODELS = {
  // Gemini 3 (Latest)
  gemini3Pro: 'gemini-3-pro-preview',
  gemini3ProImage: 'gemini-3-pro-image-preview',
  gemini3Flash: 'gemini-3-flash-preview',

  // Gemini 2.5 (Stable)
  gemini25Pro: 'gemini-2.5-pro',
  gemini25Flash: 'gemini-2.5-flash',
  gemini25FlashLite: 'gemini-2.5-flash-lite',

  // Specialized
  gemini25FlashTTS: 'gemini-2.5-flash-preview-tts',
  gemini25FlashAudio: 'gemini-2.5-flash-native-audio-preview-12-2025',

  // Previous generation
  gemini2Flash: 'gemini-2.0-flash',
} as const;
```

### 用法
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const result = await model.generateContent('Hello!');
const response = result.response.text();

// With vision
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
const imagePart = {
  inlineData: {
    data: base64Image,
    mimeType: 'image/jpeg',
  },
};
const result = await visionModel.generateContent(['Describe this:', imagePart]);
```

### 模型选择
```
gemini-3-pro-preview
├── Best for: "Best model in the world for multimodal"
├── Context: 2M tokens
├── Cost: Premium
└── Use when: Need absolute best quality

gemini-2.5-pro
├── Best for: State-of-the-art thinking, complex tasks
├── Context: 2M tokens
├── Cost: $1.25/$5 per 1M tokens
└── Use when: Long context, complex reasoning

gemini-2.5-flash
├── Best for: Fast, balanced performance
├── Context: 1M tokens
├── Cost: $0.075/$0.30 per 1M tokens
└── Use when: Speed and cost matter

gemini-2.5-flash-lite
├── Best for: Ultra-fast, lowest cost
├── Context: 1M tokens
├── Cost: $0.04/$0.15 per 1M tokens
└── Use when: High volume, simple tasks
```

---

## Eleven Labs（语音）

### 文档
- **API 文档**：https://elevenlabs.io/docs
- **模型**：https://elevenlabs.io/docs/models
- **定价**：https://elevenlabs.io/pricing

### 最新模型（2025 年 12 月）

```typescript
const ELEVENLABS_MODELS = {
  // Latest - highest quality (alpha)
  v3: 'eleven_v3',

  // Production ready
  multilingualV2: 'eleven_multilingual_v2',
  turboV2_5: 'eleven_turbo_v2_5',

  // Ultra-low latency
  flashV2_5: 'eleven_flash_v2_5',
  flashV2: 'eleven_flash_v2', // English only
} as const;
```

### 用法
```typescript
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Text to speech
const audio = await elevenlabs.textToSpeech.convert('voice-id', {
  text: 'Hello, world!',
  model_id: 'eleven_turbo_v2_5',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
  },
});

// Stream audio (for real-time)
const audioStream = await elevenlabs.textToSpeech.convertAsStream('voice-id', {
  text: 'Streaming audio...',
  model_id: 'eleven_flash_v2_5',
});
```

### 模型选择
```
eleven_v3（Alpha）
├── 最适合：最高质量、丰富的情感表现
├── 延迟：约 1 秒以上（不适用于实时场景）
├── 语言：74 种
└── 使用场景：质量优先于速度、预渲染内容

eleven_turbo_v2_5
├── 最适合：平衡质量与速度
├── 延迟：约 250-300 毫秒
├── 语言：32 种
└── 使用场景：需要较好质量且延迟合理时

eleven_flash_v2_5
├── 最适合：实时场景、对话式 AI
├── 延迟：<75 毫秒
├── 语言：32 种
└── 使用场景：实时语音代理、聊天机器人
```

---

## Replicate

### 文档
- **API 文档**：https://replicate.com/docs
- **模型**：https://replicate.com/explore
- **定价**：https://replicate.com/pricing

### 热门模型（2025 年 12 月）

```typescript
const REPLICATE_MODELS = {
  // FLUX.2 (Latest - November 2025)
  flux2Pro: 'black-forest-labs/flux-2-pro',
  flux2Flex: 'black-forest-labs/flux-2-flex',
  flux2Dev: 'black-forest-labs/flux-2-dev',

  // FLUX.1 (Still excellent)
  flux11Pro: 'black-forest-labs/flux-1.1-pro',
  fluxKontext: 'black-forest-labs/flux-kontext', // Image editing
  fluxSchnell: 'black-forest-labs/flux-schnell',

  // Video
  stableVideo4D: 'stability-ai/sv4d-2.0',

  // Audio
  musicgen: 'meta/musicgen',

  // LLMs (if needed outside main providers)
  llama: 'meta/llama-3.2-90b-vision',
} as const;
```

### 用法
```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Image generation with FLUX.2
const output = await replicate.run('black-forest-labs/flux-2-pro', {
  input: {
    prompt: 'A serene mountain landscape at sunset',
    aspect_ratio: '16:9',
    output_format: 'webp',
  },
});

// Image editing with Kontext
const edited = await replicate.run('black-forest-labs/flux-kontext', {
  input: {
    image: 'https://...',
    prompt: 'Change the sky to sunset colors',
  },
});
```

### 模型选择
```
flux-2-pro
├── 最适合：最高质量，最高支持 4MP
├── 速度：约 6 秒
├── 成本：$0.015 + 每百万像素费用
└── 使用场景：需要专业级质量时

flux-2-flex
├── 最适合：精细细节、排版
├── 速度：约 22 秒
├── 成本：每百万像素 $0.06
└── 使用场景：需要精确控制时

flux-2-dev（开源）
├── 最适合：快速生成
├── 速度：约 2.5 秒
├── 成本：每百万像素 $0.012
└── 使用场景：速度优先于质量时

flux-kontext
├── 最适合：基于文本的图像编辑
├── 速度：可变
├── 成本：按次运行计费
└── 使用场景：编辑现有图像
```

---

## Stability AI

### 文档
- **API 文档**: https://platform.stability.ai/docs/api-reference
- **模型**: https://stability.ai/stable-image
- **定价**: https://platform.stability.ai/pricing

### 最新模型（2025 年 12 月）

```typescript
const STABILITY_MODELS = {
  // Image generation
  sd35Large: 'sd3.5-large',
  sd35LargeTurbo: 'sd3.5-large-turbo',
  sd3Medium: 'sd3-medium',

  // Video
  sv4d: 'sv4d-2.0', // Stable Video 4D 2.0

  // Upscaling
  upscale: 'esrgan-v1-x2plus',
} as const;
```

### 用法
```typescript
const response = await fetch(
  'https://api.stability.ai/v2beta/stable-image/generate/sd3',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: 'A futuristic city at night',
      output_format: 'webp',
      aspect_ratio: '16:9',
      model: 'sd3.5-large',
    }),
  }
);
```

---

## Mistral AI

### 文档
- **API 文档**: https://docs.mistral.ai
- **模型**: https://docs.mistral.ai/getting-started/models
- **定价**: https://mistral.ai/technology/#pricing

### 最新模型（2025 年 12 月）

```typescript
const MISTRAL_MODELS = {
  // Flagship
  large: 'mistral-large-latest',  // Points to 2411

  // Medium tier
  medium: 'mistral-medium-2505',  // Medium 3

  // Small/Fast
  small: 'mistral-small-2506',    // Small 3.2

  // Code specialized
  codestral: 'codestral-2508',
  devstral: 'devstral-medium-2507',

  // Reasoning (Magistral)
  magistralMedium: 'magistral-medium-2507',
  magistralSmall: 'magistral-small-2507',

  // Audio
  voxtral: 'voxtral-small-2507',

  // OCR
  ocr: 'mistral-ocr-2505',
} as const;
```

### 用法
```typescript
import MistralClient from '@mistralai/mistralai';

const client = new MistralClient(process.env.MISTRAL_API_KEY);

const response = await client.chat({
  model: 'mistral-large-latest',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Code completion with Codestral
const codeResponse = await client.chat({
  model: 'codestral-2508',
  messages: [{ role: 'user', content: 'Write a Python function to...' }],
});
```

### 模型选择
```
mistral-large-latest (123B params)
├── Best for: Complex reasoning, knowledge tasks
├── Context: 128K tokens
└── Use when: Need high capability

codestral-2508
├── Best for: Code generation, 80+ languages
├── Speed: 2.5x faster than predecessor
└── Use when: Code-focused tasks

magistral-medium-2507
├── Best for: Multi-step reasoning
├── Specialty: Transparent chain-of-thought
└── Use when: Need reasoning traces
```

---

## Voyage AI（嵌入）

### 文档
- **API 文档**: https://docs.voyageai.com
- **模型**: https://docs.voyageai.com/docs/embeddings
- **定价**: https://www.voyageai.com/pricing

### 最新模型（2025 年 12 月）

```typescript
const VOYAGE_MODELS = {
  // General purpose
  large2: 'voyage-large-2',
  large2Instruct: 'voyage-large-2-instruct',

  // Code specialized
  code2: 'voyage-code-2',
  code3: 'voyage-code-3',

  // Multilingual
  multilingual2: 'voyage-multilingual-2',

  // Domain specific
  law2: 'voyage-law-2',
  finance2: 'voyage-finance-2',
} as const;
```

### 使用方法
```typescript
const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'voyage-code-3',
    input: ['Your code to embed'],
  }),
});

const { data } = await response.json();
const embedding = data[0].embedding;
```

---

## 快速参考

### 成本对比（每 1M tokens，约值）

| Provider | 低价 | 中价 | 高端 |
|----------|-------|-----|---------|
| Anthropic | $0.25 (Haiku) | $3 (Sonnet 4.5) | $5 (Opus 4.5) |
| OpenAI | $0.15 (4.1-nano) | $2 (4.1) | $15+ (o3) |
| Google | $0.04 (Flash-lite) | $0.08 (Flash) | $1.25 (Pro) |
| Mistral | $0.25 (Small) | $2.70 (Medium) | $8 (Large) |

### 各任务最佳选择

```
推理/分析              → Claude Opus 4.5, o3, Gemini 3 Pro
代码生成               → Claude Sonnet 4.5, Codestral 2508, GPT-4.1
快速响应               → Claude Haiku, GPT-4.1-mini, Gemini Flash
长上下文               → Gemini 2.5 Pro (2M), GPT-4.1 (1M), Claude (200K)
视觉                   → GPT-4.1, Claude Sonnet, Gemini 3 Pro
嵌入                   → Voyage code-3, text-embedding-3-small
语音合成               → Eleven Labs v3/flash, OpenAI TTS
图像生成               → FLUX.2 Pro, DALL-E 3, SD 3.5
视频生成               → Stable Video 4D 2.0, Runway
图像编辑               → FLUX Kontext, gpt-image-1
```

### 环境变量模板
```bash
# .env.example (NEVER commit actual keys)

# LLMs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...
MISTRAL_API_KEY=...

# Media
ELEVENLABS_API_KEY=...
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...

# Embeddings
VOYAGE_API_KEY=pa-...
```

### 模型更新检查清单
```
模型更新时：
□ 查看官方更新日志/博客
□ 更新模型 ID 字符串
□ 使用现有提示词进行测试
□ 比较输出质量
□ 检查价格变化
□ 如果上下文限制发生变化，则更新上下文限制
```

---

## 来源

- [Anthropic 模型](https://docs.anthropic.com/en/docs/about-claude/models/overview)
- [OpenAI 模型](https://platform.openai.com/docs/models)
- [OpenAI o3 发布公告](https://openai.com/index/introducing-o3-and-o4-mini/)
- [GPT-4.1 发布公告](https://openai.com/index/gpt-4-1/)
- [Google Gemini 模型](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Eleven Labs 模型](https://elevenlabs.io/docs/models)
- [Replicate FLUX.2](https://replicate.com/blog/run-flux-2-on-replicate)
- [Mistral 模型](https://docs.mistral.ai/getting-started/models)
- [Voyage AI](https://docs.voyageai.com)