---
name: ios-simulator-skill
version: 1.5.0
description: 29 production-ready scripts for iOS app testing, building, and automation. Provides semantic UI navigation, build automation, accessibility testing, and simulator lifecycle management. Optimized for AI agents with minimal token output.
---
# iOS 模拟器技能

使用由辅助功能驱动的导航和结构化数据（而非像素坐标）来构建、测试和自动化 iOS 应用程序。

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

所有脚本都支持使用 `--help` 查看详细选项，并支持使用 `--json` 获取机器可读的输出。

## 导航策略

**进行导航时，始终优先使用辅助功能树，而不是屏幕截图。** 辅助功能树可提供元素类型、标签、边框和点击目标——这种结构化数据比图像分析成本更低，也更可靠。

请按以下优先级使用：
1. `screen_mapper.py` → 结构化元素列表（5-7 行，约 10 个 token）
2. `navigator.py --find-text/--find-type/--find-id` → 语义化交互
3. 屏幕截图 → 仅用于视觉验证、错误报告或视觉差异比较

根据尺寸不同，屏幕截图需要消耗 1,600–6,300 个 token。默认模式下，辅助功能树仅需消耗 10–50 个 token。

## 29 个生产级脚本

### 构建与开发（2 个脚本）

1. **build_and_test.py** - 构建 Xcode 项目、运行测试，并通过渐进式披露解析结果
   - 实时流式传输构建结果
   - 从 xcresult 包中解析错误和警告
   - 按需获取详细的构建日志
   - 选项：`--project`、`--scheme`、`--clean`、`--test`、`--verbose`、`--json`

2. **log_monitor.py** - 具备智能过滤功能的实时日志监控
   - 流式传输日志或按指定时长捕获日志
   - 按严重程度（error/warning/info/debug）过滤
   - 对重复消息进行去重
   - 选项：`--app`、`--severity`、`--follow`、`--duration`、`--output`、`--json`

### 设备状态（2 个脚本）

3. **appearance.py** - 控制模拟器外观：深色模式、动态字体大小以及语言区域/地区
   - 通过 `xcrun simctl ui` 切换浅色/深色主题
   - 使用易记的别名（XS 到 AX5）设置动态字体大小
   - 写入语言区域和地区默认值；可选择通过 `--bundle-id` 重启应用
   - 对 ar/he/fa/ur/yi 语言区域自动标记为 RTL
   - 选项：`--theme`、`--text-size`、`--locale`、`--region`、`--reset`、`--bundle-id`、`--udid`、`--json`、`--verbose`

4. **location.py** - 模拟 GPS 坐标、命名城市预设以及 GPX 场景回放
   - 使用 `--lat`/`--lng` 固定坐标，或使用 `--city` 选择城市
   - 通过 `--gpx <scenario>` 播放内置场景（City Run、Freeway Drive 等）
   - 使用 `--waypoints` 和 `--speed` 以可配置的速度模拟包含多个路径点的路线
   - 使用 `--clear` 清除模拟位置；使用 `--list-scenarios` 列出可用场景
   - 选项：`--lat`、`--lng`、`--city`、`--gpx`、`--waypoints`、`--speed`、`--clear`、`--list-scenarios`、`--udid`、`--json`、`--verbose`

### 导航与交互（5 个脚本）

5. **screen_mapper.py** - 分析当前屏幕并列出交互元素
   - 元素类型明细
   - 可交互按钮列表
   - 文本字段状态
   - 选项：`--verbose`、`--hints`、`--json`

6. **navigator.py** - 以语义方式查找元素并与之交互
   - 按文本查找（模糊匹配）
   - 按元素类型查找
   - 按无障碍 ID 查找
   - 输入文本或点击元素
   - 选项：`--find-text`、`--find-type`、`--find-id`、`--tap`、`--enter-text`、`--json`

7. **gesture.py** - 执行轻扫、滚动、捏合及复杂手势
   - 定向轻扫（上/下/左/右）
   - 多次轻扫滚动
   - 捏合缩放
   - 长按
   - 下拉刷新
   - 选项：`--swipe`、`--scroll`、`--pinch`、`--long-press`、`--refresh`、`--json`

