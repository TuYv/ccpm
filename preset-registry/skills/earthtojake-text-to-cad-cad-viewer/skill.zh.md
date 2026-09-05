---
name: cad-viewer
description: Start CAD Viewer and return review links for CAD and robot-description files. Use when visually reviewing `.step`, `.stp`, `.glb`, `.stl`, `.3mf`, `.dxf`, `.urdf`, `.srdf`, or `.sdf` files, especially when handed off from CAD, URDF, SRDF, or SDF generation skills.
---
# CAD Viewer

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
使用已安装的本地 skill 文件作为运行时事实来源；
该仓库链接仅用于来源追溯和发布审查。如果用户要求修改、调试或迭代 CAD Viewer
源代码本身，那属于该仓库的工作，而不是此 skill 的工作范围——此 skill
用于运行 Viewer，而不是编辑它。

使用此 skill 在 CAD Viewer 中打开现有或新生成的 CAD、
机器人描述或 DXF 文件，并返回可实时查看的审查链接。预期输入是一个或多个明确的文件路径。

## 设置

Viewer 是 `cadgen` 的一部分：将此 skill 的 `requirements.txt` 安装到
Python >= 3.11 环境中，`cadgen` 命令会携带服务器和预构建客户端。
运行时无需安装其他内容，也不需要 Node。

```bash
python -m pip install -r requirements.txt
```

`cadgen doctor <this skill's directory>` 可确认已安装的 cadgen 是否与此 skill 发布时所依据的版本匹配。

## 启动 Viewer

启动操作没有条件分支：下面的命令始终会返回一个指向启动目录中实时 Viewer 的 URL。
如果该目录已有一个使用磁盘上相同 Viewer 代码运行的实例（复用键为
realpath(directory) 和一个身份令牌——该令牌由 cadgen 版本与 Viewer 文件的最新 mtime
共同生成，因此升级后的 Viewer 不会返回过时的实例），则返回其 URL
（`"action": "reused"`）；否则从 `3245` 起向上使用第一个空闲端口启动新服务器
（`"action": "started"`）。永远不要选择或推断端口——读取命令打印的 URL。
每个实例只服务一个目录——即它启动时所在的目录——并在进程生命周期内保持不变。
没有用于指定目录的标志：cwd 就是提供服务的目录。

> 基础端口 `3245` 是 `0xCAD`——十六进制中的“CAD”。

```bash
cd /absolute/project/models && cadgen viewer --host 127.0.0.1 --json
```

（`cadgen` 必须是从此 skill 的 `requirements.txt` 安装的版本。如果它不在 `PATH` 中，
使用相同解释器运行 `python -m cadgen.viewer`，效果相同。）

**请谨慎选择启动目录——这决定了一切。** cwd 决定目录目录清单会扫描什么
（项目根目录会把 `node_modules`、`.git` 和构建输出一并纳入），同时也是实例的复用键，
因此从当前所在位置随意启动可能会返回一个服务于其他位置的 Viewer。
应切换到用户认定的模型工作区目录——通常是项目的 `models/` 目录——并从那里启动。
绝不要从此 skill 的目录内部启动：这样服务的是该 skill，而不是模型。

标志：`--json` 会打印机器可读的最后一行 stdout
（`{"url", "port", "action": "started"|"reused"}`）——始终传入该标志，并从其中获取
URL。`--new` 会强制启动新实例，而不是复用现有实例。显式指定 `--port <n>` 时严格执行——
“只能使用此端口，否则失败”——并会禁用复用和滚动分配。
`cadgen viewer --help` 会列出其余选项。

## URL 格式

页面就是裸 origin，`file=` 用于选择所提供根目录中的一个工件：

```text
http://127.0.0.1:3245/?file=gripper/STEP/gear_rack_gripper.step
```

`file=` 值是相对于所服务目录的路径。URL 中不会显示任何目录信息，因此同一个链接在不同实例下指向不同的文件，根目录是服务器的根目录，而不是链接的根目录。

