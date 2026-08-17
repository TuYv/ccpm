---
name: museum-art
description: Source authentic, high-res PUBLIC-DOMAIN artwork from museum open-access APIs (Met, Cleveland, SMK, Rijksmuseum, NGA, Art Institute of Chicago, Getty, Smithsonian) instead of AI-generated or generic-stock imagery. The default move whenever a visual needs an aesthetic, credible image (blog heroes, decks, social cards, essay/spec figures). Verified keyless recipes + licensing rules inside.
---
# museum-art：用于视觉内容的公版艺术作品

> 长期规则（采纳于 2026-07-24，源自 Eric Li 关于博物馆开放获取的帖子）：**每当视觉内容需要一张具有审美分量的真实图像时，优先采用公版博物馆艺术作品**——优先级高于 AI 生成图像和通用图库素材。经过策展、具有历史意义的艺术作品会显得可信且精致；AI 生成内容则显得粗制滥造。这一规则与 `no-ai-slop` skill 及你的内部图像风格相叠加，并进一步强化它们。它并不取代生成式 `editorial-illustrations` skill（该 skill 负责由论点驱动的图表/插图），也不取代你的内部图表风格——博物馆艺术作品应用于照片式/主视觉/装饰性/氛围类图像，生成式插图则用于数据图表和概念图。

## 何时应采用此方法
- 博客文章主视觉、章节分隔图、氛围图像（博客发布流程中的图像步骤）。
- 演示文稿/幻灯片背景和章节分隔页、社交媒体卡片、文章插图、规格文档封面艺术。
- 每当你本能地想为装饰性或富有感染力的用途“生成一张图像”时，都应停下来，改用一幅真实画作。
- 不适用于：产品截图、UI 模型、数据图表、徽标，或由论点驱动的解释性图表（这些应使用 editorial-illustrations / 真实截图）。

## 决策：选择哪个来源
1. **大都会艺术博物馆 -> 克利夫兰艺术博物馆 -> SMK 优先。** 均无需密钥，只需一次 JSON 请求，采用 CC0/PD，馆藏范围广泛。这是获取高分辨率图像的最快途径。
2. **需要荷兰/佛兰德大师作品或装饰艺术？** 使用荷兰国家博物馆（无需密钥，3 次请求）。
3. **需要欧洲古代文物/摄影作品，且关键词搜索并非必需？** 使用盖蒂博物馆（无需密钥，SPARQL）。
4. **没有合适的结果，或者想进行跨博物馆搜索？** Wikimedia Commons API（无需密钥的聚合器，提供标准化许可证元数据）是最佳的通用后备方案。
5. **需要的是“历史插图/版画/老照片”，而不是美术绘画？** 直接使用 Internet Archive 或 Wikimedia Commons。
6. **科学/健康/医学类文章插图？** 使用 Wellcome Collection（无需密钥，CC0/PD）。

## 如何在此环境中获取
- 使用 **WebFetch** 请求 JSON 搜索端点，然后用 WebFetch/下载返回的图像 URL。这些 API 可从服务器端访问，无需浏览器。
- **例外——芝加哥艺术博物馆图像：** JSON API（`api.artic.edu`）可以正常使用，但图像主机 `www.artic.edu/iiif/...` 会通过 Cloudflare 机器人验证，对脚本/curl 获取请求返回 403。可以使用 AIC 的 JSON 元数据，但实际图像应通过真实/无头浏览器（browser-harness）下载，或者优先选择其他博物馆来获取图像文件。
- 发布前始终应**在查询中筛选公版内容，并逐张抽查许可证标志**（参见“许可”）。

## 新鲜度优先于缓存（强制要求）
**每次需要时都重新获取。不要建立可重复使用的本地图像下载池。** 少量缓存图像会被到处重复使用，最终变成新的“每篇文章都用同一张图库照片”——雷同也是一种粗制滥造，而大型开放馆藏的丰富多样性正是采用这一方法的核心意义。获取过程无需密钥且耗时不到一秒，因此没有任何出于成本而缓存图像文件的理由。
- **缓存查询方法/元数据，而不是图像**——这正是此 skill 的 `references/` 已经在做的事情。
- **选定图像后，只将其提交到使用它的特定制品中**（例如文章的 `assets/` 或演示文稿的媒体目录）——这样可以保留来源信息并支持离线构建。它是制品自身的资源，绝不能成为供其他制品引用的共享库。
- 每个新视觉内容 = 一次全新查询。变换搜索词和来源博物馆，避免连续发布的文章都集中使用少数几件广受欢迎的作品。

