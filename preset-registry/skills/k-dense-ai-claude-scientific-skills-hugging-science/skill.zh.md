---
name: hugging-science
description: Use when the user is doing AI/ML work in a scientific domain such as biology, chemistry, physics, astronomy, climate, genomics, materials, medicine, ecology, energy, engineering, math, drug discovery, protein design, weather modeling, theorem proving, single-cell, or PDE solving. Hugging Science is a curated catalog of scientific datasets, models, blog posts, and interactive Spaces. This skill helps discover and use resources via `datasets`, `transformers`, the HF Inference API, `gradio_client`, and methodology citations.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# Hugging Science

Hugging Science 是一个经过精选、对 LLM 友好的科学数据集、模型、博文和交互式演示索引，面向机器学习研究人员。当你遇到科学机器学习问题时，可以使用它——相比通用搜索，它的信息信噪比高得多，并且其中的条目已经过质量和开放性预筛选。

它包含两个相关入口，应当同时使用：

- **位于 `huggingscience.co` 的目录**——这是一个涵盖 17 个科学领域的静态、可解析资源索引。它提供 `llms.txt`（精简内容）、`llms-full.txt`（完整内容）以及 `topics/<slug>.md`（按领域划分）。这些都是专为获取和阅读而设计的 markdown 文件。
- **`hugging-science` Hugging Face 组织**——`huggingface.co/hugging-science`——包含社区提交的数据集、少量模型以及约 27 个交互式 Spaces（尤其包括用于蛋白质/结合剂设计的 BoltzGen、用于提交数据集的 Dataset Quest，以及用于生态系统可视化的 Science Release Heatmap）。

该目录会指向托管在更广泛 Hugging Face Hub 上的资源。因此，像 `arcinstitute/opengenome2` 这样的条目是一个常规的 HF 数据集，你可以使用 `datasets` 库加载；像 `facebook/esm2_t33_650M_UR50D` 这样的条目是一个常规的 HF 模型，你可以使用 `transformers` 加载。目录的作用是精选和发现资源；资源的使用则通过标准 Hugging Face API 完成。

## 何时使用此技能

当用户的任务涉及将 AI/ML 应用于科学时，使用此技能。常见信号包括：

- 提到某个科学领域（蛋白质、基因组、分子、晶体、天气、气候、星系、EEG、微生物组、病理学、等离子体等）
- 询问“是否有用于 X 的数据集/模型”，其中 X 属于科学领域
- 希望在科学数据上进行微调、在科学基准上进行评估，或复现某篇科学机器学习论文
- 询问特定的已知科学模型（Evo-2、ESM2、BoltzGen、Nucleotide Transformer、基于 AlphaFold 的模型等）
- 需要用于科学任务的交互式演示（结合剂设计、定理证明等）

如果任务属于通用机器学习（推荐系统、聊天机器人 RAG、对猫狗进行视觉识别），则不应使用此技能——请改用通用的 HF Hub 知识。

## 核心工作流程

大多数调用都遵循以下五步循环。不要跳过发现环节——Hugging Science 的价值在于，它已经将数百个资源筛选为各领域中高信号的精选资源。

### 1. 确定领域

将用户的任务映射到 17 个主题 slug 中的一个或多个：

`astronomy` · `benchmark` · `biology` · `biotechnology` · `chemistry` · `climate` · `conservation` · `earth-science` · `ecology` · `energy` · `engineering` · `genomics` · `materials-science` · `mathematics` · `medicine` · `physics` · `scientific-reasoning`

有些任务会横跨多个主题（例如，药物发现 → `chemistry` + `biology` + `medicine`）。请获取每个相关主题的内容。

### 2. 获取相关目录内容

使用捆绑的脚本来获得整洁、结构化的访问方式：

```bash
python scripts/fetch_catalog.py topic biology
python scripts/fetch_catalog.py topic materials-science --filter models
python scripts/fetch_catalog.py search "protein language model"
python scripts/fetch_catalog.py all     # full llms-full.txt
```

你还可以直接获取原始 markdown：

- `https://huggingscience.co/llms.txt` — 精简索引
- `https://huggingscience.co/llms-full.txt` — 每个领域中的所有条目
- `https://huggingscience.co/topics/<slug>.md` — 单个领域（slug 使用连字符，例如 `materials-science.md`、`earth-science.md`、`scientific-reasoning.md`）

每个条目都是一个 markdown 块，其中包含 `Type`、`Tags`、`HuggingFace` URL（博客则为 `Link`），以及一行描述。有关条目结构和 slug 列表，请参阅 `references/topics-and-slugs.md`。

### 3. 选择合适的资源

阅读描述和标签。应根据判断将资源与用户的任务相匹配，而不是进行关键词重叠匹配。需要权衡以下因素：

- **规模匹配** — 对于笔记本电脑上的快速序列分类任务，Evo-2 40B 可能大材小用；ESM2 35M 可能正合适。
- **许可证和访问权限** — 大多数资源是开放的，但请检查底层 HF 模型卡片。
- **模态匹配** — DNA、蛋白质、SMILES 和晶体结构之间存在差异；许多“生物学”模型并不能互换使用。
- **新近程度 / 替代关系** — 如果较旧和较新的条目都涵盖同一任务，除非有不选择较新的理由，否则优先选择较新的条目。