**启动目录是工作区，而不是文件所在的目录。** Viewer 会递归扫描该目录，因此文件浏览器会列出其下的每个模型，用户无需新链接即可切换文件。应从用户认为是其模型工作区的目录启动，通常是项目的 `models/` 目录，或所要求审查文件的最近公共父目录，并将其余路径放入 `file=`。从构件自身的深层目录启动（`cd .../models/gripper/STEP`，`?file=gear_rack_gripper.step`）虽然会打开同一个模型，但会隐藏项目的其余部分，这几乎从来不是用户想要的结果。

端口冲突不需要处理：启动器会自动切换到空闲端口，它打印出的 URL 才是准确的。在沙盒代理环境中，本地绑定失败（例如 `EPERM`/`EACCES`）仍可能发生；请使用所需的权限或提权重新运行。

`cadgen viewer list` 会显示所有正在运行的实例及其所服务的目录；`cadgen viewer stop --port <n>` 会终止其中一个实例。（两者都可以从任意目录运行，只有启动操作依赖 cwd。）
要审查当前根目录之外的目录，只需 `cd` 到该目录并再次启动即可，复用或启动机制会让第二次启动快速且正确。

## 生成工作由 CAD skill 负责；文档在 Viewer 中编译

Viewer 是一个静态可视化工具：它负责渲染已经存在的构件。生成的模型必须先运行其模型脚本构建（参见 CAD skill）；Viewer 不会运行脚本，也不会判断文档是否有脚本。

`.step`/`.stp` 文档在 Viewer 中的状态有四种，仅根据文件字节和存储决定：**未编译**（存储中没有这些字节对应的树，Viewer 会提供编译选项，并在打开时编译）、**编译中 · <phase> n/total**（cadgen 构建池中的任务正在生成一棵树，该树的输出包含此文档，这可以是 Viewer 自己的编译、终端中的 `python model.py`，也可以是父级子构建）、**已渲染**，或**失败**（针对该文档的上一次任务失败，界面会显示错误消息）。编译任务会提交到所有 cadgen door 使用的同一个任务池，因此进度和错误都会作为数据返回。这里不存在“过期 vs 源文件”状态：文档是否落后于脚本是 `cadgen store why` 要回答的问题，而不是 Viewer 的问题。当代理正在执行工作时，无需先运行任何操作：直接使用文件并返回链接即可。

## 链接

- 返回任何链接之前，解析 `<directory>/<file>` 并确认其存在。传入 `.step`/`.stp` 构件本身，无论它是生成的还是导入的。目录会列出构件，并完全按照磁盘上的名称显示：`moonwatch.step` 无论是生成的还是导入的，在标签页、面包屑、目录行和文件选择器中都显示为 `moonwatch.step`。Viewer 不会判断文档是否生成：其状态只存在于构件一侧（未编译 / 编译中 / 已渲染 / 失败），模型脚本不会显示在 UI 的任何位置。生成模型的文档必须已经存在（运行模型脚本）；存储中没有对应树的文档会在打开时根据其字节进行编译。如果解析出的路径不存在，请勿返回该链接；应报告问题并指出正确路径。
- 每个请求的文件返回一个 Viewer URL。
- 启动一次 Viewer，并为本次会话选择一个工作区根目录。每个链接都使用同一个源，以及一个相对于该根目录的 `?file=<path relative to that root>`，因此它们共享同一个可浏览目录。根目录之外的构件需要使用独立的 Viewer，使用该根目录再次启动即可（复用或启动机制具有幂等性）；单靠链接无法访问它。
- 对于仅审查目录的链接，返回不带 `?file=` 的源地址。
- 除非用户要求，否则不要停止现有的 Viewer 服务器。
- 如果 Viewer 启动失败，请报告失败，并继续使用所属 skill 的非 GUI 验证或构件。

## 参考资料

- 当你需要了解支持的文件类型、Viewer 控件或特定于文件的功能详情时，请阅读 `references/viewer-features.md`。