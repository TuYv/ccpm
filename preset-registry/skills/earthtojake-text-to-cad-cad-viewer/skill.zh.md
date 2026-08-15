---
name: cad-viewer
description: Start CAD Viewer and return review links for explicit CAD, implicit CAD, and robot-description files. Use when visually reviewing `.step`, `.stp`, `.implicit.js`, `.implicit.mjs`, `.glb`, `.stl`, `.3mf`, `.dxf`, `.urdf`, `.srdf`, or `.sdf` files, especially when handed off from CAD, implicit-cad, URDF, SRDF, or SDF generation skills.
---
# CAD Viewer

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。  
请将已安装的本地 skill 文件作为运行时的事实来源；仓库链接仅用于溯源和版本审查。如果用户要求修改、调试或迭代 CAD Viewer 源代码本身，请克隆该仓库并在其中操作——这个已安装的 skill 运行时用于运行 Viewer，并不是编辑它的地方。

使用此 skill 在 CAD Viewer 中打开现有或新生成的 CAD、隐式 CAD、机器人描述或 DXF 文件，并提供实时审查链接。预期输入是一个或多个明确的文件路径。

## 启动 Viewer

使用 `npm run start` 启动一个本地 CAD Viewer。它通过一个固定端口（`3245`）同时提供预构建的 Viewer 包和 CAD API。启动时**不**针对某个目录——目录由 URL 指定，因此一个 Viewer 可以服务任意文件夹。

> 默认端口 `3245` 是 `0xCAD`——即十六进制形式的“CAD”。

从此 skill 目录运行：

```bash
npm --prefix scripts/viewer run start -- --host 127.0.0.1
```

## URL 形式

Viewer URL 的**路径是绝对目录**，与 `file://` URL 中的形式完全相同，而 `file=` 用于选择其中的一个工件：

```text
http://127.0.0.1:3245/absolute/project/models?file=mechanisms/lift_table.step.py
```

**始终使用绝对目录构建路径。** Viewer 从任意工作目录运行——通常是 skill 恰好安装到的目录，而不是模型目录——因此相对路径会基于错误的位置进行解析。`file=` 的值是相对于该目录的路径。

**在 Windows 上，盘符位于路径中 URL 起始斜杠之后**，并使用正斜杠：`D:\project\models` 对应 `http://127.0.0.1:3245/D:/project/models`。启动器已经会输出这种形式；手动构建时也应采用相同方式。

**路径是工作区，而不是文件所在的文件夹。** Viewer 会递归扫描该路径，因此文件浏览器会列出其下的所有模型，用户无需新链接即可切换文件。请选择用户认为是其模型工作区的目录——通常是项目的 `models/` 目录，或要求审查的文件之间最近的公共父目录——并将路径的其余部分放入 `file=`。指定工件自身所在的深层文件夹（`.../models/step/mechanisms?file=lift_table.step.py`）虽然会打开同一个模型，但会隐藏项目的其余部分，而这几乎从来都不是用户想要的结果。

如果端口 `3245` 已被占用，启动器会报错退出，而不会自动切换到其他端口；请使用明确指定的空闲端口 `--port <n>` 重新运行，并使用它输出的 URL。在沙盒化的智能体环境中，可能会出现 `EPERM`/`EACCES` 等本地绑定失败；请使用所需的权限或提权方式重新运行。

添加 `--json` 还可将机器可读的结果作为标准输出的最后一行打印，该行以 `{` 开头（`{"url": ..., "port": ..., "action": "start"}`）。输出的 URL 指向启动目录；替换其路径即可审查其他任意文件夹。

## 链接

- 返回任何链接之前，请解析 `<directory>/<file>` 并确认其存在。对于**生成的**模型，请传入生成器源文件（`<name>.step.py`）——目录本身列出的就是该文件，后端可以直接解析它并按需构建渲染工件，无需存在 `.step` 文件。这也是唯一携带 `params` 辅助文件的形式，因为同名的 `<name>.step.py` 无论如何都会遮蔽 `<name>.step`。对于没有生成器的**导入** STEP，请传入 `.step`/`.stp` 文件本身。如果解析后的路径不存在，请勿返回链接；应报告问题并指出正确路径。
- 为每个请求的文件返回一个 Viewer URL。
- 只启动一次 Viewer，并为会话选择一个工作区根目录。每个链接均由同一个绝对根目录加上 `?file=<path relative to it>` 组成，因此它们共享同一个可浏览目录。仅当某个工件位于第一个根目录之外时，才使用第二个根目录。
- 对于仅审查目录的链接，请返回不带 `?file=` 的目录 URL。
- 除非用户提出要求，否则不要停止现有的 Viewer 服务器。
- 如果 Viewer 启动失败，请报告失败情况，并继续使用所属 skill 的非 GUI 验证或工件。

## 参考资料

- 当你需要了解支持的文件类型、Viewer 控件或特定文件功能的详细信息时，请阅读 `references/viewer-features.md`。
- 仅当用户明确需要可选的 SRDF MoveIt2 逆运动学或路径规划控件时，才阅读 `references/moveit2-server.md`。