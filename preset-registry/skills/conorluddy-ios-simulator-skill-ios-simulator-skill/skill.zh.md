---
name: ios-simulator-skill
version: 1.5.0
description: 29 production-ready scripts for iOS app testing, building, and automation. Provides semantic UI navigation, build automation, accessibility testing, and simulator lifecycle management. Optimized for AI agents with minimal token output.
---
# iOS Simulator Skill

使用基于可访问性驱动的导航和结构化数据来构建、测试和自动化 iOS 应用，而不是使用像素坐标。

## 快速开始

```bash
# 1. Check environment
bash scripts/sim_health_check.sh

# 2. Launch app
python scripts/app_launcher.py --launch com.example.app

# 3. Map screen to see elements
python scripts/screen_mapper.py

# 4. Tap button
python scripts/navigator.py --find-text "Login" --tap

# 5. Enter text
python scripts/navigator.py --find-type TextField --enter-text "user@example.com"
```

所有脚本都支持 `--help` 以获取详细选项，并支持 `--json` 以输出机器可读的数据。

## 导航策略

**始终优先使用可访问性树，而不是截图进行导航。** 可访问性树会提供元素类型、标签、框架和点击目标等信息，相比图像分析，这种结构化数据成本更低，也更可靠。

请按以下优先级使用：
1. `screen_mapper.py` → 结构化元素列表（5-7 行，约 10 个 token）
2. `navigator.py --find-text/--find-type/--find-id` → 语义化交互
3. 截图 → 仅用于视觉验证、错误报告或视觉差异对比

根据尺寸不同，截图会消耗 1,600–6,300 个 token。默认模式下，可访问性树只消耗 10–50 个 token。

## 29 个生产脚本

### 构建与开发（2 个脚本）

1. **build_and_test.py** - 构建 Xcode 项目、运行测试，并通过渐进式信息展示解析结果
   - 实时流式输出构建信息
   - 从 xcresult bundle 中解析错误和警告
   - 按需获取详细构建日志
   - 选项：`--project`、`--scheme`、`--clean`、`--test`、`--verbose`、`--json`

2. **log_monitor.py** - 实时监控日志并进行智能过滤
   - 流式传输日志或按持续时间捕获日志
   - 按严重级别（error/warning/info/debug）过滤
   - 对重复消息去重
   - 选项：`--app`、`--severity`、`--follow`、`--duration`、`--output`、`--json`

### 设备状态（2 个脚本）

3. **appearance.py** - 控制模拟器外观：深色模式、动态字体大小以及区域设置/地区
   - 通过 `xcrun simctl ui` 切换浅色/深色主题
   - 使用易读的别名（XS 到 AX5）设置动态字体大小
   - 写入区域设置和地区默认值；可选通过 `--bundle-id` 重启应用
   - 对于 ar/he/fa/ur/yi 区域设置自动标记 RTL
   - 选项：`--theme`、`--text-size`、`--locale`、`--region`、`--reset`、`--bundle-id`、`--udid`、`--json`、`--verbose`

4. **location.py** - 模拟 GPS 坐标、命名城市预设和 GPX 场景回放
   - 使用 `--lat`/`--lng` 固定坐标，或使用 `--city` 选择城市
   - 通过 `--gpx <scenario>` 播放内置场景（城市跑步、高速公路驾驶等）
   - 使用 `--waypoints` 和 `--speed`，以可配置的速度沿多个航点的路径移动
   - 使用 `--clear` 清除模拟位置；使用 `--list-scenarios` 列出可用场景
   - 选项：`--lat`、`--lng`、`--city`、`--gpx`、`--waypoints`、`--speed`、`--clear`、`--list-scenarios`、`--udid`、`--json`、`--verbose`

### 导航与交互（5 个脚本）

5. **screen_mapper.py** - 分析当前屏幕并列出可交互元素
   - 元素类型分类
   - 可交互按钮列表
   - 文本字段状态
   - 选项：`--verbose`、`--hints`、`--json`

