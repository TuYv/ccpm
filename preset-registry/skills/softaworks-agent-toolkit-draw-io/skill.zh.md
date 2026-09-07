---
name: draw-io
description: draw.io diagram creation, editing, and review. Use for .drawio XML editing, PNG conversion, layout adjustment, and AWS icon usage.
---
# draw.io 图表技能

## 1. 基本规则

- 仅编辑 `.drawio` 文件
- 不要直接编辑 `.drawio.png` 文件
- 在幻灯片中使用由 pre-commit 钩子自动生成的 `.drawio.png`

## 2. 字体设置

对于在 Quarto 幻灯片中使用的图表，
请在 mxGraphModel 标签中指定 `defaultFontFamily`：

```xml
<mxGraphModel defaultFontFamily="Noto Sans JP" ...>
```

同时，在每个文本元素的 style 属性中显式指定 `fontFamily`：

```xml
style="text;html=1;fontSize=27;fontFamily=Noto Sans JP;"
```

## 3. 转换命令

转换脚本请参见 [scripts/convert-drawio-to-png.sh](scripts/convert-drawio-to-png.sh)。

```sh
# Convert all .drawio files
mise exec -- pre-commit run --all-files

# Convert specific .drawio file
mise exec -- pre-commit run convert-drawio-to-png --files assets/my-diagram.drawio

# Run script directly (using skill's script)
bash ~/.claude/skills/draw-io/scripts/convert-drawio-to-png.sh assets/diagram1.drawio
```

内部使用的命令：

```sh
drawio -x -f png -s 2 -t -o output.drawio.png input.drawio
```

| 选项 | 说明 |
|--------|-------------|
| `-x` | 导出模式 |
| `-f png` | 输出 PNG 格式 |
| `-s 2` | 2 倍缩放（高分辨率） |
| `-t` | 透明背景 |
| `-o` | 输出文件路径 |

## 4. 布局调整

### 4.1. 坐标调整步骤

1. 在文本编辑器中打开 `.drawio` 文件（纯 XML 格式）
2. 找到要调整的元素对应的 `mxCell`（通过 `value` 属性搜索文本）
3. 调整 `mxGeometry` 标签中的坐标
   - `x`：距左侧的位置
   - `y`：距顶部的位置
   - `width`：宽度
   - `height`：高度
4. 运行转换并进行验证

### 4.2. 坐标计算

- 元素中心坐标 = `y + (height / 2)`
- 要对齐多个元素，请计算并匹配中心坐标

## 5. 设计原则

### 5.1. 基本原则

- 清晰：创建简洁、视觉上干净的图表
- 一致性：统一颜色、字体、图标大小、线条粗细
- 准确性：不要为了简化而牺牲准确性

### 5.2. 元素规则

- 为所有元素添加标签
- 使用箭头指示方向
  （相比双向箭头，更推荐使用 2 个单向箭头）
- 使用最新的官方图标
- 添加图例以解释自定义符号

### 5.3. 无障碍性

- 确保足够的颜色对比度
- 除颜色外还应使用图案

### 5.4. 渐进式披露

将复杂系统拆分为分阶段的图表：

| 图表类型 | 用途 |
|--------------|---------|
| 上下文图 | 从外部视角展示系统概览 |
| 系统图 | 主要组件及其关系 |
| 组件图 | 技术细节与集成点 |
| 部署图 | 基础设施配置 |
| 数据流图 | 数据流动与转换 |
| 时序图 | 基于时间序列的交互 |

### 5.5. 元数据

在图表中包含标题、描述、最后更新时间、作者和版本信息。

## 6. 最佳实践

### 6.1. 背景颜色

- 移除 `background="#ffffff"`
- 透明背景可适配各种主题

### 6.2. 字体大小

- 使用 1.5 倍标准字号（约 18px），以保证 PDF 中的可读性

### 6.3. 日文文本宽度

- 每个字符预留 30-40px
- 宽度不足会导致意外的换行

```xml
<!-- For 10-character text, allow 300-400px -->
<mxGeometry x="140" y="60" width="400" height="40" />
```

### 6.4. 箭头放置

- 始终将箭头置于底层（在 XML 中的位置紧随 Title 之后）
- 调整箭头位置，避免与标签重叠
- 箭头起点/终点与标签底边至少保持 20px 的距离

```xml
<!-- Title -->
<mxCell id="title" value="..." .../>

<!-- Arrows (back layer) -->
<mxCell id="arrow1" style="edgeStyle=..." .../>

<!-- Other elements (front layer) -->
<mxCell id="box1" .../>
```

