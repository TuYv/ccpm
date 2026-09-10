---
name: dbt-sf-to-bq-translator
metadata:
  category: BigDataAndAnalytics
description: >-
  Translates Snowflake dbt SQL models to Standardized BigQuery SQL. Handles SQL
  compilation, Jinja macro placeholder masking, BigQuery Translation Service migration
  workflows, AST-based config transformations, explicit type casting, JSON extraction
  standardization, and deduplication. Use when migrating Snowflake dbt pipelines
  or models to Google Cloud BigQuery. Don't use for generic BigQuery queries or
  non-Snowflake SQL migrations.
---
# dbt Snowflake 到 BigQuery 翻译器

你负责：
1.  **方言翻译**：将 Snowflake dbt SQL 模型翻译为标准化的 Google BigQuery SQL。
2.  **标准化与合规性**：执行 Google 特定标准，包括在每个文件最顶部添加版权标头、显式类型转换、标准化 JSON 提取，以及使用 `QUALIFY` 和 `_extracted_at` 进行去重。
3.  **工作流集成**：保留 dbt Jinja 构造，并存储最终兼容 BigQuery 的模型。

遵循 `migration_plan/[mig_prefix]/tasks.md` 中提供的指令。操作期间，将进度和最终总结添加到 tasks 文件中，以便人工主管跟踪进展。通过检查 tasks 文件从错误中恢复。

# 前置条件与环境设置

开始翻译之前，确保 Google Cloud 环境已正确配置：
1. **Google Cloud SDK**：如果尚未安装，请安装 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install.md.txt)。
2. **身份验证**：对 CLI 会话进行身份验证：
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
3. **项目配置**：设置当前活动的 GCP 项目：
    ```bash
    gcloud config set project {project_id}
    ```
4. **结算账号**：确认目标项目已关联有效的 Google Cloud Billing 账号。
5. **启用所需 API**：确保 BigQuery、Migration 和 Storage 服务已启用：
    ```bash
    gcloud services enable bigquerymigration.googleapis.com storage.googleapis.com bigquery.googleapis.com
    ```
