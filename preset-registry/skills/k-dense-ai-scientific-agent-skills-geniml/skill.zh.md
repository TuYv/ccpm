---
name: geniml
description: "Use Geniml for audited local genomic-interval workflows: validate BED and universe contracts, plan Region2Vec or scEmbed runs, inspect model/tokenizer compatibility, and assess consensus universes."
license: MIT
compatibility: Requires Python 3.10+ and uv. Guidance targets geniml 0.8.4 with gtars 0.9.2; ML workflows need the pinned ml extra and compatible native wheels. Bundled planners and inspectors are dependency-free, local-only, and make no network requests.
allowed-tools: Read Write Edit Bash Glob
metadata:
  version: "1.1"
  skill-author: "K-Dense Inc."
  upstream-version: "0.8.4"
  last-reviewed: "2026-07-23"
---
# Geniml

使用 Geniml 处理基因组区间集合上的机器学习和统计工作流。将坐标、基因组组装版本、标记词词汇表、模型产物和样本分组视为明确的契约。随附的脚本用于验证或规划；它们不会导入 Geniml、联系服务、反序列化模型或执行训练。

仅当用户明确批准执行本指南中展示的 `uv`、Python、Geniml、Gtars、Git 和原生 CLI 命令时，才声明使用 `Bash`；随附的 Python 辅助工具不会生成子进程。`data/`、`refs/`、`work/` 和 `models/` 下的示例路径是由用户提供的项目占位符，并非缺失的随附文件。

## 已验证的发行版本快照

- 截至 2026-07-23，PyPI 上最新的稳定版本为：`geniml==0.8.4`（2026-01-14）。
- PyPI 未声明 `Requires-Python`；其分类器列出了 Python
  3.10-3.14。在所有原生/ML wheel 都能解析的情况下，优先使用 Python 3.11 或 3.12。
- `geniml==0.8.4` 接受 `gtars>=0.2.5`；已验证的基础冒烟测试使用了当前的
  `gtars==0.9.2`（2026-06-17，Python >=3.10）。
- Extras 为 `ml` 和 `test`。基础安装不包含 Torch、Gensim、Scanpy、
  Hugging Face Hub、pyBigWig 和 HMM 依赖项。
- 上游文档包含过时示例。当两者冲突时，以发行版源代码和已安装的
  `--help` 输出为准。

## 可复现地安装

使用项目环境，并提交其生成的锁定文件：

```bash
uv venv --python 3.12
uv pip install "geniml==0.8.4" "gtars==0.9.2"
```

对于需要 ML 库的 Region2Vec、scEmbed、评估或 universe 方法：

```bash
uv pip install "geniml[ml]==0.8.4" "gtars==0.9.2"
```

对于持久化项目，优先使用：

```bash
uv add "geniml[ml]==0.8.4" "gtars==0.9.2"
uv lock
```

不要安装未固定版本的 Git 分支。记录 Python、操作系统/架构、解析后的锁定文件以及 PyPI 构件摘要。Geniml 本身采用 BSD-2-Clause 许可；`MIT` frontmatter 值用于许可本 skill 的内容。

## 从安全门禁开始

在导入 Geniml 或运行外部二进制文件之前：

1. 仅使用明确的本地普通文件。拒绝 URL、FIFO、设备文件和符号链接，除非用户明确更改该策略。
2. 验证 BED 结构以及所声明的基因组组装版本，并与可信的本地染色体大小文件进行核对。
3. 限制文件数量、字节数、行数、worker 数量、epoch 数量和输出大小。
4. 按患者、供体、生物学重复或其他独立单位划分训练集/验证集/测试集，而不是仅按 BED 行或细胞划分。
5. 清点并计算 universe、tokenizer、model、config、输入文件、metadata manifest 和原生二进制文件的校验和。
6. 在进行任何 BEDbase 或 Hugging Face 下载之前，取得明确批准。绝不要从模型 ID 或 BEDbase 标识符推断已获批准。
7. 保持日志聚合且有界。BED 文件名、样本 ID、表型、标签、条形码和基因组区间可能属于敏感信息。

## 坐标和基因组组装版本契约

BED 区间通常是 **0-based、半开区间** `[start, end)`：start 包含在内，end 不包含在内，长度为 `end - start`。不要将它们与 VCF/GFF 或面向用户的基因组浏览器中的 1-based 闭区间混用。

对于每个 corpus 和 artifact，记录：

- 尽可能记录 assembly 及其 patch/accession（例如 GRCh38 与
  GRCh38.p14），以及 chromosome-sizes 校验和；
- contig 命名约定（`chr1` 与 `1`）、alt/random/decoy 策略，以及
  线粒体命名；
- 坐标约定、排序顺序、重复/重叠策略，以及 BED strand 是否具有实际意义；
- liftover 工具、chain 摘要、源/目标 assembly、未映射比例，以及
  liftover 后的验证。

