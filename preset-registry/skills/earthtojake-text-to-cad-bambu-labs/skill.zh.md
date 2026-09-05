---
name: bambu-labs
description: Dry-run, upload, and cautiously initiate local Bambu Lab print jobs from validated plain `.gcode`, using Bambu LAN FTPS/MQTT handoffs.
---
# Bambu Labs

来源：[earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
使用已安装的本地 skill 文件作为运行时事实来源；仓库链接仅用于溯源和发布审查。

在普通 `.gcode` 文件已经存在并经过验证后，使用此 skill 执行本地网络上的 Bambu Lab 打印交接。此 skill 不会对模型进行切片。

## 安全规则

- 默认生成试运行计划。实际打印机通信需要使用 `--execute`。
- 未使用 `--execute --confirm-start-print` 时，绝不启动打印。
- 暂停和取消控制属于实时打印机请求；默认生成试运行计划。取消打印需要使用 `--execute --confirm-cancel-print`。
- 将用户明确要求打印或启动特定任务视为已获得实时启动授权；不要仅因实体检查而暂停以请求第二次确认。仍需验证 G-code、检查试运行载荷、读取打印机状态，优先执行仅上传而非上传并启动，说明实体检查内容，并在验证、状态或意图不安全或存在歧义时停止。
- 默认不要询问打印机序列号；通过打印机 TLS 证书使用 `serial` 获取，或让 `send` 进行缓存。
- 相比在命令中重复访问码，优先使用工作区根目录下的 `bambu-printers.json`。该文件属于本地配置，应从 Git 中忽略。
- 实时启动前，说明实体检查内容：构建板已清空、打印板/耗材/喷嘴正确、周围环境安全，以及操作员在附近。
- 发布 MQTT 仅表示发送了启动请求。通过打印机状态/UI 和实体观察确认是否已接受。

## CAD Viewer 交接

完成会创建或修改本地 `.3mf` 打印工件的 Bambu 工作后，如果已安装 `$cad-viewer`，必须始终将明确的文件路径交给它。CAD Viewer 无法打开 `.gcode`，因此普通 G-code 工件无需交接。`$cad-viewer` 必须在尚未运行时启动 CAD Viewer，并返回相关已创建或已更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，请报告该情况，不要默默省略交接。

## 工作流

1. 使用 `$gcode` 生成并验证普通 G-code。
   如果未安装切片器，请安装 OrcaSlicer 后重试；不要将缺少切片器视为阻塞条件。在 macOS 上，优先使用 `brew install --cask orcaslicer`。
2. 配置打印机。用户可以在对话中提供 IP/访问码，由 agent 写入 JSON，也可以直接编辑 `bambu-printers.json`。
   对于新的打印机设置或引导请求，先阅读 `references/new-printer-onboarding.md`。引导用户通过特定型号的触摸屏步骤查找 IP 和局域网访问码，并在运行本地启动工作流前明确启用 **Enable LAN Only** 和 **Enable Developer Mode**。

```bash
python scripts/bambu_lan_print.py config set \
  --printer a1-mini \
  --host 192.168.1.34 \
  --access-code 12345678 \
  --model a1-mini \
  --fetch-serial
```

手动 JSON 结构：

```json
{
  "printers": {
    "a1-mini": {
      "host": "192.168.1.34",
      "access_code": "12345678",
      "model": "a1-mini"
    }
  }
}
```

在 A1/A1 Mini 上，在打印机触摸屏的网络/LAN 设置中查找 IP 和 LAN 访问码。出现选项时启用 LAN Only 和 Developer Mode，然后断电重启，再重试本地启动命令。

3. 在执行实际操作前读取状态：

```bash
python scripts/bambu_lan_print.py status \
  --printer a1-mini \
  --push-all \
  --wait-seconds 10
```

4. 对准确的交接过程执行试运行，检查 JSON payload，然后运行仅上传操作。只有上传成功后，才能运行 upload-start。如果用户明确要求打印或启动作业，请在验证、状态检查和上传检查均通过后，继续运行 `upload-start --execute
--confirm-start-print`。如果用户只要求准备、切片、上传或审查，则在启动请求之前停止。

## 交接模式

`--handoff template-project` 是经过真实打印机 LAN 验证的 A1 Mini 路径。它从经过验证的纯 `.gcode` 开始，复制一个已知可用的同型号打印机 `.gcode.3mf` 模板，替换 `Metadata/plate_N.gcode`，写入 plate MD5，将项目上传到 FTPS 根目录，并发布
`print.project_file`，其 `url` 为 `ftp:///<name>.gcode.3mf`。

```bash
python scripts/bambu_lan_print.py send \
  --printer a1-mini \
  --gcode /tmp/job.gcode \
  --handoff template-project \
  --template-project /path/to/same-printer-template.gcode.3mf \
  --action upload-start
```

在审查后，如果用户明确要求打印或启动，则执行以下命令；如果意图不明确，则在获得实体确认后执行：

```bash
python scripts/bambu_lan_print.py send \
  --printer a1-mini \
  --gcode /tmp/job.gcode \
  --handoff template-project \
  --template-project /path/to/same-printer-template.gcode.3mf \
  --action upload-start \
  --execute \
  --confirm-start-print
```

`--handoff plain` 会上传 `cache/<name>.gcode` 并发布
`print.gcode_file`。对于诊断，或已知支持此方式的打印机/固件，可以保留使用。在经过测试的 A1 Mini 上，直接上传纯 G-code 成功，但 `gcode_file` 失败或被忽略，因此不要将其用作 A1 Mini 的实际启动路径。

`--handoff bambox-project` 使用 `bambox` 将纯 `.gcode` 打包，向 FTPS 根目录上传 `.gcode.3mf` 项目，并发布 `print.project_file`。
目前仅对 `p1s-0.4` 搭配 `PLA`、`ASA` 或 `PETG-CF` 启用。
已知但在验证配置文件存在之前保持禁用：`a1-mini-0.4`、`a1-0.4`、
`x1c-0.4` 和 `p1p-0.4`。

## 常用调试命令

获取/缓存序列号：

```bash
python scripts/bambu_lan_print.py serial \
  --printer a1-mini \
  --json
```

修复底层原因后，清除打印机上的过期错误：

```bash
python scripts/bambu_lan_print.py clear-error \
  --printer a1-mini \
  --execute
```

调试打印机是否确认了 MQTT 发布，以及随后立即报告了什么状态时，在 `send` 上使用 `--mqtt-qos 1 --wait-after-publish 10`。

## 打印控制

对于正在运行的打印任务，使用专用的打印控制命令，而不是临时编写 MQTT 片段。这些命令只发布控制请求；它们不会上传文件，也不会启动新作业。执行后读取状态，以确认打印机状态已发生变化。

干运行暂停载荷：

```bash
python scripts/bambu_lan_print.py pause \
  --printer a1-mini
```

执行暂停并收集打印机报告：

```bash
python scripts/bambu_lan_print.py pause \
  --printer a1-mini \
  --execute \
  --mqtt-qos 1 \
  --wait-after-publish 10
```

干运行取消载荷。发送到打印机的 Bambu LAN 命令为 `stop`：

```bash
python scripts/bambu_lan_print.py cancel \
  --printer a1-mini
```

仅当用户明确要求取消/停止打印，或意图不明确时在确认后执行取消：

```bash
python scripts/bambu_lan_print.py cancel \
  --printer a1-mini \
  --execute \
  --confirm-cancel-print \
  --mqtt-qos 1 \
  --wait-after-publish 10
```

## 失败模式

- `gcode_file` 返回 `result: fail`，或打印机保持 `IDLE`：纯 G-code 上传成功，但固件拒绝或忽略了直接本地启动。对于 A1 Mini，请切换到 `template-project`。
- 上传到 `cache/` 下的项目启动后出现 `print_error: 83935248` 或 `0500-C010`：清除错误，将项目交接文件上传到 FTPS 根目录，并使用 `ftp:///<name>.gcode.3mf`。
- `file:///sdcard/cache/...` 或本地 HTTP URL 看似被接受但没有任何启动动作：不要再在此工作流中使用这些 URL 形式。
- Bambu Studio 或 OrcaSlicer 项目导出在 macOS 上崩溃：不要继续重试基于 GUI 的项目导出。使用 OrcaSlicer 处理纯 `.gcode`，然后使用此 skill 进行交接。
- 启用 Developer Mode 后出现过时的 `gcode_state: FAILED` 或 HMS：清除打印机错误，并在重试前重新断电上电。
- FTPS 登录成功但上传失败并出现 `553` 或缺少 `cache/`：在 MQTT 启动前检查打印机存储/SD 卡状态。
- MQTT 状态正常但启动失败：确认序列号、访问代码、Developer Mode/LAN Only 状态，以及准确的交接载荷，然后再重试。

阅读 `references/new-printer-onboarding.md` 了解新打印机设置，
阅读 `references/local-lan-protocol.md` 了解协议详情，并在新打印机首次进行实时操作前阅读
`references/real-printer-checklist.md`。