## 已验证的无密钥方案（2026-07-24，均已在线实测）

### 1. 大都会艺术博物馆（The Met）——最佳全能默认选择
- 基础地址：`https://collectionapi.metmuseum.org/public/collection/v1/`——无需密钥，80 req/s，在 `isPublicDomain:true` 时为 CC0。
- 搜索：`GET /search?q=<term>&hasImages=true&isPublicDomain=true` -> `{total, objectIDs[]}`
- 对象：`GET /objects/{id}` -> 读取 `primaryImage`（全分辨率 JPEG、静态地址、无需跳转至 IIIF）或 `primaryImageSmall`（适用于网页的大尺寸图片）。
- 示例：`https://collectionapi.metmuseum.org/public/collection/v1/search?q=sunflowers&hasImages=true&isPublicDomain=true`

### 2. 克利夫兰艺术博物馆——唯一提供存档级 TIFF 的博物馆
- 基础地址：`https://openaccess-api.clevelandart.org/api/artworks/`——无需密钥，CC0。
- 搜索：`GET /api/artworks/?cc0=1&has_image=1&limit=10`（可添加 `&q=monet`、`&skip=10`）。
- 每条结果中的图像字段：`images.web.url`（900px）、`images.print.url`（3400px JPEG）、`images.full.url`（存档级 TIFF）。可直接从 `openaccess-cdn.clevelandart.org` 下载。
- 确认每条结果的 `share_license_status == "CC0"`。

### 3. SMK（丹麦）——一次跳转，广泛涵盖欧洲/北欧藏品
- 基础地址：`https://api.smk.dk/api/v1`——无需密钥。许可：Public Domain Mark 1.0（功能上等同于 CC0）。
- 搜索：`GET /art/search?keys=*&filters=[public_domain:true]&filters=[has_image:true]`
- 直接读取每条结果中的 `image_native`（无需链式跳转）。
- **注意事项（已验证）：**将 `filters` 作为**重复的**查询参数传递，每个参数使用一个 `[field:value]` 方括号表达式。拼接为 `filters=[public_domain:true][has_image:true]` 会返回 200，但会静默忽略第二个条件。

### 4. 荷兰国立博物馆（Rijksmuseum）——荷兰/佛兰德大师作品（无密钥，3 次跳转）
- 基础地址：`https://data.rijksmuseum.nl/search/collection`（Linked Art，无需密钥）。
- `GET /search/collection?type=painting&imageAvailable=true` -> 依次遍历对象 -> VisualItem -> DigitalObject -> `access_point[0].id` 即为可直接使用的 IIIF URL。
- 许可混合：大多数为 CC0/PD，但部分为 CC BY 4.0——**请检查每个对象的 rights 块**（CC BY 项目要求署名）。

### 5. NGA（华盛顿）——批量/离线，无实时搜索
- CSV：`https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/published_images.csv`——筛选 `openaccess=1`。
- 图像（IIIF）：`https://api.nga.gov/iiif/{uuid}/full/full/0/default.jpg`
- **每张图像中 `openaccess=0` 的行并非开放内容**（分辨率受限、权利受限制）。只有 `openaccess=1` 可自由使用。

### 6. 芝加哥艺术博物馆——印象派/欧洲艺术（图像主机注意事项）
- JSON：`GET https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&fields=id,title,image_id`——无需密钥，CC0。
- 图像：构造 `https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg`——**但 Cloudflare 会对脚本化请求返回 403**；请通过浏览器下载，或从其他博物馆获取图像字节。

### 7. 盖蒂——欧洲绘画/摄影/古代文物（SPARQL）
- 基础地址：`https://data.getty.edu/museum/collection/`——无需密钥。不支持关键词搜索；使用包含 `?obj crm:P138i_has_representation ?img` 的 SPARQL，可在同一查询中返回可直接使用的 IIIF 图像 URL。
- 数据集采用 CC0；**每张图像的权利信息填写不一致**——商业使用前，请与该对象在 getty.edu 上的公开页面交叉核对（显示“Download”按钮表示确为开放内容）。

