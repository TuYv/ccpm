---
name: bambu-labs
description: Dry-run, upload, and cautiously initiate local Bambu Lab print jobs from validated plain `.gcode`, using Bambu LAN FTPS/MQTT handoffs.
---
# Bambu Labs

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请将已安装的本地技能文件作为运行时的事实依据；仓库链接仅用于注明来源和版本审核。

当纯 `.gcode` 文件已经存在并通过验证后，使用此技能在本地网络中向 Bambu Lab 打印机移交打印任务。此技能不对模型进行切片。

## 安全规则

- 默认使用模拟运行计划。向真实打印机发送流量需要使用 `--execute`。
- 绝不要在没有 `--execute --confirm-start-print` 的情况下开始打印。
- 暂停和取消控制会向打印机发送实时请求；默认使用模拟运行计划。取消打印需要使用 `--execute --confirm-cancel-print`。
- 将用户明确要求打印或启动特定任务视为实时启动授权；不要仅仅为了进行物理检查而暂停并要求二次确认。仍然需要验证 G-code、检查模拟运行负载、读取打印机状态、优先选择仅上传而不是上传并启动、说明物理检查事项，并在验证结果、状态或意图不安全或不明确时停止。
- 默认不要询问打印机序列号；使用 `serial` 从打印机 TLS 证书中获取，或让 `send` 缓存该序列号。
- 优先使用工作区根目录中的 `bambu-printers.json`，而不是在命令中重复提供访问码。该文件属于本地配置，应被 Git 忽略。
- 在实时启动之前，说明以下物理检查事项：清空构建板、确认构建板/耗材/喷嘴正确、周围环境安全，并确保操作人员在附近。
- 发布 MQTT 消息仅代表发出启动请求。请通过打印机状态/界面和现场观察来确认请求已被接受。

## CAD Viewer 移交

完成会创建或修改本地 `.3mf` 打印产物的 Bambu 工作后，如果已安装 `$cad-viewer` 技能，则必须始终将明确的文件路径移交给 `$cad-viewer`。CAD Viewer 无法打开 `.gcode`，因此纯 G-code 产物无需移交。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回指向相关新建或已更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，请报告该情况，而不是不作说明地省略移交步骤。

## 工作流

1. 使用 `$gcode` 生成并验证纯 G-code。
   如果未安装切片软件，请安装 OrcaSlicer 后重试；不要将缺少切片软件视为阻碍。在 macOS 上，优先使用 `brew install --cask orcaslicer`。
2. 配置打印机。用户既可以在线程中提供 IP/访问码并让代理写入 JSON，也可以直接编辑 `bambu-printers.json`。
   对于新打印机设置或引导请求，请先阅读
   `references/new-printer-onboarding.md`。引导用户按照特定型号的触摸屏操作步骤查找 IP 和局域网访问码，并在运行本地启动工作流之前明确要求开启
   **启用仅局域网模式**和**启用开发者模式**。

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

在 A1/A1 Mini 上，通过打印机触摸屏的网络/LAN 设置查找 IP 和 LAN 访问代码。如果提供了相关选项，请启用“仅 LAN”和“开发者模式”，然后重新启动电源，再重试本地启动命令。

3. 在实际操作前读取状态：

```bash
python scripts/bambu_lan_print.py status \
  --printer a1-mini \
  --push-all \
  --wait-seconds 10
```

4. 对确切的交接操作进行试运行，检查 JSON 负载，然后执行仅上传。只有上传成功后，才应执行上传并启动。如果用户明确要求打印或启动作业，则在验证、状态和上传检查全部通过后，继续执行 `upload-start --execute
--confirm-start-print`。如果用户仅要求准备、切片、上传或审查，请在发送启动请求之前停止。

## 交接模式

`--handoff template-project` 是通过此仓库的 LAN 调试验证过的 A1 Mini 路径。它从已验证的纯 `.gcode` 开始，复制一个已知可用的同型号打印机 `.gcode.3mf` 模板，替换 `Metadata/plate_N.gcode`，写入打印板 MD5，将项目上传到 FTPS 根目录，并发布带有 `url: ftp:///<name>.gcode.3mf` 的 `print.project_file`。