8. **keyboard.py** - 文本输入和硬件按钮控制
   - 输入文本（快速或慢速）
   - 特殊键（回车、删除、制表、空格、方向键）
   - 硬件按钮（主屏幕、锁定、音量、截屏）
   - 组合键
   - 选项：`--type`、`--key`、`--button`、`--slow`、`--clear`、`--dismiss`、`--json`

9. **app_launcher.py** - 应用生命周期管理
   - 按 bundle ID 启动应用
   - 终止应用
   - 从 .app 包安装应用或卸载应用
   - 深度链接导航
   - 列出已安装的应用
   - 检查应用状态
   - 在启动/重启应用时传递启动参数（`--args`）和环境变量（`--env KEY=VALUE`，以 `SIMCTL_CHILD_*` 的形式注入）
   - 选项：`--launch`、`--terminate`、`--restart`、`--install`、`--uninstall`、`--open-url`、`--list`、`--state`、`--args`、`--env`、`--wait-for-debugger`

### 测试与分析（9 个脚本）

10. **accessibility_audit.py** - 检查当前屏幕是否符合 WCAG 标准
    - 严重问题（缺少标签、空按钮、无替代文本）
    - 警告（缺少提示、触控目标过小）
    - 信息（缺少 ID、嵌套过深）
    - 选项：`--verbose`、`--output`、`--json`

11. **visual_diff.py** - 比较两张截屏的视觉变化
    - 逐像素比较
    - 基于阈值判定通过/失败
    - 生成差异图像
    - 选项：`--threshold`、`--output`、`--details`、`--json`

12. **test_recorder.py** - 自动记录测试执行过程
    - 捕获每个步骤的截屏和无障碍树
    - 生成包含计时数据的 Markdown 报告
    - 选项：`--test-name`、`--output`、`--verbose`、`--json`

13. **app_state_capture.py** - 创建全面的调试快照
    - 截屏、UI 层次结构、应用日志、设备信息
    - 用于错误报告的 Markdown 摘要
    - 选项：`--app-bundle-id`、`--output`、`--log-lines`、`--json`

14. **sim_health_check.sh** - 验证环境是否已正确配置
    - 检查 macOS、Xcode、simctl、IDB、Python
    - 列出可用及已启动的模拟器
    - 验证 Python 包（Pillow）

15. **model_inspector.py** - 检查项目文件中的 Core Data 和 SwiftData 模型
    - 解析 .xcdatamodeld 包（实体、属性、关系）
    - 检测模型版本和当前活动版本
    - 尽力提取 SwiftData @Model 类
    - 按需获取任意模型的原始源代码转储（`--raw ModelName`）
    - 选项：`--project-path`、`--core-data-only`、`--swiftdata-only`、`--show-versions`、`--raw`、`--verbose`、`--json`

16. **container.py** - 检查应用沙盒：文件、UserDefaults 和 Core Data 存储路径
    - 通过 `--ls` 以可配置的深度列出数据容器文件
    - 通过 `--cat` 读取文件，并自动检测和解码 plist（大文件会被缓存）
    - 通过 `--userdefaults` 将 UserDefaults 转储为 key=value 或 JSON
    - 通过 `--core-data-path` 定位 `.sqlite` / `.sqlite-wal` / `.sqlite-shm` 存储
    - 通过 `--export` 导出完整的容器快照
    - 选项：`--ls`、`--cat`、`--userdefaults`、`--core-data-path`、`--export`、`--udid`、`--json`、`--verbose`