## 需要密钥的来源与聚合型来源（这些也要了解）
- **Smithsonian**（需要免费的 `api.data.gov` 密钥；`DEMO_KEY` 可用，限每小时 30 次请求）：`GET https://api.si.edu/openaccess/api/v1.0/search?q=<term> AND online_media_type:Images&api_key=KEY`；采用 CC0；逐张图片检查 `media[].usage.access=="CC0"`。覆盖范围极广（SAAM、NPG 肖像、Freer/Sackler 亚洲艺术、Cooper Hewitt 设计）。
- **Wikimedia Commons**（无需密钥，最佳聚合型备用来源）：`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=<term>&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata`；每个文件的许可证见 `extmetadata.LicenseShortName`；原始字节可通过 `Special:FilePath/{filename}` 获取。
- **Wellcome Collection**（无需密钥）：`https://api.wellcomecollection.org/catalogue/v2/works?query=<term>`；提供 CC0/PD 的医学、科学及历史图像。
- **Internet Archive**（无需密钥）：`https://archive.org/advancedsearch.php?q=<term>&fl[]=identifier&output=json`；提供 PD 书籍插图、版画、历史照片和印刷品。
- **Europeana**（免费密钥）：`https://api.europeana.eu/record/v2/search.json?wskey=<KEY>&query=<term>`；汇集欧洲各机构的 5000 多万件藏品。
- **Harvard Art Museums**（免费密钥）：`https://api.harvardartmuseums.org/object?apikey=<KEY>&q=<term>`。
- **Yale LUX**（无需密钥，与 Getty 类似，采用 Linked Art）：`https://lux.collections.yale.edu/api/search/...`；英国艺术与珍本书资源丰富。
- **Paris Musees**（无需密钥，明确采用 CC0）：`parismuseescollections.paris.fr` / `opendata.paris.fr`；涵盖法国绘画与装饰艺术。
- **NYPL Digital Collections**（免费密钥）：`https://api.repository.library.nyc/...`；提供 PD 版画、地图、照片和插图。
- **DPLA**（免费密钥）：`https://api.dp.la/v2/items?q=<term>&api_key=<KEY>`；聚合全美各机构的馆藏。

## 许可规则（发布任何图片前均须遵守）
- **真正的 CC0（无需署名）：** Met、Cleveland、Art Institute of Chicago、Smithsonian、NGA（数据集级别；图片是否开放取决于每张图片的 `openaccess=1`）。
- **Public Domain Mark / 开放但非 CC0（可免费使用，建议但不强制署名）：** SMK，以及 Rijksmuseum 中属于 PD 的子集。
- **逐张图片核验，不要盲目信任馆藏级别的“开放获取”声明：** Getty、Rijksmuseum（CC BY 项目需要署名）、NGA 和 Smithsonian 均须检查每张图片的标记。
- **规则：** 当 API 提供权利/许可证字段时，应在查询中过滤该字段，并对选中的图片进行抽查。绝不能认为“该馆藏开放获取”就意味着“这张特定图片也是开放的”。
- **通用良好实践：** 一行署名（“数字图像由 [Museum] 提供”）几乎没有成本，也能涵盖采用混合许可证的馆藏。根据内部风格进行遮罩处理或合成时，也应保留署名。

## 与其他技能的关系
- 可与 **no-ai-slop** 和内部图片风格配合使用：真实的博物馆艺术品是获取富有感染力图像时避免粗制滥造 AI 内容的默认选择。
- 与 **editorial-illustrations**（由生成式 AI 制作、以论点为导向的图解）和 **dataviz**（图表）互为补充——前两者负责解释性图形；本技能负责照片、艺术品和氛围图像。
- 在 **blog-publish**、**social-media-kit**、**weekly-ai-slide**、演示文稿和文章工作流的图片选取环节中为其提供素材。

## 参考资料（经验证的各博物馆完整指南）
`references/_synthesis.md`（速查表）+ 每家博物馆对应一个文件（`met.md`、`cleveland.md`、`smk.md`、`rijksmuseum.md`、`nga.md`、`artic.md`、`getty.md`、`smithsonian.md`），其中包含经实际测试的示例 URL、字段映射和注意事项。