6. **navigator.py** - 以语义方式查找并与元素交互
   - 按文本查找（模糊匹配）
   - 按元素类型查找
   - 按可访问性 ID 查找
   - 输入文本或点击元素
   - 选项：`--find-text`、`--find-type`、`--find-id`、`--tap`、`--enter-text`、`--json`

7. **gesture.py** - 执行滑动、滚动、捏合和复杂手势
   - 各方向滑动（上/下/左/右）
   - 多次滑动滚动
   - 捏合缩放
   - 长按
   - 下拉刷新
   - 选项：`--swipe`、`--scroll`、`--pinch`、`--long-press`、`--refresh`、`--json`

8. **keyboard.py** - 文本输入和硬件按钮控制
   - 输入文本（快速或慢速）
   - 特殊按键（回车、删除、制表符、空格、方向键）
   - 硬件按钮（主屏幕、锁定、音量、截屏）
   - 按键组合
   - 选项：`--type`、`--key`、`--button`、`--slow`、`--clear`、`--dismiss`、`--json`

9. **app_launcher.py** - 应用生命周期管理
   - 按 bundle ID 启动应用
   - 终止应用
   - 从 .app bundle 安装/卸载
   - 深层链接导航
   - 列出已安装的应用
   - 检查应用状态
   - 传递启动参数（`--args`）和环境变量（`--env KEY=VALUE`，以 `SIMCTL_CHILD_*` 的形式注入），在启动/重启时传递给应用
   - 选项：`--launch`、`--terminate`、`--restart`、`--install`、`--uninstall`、`--open-url`、`--list`、`--state`、`--args`、`--env`、`--wait-for-debugger`

### 测试与分析（9 个脚本）

10. **accessibility_audit.py** - 检查当前屏幕是否符合 WCAG
    - 严重问题（缺少标签、空按钮、没有替代文本）
    - 警告（缺少提示、触控目标过小）
    - 信息（缺少 ID、嵌套层级过深）
    - 选项：`--verbose`、`--output`、`--json`

11. **visual_diff.py** - 比较两张屏幕截图的视觉变化
    - 逐像素比较
    - 基于阈值的通过/失败判定
    - 生成差异图像
    - 选项：`--threshold`、`--output`、`--details`、`--json`

12. **test_recorder.py** - 自动记录测试执行过程
    - 捕获每个步骤的屏幕截图和可访问性树
    - 生成包含计时数据的 Markdown 报告
    - 选项：`--test-name`、`--output`、`--verbose`、`--json`

13. **app_state_capture.py** - 创建全面的调试快照
    - 屏幕截图、UI 层级结构、应用日志、设备信息
    - 为错误报告生成 Markdown 摘要
    - 选项：`--app-bundle-id`、`--output`、`--log-lines`、`--json`

14. **sim_health_check.sh** - 验证环境是否正确配置
    - 检查 macOS、Xcode、simctl、IDB、Python
    - 列出可用的模拟器和已启动的模拟器
    - 验证 Python 软件包（Pillow）

15. **model_inspector.py** - 从项目文件中检查 Core Data 和 SwiftData 模型
    - 解析 .xcdatamodeld 软件包（实体、属性、关系）
    - 检测模型版本和当前活动版本
    - 尽力提取 SwiftData `@Model` 类
    - 按需转储任意模型的原始源代码（`--raw ModelName`）
    - 选项：`--project-path`、`--core-data-only`、`--swiftdata-only`、`--show-versions`、`--raw`、`--verbose`、`--json`

16. **container.py** - 检查应用沙盒：文件、UserDefaults 和 Core Data 存储路径
    - 通过 `--ls` 按可配置深度列出数据容器文件
    - 通过 `--cat` 读取文件，并自动检测 plist 解码方式（大文件会缓存）
    - 通过 `--userdefaults` 以键值对或 JSON 格式导出 UserDefaults
    - 通过 `--core-data-path` 定位 `.sqlite` / `.sqlite-wal` / `.sqlite-shm` 存储文件
    - 通过 `--export` 导出完整容器快照
    - 选项：`--ls`、`--cat`、`--userdefaults`、`--core-data-path`、`--export`、`--udid`、`--json`、`--verbose`

