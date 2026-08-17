---
name: image-to-3d-pipeline
description: "Transformez une image 2D en modèle 3D animé prêt pour le web ou le jeu en moins de 30 minutes, en utilisant le workflow Dilum Sanjaya (Hunyuan3D + Mixamo). Use when: **Créer un personnage 3D pour un site web** - Mascotte, avatar, illustration interactive; **Prototyper un asset de jeu** - Character design, props, environnements; **Produire du contenu marketing 3D** - Produits rotatifs, personnages animés; **Convertir des illustrations existantes** - Logo, mascotte, character design → 3D; **Tes..."
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 图像到 3D 流程

> 使用 Dilum Sanjaya 工作流（Hunyuan3D + Mixamo），在不到 30 分钟内将 2D 图像转换为可用于网页或游戏的 3D 动画模型。

## 何时使用此技能

- **为网站创建 3D 角色** - 吉祥物、头像、交互式插图
- **制作游戏资产原型** - 角色设计、道具、环境
- **制作 3D 营销内容** - 旋转产品展示、动画角色
- **转换现有插图** - Logo、吉祥物、角色设计 → 3D
- **快速验证想法** - 在 30 分钟内完成 3D 原型，而不是耗费数天

## 方法论基础

**来源**：Dilum Sanjaya (@DilumSanjaya) - 游戏角色流程（2025-2026）

**核心原则**：“2D 图像就是你的蓝图。Hunyuan3D 生成网格，Mixamo 自动添加骨骼绑定。30 分钟内，你就能获得一个可在 Three.js 或 Unity 中使用的动画角色。”

**为何这很重要**：传统上，将 2D 概念图转换为完成骨骼绑定的 3D 模型需要数天的建模工作。此工作流将时间缩短至不到一小时，同时生成质量足以用于生产的资产。


## Claude 负责什么，由你决定什么

| Claude 负责 | 由你决定 |
|-------------|------------|
| 构建视频工作流 | 最终创意愿景 |
| 建议镜头构图 | 设备选择 |
| 创建分镜模板 | 品牌美学 |
| 生成脚本框架 | 最终批准 |
| 确定技术要求 | 预算分配 |

## 此技能的作用

1. **指导选择 3D 工具** - 根据使用场景选择 Hunyuan3D、Tripo 或 Meshy
2. **构建完整工作流** - 从源图像到导出的模型
3. **优化生成的网格** - 减少多边形、修正纹理
4. **自动完成骨骼绑定** - 为角色配置 Mixamo
5. **准备导出** - 根据目标平台选择 GLB/FBX 格式

## 使用方法

### 将角色设计转换为 3D 动画角色
```
J'ai cette image de personnage [joindre image]. Aide-moi à la convertir en modèle 3D animé avec le skill image-to-3d-pipeline.
```

### 创建可旋转的 3D 产品模型
```
Je veux créer un modèle 3D de mon produit [description] à partir de photos. Guide-moi avec le pipeline image-to-3d.
```

### 制作品牌吉祥物原型
```
Voici le design de notre mascotte [image]. Je veux la transformer en 3D pour notre site web avec des animations idle.
```

## 指令

协助将 2D 图像转换为 3D 时，请遵循以下流程：

### 步骤 1：评估源图像

```
## Analyse de l'Image Source

**Type d'image:**
[ ] Character design / Personnage
[ ] Objet / Produit
[ ] Illustration / Logo
[ ] Photo réelle

**Qualité pour conversion 3D:**
[ ] ✅ Vue frontale claire
[ ] ✅ Fond simple ou transparent
[ ] ✅ Couleurs/textures distinctes
[ ] ✅ Proportions cohérentes
[ ] ⚠️ Détails complexes (peut perdre en conversion)

**Complexité estimée:**
[ ] Simple - Forme géométrique basique
[ ] Moyenne - Personnage ou objet organique
[ ] Complexe - Détails fins, accessoires multiples
```

**要点：**
- 正面视图能获得更好的结果
- 透明/白色背景可简化处理
- 四肢轮廓分明的角色更容易绑定骨骼

---

### 步骤 2：选择转换工具

| 工具 | 优势 | 适用场景 | 局限性 |
|-------|--------|------------|-------------|
| **Hunyuan3D** | 纹理效果最佳、开源 | 角色、细节丰富的物体 | 有时需要清理 |
| **Tripo AI** | 用户体验简单、自动骨骼绑定 | 快速原型 | 可控性较低 |
| **Meshy** | 擅长风格化效果 | 卡通/低多边形资产 | 纹理真实感较弱 |
| **Rodin Gen-1** | 速度快、拓扑结构可直接用于游戏 | 游戏资产 | 保真度较低 |
| **CSM** | 多视图一致性 | 复杂物体 | 速度较慢 |

