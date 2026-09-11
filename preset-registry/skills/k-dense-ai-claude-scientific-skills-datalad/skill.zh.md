---
name: datalad
description: Retrieve, version, and publish scientific datasets with DataLad and git-annex, and capture computational provenance with datalad run, rerun, and containers-run. Use when cloning or fetching data from OpenNeuro, DANDI, datasets.datalad.org, or any DataLad dataset; when a file in a dataset reads as a broken symlink or a small pointer instead of real data; when an analysis needs a machine-readable record of how each output was produced so it can be re-executed; or when publishing a dataset to siblings such as a GitHub repository plus a storage remote. Also use to decide between DataLad and plain Git for a data-carrying repository.
compatibility: Needs datalad 1.6.x on Python 3.10+, plus git and git-annex 10.x. git-annex is not written in Python but installs as a prebuilt wheel from PyPI (`uv pip install git-annex`), from a system package manager, or from conda-forge. Container-based provenance also needs datalad-container (1.2.x) and Singularity/Apptainer or Docker. clone, get, and push need network access; credentialed remotes read secrets from the system keyring or from DATALAD_CREDENTIAL_<NAME>_<COMPONENT> environment variables.
license: MIT
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.0"
  skill-author: Dylan Pulver
---
# DataLad

## 概述

DataLad 是构建在 Git 和 git-annex 之上的数据管理层。Git 跟踪数据集
结构、小型文本文件以及历史记录。git-annex 跟踪大型
文件的*内容*，将每个文件存储为一个键，并将字节保存在不一定位于本地仓库中的某个位置。

这一分工是最需要理解的事情，因为它意味着，新克隆的数据集包含完整的历史记录和完整的文件列表，却几乎不包含任何数据。一个 100 TB 的数据集可以在几秒内完成克隆，并且只占用几兆字节。只有在请求时，数据才会按文件通过 `datalad get` 获取。

DataLad 增加的第二项能力是溯源。`datalad run` 执行命令，并将结果与命令、输入和输出的机器可读记录一同提交。`datalad rerun` 读取该记录并重新执行命令。这样一来，“这个图是如何生成的”就不再是考古问题，而会变成一条命令。

## 何时使用 DataLad 而不是纯 Git

在以下任一情况成立时，使用 DataLad：

- 文件对于 Git 来说过大，难以舒适地处理，或者总数据量超过了每位协作者愿意存储在磁盘上的大小。
- 数据存储在多个位置（实验室服务器、集群临时空间、S3、超级计算机），并且你需要知道哪些副本存在。
- 分析必须能够重新执行，而普通提交消息不足以提供证据。
- 你正在使用来自 OpenNeuro、DANDI 或 `datasets.datalad.org` 的已发布数据集，这些数据集以 DataLad 数据集的形式分发。
- 项目中嵌套了其他数据集，并且你希望每个数据集都保留自己的独立历史记录。

当仓库只包含代码和文本、所有内容都能轻松容纳在 Git 中，并且没有人需要部分检出时，使用纯 Git。在小型纯代码仓库之上使用 DataLad 会增加间接层，却没有带来实际收益。

## 安装

```bash
# git-annex is NOT written in Python but is available from PyPI if you already
# have git itself installed:
uv pip install git-annex
# You can also install it first from the system
# (Debian/Ubuntu: apt install git-annex; macOS: brew install git-annex;
#  conda-forge: conda install -c conda-forge git-annex)
uv pip install datalad
uv pip install datalad-container   # only for containers-run

datalad wtf --section dependencies   # confirm git-annex version is visible
```

PyPI 的 `git-annex` 软件包以适用于 Linux、macOS 和 Windows 的 wheel 形式提供预构建二进制文件，而不是构建 Haskell 源代码，因此它的安装方式与其他 Python 依赖项相同，并且可以与 DataLad 在同一环境中固定版本。它不会同时安装 git。

