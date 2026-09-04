---
name: makepad-2.0-migration
description: |
  CRITICAL: Use for migrating from Makepad 1.x to 2.0. Triggers on:
  makepad migration, live_design to script_mod, makepad upgrade, makepad 1.x,
  old syntax, new syntax, makepad breaking changes, makepad 迁移, 旧语法,
  LiveHook to ScriptHook, apply_over to script_apply_eval,
  Live to Script, live_design!, angle brackets to curly braces
---
# Makepad 1.x 到 2.0 迁移技能

> **版本：** makepad-widgets（dev 分支） | **最后更新：** 2026-03-03

## 概述

Makepad 2.0 是一次**根本性的架构转变**，从编译期静态 DSL 转向运行时脚本。迁移涉及语法变更、derive 宏更新、生命周期方法重命名以及全新的状态管理模式。

## 文档

详细文档请参考本地文件：
- `./references/migration-guide.md` - 包含示例的完整迁移参考

---

## 快速语法映射表

| Makepad 1.x | Makepad 2.0 | 说明 |
|-------------|-------------|-------|
| `live_design! { ... }` | `script_mod! { ... }` | 核心宏变更 |
| `<Widget> { ... }` | `Widget{ ... }` | 不再使用尖括号 |
| `Key = Value` | `Key: value` | 使用冒号，而非等号 |
| `(THEME_COLOR)` | `theme.color_*` | 主题命名空间 |
| `live_body: { ... }` | `body +: { ... }` | 合并运算符 |
| `#[derive(Live)]` | `#[derive(Script)]` | derive 宏 |
| `#[derive(LiveHook)]` | `#[derive(ScriptHook)]` | 生命周期钩子 |
| `#[derive(Widget)]` | `#[derive(Widget)]` | 不变 |
| `before_apply()` | `on_before_apply()` | 方法重命名 |
| `after_apply()` | `on_after_apply()` | 方法重命名 |
| `apply_over!()` | `script_apply_eval!()` | 运行时更新 |
| `DefaultNone` | `Default` | 枚举默认值 |
| `LiveRegister` | `WidgetRegister` | 控件注册 |
| `live_register()` | `register_widget(vm)` | 注册方法 |
| `LiveId` | `LiveId` | 不变 |

---

## 分步迁移

### 第 1 步：替换宏

```rust
// OLD
live_design! {
    import makepad_widgets::base::*;
    import makepad_widgets::theme_desktop_dark::*;

    App = {{App}} {
        ui: <Root> { ... }
    }
}

// NEW
script_mod! {
    use mod.prelude.widgets.*

    startup() do #(App::script_component(vm)){
        ui: Root{
            // ... UI definition
        }
    }
}
```

### 第 2 步：更新 derive

```rust
// OLD
#[derive(Live, LiveHook, Widget)]
pub struct MyWidget { ... }

// NEW
#[derive(Script, ScriptHook, Widget)]
pub struct MyWidget { ... }
```

### 第 3 步：更新 App::run

```rust
// OLD
impl LiveRegister for App {
    fn live_register(cx: &mut Cx) {
        makepad_widgets::live_design(cx);
    }
}

// NEW
impl App {
    fn run(vm: &mut ScriptVm) -> Self {
        crate::makepad_widgets::script_mod(vm);
        App::from_script_mod(vm, self::script_mod)
    }
}
```

### 第 4 步：重命名生命周期方法

```rust
// OLD
impl LiveHook for MyWidget {
    fn before_apply(&mut self, cx: &mut Cx, ...) { ... }
    fn after_apply(&mut self, cx: &mut Cx, ...) { ... }
}

// NEW
impl ScriptHook for MyWidget {
    fn on_before_apply(&mut self, cx: &mut Cx, ...) { ... }
    fn on_after_apply(&mut self, cx: &mut Cx, ...) { ... }
}
```

### 第 5 步：更新 DSL 语法

```
// OLD - angle brackets, equals signs
<View> {
    width: Fill, height: Fill
    show_bg: true
    draw_bg: { color: (THEME_BG) }

    title = <Label> {
        text: "Hello"
        draw_text: { color: #fff }
    }
}

// NEW - curly braces, colons, theme namespace
View{
    width: Fill height: Fill
    show_bg: true
    draw_bg.color: theme.color_bg_app

    title := Label{
        text: "Hello"
        draw_text.color: #fff
    }
}
```

### 第 6 步：将 apply_over 替换为 script_eval

```rust
// OLD
self.label(id!(title)).apply_over(cx, live! {
    text: "New text"
});

// NEW
script_eval!(cx, {
    ui.title.set_text("New text")
});
// OR
script_apply_eval!(cx, self.ui, {
    title.text: "New text"
});
```

---

## 关键破坏性变更

1. 属性之间**不使用逗号**（以空白字符分隔）
2. Splash 中任何地方都**不使用分号**
3. 控件类型**不使用尖括号**
4. **主题常量**使用 `theme.*` 前缀，而非 `(THEME_*)` 语法
5. **命名子元素**使用 `:=` 运算符，而非 `=`
6. 用于扩展父级属性的**合并运算符**是 `+:`，而非 `:`
7. 容器上必须使用 **`height: Fit`**（默认为 0px，而不是 auto）
8. **注册**发生在 `App::run` 中，而非 `live_register`
9. **字段属性** `#[source]` 用于链接到脚本对象（某些控件必需）
10. 旧的 `old/` **目录**中包含已归档的 1.x 代码，可供参考

---

## 常见迁移错误

| 错误 | 症状 | 修复方法 |
|---------|---------|-----|
| 仍在使用 `live_design!` | 编译错误 | 替换为 `script_mod!` |
| 使用 `<Widget>` 语法 | 解析错误 | 使用 `Widget{}` |
| 使用 `Key = Value` | 属性未生效 | 使用 `Key: value` |
| 使用 `(THEME_COLOR)` | 未知 token | 使用 `theme.color_*` |
| 缺少 `height: Fit` | 容器不可见（0px） | 添加 `height: Fit` |
| 使用 `Live` derive | 编译错误 | 使用 `Script` |
| 使用 `before_apply` | 找不到方法 | 使用 `on_before_apply` |
| 属性之间使用逗号 | 解析错误 | 移除逗号 |

---

## 迁移最佳实践

1. **从示例入手** - 研究 `examples/counter` 和 `examples/todo` 以了解 2.0 的模式
2. **一次只迁移一个控件** - 不要试图一次性转换所有内容
3. **查看 old/ 目录** - 对比新旧控件实现
4. **测试 `height: Fit`** - 大多数 UI 不可见的问题都是缺少 height 导致的
5. **使用主题变量** - 将所有硬编码的主题颜色替换为 `theme.*`
6. **添加 `new_batch: true`** - 任何带有 `show_bg` 和文本子元素的 View 都需要它