### 6.5. 箭头与文本标签的连接

对于文本元素，exitX/exitY 不生效，因此请使用显式坐标：

```xml
<!-- Good: Explicit coordinates with sourcePoint/targetPoint -->
<mxCell id="arrow" style="..." edge="1" parent="1">
  <mxGeometry relative="1" as="geometry">
    <mxPoint x="1279" y="500" as="sourcePoint"/>
    <mxPoint x="119" y="500" as="targetPoint"/>
    <Array as="points">
      <mxPoint x="1279" y="560"/>
      <mxPoint x="119" y="560"/>
    </Array>
  </mxGeometry>
</mxCell>
```

### 6.6. edgeLabel 偏移调整

通过调整 offset 属性，使箭头标签与箭头保持距离：

```xml
<!-- Place above arrow (negative value to distance) -->
<mxPoint x="0" y="-40" as="offset"/>

<!-- Place below arrow (positive value to distance) -->
<mxPoint x="0" y="40" as="offset"/>
```

### 6.7. 移除不必要的元素

- 移除与上下文无关的装饰性图标
- 示例：如果已有 ECR，则不需要单独的 Docker 图标

### 6.8. 标签与标题

- 仅服务名称：1 行
- 服务名称 + 补充信息：换行显示为 2 行
- 冗余写法（例如 ECR Container Registry）：缩短为 1 行
- 使用 `&lt;br&gt;` 标签换行

### 6.9. 背景框与内部元素放置

在背景框（分组框）内放置元素时，
请确保留有足够的边距。

- 必须做到：内部元素与框边界之间至少保留 30px 的边距
- 必须做到：将圆角（`rounded=1`）和线条宽度考虑在内
- 必须做到：始终通过目视检查 PNG 输出是否存在溢出

坐标计算验证：

```text
Background frame: y=20, height=400 -> range is y=20-420
Internal element top: frame y + 30 or more (e.g., y=50)
Internal element bottom: frame y + height - 30 or less (e.g., up to y=390)
```

错误示例（可能溢出）：

```xml
<!-- Background frame -->
<mxCell id="bg" style="rounded=1;strokeWidth=3;...">
  <mxGeometry x="500" y="20" width="560" height="400" />
</mxCell>
<!-- Text: y=30 is too close to frame top (y=20) -->
<mxCell id="label" value="Title" style="text;...">
  <mxGeometry x="510" y="30" width="540" height="35" />
</mxCell>
```

正确示例（边距充足）：

```xml
<!-- Background frame -->
<mxCell id="bg" style="rounded=1;strokeWidth=3;...">
  <mxGeometry x="500" y="20" width="560" height="430" />
</mxCell>
<!-- Text: y=50 is 30px from frame top (y=20) -->
<mxCell id="label" value="Title" style="text;...">
  <mxGeometry x="510" y="50" width="540" height="35" />
</mxCell>
```

## 7. 参考资料

- [布局指南](references/layout-guidelines.md)
- [AWS 图标](references/aws-icons.md)
- [AWS 图标搜索脚本](scripts/find_aws_icon.py)

AWS 图标搜索示例：

```sh
python ~/.claude/skills/draw-io/scripts/find_aws_icon.py ec2
python ~/.claude/skills/draw-io/scripts/find_aws_icon.py lambda
```

## 8. 检查清单

- [ ] 未设置背景颜色（page="0"）
- [ ] 字体大小合适（建议偏大）
- [ ] 箭头置于底层
- [ ] 箭头与标签无重叠（在 PNG 中验证）
- [ ] 箭头起点/终点与标签保持足够距离（至少 20px）
- [ ] 箭头未穿过方框或图标（在 PNG 中验证）
- [ ] 内部元素未溢出背景框（在 PNG 中验证）
- [ ] 背景框与内部元素之间保留 30px 以上边距
- [ ] AWS 服务名称为官方名称/正确缩写
- [ ] AWS 图标为最新版本（mxgraph.aws4.*）
- [ ] 无残留的不必要元素
- [ ] 已对 PNG 转换结果进行目视验证

## 9. 在 reveal.js 幻灯片中显示图像

在 YAML 头部添加 `auto-stretch: false`：

```yaml
---
title: "Your Presentation"
format:
  revealjs:
    auto-stretch: false
---
```

这样可以确保图像在移动设备上正确显示。