17. **hang_watcher.py** (HangBuster) - 记录并汇总 os_log 卡顿事件，支持渐进式信息披露
    - **会话模式（HangBuster，面向 agent）：** 启动分离式记录器，与模拟器交互，然后停止记录并获取精简摘要
      - `--start` → 返回会话 ID；分离式工作进程会实时规范化事件并应用阈值
      - `--stop SESSION_ID` → 输出约 80–120 个 token 的 L1 摘要（标头 + 前 N 个集群 + 进一步查看提示）
      - `--get-details SESSION_ID [--cluster N | --raw]` → L2 完整集群或 L3 单事件详情
      - `--list-sessions` / `--clear-sessions [--older-than 24h]` / `--diff A B`（跨会话回归报告）
      - 过滤流水线：解析 → 规范化 → 阈值过滤 → 分桶 → 聚类 → 聚合 → 排名 → 格式化（位于 `common/hang_pipeline.py`）
      - `--budget-tokens N` 选择能够容纳的最高密度级别（L0/L1/L2）；`--terse` 强制使用 L0
      - `--auto-sample` 在每个集群的首个事件发生时采集主线程堆栈（软依赖：`main_thread_sampler.py` #62；缺失时优雅地不执行任何操作）
    - **原始捕获模式（供 `jq` 探索的完整保真度）：** 跳过聚类流水线，将每一行匹配的日志逐字转储到 `raw.ndjson`
      - `--start --raw-capture [--max-size-mb 10] [--no-gzip]` — 生成 `log stream --style ndjson` 进程
      - 每个会话都有大小上限（`--max-size-mb`，默认 10）；达到上限时工作进程会正常停止；`extras.truncated=true`
      - `--stop` 将 `raw.ndjson` 压缩为 `raw.ndjson.gz`（压缩率约为 15–19 倍；`--no-gzip` 可选择不压缩）
      - 对原始会话执行 `--get-details SESSION_ID` 时，会打印路径，并附带 `zcat | jq ...` 提示
    - **弹性机制（流中断时自动重启）：** EOF 或子进程退出会触发 `stream_died` 事件，随后经过 2 秒退避后进行有界重启。达到 `IOS_SIM_HANG_MAX_RESTARTS`（默认 3）后，会话会标记为 `crashed`，不会遗留为过期的 `running` 状态。`--list-sessions` 会显示 `capture=Xs` 和 `restarts=N`
    - **自动清理：** 每次执行 `--start` 时都会运行 TTL 清理（`IOS_SIM_HANG_SESSION_TTL_HOURS`，默认 24h）和聚合大小上限清理（`IOS_SIM_HANG_TOTAL_CAP_MB`，默认 100 MB，优先淘汰最旧会话）
    - **旧版模式（为保持向后兼容，行为不变）：** `--watch [--duration N]`（实时流）和 `--since 5m`（历史记录）
    - 过滤器：`--bundle-id`（解析后应用——卡顿捕获仍保持模拟器全局范围，因此会保留 RunningBoard/SpringBoard 事件）、`--predicate`（也可通过 `IOS_SIM_HANG_PREDICATE` 设置）
    - 所有输出均支持 `--json`；会话存储于 `~/.ios-simulator-skill/sessions/<id>/{meta.json,events.jsonl,summary.json,raw.ndjson.gz}`