17. **hang_watcher.py** (HangBuster) - 记录并汇总 os_log 卡顿事件，支持渐进式披露
    - **会话模式（HangBuster，面向智能体）：**启动分离式记录器，与模拟器交互，然后停止记录并获得严格控制 token 数量的摘要
      - `--start` → 返回会话 ID；分离式工作进程会实时对事件进行规范化和阈值处理
      - `--stop SESSION_ID` → 输出约 80–120 个 token 的 L1 摘要（标头 + 排名前 N 的聚类 + 深入查看提示）
      - `--get-details SESSION_ID [--cluster N | --raw]` → L2 完整聚类或 L3 单事件详情
      - `--list-sessions` / `--clear-sessions [--older-than 24h]` / `--diff A B`（跨会话回归报告）
      - 过滤流水线：解析 → 规范化 → 阈值处理 → 分桶 → 聚类 → 聚合 → 排序 → 格式化（位于 `common/hang_pipeline.py`）
      - `--budget-tokens N` 选择可容纳的最高密度级别（L0/L1/L2）；`--terse` 强制使用 L0
      - `--auto-sample` 在每个聚类首次出现事件时捕获主线程堆栈（软依赖：`main_thread_sampler.py` #62；缺失时会妥善跳过，不执行任何操作）
    - **原始捕获模式（为使用 `jq` 探索保留完整保真度）：**跳过聚类流水线，将每条匹配的日志行逐字转储到 `raw.ndjson`
      - `--start --raw-capture [--max-size-mb 10] [--no-gzip]` — 启动 `log stream --style ndjson`
      - 每个会话的大小上限（`--max-size-mb`，默认值为 10）— 达到上限时工作进程会正常停止；`extras.truncated=true`
      - `--stop` 使用 gzip 压缩 `raw.ndjson` → `raw.ndjson.gz`（压缩率约为 15–19 倍；可通过 `--no-gzip` 禁用）
      - 对原始会话执行 `--get-details SESSION_ID` 时，会输出文件路径，并附带 `zcat | jq ...` 提示
    - **韧性（流终止时自动重启）：**EOF 或子进程终止会触发 `stream_died` 事件，随后以 2 秒退避时间进行有上限的重启。达到 `IOS_SIM_HANG_MAX_RESTARTS`（默认值为 3）后，会话将被标记为 `crashed`，绝不会停留在陈旧的 `running` 状态。`--list-sessions` 会显示 `capture=Xs` 和 `restarts=N`。
    - **自动清理：**每次执行 `--start` 时，都会运行 TTL 清理（`IOS_SIM_HANG_SESSION_TTL_HOURS`，默认值为 24h）和总量上限清理（`IOS_SIM_HANG_TOTAL_CAP_MB`，默认值为 100 MB，优先淘汰最早的数据）。
    - **旧版模式（保持不变以向后兼容）：**`--watch [--duration N]`（实时流）和 `--since 5m`（历史记录）
    - 过滤器：`--bundle-id`（解析后过滤——卡顿捕获仍覆盖整个模拟器，因此会保留 RunningBoard/SpringBoard 事件）、`--predicate`（也可通过 `IOS_SIM_HANG_PREDICATE` 设置）
    - 所有输出均支持 `--json`；会话存储在 `~/.ios-simulator-skill/sessions/<id>/{meta.json,events.jsonl,summary.json,raw.ndjson.gz}`

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

18. **localization_audit.py** - 检测字符串目录缺口、缺失的键和占位符不匹配
    - 按区域设置报告 `.xcstrings` 目录中缺失的键以及 `needs_review`/`new` 键
    - 通过 `--source` 将目录键与 Swift 源代码（`String(localized:)` / `NSLocalizedString`）交叉核对
    - 标记不同区域设置之间的占位符数量不匹配（`%d`、`%@`、`%s`、`%lld`）
    - 通过 `plistlib` 支持旧版 `.strings` 和 `.stringsdict`
    - 适用于 CI 的 `--strict` 会在发现任何问题时以状态码 2 退出
    - 选项：`--catalog`、`--source`、`--locale`、`--strict`、`--json`、`--verbose`

### 高级测试与权限（4 个脚本）

19. **clipboard.py** - 管理模拟器剪贴板以进行粘贴测试
    - 将文本复制到剪贴板
    - 无需手动输入即可测试粘贴流程
    - 选项：`--copy`、`--test-name`、`--expected`、`--json`

