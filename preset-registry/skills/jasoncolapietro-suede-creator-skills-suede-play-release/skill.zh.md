---
name: suede-play-release
description: "Suede Labs Google Play delivery skill: ship an Android release end to end from the agent interface, without opening the Play Console. Set up credentials, upload an AAB, promote between tracks, stage or complete a rollout, push per-locale release notes, and prove against the Play Developer API what is actually live. One step stays a Console action by design and the skill hands it to you: granting the service account release access the first time. Use when uploading or promoting an Android build, wiring a Play service account and fastlane supply lanes, fixing per-versionCode changelogs, raising or halting a staged rollout, or answering what version and fraction production is really serving. NOT FOR: planning or building the app itself (use android-app-factory); live listing and keyword audits (use suede-aso); CI required checks (use suede-ci-gate); iOS release (a private Suede Labs companion, not in this pack: ios-app-store-release)."
---
# Suede Play 发布

```text
铁律：决定发布了什么的是 Play API，而不是绿色的 fastlane 摘要。
关于线上发布的每一项声明，都必须是回读结果，否则就是猜测。
```

## 第 0 步：在执行任何操作前预检凭据

永远不要假设发布功能可用。通过一次不会产生任何变更的真实 API 调用来证明这一点：打开一个编辑并删除它。

```bash
python3 scripts/play-preflight.py
```

三种结果对应三种不同的操作：

| 结果 | 含义 | 操作 |
| --- | --- | --- |
| token 失败 | 密钥错误或已被撤销 | 轮换密钥，参见第 1 步 |
| 编辑操作返回 HTTP 401/403 | Play Console 尚未授予该账户权限 | 执行第 1 步中的授权 |
| 编辑成功打开并删除 | 发布流程已连通 | 继续 |

对于全新的服务账户，此处出现 403 是正常状态，不是 bug。

## 第 1 步：凭据

使用**专用的发布服务账户**，不要与任何账单或购买验证账户共用。能够推送发布版本的凭据不应同时具备撤销购买的权限。不要为其授予任何云 IAM 角色：它的全部权限都来自 Play Console 授权，因此在完成该授权之前，密钥是无效的。

将 JSON 以 **base64 编码**的形式存储在登录 Keychain 中：

```bash
security add-generic-password -U -s GOOGLE_PLAY_SERVICE_ACCOUNT_JSON -a <account> -w
```

将 `-w` 放在最后，并且不提供值，这样命令会提示输入，密钥也不会进入 shell 历史记录。粘贴 base64，而不是原始 JSON。

Base64 是必需的。`security` 在读取时会对任何多行密钥进行十六进制编码，因此原始 JSON 根据内容不同，读回时会呈现两种形态之一。Base64 能提供一种固定的形态和一条固定的解码路径。

授予访问权限是 **Play Console UI 操作**，无法通过 API 完成：在应用的 Users and permissions 下邀请该服务账户的电子邮件地址，并授予发布权限。将此事项作为只能由用户完成的步骤告知用户，同时提供确切的电子邮件地址和权限，然后重新运行第 0 步。

## 第 2 步：每次执行命令前都先拉取

`fastlane` 读取的是工作树，而不是远程仓库。过期的检出版本会导致一次“成功但什么也没做”的运行，因为缺少变更日志会被跳过，而不是报错。

```bash
git -C <repo> pull --ff-only && git -C <repo> log --oneline -1
```

如果 fastlane 提示要进行设置，说明 Fastfile 不在磁盘上。回答 no 并执行 pull；接受设置会用空配置覆盖真实配置。

## 第 3 步：先写入变更日志

发布说明位于
`fastlane/metadata/android/<locale>/changelogs/<versionCode>.txt`，每个 locale、每个 versionCode 对应一个文件。

缺少文件**不是错误**。Play 会静默提供上一版本的说明，因此用户会在新构建版本中看到过时的文本，而没有任何信息告知你这一点。在上传前，为所有包含商店页文案的 locale 各写入一份变更日志。

```bash
for l in $(ls fastlane/metadata/android); do
  [ -f "fastlane/metadata/android/$l/changelogs/$VC.txt" ] || echo "MISSING: $l"
done
```

匹配每个区域设置现有的措辞风格，而不是逐字翻译英文内容。检查长度限制：500 个字符。

## 第 4 步——验证构建产物，而不是源码树

读取源码不能证明更改已经进入二进制文件。

```bash
jarsigner -verify app/build/outputs/bundle/release/app-release.aab | head -1
grep -oE 'android:version(Code|Name)="[^"]*"' \
  app/build/intermediates/merged_manifests/release/*/AndroidManifest.xml
```

当此次发布更改了资源时，在两端分别计算哈希值并要求匹配：

