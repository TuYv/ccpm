# Web 设计总监

> 按情感意图（温暖/冷峻 × 活跃/沉静）组织的视觉设计方向框架。这是首个根据网站带给用户的感受，而非外观，对网站进行分类的设计参考体系。包含 48 个带注释的公开网站参考案例。

## 何时使用此 Skill

- 启动新的网站项目，并在编码前确定视觉方向
- 客户说“我希望它给人专业而温暖的感觉”，而你需要将这种要求转化为具体的设计决策
- 已有品牌定位（Dunford、StoryBrand），需要将其映射为视觉语言
- 在不同设计方案之间进行选择（深色模式与浅色模式、极简与丰富、编辑风格与产品风格）
- 根据与品牌情感领域相匹配的参考案例制作情绪板
- 当 AI 生成的设计因缺乏明确方向而显得“模板化”时

## 方法论基础

**来源**：
- 情感化设计（Don Norman，2004）——本能、行为与反思层面的处理
- 品牌定位理论（April Dunford，《Obviously Awesome》）——竞争替代方案决定视觉领域
- 色彩心理学研究——冷暖光谱及行为反应
- Web 设计模式分析——分析了分布在 4 个情感象限中的 48 个公开网站
- 对 12 个设计灵感平台（Awwwards、Dribbble、Godly、Mobbin 等）的差距分析

**核心洞察**：现有的每个设计灵感平台（Awwwards、Dribbble、Behance、Godly、Mobbin、SiteInspire、Lapa.ninja）都是按照视觉风格、行业、平台或颜色进行分类。没有任何平台按照情感意图进行组织。这正是市场空白。一个“极简深色网站”既可以让人感到奢华（Cartier），也可以让人感到威胁（CrowdStrike）——视觉风格相同，情感效果却截然相反。没有意图的风格只是装饰。没有风格的意图只是线框图。

**情感象限**：
```
              WARM
         (approach, trust)
               |
    Warm+Active | Warm+Calm
    (energy,    | (comfort,
     delight)   |  safety)
               |
ACTIVE --------+-------- CALM
(momentum,     |    (restraint,
 disruption)   |     authority)
               |
    Cold+Active | Cold+Calm
    (innovation,| (luxury,
     power)     |  exclusivity)
               |
              COLD
         (distance, precision)
```

**为何重要**：品牌定位决定了你的设计应处于哪个象限。儿童心理学家属于温暖+沉静。开发者工具属于冷峻+活跃。使用 Vercel 的美学风格来设计儿童心理学家的网站，会造成定位错配——无论它看起来多么“简洁”。

---

## Claude 负责什么，你决定什么

> “Claude 负责选择参考案例和模式。你负责验证情感契合度。”

| Claude 负责 | 你提供 |
|---------------|-------------|
| 将品牌定位映射到情感象限 | 品牌价值观、目标受众、竞争替代方案 |
| 从参考库中选择相关案例 | 直觉检查：这个参考案例给人的感受是否符合我的品牌？ |
| 提取设计模式（字体排印、间距、颜色、动效） | 预算和技术限制 |
| 生成包含依据的设计方向文档 | 在开始编码前对方向进行最终批准 |
| 标记定位错配（温暖的品牌 + 冷峻的设计） | Claude 无法了解的客户背景 |

**请记住**：参考库是对话的起点，而不是必须遵循的方案。最佳设计方向往往来自跨象限元素的组合——例如，将温暖+平静的配色与冷峻+活跃的字体设计相结合。

---

## 此 Skill 的功能

1. **情感定位** — 将品牌定位映射到正确的情感象限
2. **参考选择** — 提供 3-5 个符合目标感受且带有注释的公开网站
3. **模式提取** — 识别营造每种情感效果的具体设计机制
4. **方向文档** — 生成包含配色、字体、间距、动效和布局决策的设计简报
5. **不匹配检测** — 标记与品牌定位相矛盾的设计选择
6. **跨象限融合** — 指导有意识地混合来自不同象限的元素

## 使用方法

### 获取新网站的设计方向
```
I'm designing a website for [brand/business type].
Target audience: [who].
Brand feeling: [2-3 emotional words].
Competitive alternatives: [what they'd use instead of this brand].
Load the web-design-director skill.
```

### 查找符合特定感受的参考案例
```
I need website references that feel [emotional description].
Not [what to avoid]. The brand is in [industry].
Show me 5 annotated references from the library.
```