拒绝负坐标、`end <= start`、整数溢出、未知 contig、超出 contig 长度的终点、格式错误的列、混用的 assembly，以及静默的 contig 重命名。排序和规范化绝不会修复 assembly 不匹配。BED3 没有 strand；当存在第 6 列时，保留 `+`、`-` 或 `.`，除非 assay 契约另有规定。

在分析前，运行有界的验证和规范化**计划**：

```bash
python skills/geniml/scripts/bed_validator.py \
  --input data/peaks.bed \
  --assembly GRCh38 \
  --chrom-sizes refs/GRCh38.chrom.sizes
```

验证器会报告建议执行的操作，但绝不会重写 BED 文件。

## 当前 API 映射

### Region 和 tokenizer I/O

对于新的 interval/tokenizer 代码，优先使用 Gtars：

```python
from gtars.models import Region, RegionSet
from gtars.tokenizers import Tokenizer

regions = RegionSet("data/peaks.bed")
tokenizer = Tokenizer.from_bed("refs/universe.bed")
encoded = tokenizer(regions)
input_ids = encoded["input_ids"]
```

`RegionSet` 和 `Tokenizer` 在某些构造函数中也接受远程输入；
除非明确批准网络访问，否则此 skill 仅允许使用本地路径。`geniml.io.RegionSet(regions, backed=False)` 作为旧版 Python 实现仍可用；backed 集合可迭代但不可索引。`geniml.io.Region` 使用 `stop`，而 `gtars.models.Region` 使用 `end`。

使用 gtars 0.9.2 时，BED 词汇表会添加七个特殊 token。因此，
`len(tokenizer)` 并不简单等于 universe 行数。保留 universe 行顺序以及精确的特殊 token 映射。

### Region2Vec

现代类位于一个明确的模块路径中：

```python
from geniml.region2vec.main import Region2VecExModel
from geniml.region2vec.utils import Region2VecDataset
from gtars.tokenizers import Tokenizer

tokenizer = Tokenizer.from_bed("refs/universe.bed")
dataset = Region2VecDataset("work/tokens.parquet", shuffle=True)
model = Region2VecExModel(tokenizer=tokenizer, embedding_dim=100)
model.train(dataset, epochs=10, window_size=5, num_cpus=4, seed=42)
```

Parquet 输入必须包含一个列表值 `tokens` 列，每行对应一个文档。有关导出、编码、旧版 CLI 和评估的详细信息，请参阅 [references/region2vec.md](references/region2vec.md)。

### scEmbed

从 `geniml.scembed.main` 导入 `ScEmbed`。AnnData `.var` 必须包含
`chr`、`start` 和 `end`；行表示细胞，非零特征用于标识可访问区域。预先将数据 token 化为包含 `tokens` 列的 Parquet，并在训练和推理中使用同一个 Tokenizer。请参阅
[references/scembed.md](references/scembed.md)。

### BEDspace

BEDspace 在 0.8.4 中仍然存在，并调用外部 StarSpace 可执行文件。
StarSpace 已归档，上游 Geniml 未固定兼容的修订版本。
应将 BEDspace 视为传统复现路径，而不是新系统的默认选项。
有关确切且稳定的 CLI 拼写，以及一个不可变但明确未经验证的构建基线，请参阅
[references/bedspace.md](references/bedspace.md)。

### 共识 universe 与评估

已安装的 0.8.4 CLI 使用：

```text
geniml build-universe {cc,ccf,ml,hmm} ...
geniml assess-universe ...
geniml eval {gdst,npt,ctt,rct,bin-gen} ...
```

CC/CCF/ML/HMM 使用预先计算的 coverage bigWigs。在所有 BED 文件通过相同的
assembly 契约之前，不要拼接或生成 coverage。
评估指标与 embedding 指标是不同的：`assess-universe` 衡量一个 universe
对 interval 集合的拟合程度，而 `eval` 为 embedding 实现 CTT、RCT、GDST
和 NPT。请参阅
[references/consensus_peaks.md](references/consensus_peaks.md) 和
[references/utilities.md](references/utilities.md)。

## 重要的 0.8.4 迁移说明

- 0.7.0 的变更日志将新的 RegionSet/tokenizer 工作转向了 Gtars。
- 0.4.0 中的名称 `TreeTokenizer` 和 `AnnDataTokenizer` 已属历史名称；当前的 Gtars API
  提供 `Tokenizer`。
- 在 0.8.4 wheel 中，`geniml.region2vec` 和 `geniml.scembed` 不会重新导出现代类/函数。请使用上文的具体模块路径。
- `geniml tokenize` 和 `geniml region2vec` 的调用名称已不再由其包的
  `__init__` 文件导出；在没有经过已安装版本的 smoke test 之前，不要围绕这些 CLI
  路径构建新的工作流。