如果你不确定应该选择哪个资源，请向用户简要介绍排名前 2–3 的候选项及其权衡，然后在用户选择后继续。如果该选择会实质性地改变工作内容，不要默默替用户做决定。

有关特定领域的首选资源（“如果不确定，就从这里开始”的条目），请参阅 `references/flagship-resources.md`。

### 4. 使用资源

具体操作取决于资源类型。在编写代码之前，先阅读对应的参考文件：

- **数据集** → `references/using-datasets.md` — 通过 `datasets` 加载、对超大语料库进行流式处理、常见列、数据集划分
- **模型** → `references/using-models.md` — 本地使用 `transformers`、Hugging Face Inference API、用于超大型模型的 Inference Providers、GPU 配置要求
- **Spaces（交互式演示）** → `references/using-spaces.md` — 使用 `gradio_client` 的模式，并附有一个完整的 BoltzGen 示例

这些参考文件简短且重点明确。如果你已经熟悉相关 API，可以快速浏览；如果不熟悉，则应在编写代码前完整阅读。与通用 HF 用法相比，其中的模式在一些重要方面有所不同（例如 `trust_remote_code` 要求、科学数据的 dtype 陷阱）。

### 5. 引用方法论

当目录中有与任务匹配的博客文章时（`Type: blog`，或某个主题文件的 Blog Posts 部分中列出的文章），请在向用户解释方法时附上其 URL。方法论博客由数据集/模型作者撰写，回答了模型卡片通常不会涉及的“为什么采用这种设计”问题。请将它们作为引用处理——用一行“参见 <link>，了解 X 背后的方法论”即可。

## 身份验证：HF_TOKEN

许多目录资源受到访问限制（临床数据、大型基础模型、私有 Spaces）。请通过环境变量 `HF_TOKEN` 进行身份验证。

**如果有 `.env` 文件，请从中加载 `HF_TOKEN`** — 用户会将机密信息保存在那里。在任何访问 HF API 的脚本开头使用 `python-dotenv`：

```python
from dotenv import load_dotenv
load_dotenv()    # 从当前工作目录或任意父目录中的 .env 读取 HF_TOKEN
```

如果 `.env` 不存在或未定义 `HF_TOKEN`，应优雅地回退——许多资源是公开的，无需令牌也能使用。不要将令牌硬编码，不要回显令牌，也不要将 `huggingface-cli login` 作为主要路径；用户更倾向于使用 `.env`。

`.env` 文件应包含类似以下内容的一行：

```
HF_TOKEN=hf_...
```

如果你正在创建新项目，那么如果 `.gitignore` 中尚未包含 `.env`，也请将其添加进去。

## 需要记住的几件重要事项

**目录经过整理，但并不完整。** 如果用户需要某个特定资源，而 Hugging Science 未列出该资源，并不意味着它不存在于 HF Hub 上。将直接搜索 HF Hub 作为备用方案。但当领域匹配时，始终应当*先从目录开始*——整理筛选正是其价值所在。

**目录中的条目是指向资源的指针。** 不要试图把“使用 Hugging Science”理解成调用某个 API。Hugging Science 没有推理端点。每个可操作的资源都位于 HF Hub 上，或作为 HF Space 提供，你需要通过标准的 HF 工具使用它。

**许多科学模型都需要 `trust_remote_code=True`。** 自定义架构（Evo-2，以及许多基因组学/材料科学模型）会附带自定义建模代码。这在该生态系统中很常见，但此标志会在用户的机器上执行模型仓库中的任意 Python 代码——因此在设置它之前，请先询问用户，说明仓库名称，并等待用户回复。出现在目录中不代表经过审核：目录条目是通过网络获取的指针，并不等同于代码审查。通过 `gradio_client` 向 Space 发送文件或令牌时同样如此。

**科学数据集通常很大，且形状不规则。** 基因组学语料库可能包含数十亿个令牌；宇宙学图像可能达到数百 GB；材料数据集则包含非标准对象（晶体结构、图）。对于任何声称超过几 GB 的数据集，默认使用流式传输（在 `load_dataset` 上设置 `streaming=True`），并在假定数据列之前先检查模式。

**Spaces 非常适合一次性的科学生成任务。** 如果用户想要为目标蛋白质设计结合体，或在托管模型演示上运行推理，那么通过 `gradio_client` 调用 Space 比在本地启动模型更快、更便宜。请先查看 `references/using-spaces.md`——`huggingface.co/hugging-science` 中大约有 27 个这样的资源。

**目录本身可能会发生变化。** 目录会定期添加条目；条目的 slug 偶尔也会发生变化。如果某个 URL 返回 404，请重新获取主题文件或 `llms.txt` 以获取当前状态——不要掩盖该失败。

## 随附资源

- `scripts/fetch_catalog.py` — 获取并筛选目录内容。运行 `--help` 查看完整用法。当你需要结构化访问时，优先使用此脚本，而不是临时调用 WebFetch。
- `references/topics-and-slugs.md` — 准确的主题 slug、每个主题涵盖的内容，以及条目架构。
- `references/using-datasets.md` — 加载科学数据集时的模式和注意事项。
- `references/using-models.md` — 在本地、通过 Inference API 或通过 Inference Providers 运行科学模型。
- `references/using-spaces.md` — 以编程方式调用 HF Spaces（尤其是 BoltzGen），使用 `gradio_client`。
- `references/flagship-resources.md` — 当用户需要合理的默认选项时，各领域的首选数据集/模型。