**按用例推荐：**
- **Web 角色** → Hunyuan3D + Mixamo
- **快速原型** → Tripo AI
- **风格化游戏资产** → Meshy 或 Rodin
- **写实产品** → Hunyuan3D + 后期处理

---

### 步骤 3：转换流程

```
## Pipeline Standard (Hunyuan3D)

### A. Préparation de l'image
1. Supprimer le fond (remove.bg ou outil intégré)
2. Recadrer serré sur le sujet
3. Résolution recommandée: 1024x1024 minimum
4. Sauvegarder en PNG (préserver transparence)

### B. Génération 3D
1. Uploader sur Hunyuan3D (hunyuan3d.tencent.com)
2. Sélectionner mode: "Image to 3D"
3. Paramètres recommandés:
   - Quality: High
   - Texture: Enable
   - Multi-view: Enable (si disponible)
4. Générer et télécharger (GLB ou OBJ)

### C. Validation du mesh
- Ouvrir dans Blender ou viewer en ligne
- Vérifier: topology, textures, scale
- Identifier problèmes: trous, textures manquantes
```

---

### 步骤 4：优化与清理

```
## Checklist Optimisation

### Mesh
[ ] Poly count acceptable (< 50k pour web, < 100k pour jeu)
[ ] Pas de faces inversées
[ ] Pas de vertices orphelins
[ ] Mesh manifold (étanche)

### Textures
[ ] UV map correcte
[ ] Résolution appropriée (1024x1024 ou 2048x2048)
[ ] Pas de stretching visible
[ ] Couleurs fidèles à l'original

### Scale
[ ] Proportions correctes
[ ] Orientation (Y-up ou Z-up selon destination)
[ ] Centré sur origin
```

**清理工具：**
- **Blender**（免费）- Decimate modifier、texture paint
- **Meshlab**（免费）- 自动修复
- **gltf-transform**（CLI）- 针对 Web 优化 GLB

---

### 步骤 5：使用 Mixamo 进行骨骼绑定（仅限角色）

```
## Workflow Mixamo

1. Exporter le mesh en FBX (sans textures embarquées)
2. Uploader sur mixamo.com
3. Positionner les markers:
   - Chin
   - Wrists
   - Elbows
   - Knees
   - Groin
4. Sélectionner "Auto-Rig"
5. Choisir animations:
   - Idle (standing, breathing)
   - Walk
   - Run
   - Autres selon besoin
6. Télécharger en FBX avec skin
```

**推荐用于 Web 的动画：**
- `Idle` - 基础动画
- `Walking` - 用于移动
- `Waving` - 互动
- `Talking` - 用于配音场景

---

### 步骤 6：导出与集成

| 目标平台 | 格式 | 说明 |
|-------------|--------|-------|
| **Three.js / Web** | GLB | 推荐格式，可嵌入纹理 |
| **Unity** | FBX | 原生导入，需配置材质 |
| **Unreal** | FBX | 需要进行骨骼重定向 |
| **React Three Fiber** | GLB | 使用 gltfjsx 生成组件 |

```bash
# Optimisation GLB pour web (gltf-transform)
npx @gltf-transform/cli optimize input.glb output.glb --compress draco
```

**目标大小：**
- 首屏 3D（最先可见的内容）：< 2MB
- 次要资源：< 500KB
- 动画角色：< 5MB

## 示例

### 示例 1：游戏角色 - 角色选择界面

**输入**：角色概念图（卡通风格）

**流程**：
1. Nano Banana → 生成一致的角色设定图
2. Hunyuan3D → 转换为 3D 网格
3. Blender → 快速清理（5 分钟）
4. Mixamo → 自动绑定骨骼 + 待机/选择动画
5. Three.js → 集成悬停旋转效果

**输出**：具有 3 个动画的交互式 3D 角色
**总用时**：约 45 分钟

**基础 Three.js 代码：**
```jsx
import { useGLTF, useAnimations } from '@react-three/drei'

function Character({ url }) {
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    actions['idle']?.play()
  }, [])

  return <primitive object={scene} />
}
```

---

### 示例 2：落地页品牌吉祥物

**输入**：企业吉祥物 2D 插画

