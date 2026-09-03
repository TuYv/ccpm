---
name: tw-blazor
description: "Razor file authoring — one @code at the top, markup, optional <style> last. Use when creating or editing .razor files, @code blocks, or in-file <style> tags. CSS placement: tw-blazor-css-strategy. App shell: tw-blazor-layout."
---
# `.razor` 文件顺序

1. 指令（`@namespace`、`@inherits`、`@using`、`@inject`、注释）
2. **一个** `@code { … }` — 若没有代码或仅使用代码隐藏（code-behind）则省略
3. 标记
4. 可选的 `<style>` 放在最后（例外 B — `tw-blazor-css-strategy`）

绝不出现两个 `@code` 块。绝不在标记之后放置 `@code`。绝不将 `<style>` 放在标记上方。

手写的成员放在 `@code` 中。`.razor.cs` 仅用于存放 C# 源生成器和类级别分析器必须看到的特性（`[Page]`、`[Authorize]`、`[CrossSliceReference]`）。`PageSourceGenerator` 不会在 `.razor` 文件上运行。不要将 `[Page]` 放在 `@code` 中，也不要在已有 `[Page]` 的页面上使用 `@page`。

```razor
@namespace TimeWarp.Architecture.Features.Example
@inherits BaseComponent

@code {
  [Parameter] public string? Title { get; set; }
}

<div class="twe-example">@Title</div>

<style>
  @(@"
    .twe-example { color: var(--twe-ink); }
  ")
</style>
```