20. **status_bar.py** - 覆盖模拟器状态栏外观
    - 预设：clean（9:41，电量 100%）、testing（11:11，电量 50%）、low-battery（电量 20%）、airplane（离线）
    - 自定义时间、网络、电池和 WiFi 设置
    - 选项：`--preset`、`--time`、`--data-network`、`--battery-level`、`--clear`、`--json`

21. **push_notification.py** - 发送模拟推送通知
    - 简单模式（标题 + 正文 + 角标）
    - 自定义 JSON 负载
    - 测试通知处理和深层链接
    - 选项：`--bundle-id`、`--title`、`--body`、`--badge`、`--payload`、`--json`

22. **privacy_manager.py** - 授予、撤销和重置应用权限
    - 支持 13 种服务（相机、麦克风、位置、联系人、照片、日历、健康等）
    - 批量操作（以逗号分隔的服务）
    - 带测试场景跟踪的审计记录
    - 选项：`--bundle-id`、`--grant`、`--revoke`、`--reset`、`--list`、`--json`

### 模拟器发现（2 个脚本）

23. **sim_list.py** - 以渐进式披露方式列出模拟器
    - 默认提供简明摘要（总数 / 可用数 / 已启动数）
    - 可通过缓存 ID 按需获取完整详情
    - 按设备类型筛选
    - 使用 `--suggest` 推荐合适的模拟器
    - 与原始 `simctl list` 相比，令牌用量减少 96%（57k → 2k 个令牌）
    - 选项：`--get-details`、`--suggest`、`--device-type`、`--json`

24. **simulator_selector.py** - 为任务推荐最佳模拟器
    - 根据最近使用情况（来自 `config.json`）、最新 iOS、常用测试机型和启动状态对候选项进行排名
    - 使用 `--list` 列出所有可用模拟器
    - 使用 `--boot` 直接启动选定的模拟器
    - 提供 JSON 输出以供程序使用
    - 选项：`--suggest`、`--list`、`--boot`、`--json`

### 设备生命周期管理（5 个脚本）

25. **simctl_boot.py** - 启动模拟器，并可选择验证是否就绪
    - 按 UDID 或设备名称启动
    - 等待设备就绪，并支持设置超时时间
    - 批量启动操作（--all、--type）
    - 性能计时
    - 选项：`--udid`、`--name`、`--wait-ready`、`--timeout`、`--all`、`--type`、`--json`

26. **simctl_shutdown.py** - 正常关闭模拟器
    - 按 UDID 或设备名称关闭
    - 可选择验证关闭是否完成
    - 批量关闭操作
    - 选项：`--udid`、`--name`、`--verify`、`--timeout`、`--all`、`--type`、`--json`

27. **simctl_create.py** - 动态创建模拟器
    - 按设备类型和 iOS 版本创建
    - 列出可用的设备类型和运行时
    - 自定义设备名称
    - 返回 UDID，以便集成到 CI/CD
    - 选项：`--device`、`--runtime`、`--name`、`--list-devices`、`--list-runtimes`、`--json`

28. **simctl_delete.py** - 永久删除模拟器
    - 按 UDID 或设备名称删除
    - 默认要求安全确认（可使用 --yes 跳过）
    - 批量删除操作
    - 智能删除（使用 --old N 为每种设备类型保留 N 个模拟器）
    - 选项：`--udid`、`--name`、`--yes`、`--all`、`--type`、`--old`、`--json`

29. **simctl_erase.py** - 在不删除模拟器的情况下恢复出厂设置
    - 保留设备 UUID（比删除后重新创建更快）
    - 擦除所有模拟器、指定类型的模拟器或已启动的模拟器
    - 可选择进行验证
    - 选项：`--udid`、`--name`、`--verify`、`--timeout`、`--all`、`--type`、`--booted`、`--json`

## 常见模式

**自动检测 UDID**：如果未提供 --udid，大多数脚本会自动检测已启动的模拟器。

**设备名称解析**：使用设备名称（例如 "iPhone 16 Pro"）代替 UDID——脚本会自动解析。

