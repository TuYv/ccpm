---
name: gtars
description: Use Gtars for local genomic interval models and set algebra, overlaps and counts, consensus and coverage, tokenization, fragment processing, and refget/BEDbase planning across Python, Rust, and the CLI.
license: MIT
compatibility: Python bindings require Python 3.10+ and gtars 0.9.2. The Rust meta-crate and gtars-cli are 0.9.0 and require a Rust toolchain supporting Edition 2024; upstream declares no rust-version. Bundled audit CLIs use only Python 3.10+ standard library and are local/network-free. Remote constructors, pretrained tokenizers, refget, and BEDbase caching require explicit network and storage approval.
allowed-tools: Read Write Edit Bash Glob
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# Gtars

Gtars 提供原生 Rust 实现、Python 绑定，以及一个由特性门控的
`gtars` 二进制程序，用于基因组区间和参考序列处理。请从随附的本地检查器开始；只有在数据契约、来源、资源限制和副作用都已明确后，才调用上游代码。

## 已验证快照（2026-07-23）

- Python：[`gtars==0.9.2`](https://pypi.org/project/gtars/)，发布于
  2026-06-17，`Requires-Python >=3.10`。
- Rust 元 crate：[`gtars=0.9.0`](https://crates.io/crates/gtars)，发布于
  2026-06-15。其默认特性集为空。
- CLI crate/二进制程序：[`gtars-cli=0.9.0`](https://crates.io/crates/gtars-cli)；
  已安装的二进制程序名为 `gtars`。
- 直接使用的 refget crate：[`gtars-refget=0.9.1`](https://crates.io/crates/gtars-refget)，
  发布于 2026-06-17。`gtars=0.9.0` 本身固定了其组件版本集，其中包括 refget 0.9.0。
- 上游有意对工作区 crate、Python 绑定和 CLI 独立进行版本管理。不要假设相同的版本号意味着相同的构件。
- 已发布文档的变更日志只更新到 0.5.1。此处的 API 示例已根据 0.9.2 Python 存根/运行时以及
  `v0.9.0` CLI/Rust 源代码进行检查。

`license: MIT` 字段涵盖此 skill。已发布的 `gtars` crate 声明使用 MIT 许可证，但 GitHub 仓库当前在根目录显示 BSD-2-Clause；重新分发前请核实确切构件的许可证。

## 原生代码信任门禁和精确固定版本

Python wheel 包含一个 PyO3 原生扩展。Cargo 安装会编译原生二进制程序，并可能运行依赖项构建脚本。请将任一路径都视为代码执行：

1. 确认官方 PyPI/crates.io/GitHub 所有者和不可变版本。
2. 检查文件名、平台标签、发布来源、许可证和 SHA-256。
   GitHub 的 v0.9.0 二进制发布包含每个归档文件对应的 `.sha256` 旁车文件。
3. 切勿运行不受信任的预构建二进制程序、wheel、源代码树、Cargo 构建脚本或归档安装程序。使用隔离环境，并限制 CPU/RAM/磁盘/时间资源。
4. 将锁文件和构件哈希与分析清单一同保存。

完成上述审查后，创建隔离的 Python 环境：

```bash
uv venv --python 3.11 .venv-gtars
uv pip install --dry-run --python .venv-gtars/bin/python "gtars==0.9.2"
uv pip install --python .venv-gtars/bin/python "gtars==0.9.2"
.venv-gtars/bin/python -c \
  "import gtars; assert gtars.__version__ == '0.9.2'; print(gtars.__version__)"
```

对于经过审查的 CLI 源代码版本：

```bash
cargo install gtars-cli --version 0.9.0 --locked
gtars --version
gtars --help
```

对于 Rust 项目，精确固定包装 crate，并且只启用所需特性：

```toml
[dependencies]
gtars = { version = "=0.9.0", default-features = false, features = [
  "core", "overlaprs", "uniwig", "tokenizers", "refget"
] }
```

仅当需要更新的直接组件 API 且兼容性已经过测试时，才直接使用
`gtars-refget = "=0.9.1"`。不要将这些固定版本替换为 Git
分支或未经审查的发布版本。

## 基因组数据契约

在每次操作之前应用以下约定：

1. **坐标：** BED 区间采用 0-based、半开区间表示法：`[start, end)`。
   要求 `0 <= start < end <= contig_length`。Gtars 坐标为 `u32`，因此应拒绝超过 `4,294,967,295` 的值。
2. **组装：** 记录组装版本号，以及精确的染色体大小或 refget 序列集合元数据的 SHA-256。绝不要根据文件名或 `chr` 前缀推断组装版本。
3. **Contig：** 精确比较名称。`1` 与 `chr1`、替代位点、诱饵序列和线粒体别名不可互换。只有在经过单独审查的转换中，才能进行重命名或 liftover。
4. **排序：** 保留原始文件，然后在操作需要时，按照染色体大小文件中的顺序以及数值型的起始/结束坐标对副本进行排序。Python 的 `RegionSet(path)` 在加载时当前会按 contig 和起始坐标进行字典序排序；之后不要依赖原始行顺序。
5. **链方向：** BED6 使用 `+`、`-` 或 `.`。`Region.rest` 会保留末尾的 BED 字段，但基于文件的 Python `RegionSet` 当前会将其独立的 `strands` 向量初始化为 `*`。某些集合操作会丢弃链方向信息。当链方向具有科学意义时，应在外部保留并验证它。
6. **重复项/相邻区间：** 明确选择相应的处理策略。`reduce()` 和 consensus 会合并重叠以及相邻的区间；普通的半开区间重叠不会将 `[0,10)` 和 `[10,20)` 视为重叠。

先运行本地验证器：

```bash
python3 -B scripts/bed_validator.py \
  --input data.bed.gz \
  --assembly GRCh38.p14 \
  --chrom-sizes GRCh38.p14.chrom.sizes \
  --require-sorted
```

## 安全的本地工作流

1. 清点本地文件、校验和、组装版本、contig 字典、坐标系统、链方向策略、患者/重复样本分组以及预期输出。
2. 验证 BED/fragments 并估算工作量。使用小型合成文件进行试运行。
3. 根据文档化的接口选择 Python、CLI 或 Rust；不要凭猜测翻译 API 名称。
4. 为输入字节数/记录数/文件数、线程数/任务数、内存、临时磁盘空间、输出大小和墙钟时间设置硬限制。
5. 在专用输出目录中运行。除非已明确批准覆盖，否则拒绝发生文件冲突。
6. 重新验证输出的排序、边界、行数、校验和及溯源信息。

## 当前 Python 核心

导入来自子模块，而不是 `gtars` 顶层：

```python
from gtars.models import Region, RegionSet

query = RegionSet.from_regions(
    [
        Region(chr="chr1", start=100, end=200, rest=None),
        Region(chr="chr1", start=300, end=400, rest=None),
    ],
    strands=["+", "-"],
)
universe = RegionSet.from_vectors(
    ["chr1", "chr1"],
    [150, 500],
    [350, 600],
)

counts = query.count_overlaps(universe)       # one count per query region
flags = query.any_overlaps(universe)          # one bool per query region
indices = query.find_overlaps(universe)       # indices into universe
pieces = query.intersect_all(universe)        # all intersection fragments
fraction = query.coverage(universe)           # fraction of query bp covered
```

`RegionSet.sort()` 会就地修改对象并返回 `None`。集合代数包括
`reduce`、`setdiff`、`pintersect`（按索引配对）、`concat`、`union`、`jaccard`、
`coverage`、`overlap_coefficient`、`intersect_all`、`closest`、`cluster` 和
`gaps`。在依赖排序或链方向之前，请先阅读 `references/python-api.md`。

Consensus 位于不同模块中，是一个 Python 绑定：

```python
from gtars.genomic_distributions import consensus

rows = consensus([query, universe])
# rows: [{"chr": ..., "start": ..., "end": ..., "count": ...}, ...]
```

在 Python 0.9.2 中，信号轨道生成**并未**作为 `gtars.uniwig` 暴露；请使用经过审查的 CLI 或 Rust API。`RegionSet.coverage()` 是一个碱基对集合指标，而不是 WIG/bigWig 生成器。

## 分词器、片段和参考存储

默认情况下只使用本地构造函数：

```python
from gtars.models import RegionSet
from gtars.tokenizers import Tokenizer

tokenizer = Tokenizer.from_bed("reviewed-universe.bed")
regions = RegionSet("local-query.bed")
tokens = tokenizer.tokenize(regions)
encoding = tokenizer(regions)
ids = encoding["input_ids"]
```

当参数不是现有本地目录时，`Tokenizer.from_pretrained(name)` 会连接 Hugging Face 并写入其缓存；它不提供 revision 或 cache 参数。请先获得明确批准，通过经过审查的机制获取不可变 revision，验证校验和，然后传入本地快照目录。请参阅 `references/tokenizers.md`。

对于 refget，优先使用 `RefgetStore.in_memory()` 或 `RefgetStore.open_local(path)`。
`open_remote(cache_path, remote_url)` 会连接远程服务、创建或使用本地缓存，并按需执行范围读取。请参阅 `references/refget.md`。

## 网络和缓存门控

此 skill 不会隐式执行下载或缓存写入。在执行任何具备网络能力的上游调用之前：

- 针对确切的主机、端点、数据和缓存，获得用户的明确批准；
- 将 HTTPS 主机加入允许列表，并拒绝未经审查的重定向；
- 记录不可变 revision/identifier、获取时间、预期 SHA-256 和 domain digest、assembly accession、大小配额以及来源信息；
- 披露可能离开已批准环境的敏感 BED 坐标、条形码、样本标签和参考选择；
- 在使用下载内容之前，将其作为不受信任内容进行验证。

重要副作用：

- `RegionSet(path)` 支持 HTTP；不存在的本地字符串可能会被视为 URL。在构造之前，请检查本地路径是否存在。
- `Tokenizer.from_pretrained` 可能会将 `universe.bed.gz` 下载到 Hugging Face 缓存中。
- `RefgetStore.on_disk` 会创建并写入存储。`open_remote` 会加载远程元数据，并默认启用持久化。
- 即使是在构造客户端时，`gtars bbcache` 也会创建缓存目录。缓存/下载命令使用 `BBCLIENT_CACHE`（默认值为 `~/.bbcache`）和 `BEDBASE_API`（默认值为 `https://api.bedbase.org`）。

## 敏感元数据和泄漏

基因组区间、罕见位点、条形码、样本名称、表型和组装选择都可能具有识别性。不要将完整路径和原始坐标写入日志；默认的捆绑报告会对路径进行脱敏，并且只输出计数/校验和。

先按患者/供体冻结数据划分，然后将所有技术和生物学重复样本保留在同一划分中。仅使用训练数据拟合共识集合、全集、分词器、缩放参数、阈值和 QC 规则。不要先从所有样本创建全集再进行划分：这会泄露验证集/测试集的位点支持信息。分别记录排除的样本和重复样本聚合情况。

## Bundled deterministic CLIs

所有六个辅助工具都会拒绝 URL、路径遍历、符号链接和特殊文件；会应用字节数、记录数、文件数、坐标数和 worker 数上限；不会使用网络或 gtars import；也不会写入输出文件。计划包含固定的 argv 模板，并且永远不会启动这些工具。

```bash
python3 -B scripts/bed_validator.py --help
python3 -B scripts/execution_plan.py --help
python3 -B scripts/tokenizer_manifest.py --help
python3 -B scripts/refget_digest_plan.py --help
python3 -B scripts/coverage_preflight.py --help
python3 -B scripts/artifact_inspector.py --help
```

在不生成字节码的情况下运行合成测试：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover \
  -s tests/gtars -p 'test_*.py' -v
```

## Migration traps removed in 1.1

不要使用包含 `gtars.RegionSet`、`RegionSet.from_bed`、`TreeTokenizer`、`gtars.igd.build_index`、`gtars.uniwig.coverage_from_bed`、`gtars.RefgetStore`、全局 `set_option`/`set_log_level`、`parallel_apply` 或虚构异常类的过时示例。`uniwig generate`、`igd build`、`scoring score` 和 `fragsplit cluster-split` 等 CLI 形式对于 0.9.0 也已过时。

上游发布的文档和存根存在一些偏差（例如较旧的 `GlobalRefgetStore` 教程以及不完整的 0.9.2 存根）。如果二者发生冲突，应优先采用已安装版本的签名冒烟测试以及不可变的带标签源代码。

## Bundled references

以下是仅有的六个捆绑参考；所有链接均为本地链接且实际存在：

- `references/python-api.md` — Python 0.9.2 的确切导入方式和行为
- `references/overlap.md` — 重叠/计数/集合代数和共识语义
- `references/coverage.md` — uniwig、bigWig、coverage、排序和资源
- `references/tokenizers.md` — 分词器/全集以及片段兼容性
- `references/refget.md` — 摘要、存储、BEDbase、网络/缓存控制
- `references/cli.md` — CLI 0.9.0 命令、功能和迁移内容