**快速开始（摘要模式）：**
    ```bash
    SID=$(python scripts/hang_watcher.py --start --min-hang-ms 200)
    # ... interact with the simulator (open sheets, scroll, navigate) ...
    python scripts/hang_watcher.py --stop $SID                  # token-tight L1 summary
    python scripts/hang_watcher.py --get-details $SID --cluster 1  # drill into cluster 1
    python scripts/hang_watcher.py --diff $SID_BASELINE $SID    # cross-session regression
    ```

    **快速开始（原始捕获 + `jq` 探索）：**
    ```bash
    SID=$(python scripts/hang_watcher.py --start --raw-capture --max-size-mb 5)
    # ... interact with the simulator ...
    python scripts/hang_watcher.py --stop $SID
    # → "Session ...: raw mode, 737 lines, 0.96 MB → 0.05 MB gzipped"

    # Top processes by event count:
    zcat ~/.ios-simulator-skill/sessions/$SID/raw.ndjson.gz \
      | jq -s 'group_by(.processImagePath) | map({proc: (.[0].processImagePath | split("/") | last), n: length}) | sort_by(-.n) | .[:5]'

    # All RunningBoard assertion invalidations:
    zcat .../raw.ndjson.gz | jq -c 'select(.subsystem == "com.apple.runningboard" and (.eventMessage | startswith("Invalidating")))'

    # Hangs per minute:
    zcat .../raw.ndjson.gz | jq -r '.timestamp[:16]' | sort | uniq -c
    ```

18. **localization_audit.py** - 检测字符串目录缺口、缺失键和占位符不匹配
    - 报告 `.xcstrings` 目录中每个语言环境缺失的以及处于 `needs_review`/`new` 状态的键
    - 通过 `--source` 将目录键与 Swift 源代码中的 `String(localized:)` / `NSLocalizedString` 进行交叉引用
    - 标记各语言环境之间的占位符数量不匹配（`%d`、`%@`、`%s`、`%lld`）
    - 通过 `plistlib` 支持旧版 `.strings` 和 `.stringsdict`
    - 适用于 CI 的 `--strict`：发现任何问题时退出 2
    - 选项：`--catalog`、`--source`、`--locale`、`--strict`、`--json`、`--verbose`

### 高级测试与权限（4 个脚本）

19. **clipboard.py** - 管理模拟器剪贴板以进行粘贴测试
    - 将文本复制到剪贴板
    - 无需手动输入即可测试粘贴流程
    - 选项：`--copy`、`--test-name`、`--expected`、`--json`

20. **status_bar.py** - 覆盖模拟器状态栏外观
    - 预设：clean（9:41，100% 电量）、testing（11:11，50%）、low-battery（20%）、airplane（离线）
    - 自定义时间、网络、电量和 WiFi 设置
    - 选项：`--preset`、`--time`、`--data-network`、`--battery-level`、`--clear`、`--json`

21. **push_notification.py** - 发送模拟推送通知
    - 简单模式（标题 + 正文 + 徽标）
    - 自定义 JSON 负载
    - 测试通知处理和深层链接
    - 选项：`--bundle-id`、`--title`、`--body`、`--badge`、`--payload`、`--json`

22. **privacy_manager.py** - 授予、撤销和重置应用权限
    - 支持 13 项服务（相机、麦克风、位置、通讯录、照片、日历、健康等）
    - 批量操作（以逗号分隔的服务）
    - 带有测试场景跟踪的审计记录
    - 选项：`--bundle-id`、`--grant`、`--revoke`、`--reset`、`--list`、`--json`

### 模拟器发现（2 个脚本）

23. **sim_list.py** - 以渐进式披露方式列出模拟器
    - 默认提供简洁摘要（总数 / 可用 / 已启动）
    - 通过缓存 ID 按需获取完整详情
    - 按设备类型筛选
    - 使用 `--suggest` 推荐模拟器
    - 相比原始 `simctl list` 减少 96% 的 token（57k → 2k tokens）
    - 选项：`--get-details`、`--suggest`、`--device-type`、`--json`

24. **simulator_selector.py** - 为任务推荐最佳模拟器
    - 根据最近使用情况（来自 `config.json`）、最新 iOS、常用测试机型和启动状态为候选项排序
    - 使用 `--list` 列出所有可用模拟器
    - 使用 `--boot` 直接启动选定的模拟器
    - 支持用于程序化处理的 JSON 输出
    - 选项：`--suggest`、`--list`、`--boot`、`--json`