```bash
python scripts/bambu_lan_print.py send \
  --printer a1-mini \
  --gcode /tmp/job.gcode \
  --handoff template-project \
  --template-project /path/to/same-printer-template.gcode.3mf \
  --action upload-start
```

审查后，如果用户明确要求打印或启动，则执行以下命令；如果用户意图不明确，则在获得现场确认后执行：

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

`--handoff plain` 会上传 `cache/<name>.gcode` 并发布 `print.gcode_file`。将其保留用于诊断，或用于已知可通过此方式工作的打印机/固件。在经过测试的 A1 Mini 上，直接上传纯 G-code 能够成功，但 `gcode_file` 会失败或被忽略，因此不要将其用作 A1 Mini 的实际启动路径。

`--handoff bambox-project` 使用 `bambox` 打包纯 `.gcode`，将 `.gcode.3mf` 项目上传到 FTPS 根目录，并发布 `print.project_file`。目前仅对使用 `PLA`、`ASA` 或 `PETG-CF` 的 `p1s-0.4` 启用。已知但在验证配置文件可用前保持禁用的型号包括：`a1-mini-0.4`、`a1-0.4`、`x1c-0.4` 和 `p1p-0.4`。

## 常用调试命令

获取/缓存序列号：

```bash
python scripts/bambu_lan_print.py serial \
  --printer a1-mini \
  --json
```

修复根本原因后，清除打印机上残留的错误：

```bash
python scripts/bambu_lan_print.py clear-error \
  --printer a1-mini \
  --execute
```

调试打印机是否确认收到 MQTT 发布以及紧接着报告了什么状态时，请在 `send` 上使用 `--mqtt-qos 1 --wait-after-publish 10`。

## 打印控制

对于正在运行的打印任务，请使用专用的打印控制命令，而不是临时拼凑的 MQTT 片段。这些命令只发布控制请求；它们不会上传文件或启动新作业。执行后读取状态，以确认打印机状态已发生变化。

试运行暂停载荷：

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

试运行取消载荷。发送到打印机的 Bambu LAN 命令是 `stop`：

```bash
python scripts/bambu_lan_print.py cancel \
  --printer a1-mini
```

仅当用户明确要求取消/停止打印时，或在意图不明确的情况下经确认后，才执行取消操作：

```bash
python scripts/bambu_lan_print.py cancel \
  --printer a1-mini \
  --execute \
  --confirm-cancel-print \
  --mqtt-qos 1 \
  --wait-after-publish 10
```

## 故障模式

- `gcode_file` 返回 `result: fail` 或打印机一直处于 `IDLE`：普通 G-code 上传成功，但固件拒绝或忽略了直接本地启动。对于 A1 Mini，请切换到 `template-project`。
- 上传到 `cache/` 下的项目启动后失败，并出现 `print_error: 83935248` 或 `0500-C010`：清除错误，将项目交接文件上传到 FTPS 根目录，并使用 `ftp:///<name>.gcode.3mf`。
- `file:///sdcard/cache/...` 或本地 HTTP URL 看似被接受，但没有启动任何任务：此工作流中不要再使用这些 URL 格式。
- Bambu Studio 或 OrcaSlicer 在 macOS 上导出项目时崩溃：不要持续重试由 GUI 支持的项目导出。使用 OrcaSlicer 生成普通 `.gcode`，然后使用此技能进行交接。
- 启用开发者模式后残留旧的 `gcode_state: FAILED` 或 HMS：清除打印机错误并重新通电，然后再重试。
- FTPS 登录成功，但上传失败并出现 `553` 或缺少 `cache/`：在通过 MQTT 启动前，检查打印机存储空间/SD 卡状态。
- MQTT 状态正常，但无法启动：重试前确认序列号、访问码、开发者模式/LAN Only 状态以及确切的交接载荷。

新打印机设置请阅读 `references/new-printer-onboarding.md`，
协议详情请阅读 `references/local-lan-protocol.md`，并在新打印机上首次实际使用前
阅读 `references/real-printer-checklist.md`。