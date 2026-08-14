---
name: cloud-uploader
description: Uploads promo videos and content to Cloudflare R2 or AWS S3. Use when the user wants to host promo content for social media or distribution.
model: sonnet
effort: low
prerequisites:
  - promo-director
allowed-tools:
  - Read
  - Bash
  - Glob
requirements:
  python:
    - boto3
---
# 云端上传技能

将宣传视频和其他专辑内容上传到云存储（Cloudflare R2 或 AWS S3）。

## 用途

使用 `/bitwize-music:promo-director` 生成宣传视频后，将其上传到云存储，以便：
- 托管在网站上
- 通过直链分享
- 通过 CDN 分发
- 备份和归档

## 使用时机

- 宣传视频生成后，用户希望将其上传到云端
- 用户说“将宣传视频上传到 R2”或“上传到 S3”
- 用户说“上传 [album] 的宣传视频”
- 仅支持手动调用（不会自动执行）

## 在工作流中的位置

```
Generate → Master → Promo Videos → **[Cloud Upload]** → Release
```

这是 promo-director 之后、release-director 之前的可选步骤。

## 前置条件

### 云配置

必须在 `~/.bitwize-music/config.yaml` 中配置云服务凭据：

```yaml
cloud:
  enabled: true
  provider: "r2"  # or "s3"

  # For Cloudflare R2
  r2:
    account_id: "your-account-id"
    access_key_id: "your-access-key"
    secret_access_key: "your-secret-key"
    bucket: "promo-videos"

  # For AWS S3
  s3:
    region: "us-west-2"
    access_key_id: "your-access-key"
    secret_access_key: "your-secret-key"
    bucket: "promo-videos"
```

有关详细的设置说明，请参阅 `${CLAUDE_PLUGIN_ROOT}/reference/cloud/setup-guide.md`。

### 所需文件

- 已生成宣传视频（先运行 `/bitwize-music:promo-director`）
- 位于：`{audio_root}/artists/{artist}/albums/{genre}/{album}/promo_videos/`
- 专辑试听合辑位于：`{audio_root}/artists/{artist}/albums/{genre}/{album}/album_sampler.mp4`

### Python 依赖项

```bash
# If using the shared venv (recommended)
~/.bitwize-music/venv/bin/pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt

# Or install separately
pip install boto3
```

如果 `~/.bitwize-music/venv` 可用，上传脚本会使用它；否则会回退到系统 Python。

## 工作流

### 1. 验证前置条件

**检查配置：**
```bash
cat ~/.bitwize-music/config.yaml | grep -A 20 "cloud:"
```

确认：
- `cloud.enabled: true`
- 已配置云服务提供商凭据（r2 或 s3）
- 已设置存储桶名称

**检查宣传视频是否存在：**
```bash
ls {audio_root}/artists/{artist}/albums/{genre}/{album}/promo_videos/
ls {audio_root}/artists/{artist}/albums/{genre}/{album}/album_sampler.mp4
```

如果缺失：
```
Error: Promo videos not found.

Generate with: /bitwize-music:promo-director {album}
```

### 2. 获取 Python 命令

**首先调用 `get_python_command()`**，以获取虚拟环境的 Python 路径和插件根目录。在下面的所有 bash 调用中使用它们。

```
PYTHON="{python from get_python_command}"
PLUGIN_DIR="{plugin_root from get_python_command}"
```

### 3. 预览上传（试运行）

先进行预览：
```bash
$PYTHON "$PLUGIN_DIR/tools/cloud/upload_to_cloud.py" {album} --dry-run
```

输出内容包括：
- 云服务提供商和存储桶
- 要上传的文件
- S3 键（存储桶中的路径）
- 文件大小

### 4. 上传文件

**上传全部内容（宣传视频 + 试听合辑）：**
```bash
$PYTHON "$PLUGIN_DIR/tools/cloud/upload_to_cloud.py" {album}
```

**仅上传曲目宣传视频：**
```bash
$PYTHON "$PLUGIN_DIR/tools/cloud/upload_to_cloud.py" {album} --type promos
```

**仅上传专辑试听集：**
```bash
$PYTHON "$PLUGIN_DIR/tools/cloud/upload_to_cloud.py" {album} --type sampler
```

**上传并开放公开访问：**
```bash
$PYTHON "$PLUGIN_DIR/tools/cloud/upload_to_cloud.py" {album} --public
```

### 5. 验证上传

**对于 R2：**
- 查看 Cloudflare 控制面板 → R2 → 你的存储桶
- 文件应出现在 `{artist}/{album}/` 下

**对于 S3：**
- 查看 AWS 控制台 → S3 → 你的存储桶
- 或使用 AWS CLI：`aws s3 ls s3://{bucket}/{artist}/{album}/`

### 5. 报告结果

```
## Cloud Upload Complete

**Provider:** R2 (or S3)
**Bucket:** {bucket}
**Album:** {album}

**Uploaded Files:**
- {artist}/{album}/promos/01-track_promo.mp4
- {artist}/{album}/promos/02-track_promo.mp4
- ...
- {artist}/{album}/promos/album_sampler.mp4

**Total:** 11 files, 125.4 MB

**Next Steps:**
1. Verify files in cloud dashboard
2. If public: Test URLs work
3. Continue to release: /bitwize-music:release-director {album}
```