**批量操作**：许多脚本支持使用 `--all` 选择所有模拟器，或使用 `--type iPhone` 按设备类型筛选。

**输出格式**：默认输出简明易读的内容。在 CI/CD 中，可使用 `--json` 获取机器可读的输出。

**帮助**：所有脚本都支持使用 `--help` 查看详细选项和示例。

**截图尺寸**：截图会经过缩放以节省令牌。预设：`full`（3-4 个图块，约 5K 个令牌）、`half`（1 个图块，约 1.6K 个令牌，默认）、`quarter`（1 个图块，约 800 个令牌，细节较少）。快速视觉检查时使用 `quarter`，需要清晰可读的 UI 时使用 `half`，仅在像素级细节很重要时使用 `full`。用于捕获截图的脚本（`app_state_capture.py`、`test_recorder.py`）默认使用 `half`。

## 典型工作流程

1. 验证环境：`bash scripts/sim_health_check.sh`
2. 启动应用：`python scripts/app_launcher.py --launch com.example.app`
3. 分析屏幕：`python scripts/screen_mapper.py`
4. 执行交互：`python scripts/navigator.py --find-text "Button" --tap`
5. 验证：`python scripts/accessibility_audit.py`
6. 必要时调试：`python scripts/app_state_capture.py --app-bundle-id com.example.app`

## 配置

大多数运行限制都可以通过环境变量进行调整。默认值适用于典型的本地开发；对于速度较慢的 CI 运行器、大型单体仓库构建，或复杂屏幕上的无障碍审核，请提高这些值。

