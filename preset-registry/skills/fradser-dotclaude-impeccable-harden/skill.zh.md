---
name: harden
description: Make interfaces production-ready: error handling, empty states, onboarding flows, i18n, text overflow, and edge case management. Use when the user asks to harden, make production-ready, handle edge cases, add error states, design empty states, improve onboarding, or fix overflow and i18n issues.
version: 2.1.1
user-invocable: false
argument-hint: "[target]"
---
增强界面对边界情况、错误、国际化问题以及可能破坏理想化设计的真实使用场景的适应能力。

## 评估加固需求

识别薄弱环节和边界情况：

1. **使用极端输入进行测试**：
   - 非常长的文本（姓名、描述、标题）
   - 非常短的文本（空文本、单个字符）
   - 特殊字符（表情符号、RTL 文本、重音字符）
   - 大数值（数百万、数十亿）
   - 大量项目（1000+ 个列表项、50+ 个选项）
   - 无数据（空状态）

2. **测试错误场景**：
   - 网络故障（离线、网络缓慢、超时）
   - API 错误（400、401、403、404、500）
   - 验证错误
   - 权限错误
   - 速率限制
   - 并发操作

3. **测试国际化**：
   - 较长的翻译文本（德语通常比英语长 30%）
   - RTL 语言（阿拉伯语、希伯来语）
   - 字符集（中文、日文、韩文、表情符号）
   - 日期/时间格式
   - 数字格式（1,000 与 1.000）
   - 货币符号

**关键**：只能处理完美数据的设计还没有达到生产就绪标准。应针对现实情况进行加固。

## 加固维度

系统性地提高韧性：

### 文本溢出与换行

**长文本处理**：
```css
/* Single line with ellipsis */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line with clamp */
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Allow wrapping */
.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

**Flex/Grid 溢出**：
```css
/* Prevent flex items from overflowing */
.flex-item {
  min-width: 0; /* Allow shrinking below content size */
  overflow: hidden;
}

/* Prevent grid items from overflowing */
.grid-item {
  min-width: 0;
  min-height: 0;
}
```

**响应式文本大小**：
- 使用 `clamp()` 实现流式排版
- 设置可读的最小字号（移动端为 14px）
- 测试文本缩放（放大至 200%）
- 确保容器能够随文本扩展

### 国际化 (i18n)

**文本扩展**：
- 为翻译文本预留 30-40% 的空间
- 使用可适应内容的 flexbox/grid
- 使用文本最长的语言进行测试（通常是德语）
- 避免为文本容器设置固定宽度

```jsx
// ❌ Bad: Assumes short English text
<button className="w-24">Submit</button>

// ✅ Good: Adapts to content
<button className="px-4 py-2">Submit</button>
```

**RTL（从右到左）支持**：
```css
/* Use logical properties */
margin-inline-start: 1rem; /* Not margin-left */
padding-inline: 1rem; /* Not padding-left/right */
border-inline-end: 1px solid; /* Not border-right */

/* Or use dir attribute */
[dir="rtl"] .arrow { transform: scaleX(-1); }
```

**字符集支持**：
- 全面使用 UTF-8 编码
- 使用中文/日文/韩文（CJK）字符进行测试
- 使用表情符号进行测试（它们可能占用 2-4 个字节）
- 处理不同的书写系统（拉丁字母、西里尔字母、阿拉伯字母等）

**日期/时间格式化**：
```javascript
// ✅ Use Intl API for proper formatting
new Intl.DateTimeFormat('en-US').format(date); // 1/15/2024
new Intl.DateTimeFormat('de-DE').format(date); // 15.1.2024

new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(1234.56); // $1,234.56
```

**复数形式处理**：
```javascript
// ❌ Bad: Assumes English pluralization
`${count} item${count !== 1 ? 's' : ''}`