## 上传路径结构

**重要：云端路径是扁平的——不包含流派文件夹。**

云端路径结构与本地内容结构不同：

| 位置 | 路径结构 |
|----------|----------------|
| 本地内容 | `{content_root}/artists/{artist}/albums/{genre}/{album}/` |
| 本地音频 | `{audio_root}/artists/{artist}/albums/{genre}/{album}/` |
| **云端** | `{artist}/{album}/`（不包含流派！） |

文件在存储桶中的组织方式如下：

```
{bucket}/
└── {artist}/
    └── {album}/
        └── promos/
            ├── 01-track_promo.mp4
            ├── 02-track_promo.mp4
            ├── ...
            └── album_sampler.mp4
```

**流派为 rock、由「bitwize」创作的专辑「my-album」示例：**
- 本地：`~/music/artists/bitwize/albums/rock/my-album/`
- 云端：`bitwize/my-album/promos/`（不是 `bitwize/albums/rock/my-album/`）

## 命令选项

| 选项 | 说明 |
|--------|-------------|
| `--type promos` | 仅上传单曲宣传视频 |
| `--type sampler` | 仅上传专辑试听集 |
| `--type all` | 两者都上传（默认） |
| `--dry-run` | 仅预览，不上传 |
| `--public` | 将文件设置为公开可读 |
| `--audio-root PATH` | 覆盖配置中的 audio_root |

## 调用示例

**基本上传：**
```
/bitwize-music:cloud-uploader my-album
```

**仅预览：**
```
/bitwize-music:cloud-uploader my-album --dry-run
```

**仅上传宣传视频：**
```
/bitwize-music:cloud-uploader my-album --type promos
```

**上传并开放公开访问：**
```
/bitwize-music:cloud-uploader my-album --public
```

## 错误处理

**「未启用云端上传」**
- 将 `cloud.enabled: true` 添加到配置中
- 请参阅 `${CLAUDE_PLUGIN_ROOT}/reference/cloud/setup-guide.md`

**「未配置凭证」**
- 将凭证添加到配置文件中
- 对于 R2：account_id、access_key_id、secret_access_key
- 对于 S3：access_key_id、secret_access_key

**「未找到专辑」**
- 检查专辑是否存在于 `{audio_root}/artists/{artist}/albums/{genre}/{album}/`
- 验证配置中的艺术家名称是否匹配

**「未找到要上传的文件」**
- 请先生成宣传视频：`/bitwize-music:promo-director {album}`

**“访问被拒绝”**
- 检查凭证是否正确
- 对于 R2：确认 API 令牌具有写入权限
- 对于 S3：确认 IAM 策略允许 s3:PutObject

**“未找到存储桶”**
- 先在云服务控制面板中创建存储桶
- 确认配置中的存储桶名称

## 安全说明

- 凭证存储在配置文件中（请确保设置适当的文件权限）
- 用户内容仓库中的配置文件应加入 gitignore
- 默认：文件以私有方式上传（不公开）
- 仅对需要公开访问的文件使用 `--public` 标志
- 考虑在 CI/CD 中使用环境变量（未来增强功能）

## 与其他 Skill 的集成

### 移交自

**promo-director：**

宣传内容生成后：
```
Promo videos generated successfully.

**Optional:** Upload to cloud storage: /bitwize-music:cloud-uploader {album}
```

### 移交至

**release-director：**

云端上传后：
```
Cloud upload complete.

Ready for release workflow: /bitwize-music:release-director {album}
```

## 支持的提供商

### Cloudflare R2

- 兼容 S3 的 API
- 无出口流量费用
- 集成全球 CDN
- 适合高流量内容

### AWS S3

- 行业标准
- 细粒度 IAM 权限
- 可使用 CloudFront CDN
- 适合与 AWS 生态系统集成

## 未来增强功能

- 环境变量凭证（用于 CI/CD）
- 支持多个存储桶
- 自动使 CDN 缓存失效
- 大文件上传进度条
- 恢复失败的上传
- 在存储桶缺失时创建存储桶
- 支持其他提供商（Backblaze B2、DigitalOcean Spaces）

## 相关文档

- `${CLAUDE_PLUGIN_ROOT}/reference/cloud/setup-guide.md` - 详细设置说明
- `${CLAUDE_PLUGIN_ROOT}/skills/promo-director/SKILL.md` - 生成宣传视频
- `${CLAUDE_PLUGIN_ROOT}/skills/release-director/SKILL.md` - 发布工作流

## 模型建议

**Sonnet 4.5** - 此 Skill 运行脚本并协调工作流。无需 LLM 生成创意内容。

## 版本历史

- v0.14.0 - 初始实现
  - 通过 boto3 支持 R2 和 S3
  - 试运行模式
  - 公开/私有上传选项
  - 按艺术家/专辑组织路径