### 设备生命周期管理（5 个脚本）

25. **simctl_boot.py** - 启动模拟器，可选就绪状态验证
    - 按 UDID 或设备名称启动
    - 等待设备就绪，并支持超时设置
    - 批量启动操作（`--all`、`--type`）
    - 性能计时
    - 选项：`--udid`、`--name`、`--wait-ready`、`--timeout`、`--all`、`--type`、`--json`

26. **simctl_shutdown.py** - 正常关闭模拟器
    - 按 UDID 或设备名称关闭
    - 可选验证关闭是否完成
    - 批量关闭操作
    - 选项：`--udid`、`--name`、`--verify`、`--timeout`、`--all`、`--type`、`--json`

27. **simctl_create.py** - 动态创建模拟器
    - 按设备类型和 iOS 版本创建
    - 列出可用的设备类型和运行时
    - 自定义设备名称
    - 返回 UDID，用于 CI/CD 集成
    - 选项：`--device`、`--runtime`、`--name`、`--list-devices`、`--list-runtimes`、`--json`

28. **simctl_delete.py** - 永久删除模拟器
    - 按 UDID 或设备名称删除
    - 默认进行安全确认（使用 `--yes` 跳过）
    - 批量删除操作
    - 智能删除（使用 `--old N` 为每种设备类型保留 N 个）
    - 选项：`--udid`、`--name`、`--yes`、`--all`、`--type`、`--old`、`--json`

29. **simctl_erase.py** - 将模拟器恢复出厂设置，但不删除模拟器
    - 保留设备 UUID（比删除后重新创建更快）
    - 擦除所有模拟器、指定类型的模拟器或已启动的模拟器
    - 可选验证
    - 选项：`--udid`、`--name`、`--verify`、`--timeout`、`--all`、`--type`、`--booted`、`--json`

## 常见模式

**自动检测 UDID**：如果未提供 `--udid`，大多数脚本会自动检测已启动的模拟器。

**设备名称解析**：使用设备名称（例如 “iPhone 16 Pro”）代替 UDID，脚本会自动解析。

**批量操作**：许多脚本支持使用 `--all` 操作所有模拟器，或使用 `--type iPhone` 按设备类型筛选。

**输出格式**：默认输出简洁、便于人类阅读的内容。使用 `--json` 可在 CI/CD 中生成机器可读的输出。

**帮助**：所有脚本都支持 `--help`，可查看详细选项和示例。

**截图尺寸**：截图会调整大小以节省 token。预设值：`full`（3-4 个图块，约 5K tokens）、`half`（1 个图块，约 1.6K tokens，默认值）、`quarter`（1 个图块，约 800 tokens，细节较少）。捕获截图的脚本（`app_state_capture.py`、`test_recorder.py`）默认使用 `half`。

## 典型工作流

1. 验证环境：`bash scripts/sim_health_check.sh`
2. 启动应用：`python scripts/app_launcher.py --launch com.example.app`
3. 分析屏幕：`python scripts/screen_mapper.py`
4. 交互：`python scripts/navigator.py --find-text "Button" --tap`
5. 验证：`python scripts/accessibility_audit.py`
6. 必要时调试：`python scripts/app_state_capture.py --app-bundle-id com.example.app`

## 配置

大多数运行限制都可以通过环境变量进行调整。默认值适用于典型的本地开发环境；对于运行缓慢的 CI runner、大型 monorepo 构建，或复杂屏幕上的无障碍审计，可以适当提高这些值。