// ✅ Good: Use proper i18n library
t('items', { count }) // Handles complex plural rules
```

### 错误处理

**网络错误**：
- 显示清晰的错误消息
- 提供重试按钮
- 解释发生了什么
- 提供离线模式（如适用）
- 处理超时场景

```jsx
// Error states with recovery
{error && (
  <ErrorMessage>
    <p>Failed to load data. {error.message}</p>
    <button onClick={retry}>Try again</button>
  </ErrorMessage>
)}
```

**表单验证错误**：
- 在字段附近显示行内错误
- 提供清晰、具体的消息
- 建议如何修正
- 不要无故阻止提交
- 发生错误时保留用户输入

**API 错误**：
- 根据各状态码进行适当处理
  - 400：显示验证错误
  - 401：重定向到登录页面
  - 403：显示权限错误
  - 404：显示未找到状态
  - 429：显示速率限制消息
  - 500：显示通用错误，并提供支持渠道

**优雅降级**：
- 核心功能在没有 JavaScript 的情况下仍可运行
- 图片具有替代文本
- 渐进增强
- 为不受支持的功能提供回退方案

### 边缘情况与边界条件

**空状态**：
- 列表中没有项目
- 没有搜索结果
- 没有通知
- 没有可显示的数据
- 提供明确的后续操作

**加载状态**：
- 初始加载
- 分页加载
- 刷新
- 显示正在加载的内容（“正在加载你的项目……”）
- 为耗时较长的操作提供时间预估

**大型数据集**：
- 分页或虚拟滚动
- 搜索/筛选功能
- 性能优化
- 不要一次性加载全部 10,000 个项目

**并发操作**：
- 防止重复提交（加载时禁用按钮）
- 处理竞态条件
- 支持回滚的乐观更新
- 冲突解决

**权限状态**：
- 无查看权限
- 无编辑权限
- 只读模式
- 清晰解释原因

**浏览器兼容性**：
- 为现代功能提供 Polyfill
- 为不受支持的 CSS 提供回退方案
- 使用特性检测（而非浏览器检测）
- 在目标浏览器中进行测试

### 新手引导与首次运行体验

可用于生产环境的功能不仅要服务于高级用户，也要适用于首次使用的用户。设计能够帮助新用户获取价值的路径：

**空状态**：每个零数据页面都需要：
- 此处将显示什么（描述或插图）
- 为什么这对用户很重要
- 提供清晰的 CTA，用于创建第一个项目或从模板开始
- 具有视觉吸引力（而不只是带有“暂无项目”文字的空白区域）

需要处理的空状态类型：
- **首次使用**：强调价值，提供模板
- **用户已清空**：简洁处理，便于重新创建
- **无结果**：建议尝试其他查询，并提供清除筛选条件的选项
- **无权限**：解释原因以及如何获取访问权限

**首次运行体验**：尽快让用户抵达“顿悟时刻”。
- 展示，而非讲述——用可运行的示例代替描述
- 渐进式披露——一次教授一项内容，而不是预先展示所有内容
- 让新手引导可选——允许有经验的用户跳过
- 提供智能默认值，将必需的设置降至最低

**功能发现**：在用户需要时介绍功能，而不是预先灌输。
- 在使用位置提供上下文工具提示（简短、可关闭、仅显示一次）
- 为新增或尚未使用的功能添加徽章或指示标记
- 以低调的方式庆祝激活事件（使用轻提示，而不是模态框）

**绝不要**：
- 在用户能够使用产品之前强制进行冗长的新手引导
- 反复显示同一个工具提示（跟踪并尊重用户的关闭操作）
- 在引导式导览期间阻塞整个 UI
- 创建与实际产品脱节的独立教程模式
- 设计只显示“没有项目”而不提供后续操作的空状态

### 输入验证与清理

**客户端验证**：
- 必填字段
- 格式验证（电子邮件、电话号码、URL）
- 长度限制
- 模式匹配
- 自定义验证规则

**服务端验证**（始终执行）：
- 绝不要只信任客户端
- 验证并清理所有输入
- 防范注入攻击
- 速率限制

**约束处理**：
```html
<!-- Set clear constraints -->
<input 
  type="text"
  maxlength="100"
  pattern="[A-Za-z0-9]+"
  required
  aria-describedby="username-hint"
/>
<small id="username-hint">
  Letters and numbers only, up to 100 characters
</small>
```

### 无障碍韧性

**键盘导航**：
- 所有功能均可通过键盘访问
- 合理的 Tab 键顺序
- 模态框中的焦点管理
- 为较长内容提供跳转链接

**屏幕阅读器支持**：
- 正确的 ARIA 标签
- 播报动态变化（实时区域）
- 描述性的替代文本
- 语义化 HTML

**动态效果敏感性**：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**高对比度模式**：
- 在 Windows 高对比度模式下进行测试
- 不要只依赖颜色
- 提供替代性的视觉提示

### 性能韧性

**慢速连接**：
- 渐进式图像加载
- 骨架屏
- 乐观式 UI 更新
- 离线支持（Service Worker）

**内存泄漏**：
- 清理事件监听器
- 取消订阅
- 清除定时器/周期计时器
- 在卸载时中止待处理的请求

**节流与防抖**：
```javascript
// Debounce search input
const debouncedSearch = debounce(handleSearch, 300);

// Throttle scroll handler
const throttledScroll = throttle(handleScroll, 100);
```

## 测试策略

**手动测试**：
- 使用极端数据进行测试（非常长、非常短、为空）
- 使用不同语言进行测试
- 测试离线状态
- 测试慢速连接（限制为 3G）
- 使用屏幕阅读器进行测试
- 测试纯键盘导航
- 在旧版浏览器上进行测试

**自动化测试**：
- 针对边界情况的单元测试
- 针对错误场景的集成测试
- 针对关键路径的 E2E 测试
- 视觉回归测试
- 无障碍测试（axe、WAVE）

**重要提示**：强化健壮性意味着要预料意外情况。真实用户会做出你从未设想过的事情。

**绝不要**：
- 假设输入始终完美（验证所有内容）
- 忽视国际化（面向全球进行设计）
- 使用笼统的错误消息（“发生错误”）
- 忘记离线场景
- 仅信任客户端验证
- 为文本使用固定宽度
- 假设文本长度与英语相同
- 在一个组件发生错误时阻塞整个界面

## 验证加固效果

使用边界情况进行全面测试：

- **长文本**：尝试使用 100 个以上字符的名称
- **Emoji**：在所有文本字段中使用 Emoji
- **RTL**：使用阿拉伯语或希伯来语进行测试
- **CJK**：使用中文、日文或韩文进行测试
- **网络问题**：断开互联网连接，限制连接速度
- **大型数据集**：使用 1000 个以上的条目进行测试
- **并发操作**：快速点击提交 10 次
- **错误**：强制触发 API 错误，测试所有错误状态
- **空数据**：删除所有数据，测试空状态

请记住：你要针对生产环境中的实际情况进行加固，而不是追求演示效果的完美。要预料到用户会输入奇怪的数据、在流程中途断开连接，并以意想不到的方式使用你的产品。请将韧性融入每个组件。