**流程**：
1. 清理背景（remove.bg）
2. Hunyuan3D → 生成带纹理的 3D 网格
3. 无需骨骼绑定（静态）
4. 导出优化后的 GLB
5. Spline 或 Three.js → 简单的 CSS/JS 动画（旋转、弹跳）

**输出**：首屏区域中旋转的 3D 吉祥物
**总用时**：约 20 分钟

---

### 示例 3：电商产品 360° 展示

**输入**：4 张产品照片（正面、背面、两侧）

**流程**：
1. CSM → 多视图重建（更适合物体）
2. Blender 清理 → 简化几何体
3. 烘焙高分辨率纹理
4. 导出 GLB
5. model-viewer → 响应式 3D 查看器

**输出**：支持缩放/旋转的交互式 3D 查看器
**总用时**：约 1 小时

**model-viewer 代码：**
```html
<model-viewer
  src="product.glb"
  ar
  auto-rotate
  camera-controls
  shadow-intensity="1"
></model-viewer>
```

## 检查清单与模板

### 转换前检查清单

```
## Image Source
[ ] Résolution suffisante (min 1024x1024)
[ ] Fond transparent ou uniforme
[ ] Sujet bien délimité
[ ] Style cohérent (pas de mix photo/illustration)

## Objectif
[ ] Destination claire (web/jeu/vidéo)
[ ] Poly budget défini
[ ] Animations nécessaires identifiées
[ ] Format d'export choisi
```

### 3D 项目简报模板

```
## Brief Conversion 2D → 3D

**Image source:** [joindre]
**Type:** [ ] Personnage [ ] Objet [ ] Logo [ ] Autre

**Destination finale:**
- Plateforme: _______________
- Interaction: [ ] Statique [ ] Rotation [ ] Animation complète
- Taille max: ___ MB

**Style souhaité:**
- [ ] Fidèle à l'original
- [ ] Stylisé/Low-poly
- [ ] Réaliste

**Animations (si personnage):**
- [ ] Idle
- [ ] Walk
- [ ] Autres: _______________

**Contraintes:**
- _______________
```

## 工具对比矩阵

| 标准 | Hunyuan3D | Tripo AI | Meshy | Rodin | CSM |
|---------|-----------|----------|-------|-------|-----|
| **纹理质量** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **速度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **易用性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **所需清理程度** | 中等 | 低 | 低 | 低 | 中等 |
| **价格** | 免费 | 免费增值 | 免费增值 | 付费 | 免费增值 |
| **最适合** | 角色 | 原型 | 风格化模型 | 游戏 | 多视图 |

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|----------|----------------|----------|
| 网格“炸裂” | 背景不透明 | 上传前移除背景 |
| 纹理缺失 | 导出时未嵌入纹理 | 使用打包纹理重新导出 |
| 绑定失败 | 姿势不是 T-pose | 在使用 Mixamo 前于 Blender 中修改姿势 |
| 文件过大 | 多边形过多 | 使用 Decimate 修改器 |
| 动画卡顿 | FPS 不兼容 | 以 30fps 重新导出 |

## Skill 边界

### 此 Skill 擅长的工作
- 构建视频制作工作流
- 创建故事板框架
- 提出技术方案建议
- 提供创意指导模板

### 此 Skill 无法完成的工作
- 替代专业视频制作
- 直接编辑视频文件
- 作出最终的创意判断
- 保证受众参与度

## 参考资料

### 工具
- [Hunyuan3D](https://hunyuan3d.tencent.com) - 腾讯，免费
- [Tripo AI](https://www.tripo3d.ai) - 免费增值
- [Meshy](https://www.meshy.ai) - 免费增值
- [Mixamo](https://www.mixamo.com) - Adobe，免费
- [gltf-transform](https://gltf-transform.donmccurdy.com) - CLI 优化工具

### 教程
- Dilum Sanjaya：角色转 3D 工作流（X/Twitter）
- Three.js 基础：加载 3D 模型
- React Three Fiber：useGLTF 文档

### 研究
- `docs/research-ai-design-workflows-2026-01.md` - 深度研究，包含 75+ 个来源

## 相关 Skill

- `character-design-ai/` - 生成一致的角色图像（作为此 Skill 的输入）
- `vibe-coding-design/` - 快速迭代方法
- `ai-ui-generation/` - 将 3D 集成到生成的界面中

---

*Skill 版本：1.0*
*最后更新：2026-01-28*
*类别：ai-design*