```bash
unzip -p <aab> 'base/res/*xxxhdpi*ic_launcher.png' | shasum -a 256
shasum -a 256 app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

在 Play App Signing 下，`jarsigner` 报告使用自签名证书是正常的，因为 Play 会使用真正的发布密钥重新签名。

## 第 5 步——先上传到测试轨道

```bash
fastlane android internal
```

构建上传只包含二进制文件及其更新日志。列表文本、图标、宣传图和屏幕截图通过单独的 lane 处理，因此常规上传不会改写商店中关于应用的内容。

## 第 6 步——推广，绝不要重新上传

Play 会拒绝携带已有 versionCode 的第二个 bundle。重新上传不是通往同一目标的更慢路径，而是一个错误。

推广测试轨道上已有的 versionCode。这也是测试优先真正有意义的唯一方式：进入生产环境的构建，正是经过逐位验证的那个构建。

```ruby
upload_to_play_store(
  version_code: <code>, track: "internal", track_promote_to: "production",
  skip_upload_aab: true, skip_upload_apk: true,
  release_status: "inProgress", rollout: "0.1"
)
```

## 第 7 步——暂停生产发布

生产环境的发布对于已经收到它的用户来说是不可逆的。暂停并呈现：

```text
Ready to promote versionCode <n> (<name>) to production at <pct>% of users.
Currently live: versionCode <m>. <one line on what users will notice>.
  1. Promote at <pct>%
  2. Promote at a different fraction
  3. Upload to a testing track only
  4. Hold
```

然后等待。只有在收到明确答复后才继续，并将长期有效的发布指令视为该答复。

## 第 8 步——回读实际已上线的内容

fastlane 摘要报告的是请求成功，而不是发布最终变成了什么。`track_promote_release_status` 等参数可能不同于你设置的 `release_status`，因此应读取轨道：

```
GET /androidpublisher/v3/applications/<pkg>/edits/<id>/tracks/production
```

检查以下三个字段，并明确说明其值：

- `versionCodes` —— 用户获得的构建。
- `status` —— `inProgress` 表示分阶段发布；`completed` 表示所有用户。
- `userFraction` —— `completed` 时不存在。

100% 发布应当最终显示为 `status: completed`，且**没有** `userFraction`。处于 `inProgress` 且 `userFraction: 1.0` 的发布是另一种状态，但在成功消息中看起来相同。请确认实际得到的是哪一种。

另外，确认你写入的每个 locale 都出现在该版本 release 的 `releaseNotes` 中。

## 完成标准

本次运行中，每一行都必须由命令证实：

- 预检已打开并删除了一个真实的 Play 编辑。
- AAB 已验证：签名、合并 manifest 中的 versionCode，以及任何已更改资源的哈希匹配。
- track 回读结果显示预期的 versionCode、状态和 fraction。
- 每个包含 listing copy 的 locale 都出现在实时 release 的 notes 中。

## 边界

1. 未获得明确涵盖该操作的指令，不得将版本提升到 production、提高 rollout 比例或停止 rollout。
2. 不得自行创建 Play Console 授权；这是一个 UI 操作。向用户提供所需的邮箱和权限。
3. 不得打印、提交或将 service-account JSON、upload keystore 或 `keystore.properties` 复制到 repo 中。
4. 不得在 build upload 中推送 listing text、图片或截图。copy 的移动必须作为独立且经过明确决策的步骤执行。
5. 不得根据 fastlane summary 报告 release 状态。读取 track。
6. 不得复用用于 billing 或 purchase-verification 的 service account 进行发布。
7. 不得编辑已向用户提供的 versionCode 对应的 changelog 来悄悄修复拼写错误；这会更改实时商店文案，必须与 rollout 变更一起确认。

## 路由

- 需要规划、构建、测试或进行 app 本身的 policy-check -> 使用
  `android-app-factory`，然后返回此处进行交付。
- 需要对已发布 app 进行实时 Play listing 或关键词审核 -> 使用
  `suede-aso`。
- 需要围绕 release 配置 CI、必需检查或合并门禁 -> 使用
  `suede-ci-gate`。
- 需要处理 release branch 的 branch、worktree 或过时镜像 -> 使用
  私有的 Suede Labs companion，不在此 pack 中：suede-git-hygiene。
- 需要同一 release 的 iOS 部分 -> 使用私有的 Suede Labs companion，不在此 pack 中：ios-app-store-release。
- 需要确保 Android、iOS 和 web surfaces 之间的常量一致 -> 使用
  `suede-parity-contract`。
- 从 `android-app-factory` 过来时：将 Play credential setup、upload、
  track promotion、staged rollout 和 live-state verification 路由回此处。