`datalad wtf` 会打印解析后的环境信息；当行为看起来不可能时，这是首先要运行的命令。大量令人困惑的错误都源于版本过旧或缺失的 git-annex。

DataLad 本身采用 MIT 许可证。git-annex 是一个单独的工具，采用 AGPL 许可证；只有在重新分发经过修改的 git-annex，而不是调用它时，这一点才会产生影响。

## 最先让人踩坑的问题：指针不是数据

执行 `datalad clone` 后，annex 文件会作为指向 `.git/annex/objects/` 的符号链接存在（在 Windows 或功能受限的文件系统等不支持符号链接的环境中，则可能是小型指针文件）。此时还没有下载实际内容。

```bash
datalad clone https://github.com/OpenNeuroDatasets/ds000001.git
cd ds000001
ls sub-01/anat/            # the file is listed
python -c "import nibabel; nibabel.load('sub-01/anat/sub-01_T1w.nii.gz')"   # fails
datalad get sub-01/anat/sub-01_T1w.nii.gz                                   # now it works
```

需要识别的故障模式是：某个工具报告文件为空、已截断、损坏、"not
a gzip file" 或符号链接断开，而文件在磁盘上的大小只有几百字节。这是一个指针，不是下载损坏。**读取数据前先运行 `datalad get`，并将“文件存在”视为不足以证明其内容已存在。**

在分析操作涉及某个目录之前，显式获取该目录：

```bash
datalad get sub-01/                  # everything under a path
datalad get -r .                     # everything, including subdatasets
datalad get -n -r .                  # subdataset structure only, no file content
```

`datalad status --annex` 会报告本地已有多少内容，`git annex whereis <path>` 会报告哪些仓库持有指定文件。`whereis` 读取的是已记录的状态，不会联系远程仓库，因此它告诉你的是 git-annex 上次获知的情况，而不是当前实际情况。

请参阅 [data-access.md](references/data-access.md)，了解如何查找数据集、子数据集的行为、安全丢弃内容以及修复数据集。

## 使用 datalad run 记录溯源

在方法学场景中，使用 DataLad 的理由就在于 `datalad run`。它会将命令及其产生的结果保存到同一个提交中：

```bash
datalad run -m "extract brain mask" \
  --input "sub-01/anat/sub-01_T1w.nii.gz" \
  --output "derivatives/sub-01_brain.nii.gz" \
  "bet {inputs} {outputs} -m"
```

各部分的作用，以及省略它们会带来的问题：

- `--input` 会在运行前获取内容，因此命令不会因指针而失败。它还会记录依赖关系，这使得 `rerun` 能够在另一台机器上获取相同的输入。
- `--output` 会先解锁或移除目标文件，因此 git-annex 不会拒绝覆写它正在保护的内容。没有它时，再次运行相同命令通常会因 annex 文件看似只读而出现权限错误。
- `{inputs}` 和 `{outputs}` 会展开为相应的值。还可以使用 `{pwd}`、`{dspath}` 和 `{tmpdir}`，而 `{inputs[0]}` 可以索引单个条目。
- 提交消息会在 `=== Do not change lines below ===` 和 `^^^ Do not change lines above ^^^` 之间保存一条 JSON 运行记录。不要手动编辑该代码块；`rerun` 会解析它。

当数据集存在未保存的修改时，`datalad run` 会拒绝启动，因为不干净的起始状态会使记录不可靠。请先保存或丢弃修改，或者传递 `--explicit` 来声明列出的输入和输出就是全部变更内容。使用 `--dry-run basic` 或 `--dry-run command`，在提交命令前检查该命令。

一次不产生任何更改的运行不会创建提交，与 `datalad save` 的行为完全一致。

### 重新执行

```bash
datalad rerun                       # redo the run recorded at HEAD
datalad rerun --report              # show what would be done, change nothing
datalad rerun --script recompute.sh # extract the commands instead of running them
datalad rerun --since <commit> -b check <revision>   # replay a range onto a new branch
```