| 变量 | 默认值 | 控制项 |
|---|---|---|
| `IOS_SIM_A11Y_LABEL_MAX` | `80` | 无障碍审计输出中保留的 `AXLabel` 最大字符数 |
| `IOS_SIM_A11Y_TOP_ISSUES` | `10` | 每次审计显示的无障碍问题数量上限 |
| `IOS_SIM_APPS_PREVIEW` | `30` | 截断前由 `app_launcher.py` 列出的应用条目数 |
| `IOS_SIM_BOOT_SUBPROCESS_TIMEOUT` | `60` | `simctl boot` 子进程本身的超时时间（秒） |
| `IOS_SIM_BOOT_TIMEOUT` | `300` | 启动后等待模拟器就绪的超时时间（秒） |
| `IOS_SIM_BUILD_JSON_CAP` | `50` | JSON 输出中的构建错误数 / 失败测试数上限 |
| `IOS_SIM_BUILD_LOG_PREVIEW` | `4000` | 默认输出中构建日志预览的字符数 |
| `IOS_SIM_BUILD_TIMEOUT` | `1800` | `xcodebuild build` 调用被终止前允许的最大秒数 |
| `IOS_SIM_INTROSPECT_TIMEOUT` | `60` | `xcodebuild -list` 和 `simctl list` 查询的超时时间（秒） |
| `IOS_SIM_TEST_TIMEOUT` | `2700` | `xcodebuild test` 调用被终止前允许的最大秒数 |
| `IOS_SIM_BUILD_SUMMARY_CAP` | `15` | 默认构建摘要中的错误/失败数量上限 |
| `IOS_SIM_BUILD_VERBOSE_CAP` | `100` | 详细构建输出中的错误/警告数量上限 |
| `IOS_SIM_CACHE_MAX_ENTRIES` | `500` | 渐进式披露缓存中的最大条目数（采用 LRU 淘汰） |
| `IOS_SIM_CACHE_TTL_HOURS` | `1` | 缓存条目的过期时间 |
| `IOS_SIM_ERASE_TIMEOUT` | `90` | 等待抹除完成的超时时间（秒） |
| `IOS_SIM_HANG_PREDICATE` | _(default)_ | 覆盖 `hang_watcher.py` 使用的 `os_log` 谓词（默认捕获 RunningBoard kill、"Hang detected" 以及主线程卡顿）。卡顿事件源自系统守护进程（RunningBoard、SpringBoard），因此谓词保持模拟器全局范围；`--bundle-id` 会在解析后应用，而不是与谓词进行 AND 运算。 |
| `IOS_SIM_HANG_MIN_MS` | `250` | HangBuster 阈值：低于此持续时间的事件不会写入磁盘（值越小越敏感，摘要也越大） |
| `IOS_SIM_HANG_SESSION_TTL_HOURS` | `24` | HangBuster 会话清理期限；每次执行 `--start` 时都会进行清理 |
| `IOS_SIM_HANG_DEFAULT_TOP_N` | `3` | `--stop` L1 输出中默认显示的前 N 个集群 |
| `IOS_SIM_HANG_BUDGET_TOKENS` | _(unset)_ | `--stop` 的默认 token 预算（选择适合预算的 L0/L1/L2） |
| `IOS_SIM_HANG_MAX_RESTARTS` | `3` | HangBuster worker：在 EOF/子进程退出后允许重新生成 `log stream` 的最大尝试次数，超过后会将会话标记为 `crashed` |
| `IOS_SIM_HANG_TOTAL_CAP_MB` | `100` | HangBuster 聚合磁盘上限。在 `--start` 时，如果会话状态总大小超过此值，将优先删除最早的会话。设置为 `0` 可禁用。 |
| `IOS_SIM_LOG_JSON_CAP` | `100` | `log_monitor.py` JSON 输出中的错误/警告数量上限 |
| `IOS_SIM_LOG_LINE_MAX` | `300` | 日志摘要中每行的截断长度 |
| `IOS_SIM_LOG_TAIL` | `200` | 详细 / 示例输出中的日志尾部行数 |
| `IOS_SIM_LOG_TEXT_SUMMARY` | `15` | 文本模式日志摘要中显示的错误/警告数量 |
| `IOS_SIM_MAX_ELEMENTS` | `25` | `navigator.py` 列出的可点击元素数量 |
| `IOS_SIM_POLL_INTERVAL` | `0.5` | 启动/抹除状态轮询间隔（秒） |
| `IOS_SIM_RELAUNCH_DELAY_MS` | `1000` | `app_launcher.py` 中终止并重新启动之间的延迟 |
| `IOS_SIM_SCREEN_BUTTONS_PREVIEW` | `15` | `screen_mapper.py` 列出的按钮名称数量 |
| `IOS_SIM_SCREEN_SECTION_ITEMS` | `10` | `screen_mapper.py` 每个分区显示的条目数 |
| `IOS_SIM_STATE_SUBPROCESS_TIMEOUT` | `15` | `app_state_capture.py` 中子进程的超时时间（秒） |
| `IOS_SIM_TAP_SETTLE_MS` | `500` | `navigator.py` 点击后的稳定等待延迟 |

