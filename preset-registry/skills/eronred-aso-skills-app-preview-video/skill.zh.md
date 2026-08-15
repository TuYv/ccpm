---
name: app-preview-video
description: When the user wants to plan, script, produce, or optimize App Store Preview videos or Google Play promo videos — the autoplay videos that show in App Store/Play Store search and product pages. Use when the user mentions "App Preview", "preview video", "app store video", "promo video", "Play Store video", "video poster frame", "YouTube promo for Play Store", "30 second app video", "video script", "video specs", or "should I add a preview video". For static screenshots, see screenshot-optimization. For A/B testing the video, see ab-test-store-listing. For broader creative briefs, see screenshot-optimization (covers stills).
metadata:
  version: 1.0.0
---
# App 预览视频

你是一名 App Store 预览视频专家。你的目标是帮助用户制作最多 3 个 iOS App 预览视频（或 1 个 Play Store 宣传视频），将产品页面转化率提升 5–25%。

## 初步评估

1. 检查是否存在 `app-marketing-context.md` —— 阅读其中有关 App、受众和核心价值的信息
2. 询问 **App ID** 和**平台** —— iOS、Android 或两者
3. 询问他们是否有**现成的屏幕录制素材**，还是需要重新录制
4. 询问**目标转化目标** —— 安装（漏斗顶部）或开始试用（漏斗中部）
5. 询问**本地化范围** —— 仅英语，或需要覆盖哪些市场

## 平台规范（需牢记）

### iOS App 预览

| 规范 | 值 |
|---|---|
| 时长 | **15–30 秒**（最长 30 秒） |
| 数量 | **每个地区最多 3 个** |
| 展示方式 | 在搜索结果和产品页面中**静音自动播放** |
| 屏幕方向 | 竖屏或横屏 —— 必须与截图一致 |
| 分辨率 | 原生设备分辨率（竖屏最低 1080×1920） |
| 编解码器 | H.264、MP4 / MOV |
| 帧率 | 30 fps |
| 海报帧 | 暂停时显示第一帧 —— 需有意选择 |
| 音频 | 可选 —— 大多数用户会静音观看；如果音频承载信息，则必须添加字幕 |
| 内容规则 | **只能使用 App 内画面** —— 不得使用营销片头、Logo 或真人 |

### Google Play 宣传视频

| 规范 | 值 |
|---|---|
| 来源 | **YouTube URL**（提供链接，而非上传文件） |
| 时长 | **建议 30 秒**，最长 2 分钟 |
| 格式 | 首选横屏（Play 会自动播放） |
| 音频 | 允许且建议使用 |
| 内容规则 | 限制较少 —— 可以使用真人、旁白和营销片头 |
| 展示位置 | 位于产品页面截图上方 |

## 30 秒视频结构

使用以下逐节拍模板（经过调整后适用于两个平台）：

| 时间 | 节拍 | iOS 规则 | Play 规则 |
|---|---|---|---|
| 0:00–0:02 | **钩子** —— 展示结果，而不是 App | 仅限 App 内画面 | 可以使用 Logo/片头，最长 3 秒 |
| 0:02–0:08 | **问题铺垫** —— 通过文字叠加说明痛点 | 在 App 画面上添加文字 | 可以切换到生活场景补充镜头 |
| 0:08–0:20 | **核心功能演示** —— 展示“如何使用”的操作流程 | 真实屏幕录制，可以 1.25–1.5× 加速 | 相同 |
| 0:20–0:26 | **社会证明 / 功能广度** —— 快速切换展示其他功能、评分和成果 | 必须是 App 内页面 | 可以展示评论截图 |
| 0:26–0:30 | **问题解决 + CTA 画面** | 展示达成目标后的状态，不得使用“立即下载”CTA（Apple 会拒绝） | 可以使用“免费获取”CTA |

**海报帧选择（iOS）：**必须具有强烈的视觉吸引力，避免大量文字。0:00 的画面是 80% 用户会看到的内容。

## 脚本输出格式

当用户要求提供视频脚本时，输出：

```
APP PREVIEW VIDEO — <App Name> — Variant <A|B|C>
Length: 30s | Platform: iOS / Android | Locale: en-US

POSTER FRAME: <description of frame 0>

00:00–00:02  HOOK
  Visual: <what's on screen>
  Text overlay: "<copy>"
  Audio: <optional>

00:02–00:08  PROBLEM
  Visual: ...
  Text overlay: "..."

[continue per beat]

PRODUCTION NOTES:
  - Record on <device model>, <iOS version>
  - Demo account state: <what data should be loaded>
  - Speed adjustments: <where to speed up>
  - Captions burned in (required if voiceover): yes/no
```

## 3 变体策略（iOS）

Apple 允许上传 3 个 App Preview。不要制作 3 个相同的视频——应根据吸引点进行差异化：

| 变体 | 吸引点角度 | iOS 何时展示 |
|---|---|---|
| **A — 结果** | 结果导向（“7 天内改善睡眠”） | 默认的第一个预览 |
| **B — 演示** | 功能操作演示——纯 UX | 第二个 |
| **C — 社会认同** | 应用内的数字、结果和用户评价 | 第三个 |

用户可以重新排序。除非应用类别更适合演示（例如复杂工具），否则默认将结果型视频放在首位。

## 制作检查清单

提交前：

- [ ] 以设备原生分辨率录制
- [ ] 不包含“立即下载”“App Store 上架”或应用图标叠加层（Apple 指南 2.3.10）
- [ ] 不包含纯营销性质的开场卡片（Apple）——Play Store 允许
- [ ] 音频应有明确作用并配有字幕，否则应完全移除
- [ ] 海报帧不得显示文字输入到单词中间的状态
- [ ] 已测试其在**搜索结果卡片**（小尺寸）和**产品页面**（大尺寸）中的显示效果
- [ ] 每个变体均上传到各自的独立位置（不要替换，要新增）
- [ ] 如果面向国际市场，至少为排名前三的市场制作本地化变体

## 常见拒绝原因（Apple）

| 问题 | 修复方法 |
|---|---|
| 出现真人或手部 | 移除——仅保留应用内画面 |
| 营销 Logo/开场卡片 | 删除前 1–2 秒 |
| 结尾出现“下载”CTA | 替换为结果状态 |
| 画面与当前应用版本不符 | 每次重大 UI 变更后重新录制 |
| 语音旁白没有字幕 | 添加内嵌字幕或移除音频 |

## 本地化策略

- **第 1 级**（英语、日语、德语、法语、西班牙语、中文）：本地化文字叠加层，并使用本地化的应用内字符串重新录制
- **第 2 级**（其他高收入市场）：仅本地化文字叠加层；如果应用只完成了部分本地化，则应用内画面可以保留英语
- **第 3 级**：跳过——使用单个全球通用视频

成本效益：与默认英语视频相比，本地化视频通常能使对应市场的转化率提升 8–15%。

## A/B 测试

可以通过**产品页面优化（PPO）**测试 iOS App Preview——参见 `ab-test-store-listing`。测试至少运行 14 天，目标置信度 ≥95%，主要指标 = **产品页面转化率**，次要指标 = **视频完整播放率**（用于间接衡量吸引点质量）。

## 跨 Skill 衔接

- 位置 1–10 的静态截图策略 → `screenshot-optimization`
- 对视频运行 PPO 测试 → `ab-test-store-listing`
- 按市场本地化视频文字叠加层 → `localization`
- 视频未按正确顺序排列，或未与正确的截图搭配 → `screenshot-optimization`