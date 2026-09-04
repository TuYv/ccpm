---
name: release-codexbar
description: "CodexBar release: versioning, notarization, appcast, Homebrew, post-release bump."
---
# CodexBar Release

用于发布已签名/已公证的 macOS 应用，尤其是带有 Sparkle appcast 和 Homebrew cask 的仓库。

## 开始

1. 除非另有要求，否则在应用仓库中操作。
2. 检查仓库状态、当前版本、最新的 tag/release，以及发布文档/脚本。
3. 确认 `CHANGELOG.md` 内容完整、面向用户、已去重，并为本次发布标注了日期。
4. 优先使用仓库的发布脚本；对于脚本/测试中的小阻碍应打补丁修复，而不是绕过发布流程。
5. 绝不打印密钥材料。1Password 引用和本地密钥路径仅以引用形式保留。
6. 在解析 Peter 拥有的凭据定位器之前，如果 `$release-private` 存在，先加载它。

## 密钥材料

使用 `$one-password` 处理机密信息。`op` 仅在 tmux/持久 shell 中使用；不要执行宽泛的 `env`、`set`、`export -p` 或机密扫描。

已知的 App Store Connect 结构：

- 字段：`private_key_p8`、`key_id`、`issuer_id`
- 三个字段必须来自同一个 1Password 条目；不要与 `~/.profile` 中的过期值混用
- 从 `$release-private` 解析 Peter 拥有的条目引用

已知的 Sparkle 密钥：

- 从 `$release-private` 解析私钥文件
- 以 `SPARKLE_PRIVATE_KEY_FILE` 传入

安全的 env 文件模式：

```text
APP_STORE_CONNECT_API_KEY_P8=<1Password ref from release-private>
APP_STORE_CONNECT_KEY_ID=<1Password ref from release-private>
APP_STORE_CONNECT_ISSUER_ID=<1Password ref from release-private>
SPARKLE_PRIVATE_KEY_FILE=<path from release-private>
```

使用 `op run --account my.1password.com --env-file <file> -- <script>` 运行，然后删除临时 env 文件。

## CodexBar

路径：

- 仓库：`~/Projects/codexbar`
- 发布脚本：`Scripts/release.sh`
- 签名/公证：`Scripts/sign-and-notarize.sh`
- appcast：`Scripts/make_appcast.sh`、`appcast.xml`
- 发布资产：`CodexBar-macos-universal-<version>.zip`、`CodexBar-macos-universal-<version>.dSYM.zip`
- 打包后的应用：`CodexBar.app`
- 版本文件：`version.env`
- 变更日志：`CHANGELOG.md`
- Homebrew tap：`~/Projects/homebrew-tap`
- cask：`~/Projects/homebrew-tap/Casks/codexbar.rb`
- formula：`~/Projects/homebrew-tap/Formula/codexbar.rb`
- CLI 发布工作流：`.github/workflows/release-cli.yml`

正常发布：

```bash
tmux new-session -d -s codexbar-release 'op run --account my.1password.com --env-file /tmp/codexbar-release-op.env -- Scripts/release.sh'
tmux attach -t codexbar-release
```

如果公证失败并报 `401 Unauthenticated`，请使用上述 1Password 条目中的全部三个 App Store Connect 字段重新运行。`~/.profile` 中不匹配的 `key_id` / `issuer_id` 可能导致此问题。

如果小组件元数据生成超时，`CODEXBAR_WIDGET_METADATA_TIMEOUT_SECONDS=600` 是已知可用的下限值。

CodexBar CLI 的 tarball 并非由 `Scripts/release.sh` 本身生成。GitHub release 事件会触发 `.github/workflows/release-cli.yml`，由其构建并上传：

- `CodexBarCLI-v<version>-macos-arm64.tar.gz`
- `CodexBarCLI-v<version>-macos-x86_64.tar.gz`
- `CodexBarCLI-v<version>-linux-aarch64.tar.gz`
- `CodexBarCLI-v<version>-linux-x86_64.tar.gz`
- 对应的 `.sha256` 文件

如果工作流仅在 `update-homebrew-tap` 步骤因 GitHub API 速率限制而失败，CLI 资产可能已经上传完成。请验证资产已上线，然后根据 tarball 校验和手动更新 `Formula/codexbar.rb`。

## 验证

在已发布的完整链路通过检查之前，发布不算完成：

```bash
gh release view v<VERSION> --json tagName,name,isDraft,isPrerelease,url,assets,body
Scripts/check-release-assets.sh v<VERSION>
python3 - <<'PY'
import xml.etree.ElementTree as ET
ns={'sparkle':'http://www.andymatuschak.org/xml-namespaces/sparkle'}
root=ET.parse('appcast.xml').getroot()
item=root.find('channel').find('item')
enc=item.find('enclosure')
print(item.findtext('title'))
print(item.findtext('sparkle:version', namespaces=ns))
print(item.findtext('sparkle:shortVersionString', namespaces=ns))
print(enc.attrib.get('url'))
print(enc.attrib.get('length'))
print(bool(enc.attrib.get('{http://www.andymatuschak.org/xml-namespaces/sparkle}edSignature')))
PY
codesign --verify --deep --strict --verbose=2 CodexBar.app
spctl --assess --type execute --verbose CodexBar.app
```

针对 Homebrew：

```bash
shasum -a 256 CodexBar-macos-universal-<VERSION>.zip
cd /Users/steipete/Projects/homebrew-tap
python3 .github/scripts/update_formula.py --formula codexbar --tag v<VERSION> --repository steipete/CodexBar --artifact-template 'CodexBarCLI-{tag}-{target}.tar.gz' --target-aliases 'darwin_arm64=macos-arm64,darwin_amd64=macos-x86_64,linux_arm64=linux-aarch64,linux_amd64=linux-x86_64'
brew fetch --cask --force --retry codexbar
brew fetch --formula --force --retry steipete/tap/codexbar
```

当应用 zip 资产存在时更新 cask。仅当该版本的独立 CLI tarball 存在时才更新 formula。

Tap 审计可能会因无关的 formulae 而产生大量噪音；请保持证据仅针对该应用的 cask。

## 收尾

1. 通过发布脚本创建/推送 tag 和 GitHub release。
2. 验证 appcast 指向新的 GitHub release 资产，且带有签名和长度。
3. 如果应用 zip 有变更，更新/推送 Homebrew cask。
4. 将应用仓库提升到下一个 patch 版本的 `Unreleased` 状态：
   - `version.env`：下一个 `MARKETING_VERSION`、下一个 `BUILD_NUMBER`
   - `CHANGELOG.md`：顶部为 `## <next> — Unreleased`
5. 提交、推送，然后以 `--ff-only` 方式拉取。
6. 从打包的 bundle 重启本地应用，并验证运行中的 bundle 版本。
7. 检查没有残留的 release/notary/op 临时会话或临时 env 文件。

CodexBar 重启：

```bash
pkill -x CodexBar || pkill -f CodexBar.app || true
cd "$(git rev-parse --show-toplevel)"
open -n CodexBar.app
/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' CodexBar.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' CodexBar.app/Contents/Info.plist
```
