---
name: ilspy-decompile
description: Understand implementation details of .NET code by decompiling assemblies. Use when you want to see how a .NET API works internally, inspect NuGet package source, view framework implementation, or understand compiled .NET binaries.
allowed-tools: Bash(dnx:*)
---
# 使用 ILSpy 反编译 .NET 程序集

使用此技能可通过反编译已编译的程序集，了解 .NET 代码的内部工作原理。

## 前置条件

- 已安装 .NET SDK
- 可通过以下任一方式使用 ILSpy 命令行工具：
  - `dnx ilspycmd`（如果你的 SDK 或运行时中可用）
  - `dotnet tool install --global ilspycmd`

下文同时展示了这两种形式。请使用适合你环境的方式。

> 注意：不同版本的 ILSpyCmd 选项可能略有差异。  
> 请始终使用 `ilspycmd -h` 确认支持的标志。

## 快速开始

```bash
# Decompile an assembly to stdout
ilspycmd MyLibrary.dll
# or
dnx ilspycmd MyLibrary.dll

# Decompile to an output folder
ilspycmd -o output-folder MyLibrary.dll
```

## 常见的 .NET 程序集位置

### NuGet 包

```bash
~/.nuget/packages/<package-name>/<version>/lib/<tfm>/
```

### .NET 运行时库

```bash
dotnet --list-runtimes
```

### .NET SDK 引用程序集

```bash
dotnet --list-sdks
```

> 引用程序集不包含具体实现。

### 项目构建输出

```bash
./bin/Debug/net8.0/<AssemblyName>.dll
./bin/Release/net8.0/publish/<AssemblyName>.dll
```

## 核心工作流程

1. 确定你想要了解的内容
2. 找到程序集
3. 列出类型
4. 反编译目标

## 命令

### 基本反编译

```bash
ilspycmd MyLibrary.dll
ilspycmd -o ./decompiled MyLibrary.dll
ilspycmd -p -o ./project MyLibrary.dll
```

### 定向反编译

```bash
ilspycmd -t Namespace.ClassName MyLibrary.dll
ilspycmd -lv CSharp12_0 MyLibrary.dll
```

### 查看 IL 代码

```bash
ilspycmd -il MyLibrary.dll
```

## 现代 .NET 构建的注意事项

- ReadyToRun 映像可能会降低可读性
- 经过裁剪或 AOT 编译的构建可能会省略代码
- 优先使用未经裁剪的构建

## 法律声明

反编译程序集可能受到许可证限制。