6. **区域选择**：配置首选的计算/BigQuery 区域（默认推荐：`us-central1` 或 `us`）。请参阅 [Google Cloud Locations](https://cloud.google.com/about/locations.md.txt)：
    ```bash
    gcloud config set compute/region us-central1
    ```

# 步骤

- **初始化与设置**：如果没有定义 `mig_prefix`，或者用户希望开始新的翻译项目，**必须**首先向用户询问：
  1. 迁移项目名称（例如 `my_migration_project`）。
  2. 包含 Snowflake SQL 文件的输入目录。
  3. 用于保存 BigQuery SQL 文件的输出目录。
  4. 用于暂存翻译资产的 GCS Bucket 名称。
  5. GCP 区域（例如 `us` 或 `eu`）。
  6. （可选）包含源数据库元数据的目录或 `.zip` 文件的本地路径（例如 `columns.csv` 或 `tables.csv`）。
  收到这些信息后，在 `migration_plan/[mig_prefix]/tasks.md` 下创建任务清单文件，其中包含代表迁移步骤的未勾选任务。

- **通过内置脚本自动执行**：
  使用内置翻译脚本 `scripts/bulk_translate_via_gcloud.py` 执行确定性的端到端迁移：
  ```bash
  python3 scripts/bulk_translate_via_gcloud.py \
    --input <input_dir> \
    --output <output_dir> \
    --bucket <gcs_bucket> \
    --location <region> \
    [--metadata <metadata_path>]
  ```
  `scripts/` 中内置的迁移工具将执行以下协调操作：
  - `scripts/bulk_translate_via_gcloud.py`：编排端到端批量迁移，自动完成预处理、GCS 上传、BigQuery Translation Service 调用、下载、后处理和 YAML 配置复制。
  - `scripts/dbt_translator.py`：核心翻译库，包含用于 `config(...)` 的确定性 AST 解析器、Jinja 占位符屏蔽与恢复、JSON 提取清理、宏审计、大小写/连接标准化以及版权标头强制添加。

- **详细翻译生命周期（由脚本执行）**：
  1.  **使用占位符编译为标准 SQL（翻译前）**：
      - 读取原始源 dbt `.sql` 文件。提取并移除每个文件顶部的 `{{ config(...) }}` 头部块。
      - 将 dbt 宏调用替换为符合标准 SQL 的占位符标识符，以防止 BigQuery Translation Service 抛出语法错误：
        * 将 `{{ source('src_name', 'table_name') }}` 替换为 `_DBT_SOURCE_src_name_DBTSEP_table_name_`
        * 将 `{{ ref('model_name') }}` 替换为 `_DBT_REF_model_name_`
      - 在翻译前从 SQL 中消除 Jinja 花括号（`{{ ... }}`），确保转译器处理 100% 有效的 Snowflake 方言 SQL。
  2.  **隔离 SQL 文件**：
      - 将这些预处理后的无 Jinja 文件保存到可供上传至 GCS 的暂存输入目录。
  3.  **预处理元数据并通过 BigQuery Translation Service 翻译 SQL**：
      - 如果提供了元数据路径，则将与发现的 dbt 模型/源匹配的表条目映射为 `columns.csv` 和 `tables.csv` 中的占位符名称，清空 catalog 名称以防止命名空间解析错误，将其打包为 `metadata.zip` 并上传至 GCS。
      - 将暂存 SQL 文件上传至 GCS：
        `gcloud storage cp <staging_input_dir>/*.sql gs://[YOUR_BUCKET]/migration_input/`
      - 创建 `migration_config.yaml`，指定 `snowflakeDialect` 为源方言、`bigqueryDialect` 为目标方言（如果提供了 `metadata.zip`，则将 `schemaPath` 指向该文件）。
      - 触发翻译工作流：
        `gcloud bq migration-workflows create --location=<region> --config-file=migration_config.yaml --no-async`
      - 从 GCS 下载翻译后的 GoogleSQL 文件：
        `gcloud storage cp gs://[YOUR_BUCKET]/migration_output/*.sql <translated_output_dir>/`
  4.  **恢复占位符并重新嵌入 dbt 逻辑**：
      - 获取翻译后的 BigQuery SQL 文件并执行高级后处理：
        * **基于 AST 的 Config 转换**：解析原始的 `{{ config(...) }}` 块，移除 `copy_grants`、`transient` 和 `secure` 等 Snowflake 专用参数。清理钩子（`pre_hook` 和 `post_hook`），移除无效的 Snowflake 命令，例如 `ALTER ICEBERG TABLE ... REFRESH` 或 `UNSET SECURE`，同时保留有效命令。
        * **引用解析器（命名空间解析）**：扫描 FROM 和 JOIN 子句中的硬编码 Snowflake 数据库/架构表路径，并通过与发现的项目模型和源进行解析，将其映射回原生 dbt `{{ ref(...) }}` 或 `{{ source(...) }}` 宏。
        * **宏与语法审计**：扫描所有 `{{ ... }}` Jinja 表达式，并记录任何自定义或未列入允许列表的数据库专用宏的警告。同时审计这些块中的 Snowflake 专用语法（例如 `::date`、`dateadd`、`to_date`），这些语法可能已被跳过或屏蔽，并将警告注释直接列入文件。
        * **平衡 SQL 边界情况清理**：使用平衡括号解析器转换控制块内外的日期强制转换后缀（`::date` -> `CAST(... AS DATE)`）、日期时间强制转换后缀（`::timestamp` -> `CAST(... AS TIMESTAMP)`）、嵌套的 `dateadd(...)` 调用以及间隔表达式（`- interval '5 month'`）。
        * **版权头部放置**：在文件最顶部、config 块之前添加强制性的 Google 版权头部。
  5.  **写入新的 BigQuery dbt 文件并复制 YAML 配置**：
      - 保存重新组装的、兼容 BigQuery 的文件，同时保留目录结构。此外，将输入目录中的所有 `.yml`/`.yaml` 文件复制到输出目录。

请提供需要翻译的英文 `SKILL.md` 片段，或指定工作区中对应的源文件路径。目前缺少源文档内容和迁移任务范围，无法生成 `migration_plan/[mig_prefix]/translated_models/` 下的 BigQuery dbt SQL 模型，也无法更新任务文件或请求对具体翻译结果进行审批。