| 变量 | 默认值 | 控制项 |
|---|---|---|
| `IOS_SIM_A11Y_LABEL_MAX` | `80` | 无障碍审核输出中保留的 `AXLabel` 最大字符数 |
| `IOS_SIM_A11Y_TOP_ISSUES` | `10` | 每次审核显示的主要无障碍问题数量 |
| `IOS_SIM_APPS_PREVIEW` | `30` | `app_launcher.py` 截断前列出的应用条目数 |
| `IOS_SIM_BOOT_SUBPROCESS_TIMEOUT` | `60` | `simctl boot` 子进程本身的超时时间（秒） |
| `IOS_SIM_BOOT_TIMEOUT` | `300` | 启动后等待就绪的超时时间（秒） |
| `IOS_SIM_BUILD_JSON_CAP` | `50` | JSON 输出中的最大构建错误数／失败测试数 |
| `IOS_SIM_BUILD_LOG_PREVIEW` | `4000` | 默认输出中构建日志预览的字符数 |
| `IOS_SIM_BUILD_TIMEOUT` | `1800` | `xcodebuild build` 调用被终止前可运行的最大秒数 |
| `IOS_SIM_INTROSPECT_TIMEOUT` | `60` | `xcodebuild -list` 和 `simctl list` 查询的超时时间（秒） |
| `IOS_SIM_TEST_TIMEOUT` | `2700` | `xcodebuild test` 调用被终止前可运行的最大秒数 |
| `IOS_SIM_BUILD_SUMMARY_CAP` | `15` | 默认构建摘要中的错误／失败数量 |
| `IOS_SIM_BUILD_VERBOSE_CAP` | `100` | 详细构建输出中的错误／警告数量 |
| `IOS_SIM_CACHE_MAX_ENTRIES` | `500` | 渐进式披露缓存中的最大条目数（LRU 淘汰） |
| `IOS_SIM_CACHE_TTL_HOURS` | `1` | 缓存条目的过期时间 |
| `IOS_SIM_ERASE_TIMEOUT` | `90` | 等待抹除操作完成的超时时间（秒） |
| `IOS_SIM_HANG_PREDICATE` | _(默认)_ | 覆盖 `hang_watcher.py` 使用的 `os_log` 谓词（默认捕获 RunningBoard 终止事件、“Hang detected”以及主线程卡顿）。卡顿事件源自系统守护进程（RunningBoard、SpringBoard），因此该谓词保持模拟器全局作用域——`--bundle-id` 在解析后应用，而不会通过 AND 条件并入谓词。 |
| `IOS_SIM_HANG_MIN_MS` | `250` | HangBuster 阈值——持续时间低于此值的事件不会写入磁盘（值越小越敏感，摘要越大） |
| `IOS_SIM_HANG_SESSION_TTL_HOURS` | `24` | HangBuster 会话的清理期限；每次执行 `--start` 时都会运行清理 |
| `IOS_SIM_HANG_DEFAULT_TOP_N` | `3` | `--stop` L1 输出中的默认前 N 个聚类 |
| `IOS_SIM_HANG_BUDGET_TOKENS` | _(未设置)_ | `--stop` 的默认令牌预算（选择适合预算的 L0/L1/L2） |
| `IOS_SIM_HANG_MAX_RESTARTS` | `3` | HangBuster 工作进程：在 EOF／子进程终止时，`log stream` 的最大重新生成尝试次数；超过后会话将被标记为 `crashed` |
| `IOS_SIM_HANG_TOTAL_CAP_MB` | `100` | HangBuster 的总磁盘容量上限。在执行 `--start` 时，如果会话状态总量超过此值，会优先删除最旧的会话。设置为 `0` 可禁用。 |
| `IOS_SIM_LOG_JSON_CAP` | `100` | `log_monitor.py` JSON 输出中的最大错误／警告数量 |
| `IOS_SIM_LOG_LINE_MAX` | `300` | 日志摘要中每行的截断长度 |
| `IOS_SIM_LOG_TAIL` | `200` | 详细／示例输出中的日志末尾行数 |
| `IOS_SIM_LOG_TEXT_SUMMARY` | `15` | 文本模式日志摘要中显示的错误／警告数量 |
| `IOS_SIM_MAX_ELEMENTS` | `25` | `navigator.py` 列出的可点击元素数量 |
| `IOS_SIM_POLL_INTERVAL` | `0.5` | 启动／抹除状态的轮询间隔（秒） |
| `IOS_SIM_RELAUNCH_DELAY_MS` | `1000` | `app_launcher.py` 中终止应用与重新启动之间的延迟 |
| `IOS_SIM_SCREEN_BUTTONS_PREVIEW` | `15` | `screen_mapper.py` 列出的按钮名称数量 |
| `IOS_SIM_SCREEN_SECTION_ITEMS` | `10` | `screen_mapper.py` 显示的每个分区条目数 |
| `IOS_SIM_STATE_SUBPROCESS_TIMEOUT` | `15` | `app_state_capture.py` 中的子进程超时时间（秒） |
| `IOS_SIM_TAP_SETTLE_MS` | `500` | `navigator.py` 中点击后的稳定等待时间 |

示例：

```bash
# Slow GitHub Actions runner: give boot 10 minutes
IOS_SIM_BOOT_TIMEOUT=600 python scripts/simctl_boot.py --wait-ready
```

## 要求

- macOS 12+
- Xcode Command Line Tools
- Python 3
- IDB（可选，用于交互功能）

## 文档

- **SKILL.md**（本文件）- 脚本参考和快速入门
- **README.md** - 安装和示例
- **CLAUDE.md** - 架构和实现细节
- **references/** - 特定主题的深入文档
- **examples/** - 完整的自动化工作流

## 核心设计原则

**语义导航**：通过含义（文本、类型、ID）而非像素坐标查找元素。即使 UI 发生变化也能正常工作。

**Token 效率**：默认输出简洁（3-5 行），并提供可选的详细模式和 JSON 模式以输出详细结果。

**无障碍优先**：基于标准无障碍 API 构建，确保可靠性和兼容性。

**零配置**：可在任何装有 Xcode 的 macOS 上立即使用，无需设置。

**结构化数据**：脚本输出 JSON 或格式化文本，而非原始日志。便于解析和集成。

**自动学习**：构建系统会记住你的设备偏好。配置按项目存储。

---

你可以直接使用这些脚本，也可以在你的请求与该 Skill 的描述匹配时，让 Claude Code 自动调用它们。