将运行重新执行到一个分支上（`-b`）是测试可复现性的安全方式：重放结果会写入其他位置，通过与原分支进行比较，可以确认输出是否完全一致。

### 容器

使用 `datalad-container` 扩展时，注册一次镜像，之后的每次运行都会记录生成输出所使用的镜像：

```bash
datalad containers-add fsl --url docker://brainlife/fsl:6.0.4
datalad containers-run -n fsl -m "brain mask in container" \
  --input "sub-01/anat/sub-01_T1w.nii.gz" \
  --output "derivatives/sub-01_brain.nii.gz" \
  "bet {inputs} {outputs} -m"
```

镜像本身会在数据集中进行跟踪，因此软件环境会与数据和溯源记录一起保存，而不是只存在于某人的 shell 历史中。当只配置了一个容器时，可以省略 `-n`。

请参阅 [provenance.md](references/provenance.md)，了解 STAMPED 原则和 YODA 项目布局、运行记录格式、`--explicit` 和 `--assume-ready` 语义，以及将溯源导出为 W3C PROV。

## 保存和检查更改

```bash
datalad status                 # what changed, including subdataset state
datalad save -m "add QC report" path/to/file
datalad save -m "checkpoint" -r                 # recurse into subdatasets
datalad save -m "small text file" --to-git notes.md
```

`datalad save` 会根据数据集的 `.gitattributes`，决定每个文件的内容应存入 Git 还是 git-annex。使用 `--to-git` 可以强制将文件存入 Git，这适用于代码和应保持可直接读取的小型文本文件。`yoda` 过程（`datalad create -c yoda`）会自动为 `code/`、`README.md` 和 `CHANGELOG.md` 配置这些设置。

## 创建数据集

```bash
datalad create my_dataset               # plain dataset
datalad create -c yoda my_analysis      # analysis layout (code/ tracked in Git,
                                        # README.md and CHANGELOG.md preconfigured)
datalad create -d . inputs/raw          # register a new subdataset under an existing one
```

`-c yoda` 会应用 [provenance.md](references/provenance.md) 中介绍的分析项目布局。`-d .` 用于将新数据集注册为父数据集的子数据集，而不是将一个无关的仓库留在其中。

## 发布

DataLad 数据集通常会同时发布到两个位置：用于保存历史记录的 Git 托管服务，以及用于存储 annex 内容的存储远程端。

```bash
datalad create-sibling-github myaccount/mydataset
git annex initremote store type=S3 bucket=my-bucket encryption=none autoenable=true
datalad siblings configure -s github --publish-depends store
datalad push --to github
```

Git sibling 和存储 sibling 是由不同工具有意创建的。Git sibling 是 Git 远程仓库，而 `datalad create-sibling-*` 用于处理托管服务上的 sibling。
S3 bucket（或 WebDAV、SSH 目录）是 *git-annex special remote*，而不是 Git
远程仓库，因此应使用 `git annex initremote` 创建。之后，`datalad siblings` 会自动发现这个 special
remote，并像处理其他 sibling 一样处理它。在这里使用 `datalad siblings add --url
s3://...` 正是本节要避免的错误：`--url` 是 Git 远程仓库 URL，
而 S3 不是；随后执行下面的 `push --to github` 时，就会在 `--publish-depends` 这一步失败。

`--publish-depends` 可以避免常见的错误发布：Git 仓库的历史记录引用了从未上传的内容，导致协作者能够成功克隆仓库，却发现每个 `datalad get` 都失败。声明依赖关系后，每次都会先发布存储 sibling。

`datalad push` 会发送 Git 历史记录，并且默认情况下（`--data auto-if-wanted`）发送目标配置为需要的 annex 内容。传递 `--data anything` 可以推送所有内容，而不考虑目标的偏好。

请参阅 [publishing.md](references/publishing.md)，了解 RIA 存储、special remote、凭据处理，以及如何配置每个 sibling 保存哪些内容。

## 释放磁盘空间