### 根据品牌定位审核现有设计
```
Here's our current site: [URL or screenshot].
Our brand positioning is: [positioning statement].
Does the design match the emotional intent? What's misaligned?
```

---

## 操作说明

### 第 1 步：确定情感象限

通过询问以下问题来确定品牌所处的位置：

```
## Brand Emotional Mapping

**1. What should a visitor feel in the first 3 seconds?**
   [ ] Safe, welcomed, at ease (→ Warm)
   [ ] Impressed, curious, intrigued (→ Cold)

**2. What should the site's energy level be?**
   [ ] Dynamic, forward-moving, "things are happening" (→ Active)
   [ ] Restrained, spacious, "take your time" (→ Calm)

**3. What's the brand's relationship with the visitor?**
   [ ] Peer/friend/guide (→ Warm)
   [ ] Expert/authority/institution (→ Cold)

**4. Competitive alternatives — what would people use instead?**
   (This determines your visual territory — you must look DIFFERENT from alternatives)
```

**象限判定**：

| 组合 | 象限 | 标志性感受 |
|-------------|----------|-------------------|
| 温暖 + 活跃 | **活力温暖** | “既令人兴奋，又让人感到友好” |
| 温暖 + 平静 | **呵护舒适** | “我在这里感到安心和被理解” |
| 冷峻 + 活跃 | **创新力量** | “前沿且严肃” |
| 冷峻 + 平静 | **精致权威** | “高级且专属” |

---

### 第 2 步：从参考库中选择案例

从匹配的象限中选择 3-5 个参考案例。对于每个案例，请注明：
- 营造情感效果的具体设计机制
- 最能体现这种效果的区块/页面
- 哪些元素值得借鉴，哪些不应沿用

**跨象限融合规则**：
- 从相邻象限借用一个元素来营造对比（例如，在暖色+平静的配色中使用冷色+活跃的字体排印）
- 绝不要从对角象限借用元素（在暖色+活跃的网站中使用冷色+平静的元素 = 造成混乱）
- 相邻象限共享一个轴：暖色+平静与暖色+活跃共享温暖感；冷色+平静与冷色+活跃共享精准感

---

### 第 3 步：提取设计决策

对于每个设计维度，请参考资料库做出具体选择：

```
## Design Direction Document

**Quadrant**: [Warm+Calm / Warm+Active / Cold+Active / Cold+Calm]
**Primary references**: [3 sites from library]
**Cross-quadrant accent**: [1 element from adjacent quadrant, if any]

### Color Palette
- **Background**: [specific color + reference site that uses it]
- **Primary accent**: [specific color + emotional rationale]
- **Text**: [dark/light + contrast ratio reasoning]
- **System**: [monochromatic / complementary / analogous]

### Typography
- **Headings**: [serif/sans/display + weight + specific font suggestion]
- **Body**: [font + size + line-height + rationale from reference]
- **Personality**: [what the type says about the brand]

### Spacing & Layout
- **Density**: [generous/moderate/compact + reference]
- **Grid**: [columns + max-width + rationale]
- **White space**: [aggressive/balanced/minimal]
- **Section rhythm**: [alternating/consistent/progressive]

### Motion & Interaction
- **Animation style**: [subtle/expressive/none + reference]
- **Scroll behavior**: [smooth/standard/parallax]
- **Hover states**: [transform type + timing]
- **Page transitions**: [type or none]

### Photography & Imagery
- **Style**: [photography/illustration/abstract/mixed]
- **Emotional direction**: [reference to minimalist-image-director quadrant]
- **Treatment**: [full-color/muted/duotone/grain]

### Layout Pattern
- **Hero**: [full-bleed/contained/split/text-only]
- **Cards**: [bordered/borderless/elevated/flat]
- **Navigation**: [top/side/minimal/hidden]
```

---

### 第 4 步：根据定位进行验证

最终确定之前，执行不匹配检查：

```
## Positioning Mismatch Check

- [ ] Does the color temperature match the brand warmth? (warm brand = warm colors)
- [ ] Does the animation level match the brand energy? (calm brand ≠ aggressive animations)
- [ ] Does the typography match the brand authority level? (playful brand ≠ all-caps sans-serif)
- [ ] Would a visitor from the target audience feel welcomed or intimidated?
- [ ] Does this look DIFFERENT from the competitive alternatives?
- [ ] Would this design work for the brand's WORST day? (not just launch day)
```

---

## 参考资料库——48 个带注释的公开网站