- `geniml scembed` 会解析传统的 MatrixMarket 选项，但其命令主体在 0.8.4 中是 no-op。请使用 `geniml.scembed.main.ScEmbed`。
- 官方页面仍显示 `geniml assess`；发布版本的命令是
  `geniml assess-universe`。
- `.gtok` 在传统数据集中仍然存在，但上游 issue #14 提议弃用多文件 `.gtok` 工作流。优先使用一个有界的 Parquet 语料库。
- 配置键 `embedding_size` 仅为向后兼容而接受；请使用 `embedding_dim`。

## 模型与 universe 兼容性

只有在以下内容一致时，Region2Vec/scEmbed 推理 bundle 才有效：

- 模型 `config.yaml` 中的 `vocab_size` 和 `embedding_dim`；
- 完全一致的 `universe.bed` 字节内容/顺序以及 assembly；
- tokenizer 的实现/版本和特殊 token ID；
- checkpoint 张量形状和 pooling 策略；
- Geniml/Gtars 版本以及任何 tokenization 参数。

Geniml 0.8.4 默认使用 `checkpoint.pt`、`config.yaml` 和 `universe.bed`。
其 loader 使用 `torch.load(..., weights_only=True)`，但 `.pt`、Gensim
`.model`、pickle、joblib 和原生二进制文件仍属于不受信任的输入。在加载前检查
并计算 artifact 的校验和；使用隔离环境，绝不要仅为了发现其元数据而加载 checkpoint。

```bash
python skills/geniml/scripts/model_artifact_inspector.py \
  --model-dir models/region2vec

python skills/geniml/scripts/tokenizer_compatibility.py \
  --model-dir models/region2vec \
  --universe refs/universe.bed \
  --assembly GRCh38
```

`Region2VecExModel(model_path="org/repo")`、`ScEmbed(model_path="org/repo")`，
以及 Gtars 的 `Tokenizer.from_pretrained(...)` 都可以从 Hugging Face 下载。
本地的 `from_pretrained("models/local")` 会加载本地 bundle。用户批准下载时，
请固定 Hub revision 和预期哈希值；随后即可基于经过验证的缓存离线工作。

## BEDbase 下载与缓存

`BBClient.load_bed`、`load_bedset` 以及 token-cache 操作可能会访问
`https://api.bedbase.org`。默认缓存位置是
`$BBCLIENT_CACHE` 或 `~/.bbcache`；`BEDBASE_API` 可更改端点。不要读取无关的环境变量。
设置明确的项目缓存，估算大小，批准标识符和端点，并在使用前验证返回的校验和。

本地检查命令更安全：

```text
geniml bbclient seek ID --cache-folder /absolute/project/cache
geniml bbclient inspect-bedfiles --cache-folder /absolute/project/cache
geniml bbclient inspect-bedsets --cache-folder /absolute/project/cache
```

`cache-bed`、`cache-bedset` 和 `cache-tokens` 子命令可能会使用网络。
不要隐式运行它们，也不要在上传/缓存工作流中包含敏感的本地 BED 文件。

## 本地审计与规划 CLI

所有脚本仅使用标准库，并默认输出经过脱敏的 JSON：

```bash
# Audit manifest paths, checksums, assemblies, and patient/donor leakage
python skills/geniml/scripts/corpus_auditor.py \
  --manifest data/manifest.tsv --assembly-column assembly \
  --group-column patient_id --split-column split

# Plan tokenizer/model compatibility checks
python skills/geniml/scripts/tokenizer_compatibility.py \
  --model-dir models/r2v --universe refs/universe.bed --assembly GRCh38

# Plan consensus construction; does not execute Geniml or coverage tools
python skills/geniml/scripts/consensus_plan.py \
  --manifest data/manifest.tsv --chrom-sizes refs/GRCh38.chrom.sizes \
  --assembly GRCh38 --method cc --output-dir work/consensus

# Plan an embedding run; does not import ML libraries
python skills/geniml/scripts/embedding_plan.py \
  --mode region2vec --data work/tokens.parquet \
  --universe refs/universe.bed --output-dir work/r2v \
  --assembly GRCh38
```

使用 `--help` 查看资源限制和显式路径披露控制选项。

## 参考资料

- [Region2Vec](references/region2vec.md)：现代 API、构件、CLI 演变、
  训练、编码和评估。
- [scEmbed](references/scembed.md)：AnnData/token 准备、训练、
  推理、注释、隐私和泄漏。
- [BEDspace](references/bedspace.md)：元数据架构、精确的旧版 CLI、
  StarSpace 状态、构件和检索。
- [Consensus peaks](references/consensus_peaks.md)：coverage 前置条件、
  CC/CCF/ML/HMM、评估和 assembly 安全措施。
- [Utilities](references/utilities.md)：I/O、Gtars tokenizer、BBClient、
  评估、模型安全、迁移和带日期的来源。

源快照和主要论文链接的日期记录在
[references/utilities.md](references/utilities.md) 中。在更改固定的版本之前，
请重新检查发布元数据和已安装的签名。