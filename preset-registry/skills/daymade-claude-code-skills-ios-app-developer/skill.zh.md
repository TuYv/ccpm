---
name: developing-ios-apps
description: Develops iOS/macOS apps with XcodeGen, SwiftUI, and SPM, including Apple Developer signing, notarization, and CI/CD pipelines. Use when building iOS/macOS apps, fixing Xcode build failures, deploying to real devices, or configuring CI/CD signing. Triggers on XcodeGen project.yml, SPM dependency issues, code signing errors (Error -25294, keychain mismatch, adhoc fallback, EMFILE, notarization credential conflict), "Library not loaded @rpath", Electron @electron/osx-sign / @electron/notarize, notarytool, or certificate/provisioning problems.
---
# iOS 应用开发

使用 XcodeGen 和 Swift Package Manager 构建、配置和部署 iOS 应用程序。

## 关键警告

| 问题 | 原因 | 解决方案 |
|-------|-------|----------|
| "Library not loaded: @rpath/Framework" | XcodeGen 不会自动嵌入 SPM 动态框架 | **先在 Xcode GUI 中构建**（不要使用 xcodebuild）。参阅[故障排除](#spm-dynamic-framework-not-embedded) |
| `xcodegen generate` 导致签名配置丢失 | 覆盖项目设置 | 在 `project.yml` 的 target settings 中配置，而不是在全局设置中配置 |
| 命令行签名失败 | 免费 Apple ID 的限制 | 使用 Xcode GUI 或付费开发者账户（每年 99 美元） |
| "Cannot be set when automaticallyAdjustsVideoMirroring is YES" | 在未禁用自动调整的情况下设置 `isVideoMirrored` | 先设置 `automaticallyAdjustsVideoMirroring = false`。参阅[相机](#camera--avfoundation) |
| 尽管有证书，应用仍被签名为 adhoc | `@electron/packager` 默认设置 `continueOnError: true` | 在 osxSign 中设置 `continueOnError: false`。参阅[代码签名](#macos-code-signing--notarization) |
| "Cannot use password credentials, API key credentials..." | 使用 API key 身份验证时将 `teamId` 传递给 `@electron/notarize` | **移除 `teamId`**。`notarytool` 会从 API key 推断团队。参阅[代码签名](#macos-code-signing--notarization) |
| 签名期间出现 EMFILE（嵌入式运行时较大） | `@electron/osx-sign` 会遍历 .app 包中的所有文件 | 在 CI 中添加 `ignore` 过滤器和 `ulimit -n 65536`。参阅[代码签名](#macos-code-signing--notarization) |

## 快速参考

| 任务 | 命令 |
|------|---------|
| 生成项目 | `xcodegen generate` |
| 构建模拟器版本 | `xcodebuild -destination 'platform=iOS Simulator,name=iPhone 17' build` |
| 构建设备版本（付费账户） | `xcodebuild -destination 'platform=iOS,name=DEVICE' -allowProvisioningUpdates build` |
| 清理 DerivedData | `rm -rf ~/Library/Developer/Xcode/DerivedData/PROJECT-*` |
| 查找设备名称 | `xcrun xctrace list devices` |

## XcodeGen 配置

### 最小化 project.yml

```yaml
name: AppName
options:
  bundleIdPrefix: com.company
  deploymentTarget:
    iOS: "16.0"

settings:
  base:
    SWIFT_VERSION: "6.0"

packages:
  SomePackage:
    url: https://github.com/org/repo
    from: "1.0.0"

targets:
  AppName:
    type: application
    platform: iOS
    sources:
      - path: AppName
    settings:
      base:
        INFOPLIST_FILE: AppName/Info.plist
        PRODUCT_BUNDLE_IDENTIFIER: com.company.appname
        CODE_SIGN_STYLE: Automatic
        DEVELOPMENT_TEAM: TEAM_ID_HERE
    dependencies:
      - package: SomePackage
```

### 代码签名配置

**个人（免费）账户**：仅可在 Xcode GUI 中使用。命令行构建需要付费账户。

```yaml
# In target settings
settings:
  base:
    CODE_SIGN_STYLE: Automatic
    DEVELOPMENT_TEAM: TEAM_ID  # Get from Xcode → Settings → Accounts
```

**获取 Team ID**：
```bash
security find-identity -v -p codesigning | head -3
```

## iOS 版本兼容性

### 各版本的 API 变更

| 仅限 iOS 17+ | 兼容 iOS 16 |
|--------------|-------------------|
| `.onChange { old, new in }` | `.onChange { new in }` |
| `ContentUnavailableView` | 自定义 VStack |
| `AVAudioApplication` | `AVAudioSession` |
| `@Observable` 宏 | `@ObservableObject` |
| SwiftData | CoreData/Realm |

### 降低部署目标版本

1. 更新 `project.yml`：
```yaml
deploymentTarget:
  iOS: "16.0"
```

2. 修复不兼容的 API：
```swift
// iOS 17
.onChange(of: value) { oldValue, newValue in }
// iOS 16
.onChange(of: value) { newValue in }

// iOS 17
ContentUnavailableView("Title", systemImage: "icon")
// iOS 16
VStack {
    Image(systemName: "icon").font(.system(size: 48))
    Text("Title").font(.title2.bold())
}

// iOS 17
AVAudioApplication.shared.recordPermission
// iOS 16
AVAudioSession.sharedInstance().recordPermission
```

3. 重新生成：`xcodegen generate`

## 设备部署

### 首次设置

1. 通过 USB 连接设备
2. 在设备上信任电脑
3. 在 Xcode 中：Settings → Accounts → Add Apple ID
4. 在方案下拉菜单中选择设备
5. 运行（`Cmd + R`）
6. 在设备上：Settings → General → VPN & Device Management → Trust

### 命令行构建（需要付费账户）

```bash
xcodebuild \
  -project App.xcodeproj \
  -scheme App \
  -destination 'platform=iOS,name=DeviceName' \
  -allowProvisioningUpdates \
  build
```

### 常见问题

| 错误 | 解决方案 |
|-------|----------|
| "Library not loaded: @rpath/Framework" | SPM 动态框架未嵌入。先在 Xcode GUI 中构建，之后即可使用 CLI |
| "No Account for Team" | 在 Xcode Settings → Accounts 中添加 Apple ID |
| "Provisioning profile not found" | 免费账户的限制。请使用 Xcode GUI 或获取付费账户 |
| 设备未列出 | 重新连接 USB，在设备上信任电脑，然后重启 Xcode |
| 无法删除 DerivedData | 先关闭 Xcode：`pkill -9 Xcode && rm -rf ~/Library/Developer/Xcode/DerivedData/PROJECT-*` |

### 免费与付费开发者账户对比

| 功能 | 免费 Apple ID | 付费（$99/年） |
|---------|---------------|-----------------|
| Xcode GUI 构建 | ✅ | ✅ |
| 命令行构建 | ❌ | ✅ |
| App 有效期 | 7 天 | 1 年 |
| App Store | ❌ | ✅ |
| CI/CD | ❌ | ✅ |

## SPM 依赖项

### SPM 动态框架未嵌入

**根本原因**：XcodeGen 不会为 SPM 动态框架（例如 RealmSwift、Realm）生成“Embed Frameworks”构建阶段。App 可以成功构建，但会在启动时崩溃并显示：

```
dyld: Library not loaded: @rpath/RealmSwift.framework/RealmSwift
  Referenced from: /var/containers/Bundle/Application/.../App.app/App
  Reason: image not found
```

**发生此问题的原因**：
- 静态框架（大多数 SPM 软件包）会被链接到二进制文件中，无需嵌入
- 动态框架（RealmSwift 等）必须复制到 App Bundle 中
- XcodeGen 会为 SPM 软件包生成链接阶段，但不会生成嵌入阶段
- 在 project.yml 中设置 `embed: true` 会导致构建错误（XcodeGen 的限制）

**修复方法**（每个项目手动执行一次）：
1. 在 Xcode GUI 中打开项目
2. 选择 target → General → Frameworks, Libraries
3. 找到动态框架（RealmSwift）
4. 将 "Do Not Embed" 更改为 "Embed & Sign"
5. 首先从 Xcode GUI 构建并运行

**手动修复后**：命令行构建（`xcodebuild`）将可以正常工作，因为 Xcode 会将嵌入设置持久化到 project.pbxproj 中。

**识别动态框架**：
```bash
# Check if a framework is dynamic
file ~/Library/Developer/Xcode/DerivedData/PROJECT-*/Build/Products/Debug-iphoneos/FRAMEWORK.framework/FRAMEWORK
# Dynamic: "Mach-O 64-bit dynamically linked shared library"
# Static: "current ar archive"
```

### 添加软件包

```yaml
packages:
  AudioKit:
    url: https://github.com/AudioKit/AudioKit
    from: "5.6.5"
  RealmSwift:
    url: https://github.com/realm/realm-swift
    from: "10.54.6"

targets:
  App:
    dependencies:
      - package: AudioKit
      - package: RealmSwift
        product: RealmSwift  # Explicit product name when package has multiple
```

### 解析依赖项（中国代理）

```bash
git config --global http.proxy http://127.0.0.1:1082
git config --global https.proxy http://127.0.0.1:1082
xcodebuild -scmProvider system -resolvePackageDependencies
```

**切勿清除全局 SPM 缓存**（`~/Library/Caches/org.swift.swiftpm`）。重新下载速度很慢。

## 相机 / AVFoundation

相机预览需要真机（模拟器没有相机）。

### 快速调试检查清单

1. **权限**：是否已将 `NSCameraUsageDescription` 添加到 Info.plist？
2. **设备**：是否在真机而非模拟器上运行？
3. **会话正在运行**：是否在后台线程调用了 `session.startRunning()`？
4. **视图尺寸**：UIViewRepresentable 是否具有非零边界？
5. **视频镜像**：是否在设置 `isVideoMirrored` 之前禁用了 `automaticallyAdjustsVideoMirroring`？

### 视频镜像（前置摄像头）

**关键**：必须先禁用自动调整，然后再设置手动镜像：

```swift
// WRONG - crashes with "Cannot be set when automaticallyAdjustsVideoMirroring is YES"
connection.isVideoMirrored = true

// CORRECT - disable automatic first
connection.automaticallyAdjustsVideoMirroring = false
connection.isVideoMirrored = true
```

### UIViewRepresentable 尺寸问题

ZStack 中的 UIViewRepresentable 可能具有零边界。可通过显式设置 frame 修复：

```swift
// BAD: UIViewRepresentable may get zero size in ZStack
ZStack {
    CameraPreviewView(session: session)  // May be invisible!
    OtherContent()
}

// GOOD: Explicit sizing
ZStack {
    GeometryReader { geo in
        CameraPreviewView(session: session)
            .frame(width: geo.size.width, height: geo.size.height)
    }
    .ignoresSafeArea()
    OtherContent()
}
```

### 调试日志模式

添加日志以跟踪相机流程：

```swift
import os
private let logger = Logger(subsystem: "com.app", category: "Camera")

func start() async {
    logger.info("start() called, isRunning=\(self.isRunning)")
    // ... setup code ...
    logger.info("session.startRunning() completed")
}

// For CGRect (doesn't conform to CustomStringConvertible)
logger.info("bounds=\(NSCoder.string(for: self.bounds))")
```

在 Console.app 中按 subsystem 筛选。

**有关相机实现的详细信息**：请参阅 [references/camera-avfoundation.md](references/camera-avfoundation.md)

## macOS 代码签名与公证

要在 App Store 之外分发 macOS 应用（Electron 或原生应用），必须进行签名和公证。否则，用户会看到“Apple 无法检查此应用是否包含恶意软件”。

**5 步检查清单：**

| 步骤 | 操作 | 关键细节 |
|------|------|-----------------|
| 1 | 在 Keychain Access 中创建 CSR | Common Name 无关紧要；选择“Saved to disk” |
| 2 | 在 developer.apple.com 申请 **Developer ID Application** 证书 | 选择 **G2 Sub-CA**（不要选择 Previous Sub-CA） |
| 3 | 安装 `.cer` → 必须选择 **`login` keychain** | iCloud/System → Error -25294（私钥不匹配） |
| 4 | 从 `login` keychain 导出带密码的 P12 | Base64：`base64 -i cert.p12 \| pbcopy` |
| 5 | 创建 App Store Connect API Key（Developer 角色） | `.p8` 只能下载一次；记录 Key ID + Issuer ID |

**所需的 GitHub Secrets（5 个 Secret）：**

| Secret | 来源 |
|--------|--------|
| `MACOS_CERT_P12` | 第 4 步中的 base64 |
| `MACOS_CERT_PASSWORD` | 第 4 步中的密码 |
| `APPLE_API_KEY` | 第 5 步中的 `.p8` base64 |
| `APPLE_API_KEY_ID` | 第 5 步中的 Key ID |
| `APPLE_API_ISSUER` | 第 5 步中的 Issuer ID |

> **不需要 `APPLE_TEAM_ID`。** `notarytool` 会根据 API key 推断团队。向 `@electron/notarize` v2.5.0 传递 `teamId` 会导致凭据冲突错误。

**Electron Forge osxSign 关键设置：**

```typescript
osxSign: {
  identity: 'Developer ID Application',
  hardenedRuntime: true,
  entitlements: 'entitlements.mac.plist',
  entitlementsInherit: 'entitlements.mac.plist',
  continueOnError: false,  // CRITICAL: default is true, silently falls back to adhoc
  // Skip non-binary files in large embedded runtimes (prevents EMFILE)
  ignore: (filePath: string) => {
    if (!filePath.includes('python-runtime')) return false;
    if (/\.(so|dylib|node)$/.test(filePath)) return false;
    return true;
  },
  // CI: explicitly specify keychain (apple-actions/import-codesign-certs uses signing_temp.keychain)
  ...(process.env.MACOS_SIGNING_KEYCHAIN
    ? { keychain: process.env.MACOS_SIGNING_KEYCHAIN }
    : {}),
},
```

**快速失败的三层防御：**

1. `@electron/osx-sign`：`continueOnError: false` — 签名错误会立即抛出
2. `postPackage` hook：`codesign --verify --deep --strict` + adhoc 检测
3. Release 触发脚本：在分派前验证本地 HEAD 与远程是否一致

**验证签名：**
```bash
security find-identity -v -p codesigning | grep "Developer ID Application"
```

如需完整的分步指南、entitlements、workflow 示例，以及完整的故障排除说明（包含 7 个真实错误及其根本原因），请参阅：**[references/apple-codesign-notarize.md](references/apple-codesign-notarize.md)**

---

## 资源

- [references/xcodegen-full.md](references/xcodegen-full.md) - 完整的 project.yml 选项
- [references/swiftui-compatibility.md](references/swiftui-compatibility.md) - iOS 版本间的 API 差异
- [references/camera-avfoundation.md](references/camera-avfoundation.md) - 相机预览调试
- [references/testing-mainactor.md](references/testing-mainactor.md) - 测试 @MainActor 类（状态机、回归测试）
- [references/apple-codesign-notarize.md](references/apple-codesign-notarize.md) - 用于 macOS/Electron CI/CD 的 Apple Developer 签名与公证