```bash
git annex whereis sub-01/                 # confirm another copy exists first
datalad drop sub-01/                      # remove local content, keep the pointer
datalad drop --what all --reckless kill <path>   # last resort, destroys data
```

当无法验证内容的其他副本是否存在时，`datalad drop` 默认会拒绝操作。这是一项安全检查，而不是障碍。`--nocheck` 和 `--if-dirty` 已弃用；当前的写法是 `--reckless availability`，其含义正如其名称所示。`--what` 用于在 `filecontent`（默认值）、`allkeys`、`datasets` 和 `all` 之间进行选择。

## 值得了解的故障模式

| 现象 | 原因 | 修复方法 |
|---|---|---|
| 文件读取为空、被截断，或是损坏的符号链接 | 内容尚未获取；当前只有指针 | `datalad get <path>` |
| 向现有输出写入时出现 "Permission denied" | git-annex 会对 annex 内容启用写保护 | 使用 `--output` 声明它，或使用 `datalad unlock <path>` |
| `datalad run` 拒绝启动 | Dataset 存在未保存的更改 | 先执行 `datalad save`，或传递 `--explicit` |
| `datalad drop` 拒绝执行 | 没有经过验证的内容第二副本 | 先推送到 sibling，或接受 `--reckless availability` |
| 协作者可以克隆，但每个 `get` 都失败 | 发布了历史记录，却没有发布内容 | 发布存储 sibling，并设置 `--publish-depends` |
| 克隆成功，但 subdataset 目录为空 | 默认不会安装 subdataset | `datalad get -n -r .`，然后对所需路径执行 `get` |
| 命令表现异常 | 缺少 git-annex，或其版本过旧 | `datalad wtf --section dependencies` |

## 详细参考

- [data-access.md](references/data-access.md)：查找已发布的 Dataset
  （`registry.datalad.org`、OpenNeuro、DANDI、`datasets.datalad.org` 以及 `///`
  快捷方式）、克隆和获取选项、subdataset 处理、annex 内容状态、丢弃和移除，以及
  `fsck` 修复。
- [provenance.md](references/provenance.md)：STAMPED 原则和 YODA 布局、
  运行记录格式、`run` 和 `rerun` 的完整选项、`containers-run`，以及将 DataLad 溯源信息导出到 W3C PROV 的当前状态。
- [publishing.md](references/publishing.md)：sibling 及其操作、
  `create-sibling-*` 变体、RIA 存储、special remote、`push` 语义，以及
  凭据处理。

## 相关技能

`bids` 技能介绍了脑影像数据结构（Brain Imaging Data Structure），DataLad 分发的许多神经影像数据集都按照该结构组织。典型工作流是使用 DataLad 克隆一个 BIDS 数据集，使用 BIDS 工具进行验证，然后在 `datalad containers-run` 下运行 BIDS-App，以便衍生数据保留溯源信息。

## 主要来源

- DataLad 文档：<https://docs.datalad.org/en/stable/>
- DataLad 手册：<https://handbook.datalad.org/en/latest/>
- `datalad run` 章节：<https://handbook.datalad.org/en/latest/basics/101-108-run.html>
- YODA 原则：<https://handbook.datalad.org/en/latest/basics/101-127-yoda.html>
- STAMPED 原则（由 YODA 操作化而来）：<https://stamped-principles.org>
- datalad-container：<https://docs.datalad.org/projects/container/en/stable/>
- git-annex：<https://git-annex.branchable.com/>
- 数据集注册表：<https://registry.datalad.org>

## 致谢

该技能的主题范围部分参考了 @bcmcpher 基于 MIT 许可的
[datalad-cli](https://github.com/bcmcpher/my-skills/tree/main/plugins/datalad-cli)
插件（包含十九个按命令划分的斜杠命令技能）。本文内容独立编写，依据上游 DataLad 文档；由于两者都涵盖 DataLad，内容存在重叠在所难免，但在结构、风格和具体技术论断方面有所不同。