### 暖色 + 平静——滋养人心的舒适感
*“我在这里感到安全且被理解”*

这一象限中的网站采用：暖色调配色、宽裕的间距、柔和的图像、亲切易读的字体排印以及舒缓的过渡效果。它们优先考虑可读性和情感舒适度，而非视觉冲击力。

| # | 网站 | 行业 | 核心设计机制 | 最值得研究的页面 | 反模式警告 |
|---|------|----------|--------------------|--------------------|---------------------|
| 1 | **[Headspace](https://headspace.com)** | 健康/冥想 | 圆润形状 + 温暖插画 + 柔和配色。感觉像一个温柔的拥抱。 | 首页主视觉 + 新手引导流程 | 如果没有谨慎平衡，插画可能会显得幼稚 |
| 2 | **[Allbirds](https://allbirds.com)** | 可持续时尚 | 大地色调摄影 + 自然纹理 + 简洁网格。以产品为先，但仍具温度。 | 产品详情页 | 缺乏个性时，可能会显得过于“环保企业化” |
| 3 | **[Wildling Shoes](https://wildling.shoes)** | 儿童鞋履 | 自然摄影 + 温暖的中性色 + 有机流动感。感觉像在森林中漫步。 | 首页滚动叙事 | 容易因自然图像而弱化产品焦点 |
| 4 | **[Kinfolk](https://kinfolk.com)** | 生活方式编辑内容 | 字体排印主导 + 大量留白 + 暖色调摄影。安静的自信。 | 文章布局 | 如果内容单薄，可能会显得过于空旷 |
| 5 | **[Cereal Magazine](https://readcereal.com)** | 旅行/设计 | 柔和的暖色调配色 + 编辑式网格 + 沉思感图像。节奏舒缓。 | 旅行指南 | 低对比度可能会影响可读性 |
| 6 | **[Aesop](https://aesop.com)** | 美容/护肤 | 暖色调产品摄影 + 衬线字体排印 + 克制的布局。精致的温暖感。 | 门店定位器 + 产品页面 | 游走于暖色+平静与冷色+平静之间 |
| 7 | **[Everlane](https://everlane.com)** | 道德时尚 | 简洁布局 + 温暖的生活方式摄影 + 透明定价。真诚的温暖感。 | “关于”页面 + 工厂故事 | 如果过度使用，透明度相关信息可能会显得说教 |
| 8 | **[Patagonia](https://patagonia.com)** | 户外/使命驱动 | 大胆的暖色调摄影 + 使命驱动的内容 + 有深度的编辑内容。行动主义式的温暖感。 | 环保故事 | 以行动主义为先的设计可能会疏远非行动主义受众 |
| 9 | **[Nurture Life](https://nurturelife.com)** | 儿童餐食 | 柔和的粉彩色 + 圆润的 UI + 温暖的食物摄影。对家长友好。 | 餐食计划页面 | 过度使用粉彩色可能会显得像千篇一律的“婴幼儿品牌” |
| 10 | **[Organic Basics](https://organicbasics.com)** | 可持续基础用品 | 中性色调 + 充足的呼吸空间 + 极简导航。平静的商业体验。 | 产品分类页面 | 过度极简可能会让人觉得“这里没什么可看的” |
| 11 | **[Ritual](https://ritual.com)** | 健康/营养补充剂 | 暖黄色强调色 + 简洁布局 + 具有科学感的温暖。通过透明度建立信任。 | 成分可追溯性页面 | 过度使用黄色强调色可能会显得临床化 |
| 12 | **[Mejuri](https://mejuri.com)** | 亲民珠宝 | 温暖的生活方式摄影 + 柔和的金色点缀 + 简洁的电商网格。平易近人的奢华感。 | 系列页面 | 需要在奢华感与亲民定价之间取得平衡 |

**跨象限模式**：所有温暖+平静型网站都具有宽松的行高（1.6-1.8）、柔和/大地色系的配色，以及展现真实人物身处自然环境中的摄影作品。导航始终简洁。动画始终含蓄。

---

### 温暖 + 活跃 — 活力四射的温暖感
*“既令人兴奋，又让人感到友好”*

这一象限的网站会采用：大胆的色彩、动态动画、趣味插画、活力十足的字体设计和交互元素。它们给人的感觉，就像一位热情的朋友正在向你展示某个令人惊叹的事物。

| # | 网站 | 行业 | 关键设计机制 | 最值得研究的页面 | 反模式警告 |
|---|------|----------|--------------------|--------------------|---------------------|
| 1 | **[Notion](https://notion.so)** | 效率工具 | 温暖的插画 + 简洁的产品 UI + 友好的微交互。井然有序的热情感。 | 模板库 + 首页 | 这种插画风格被大量模仿——要找到自己的风格 |
| 2 | **[Figma](https://figma.com)** | 设计工具 | 鲜艳的渐变 + 协作活力 + 大胆的字体设计。设计感前卫，却不显冰冷。 | 社区/插件页面 | 大量使用渐变的设计很快就会过时 |
| 3 | **[Mailchimp](https://mailchimp.com)** | 电子邮件营销 | 独特的插画 + 温暖的品牌黄色 + 趣味 UI。以个性驱动。 | 首页 + 定价页面 | 另类的插画风格需要坚定的品牌投入 |
| 4 | **[Loom](https://loom.com)** | 视频通信 | 温暖的紫色 + 亲切易用的 UI + 以产品为主导的动画。不显科技感的科技产品。 | 产品演示部分 | 紫色营造的温暖感如果过度饱和，可能会显得企业化 |
| 5 | **[Intercom](https://intercom.com)** | 客户沟通 | 大胆的色彩 + 对话式文案 + 动态布局。亲切而权威。 | 产品导览页面 | 如果不严格控制留白，大胆的配色可能令人应接不暇 |
| 6 | **[Monday.com](https://monday.com)** | 工作管理 | 鲜艳的多色彩 + 活力十足的动画 + 大胆的网格布局。高活力，高清晰度。 | 首页产品演示 | 色彩爆发需要严格的层级结构，否则就会陷入混乱 |
| 7 | **[Miro](https://miro.com)** | 协作工具 | 温暖的黄色 + 协作场景图像 + 动态画布预览。富有创造力的活力感。 | 使用场景页面 | 以协作为主题的图像可能显得千篇一律 |
| 8 | **[Webflow](https://webflow.com)** | 网站构建工具 | 大胆的字体设计 + 赋能式文案 + 创意作品展示。属于创作者的活力。 | 作品展示库 + 首页 | “赋能”类信息已经是一个非常拥挤的领域 |
| 9 | **[Framer](https://framer.com)** | 设计/发布 | 设计感前卫 + 大胆的动态效果 + 深色与暖色的混合风格。彰显创意工具的自信。 | 模板 + 首页 | 大量使用动态效果的设计可能拖慢页面加载速度 |
| 10 | **[Shopify](https://shopify.com)** | 电子商务平台 | 温暖的绿色 + 创业活力 + 成功案例。乐观积极的商业氛围。 | 成功案例 + 首页 | 创业活力可能给人一种“奋斗至上文化”的感觉 |
| 11 | **[Asana](https://asana.com)** | 项目管理 | 温暖的珊瑚色/渐变 + 简洁的产品 UI + 目的明确的动画。井然有序的愉悦感。 | 产品功能页面 | 过度使用渐变很快就会显得过时 |
| 12 | **[Canva](https://canva.com)** | 设计平台 | 鲜艳的紫色 + 易于上手的设计 + 模板展示。让创意设计大众化。 | 模板库 | 对易用性的侧重可能会降低感知质量 |

**跨象限模式**：所有温暖+活跃型网站都使用醒目的原色（而非柔和的粉彩色）、动态滚动动画、产品实际使用演示，以及直接面向用户（“你”）的文案。字体采用无衬线体，字重为中等至粗体。插图独具特色，而非千篇一律。

---

### 冷峻 + 沉静 — 精致权威
*“这里彰显高雅与专属感”*

这一象限的网站通常采用：克制的配色（黑/白/灰 + 一种强调色）、充足的留白、衬线字体或精致的无衬线字体、极少的动画以及大幅图像。它们通过未展示的内容来传达信息。

| # | 网站 | 行业 | 关键设计机制 | 最值得研究的页面 | 反模式警告 |
|---|------|----------|--------------------|--------------------|---------------------|
| 1 | **[Cartier](https://cartier.com)** | 奢华珠宝 | 金色 + 黑色 + 电影感摄影 + 克制的交互。纯粹的奢华。 | 高级珠宝系列 | 奢侈品牌的设计语言很难有效迁移到非奢侈品牌 |
| 2 | **[Givenchy](https://givenchy.com)** | 高级时装 | 全黑配色 + 全出血摄影 + 极简字体。时尚权威感。 | 广告大片页面 | 深色 + 极简会让大众市场品牌显得难以亲近 |
| 3 | **[Monocle](https://monocle.com)** | 全球编辑出版 | 简洁的编辑网格 + 克制的配色 + 字体层级。知性的自信。 | 杂志专题 | 编辑式的高信息密度需要丰富内容作为支撑 |
| 4 | **[Herzog & de Meuron](https://herzogdemeuron.com)** | 建筑 | 纯白 + 项目摄影 + 极简导航。以建筑作为界面。 | 项目页面 | 极简导航会让普通访客感到挫败 |
| 5 | **[White Cube](https://whitecube.com)** | 画廊 | 画廊式纯白 + 艺术优先 + 隐形 UI。内容本身就是设计。 | 展览页面 | 只有当内容在视觉上足够惊艳时才有效 |
| 6 | **[Eleven Madison Park](https://elevenmadisonpark.com)** | 高级餐饮 | 深色 + 克制 + 电影感美食摄影。餐饮剧场。 | 菜单/体验页面 | 餐厅级的克制设计只适用于高端价位 |
| 7 | **[Apple](https://apple.com)** | 科技 | 英雄式产品摄影 + 简洁分区 + 精准排版。受控呈现。 | 产品发布页面 | Apple 的资源无法复制——应借鉴原则，而非照搬执行方式 |
| 8 | **[Porsche](https://porsche.com)** | 汽车 | 深色 + 性能摄影 + 精准网格 + 受控动效。工程化的优雅。 | 车型配置器 | 汽车的戏剧张力需要影棚级摄影 |
| 9 | **[Bang & Olufsen](https://bang-olufsen.com)** | 音频/设计 | 产品即雕塑 + 中性背景 + 设计主导的布局。对物件的崇尚。 | 产品详情页 | 需要真正美观的实体产品 |
| 10 | **[Bottega Veneta](https://bottegaveneta.com)** | 奢华时装 | 绿色强调色 + 编辑式摄影 + 戏剧性的尺度变化。自信的克制。 | 数字期刊 | 大胆的克制需要创意总监级别的判断力 |
| 11 | **[Ace & Tate](https://aceandtate.com)** | 眼镜 | 简洁摄影 + 柔和配色 + 编辑式叙事。平易近人的精致感。 | 故事/编辑内容版块 | 如果产品不匹配，可能会让人觉得为了显得奢华而“用力过猛” |
| 12 | **[The Row](https://therow.com)** | 奢华时装 | 近乎隐形的导航 + 极致留白 + 如耳语般轻柔的字体。克制的巅峰。 | 首页 | 极端极简主义只有在品牌认知度很高时才有效 |

**跨象限模式**：所有「冷峻+平静」网站都采用衬线体或纤细的无衬线体、单色或近单色配色、满幅图像，以及较高的内容与界面元素比例。导航被尽量精简。动画很少使用，且效果含蓄。文案简洁——由图像来传达信息。

---

### 冷峻 + 活跃——创新力量
*“这是前沿的，也是严肃的”*

此象限中的网站采用：深色背景、锐利的字体、醒目的渐变、技术演示、快节奏的滚动动画，以及代码/数据可视化。它们传达出速度、精准和技术权威感。

| # | 网站 | 行业 | 关键设计机制 | 最值得研究的页面 | 反模式警告 |
|---|------|----------|--------------------|--------------------|---------------------|
| 1 | **[Vercel](https://vercel.com)** | 基础设施 | 深色模式 + 锐利字体 + 速度指标可视化。将性能塑造成品牌。 | 首页 + 框架页面 | 深色模式的开发者美学会疏远非技术受众 |
| 2 | **[Linear](https://linear.app)** | 事项跟踪 | 深色 + 精准动画 + 产品优先的 UI。工具自信。 | 首页滚动序列 | 极度精致的深色 UI 需要大量工程投入 |
| 3 | **[Stripe](https://stripe.com)** | 支付 | 深邃渐变 + 技术优雅感 + 交互式演示。美妙的复杂性。 | 文档 + 支付流程 | Stripe 的制作水准堪称标杆，但需要专门的设计团队 |
| 4 | **[Supabase](https://supabase.com)** | 数据库平台 | 深绿色 + 开发者友好 + 开源美学。技术温度。 | 仪表板预览 + 文档 | 开源美学可能会让企业买家觉得“尚未完成” |
| 5 | **[Railway](https://railway.com)** | 云平台 | 深紫色 + 简洁的部署 UI + 低摩擦设计。让开发者愉悦。 | 仪表板 + 部署流程 | 紫色深色模式正在成为开发者工具中的陈词滥调 |
| 6 | **[Anthropic](https://anthropic.com)** | AI 研究 | 纯净白色 + 深度研究内容 + 克制的权威感。科学自信。 | 研究论文页面 | 接近「冷峻+平静」——以克制取代强势 |
| 7 | **[Plaid](https://plaid.com)** | 金融 API | 结构化布局 + 技术图表 + 简洁文档。金融科技的精准感。 | API 文档 + 使用场景 | 如果缺少产品可视化，金融/API 美学可能会显得枯燥 |
| 8 | **[Wiz](https://wiz.io)** | 云安全 | 深色 + 醒目渐变 + 威胁可视化。安全权威感。 | 平台概览 | 安全美学（深色+强势）可能会让人感到威胁 |
| 9 | **[CrowdStrike](https://crowdstrike.com)** | 网络安全 | 深红黑配色 + 强势字体 + 威胁情报仪表板。防护力量。 | 平台页面 | 强势设计会排斥安全领域之外的受众 |
| 10 | **[Raycast](https://raycast.com)** | 开发者生产力 | 深色 + 流畅动画 + 键盘优先设计。速度文化。 | 扩展商店 + 首页 | 键盘优先的美学会限制其对移动端用户的吸引力 |
| 11 | **[Arc Browser](https://arc.net)** | 浏览器 | 醒目渐变 + 趣味与深色的混合风格 + 产品创新展示。富有个性的科技感。 | 首页 + 功能展示 | 趣味深色风格很难在整个网站中保持一致 |
| 12 | **[Resend](https://resend.com)** | 电子邮件 API | 深色 + 极简 + 聚焦字体排印 + 代码优先。开发者极简主义。 | 首页 + 文档 | 极简开发者网站可能会让非开发者觉得内容空洞 |

**跨象限模式**：所有冷感+活跃型网站都使用深色背景（#000-#1a1a1a）、等宽字体或几何无衬线字体、渐变强调色（紫色/蓝色/绿色），以产品演示作为首屏核心元素，并突出性能/速度信息。文案技术性强且精确。动效经过精心设计，节奏快速。

---

## 跨象限模式分析

### 各象限的设计维度

| 维度 | 暖感+平静 | 暖感+活跃 | 冷感+平静 | 冷感+活跃 |
|-----------|-----------|-------------|-----------|-------------|
| **背景** | 奶油色/暖白色（#FAF5F0-#FFF） | 白色 + 大胆的强调色区块 | 纯白或纯黑 | 深色（#000-#111） |
| **字体排印** | 圆润无衬线字体或温暖的衬线字体 | 粗体无衬线字体，中等至较粗字重 | 细体无衬线字体或优雅的衬线字体 | 几何/等宽无衬线字体 |
| **主色** | 大地色系、低饱和色 | 大胆的原色（黄色、珊瑚色、紫色） | 黑白 + 1 种强调色 | 渐变色（紫色、蓝色、绿色） |
| **间距** | 非常宽裕（64-128px） | 宽裕但富有动感（48-96px） | 极其宽裕（80-160px） | 适中（32-64px） |
| **动画** | 细微淡入淡出、柔和滚动 | 动态、活泼、交互性强 | 少见、克制 | 快速、精确、技术感强 |
| **图像** | 暖色调摄影、自然光 | 插画 + 产品演示 | 全出血电影感摄影 | 产品 UI、代码、数据可视化 |
| **文案语调** | 温暖、富有同理心、“我们理解” | 充满活力、“让我们开始构建”、“你可以” | 简练、“作品本身足以说明一切” | 技术性强、精确、“为速度而生” |
| **导航** | 简单、可见 | 丰富、按产品组织 | 极简、隐藏 | 极简、键盘操作友好 |
| **卡片** | 无边框、柔和阴影 | 醒目边框或丰富色彩 | 全出血或带框 | 深色搭配细微边框 |
| **CTA 样式** | 柔和、圆角、暖色 | 醒目、填充式、高对比度 | 低调、文本链接样式 | 锐利、描边式或渐变式 |
| **行高** | 1.6-1.8（留有呼吸空间） | 1.4-1.6（均衡） | 1.4-1.6（优雅） | 1.3-1.5（紧凑、高效） |
| **最大宽度** | 1100-1200px | 1200-1400px | 1200-1400px | 1000-1200px |

### “相邻象限”融合指南

从相邻象限借用一种元素，以增加张力和趣味性：

| 你的象限 | 相邻选项 | 融合示例 |
|---------------|-----------------|-----------------|
| 暖感+平静 | 暖感+活跃 或 冷感+平静 | 平静型网站 + 一种醒目的 CTA 颜色（来自活跃型） |
| 暖感+活跃 | 暖感+平静 或 冷感+活跃 | 活跃型网站 + 宽裕的间距（来自平静型） |
| 冷感+平静 | 暖感+平静 或 冷感+活跃 | 奢华型网站 + 暖色强调色（来自暖感型） |
| 冷感+活跃 | 暖感+活跃 或 冷感+平静 | 开发者工具 + 精致的衬线字体标题（来自平静型） |

**绝不要融合对立象限**：暖感+平静 + 冷感+活跃 = 定位混乱。冷感+平静 + 暖感+活跃 = 风格割裂。

---

## 技能边界（边界识别）

### 此技能尤其适用于：
- 尚未确定视觉方向的新网站项目
- 品牌重新定位（将新的品牌定位映射为新的视觉语言）
- 设计审查（当前设计是否与品牌意图一致？）
- 为设计师或 AI 编码工具编写创意简报
- 跨职能协作对齐（为非设计人员提供用于设计反馈的词汇）

### 此技能不适用于：
- 特定 UI 组件设计（实现请使用 `/frontend-design`）
- 字体搭配细节（此技能提供方向，而非字体选择）
- 创建设计系统（此技能侧重策略，而非体系）
- 动画工程（此技能定义意图，而非关键帧）
- 有意颠覆预期的网站（反设计、粗野主义）——这类网站需要刻意打破这些规则

### 质量检查点

接受设计方向之前：
- [ ] 象限选择符合品牌定位（而不只是个人喜好）
- [ ] 参考网站符合客户理想中的品牌身份，而非当前状态
- [ ] 跨象限融合是有意为之，并且有所限制（最多 1 个元素）
- [ ] 方向文档足够具体，无需进一步解读即可实施
- [ ] 团队中的非设计人员也能理解并验证该方向

---

## 迭代指南

> “先定方向，再做装饰。先谈感受，再选字体。”

### 推荐的迭代模式

| 轮次 | 重点 | 要提出的问题 |
|------|-------|------------------|
| **第 1 轮** | 象限 | “这个象限符合品牌的情感领域吗？” |
| **第 2 轮** | 参考 | “这些网站带来的感受，是否符合我的品牌应有的感受？” |
| **第 3 轮** | 提炼 | “这些设计决策是否足够具体，可以直接实施？” |
| **第 4 轮** | 错位检查 | “我们的目标受众访问后会感到自在吗？” |

### 实用的后续提示词

- “这些参考的感觉是对的，但配色并不适合我们的行业。请寻找能量感相同、但属于 [industry] 的参考。”
- “我们介于 Warm+Calm 和 Cold+Calm 之间。请向我展示 3 个横跨这一边界的网站。”
- “这个方向过于保守。加入一个相邻象限的强调元素，会给这个设计带来什么变化？”
- “我们的竞争对手使用 [X quadrant]。在保持相同情感领域的同时，我们该如何实现视觉差异化？”
- “将这个设计方向转化为提供给 `/frontend-design` 技能的简报。”

---

## 与其他 ClawFu 技能集成

| 技能 | 集成节点 |
|-------|------------------|
| **[design-trends-2026](../design-trends-2026/)** | 在选择象限之后使用——根据情感契合度筛选趋势 |
| **[minimalist-image-director](../minimalist-image-director/)** | 用于指导 Warm+Calm 和 Warm+Active 象限中的摄影方向 |
| **[landing-page-copy](../../content/landing-page-copy/)** | 用于确定文案结构——然后使文案语气与象限风格保持一致 |
| **[landing-page-optimizer](../../content/landing-page-optimizer/)** | 用于设计转化机制——将其叠加在情感方向之上 |
| **`/frontend-design`** | 将设计方向文档作为输入，交由其生成代码 |
| **[brand-strategy](../../branding/brand-strategy/)** | 在此技能之前使用——品牌策略决定象限 |

**工作流顺序**：
```
brand-strategy → web-design-director → design-trends-2026 → minimalist-image-director → /frontend-design
(positioning)    (direction)           (trend filter)        (image generation)           (code)
```

---

## 检查清单与模板

### 设计方向简报模板

```
## Design Direction Brief

**Brand**: ________________
**Target audience**: ________________
**Brand positioning statement**: ________________
**Competitive alternatives**: ________________

### Emotional Quadrant
**Selected**: [Warm+Calm / Warm+Active / Cold+Active / Cold+Calm]
**Rationale**: ________________
**Adjacent accent**: [element from adjacent quadrant, if any]

### Primary References (3-5 sites)
| Site | What to borrow | What to leave behind |
|------|---------------|---------------------|
| [site 1] | [specific mechanic] | [what doesn't fit] |
| [site 2] | [specific mechanic] | [what doesn't fit] |
| [site 3] | [specific mechanic] | [what doesn't fit] |

### Design Decisions
- **Background**: ________________
- **Primary color**: ________________
- **Typography headings**: ________________
- **Typography body**: ________________
- **Spacing density**: ________________
- **Animation style**: ________________
- **Photography direction**: ________________
- **Card style**: ________________
- **CTA style**: ________________
- **Hero pattern**: ________________

### Validation
- [ ] Matches brand quadrant
- [ ] Different from competitive alternatives
- [ ] Target audience would feel welcomed
- [ ] Specific enough to implement
```

---

## 参考资料

### 核心方法论
- Norman, Don。《情感化设计》（2004）——本能、行为和反思层面的处理
- Dunford, April。《显而易见的卓越》（2019）——竞争性替代方案定义定位空间
- Kittl x Savee。《2026 年设计趋势报告》——暖色极简主义成为主导趋势

### 设计灵感平台（差距分析）
- [Awwwards](https://awwwards.com) - 分类：行业、技术、风格。无情感分类。
- [Dribbble](https://dribbble.com) - 分类：颜色、媒体类型。无情感分类。
- [Behance](https://behance.net) - 分类：领域、工具。无情感分类。
- [Godly](https://godly.website) - 分类：风格、类型。无情感分类。
- [Mobbin](https://mobbin.com) - 分类：平台、流程类型。无情感分类。
- [SiteInspire](https://siteinspire.com) - 分类：风格、类型、主题。无情感分类。
- [Lapa.ninja](https://lapa.ninja) - 分类：颜色、类别。无情感分类。
- [Landbook](https://land-book.com) - 分类：类型、颜色、风格。无情感分类。

### 色彩心理学与神经科学
- [视觉环境与热感知（ScienceDirect）](https://www.sciencedirect.com/science/article/pii/S0306456523000293) - 视觉温暖感会影响感知
- [摄影中的色彩心理学（Skylum）](https://skylum.com/blog/color-psychology-for-photographers) - 暖色与冷色引发的行为反应
- [照片中的低温感可增强认知控制（ScienceDaily）](https://www.sciencedaily.com/releases/2017/04/170410085010.htm) - 暖色 → 趋近，冷色 → 警觉

### 网页设计分析
- [2026 年网页设计趋势（Webflow）](https://webflow.com/blog/web-design-trends) - 行业趋势调查
- [最佳 SaaS 网站（2025-2026）](https://www.saasframe.io) - SaaS 设计模式库

---

## 相关技能

- [极简图像指导](../minimalist-image-director/) - 情感象限系统内的 AI 摄影
- [2026 年设计趋势](../design-trends-2026/) - 按象限筛选的当前视觉趋势
- [落地页文案](../../content/landing-page-copy/) - 与象限调性相匹配的文案结构
- [落地页优化器](../../content/landing-page-optimizer/) - 建立在情感方向之上的转化机制
- [品牌战略](../../branding/brand-strategy/) - 决定象限的品牌基础

---

## 技能元数据

```yaml
name: web-design-director
category: ai-design
subcategory: art-direction
version: 1.0
author: GUIA
source_expert: Don Norman (Emotional Design) + April Dunford (Positioning) + Web Design Pattern Analysis (48 sites)
source_work: null
difficulty: intermediate
mode: centaur
estimated_value: Creative director engagement (~2000-5000 EUR per project)
tags: [web-design, art-direction, emotional-design, design-references, brand-positioning, UI-direction, design-system, mood-board, warm-minimalism]
created: 2026-02-12
updated: 2026-02-12
```

---

*此技能是 GUIA 高级营销技能库的一部分——该技能库的 201 层连接了 AI 基础知识与技术实现。*