示例：

```bash
# Slow GitHub Actions runner: give boot 10 minutes
IOS_SIM_BOOT_TIMEOUT=600 python scripts/simctl_boot.py --wait-ready
```

## 要求

- macOS 15 (Sequoia)+
- Xcode 26+ 和 Command Line Tools
- Python 3.12+
- `idb` **1.5.1+** - 每个交互脚本（tap、swipe、type）都需要：
  `brew tap facebook/fb && brew install facebook/fb/idb-companion facebook/fb/idb-cli`
- Pillow，仅用于视觉差异比较：`pip3 install pillow`

使用 `bash scripts/sim_health_check.sh` 验证（添加 `--json` 以获取结构化输出）。

## 故障排除

**点按、滑动和输入都没有效果，但读取操作正常。** `idb` 报告成功，屏幕却没有任何变化。在 Xcode 27 上，这意味着 `idb-companion` 版本低于 1.5.1：它会在 Xcode 26 使用的路径查找
`SimulatorKit.framework`。请升级：
`brew upgrade facebook/fb/idb-companion`。

**`SimulatorKit is required for HID interactions`。** 原因相同，修复方式也相同。

**每次调用 idb 都出现 `Connection refused` 或 `No such file`。** `idb` 的注册表 `/tmp/idb/state` 中仍然存在一个已失效的 companion，因此 `idb` 会连接到一个无人监听的 socket，而不是启动新的 companion。修复方法：`idb disconnect <udid>`。

**`open -a Simulator` 失败。** Xcode 27 没有 `Simulator.app`；它已被
`Xcode.app/Contents/Applications/` 中的 `DeviceHub.app` 替代。请改为无界面启动：
`xcrun simctl boot <udid>`。请注意，退出 DeviceHub 会关闭它所承载的 simulator。

**`idb: command not found`。** companion 和 CLI 是两个独立的软件包；请同时安装二者
（参见 Requirements）。如果 `which -a idb` 显示多个结果，则由 `PATH` 中排在最前面的版本生效。

## 文档

- **SKILL.md**（此文件）- 脚本参考、要求、故障排除
- **README.md** - 安装、更新 idb、Xcode 27 注意事项
- **CLAUDE.md** - 架构和实现细节

## 核心设计原则

**语义导航**：根据元素的含义（文本、类型、ID）而不是像素坐标查找元素。能够适应 UI 变化。

**Token 效率**：默认输出简洁（3-5 行），并提供可选的详细和 JSON 模式以获取更详细的结果。

**无障碍优先**：基于标准无障碍 API 构建，确保可靠性和兼容性。

**零配置**：在任何安装了 Xcode 的 macOS 上即可立即运行。无需设置。

**结构化数据**：脚本输出 JSON 或格式化文本，而不是原始日志。易于解析和集成。

**自动学习**：构建系统会记住你的设备偏好。配置按项目存储。

---

直接使用这些脚本，或者当你的请求符合该 skill 的描述时，让 Claude Code 自动调用它们。