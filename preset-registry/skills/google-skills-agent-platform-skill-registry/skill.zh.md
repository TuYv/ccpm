---
name: agent-platform-skill-registry
metadata:
  category: AiAndMachineLearning
description: >
  Interact with the Gemini Enterprise Agent Platform Skill Registry to create
  and search for available skills. Use this skill to enable agents to register
  functionality or discover new capabilities.
---
# 技能注册表

此技能提供了在 Gemini Enterprise Agent Platform 上与 **Skill Registry** 交互的说明。

## 核心功能

-   **技能发现** - 查询注册表，以便轻松搜索、列出和获取特定技能，以及查看修订历史。
-   **技能生命周期管理** - 上传、更新或永久删除技能。
-   **操作监控** - 用于检查长时间运行的状态变更操作（LRO）是否完成的实用工具。
-   **生成技能** - 在本地自动完成新代理技能的初始脚手架搭建。

## 核心指令

-   **强制验证**：执行任何操作之前，始终运行环境验证检查。

    在执行任何操作之前，你**必须**验证核心环境。

    ```bash
    # Execute the validation script
    python3 scripts/validate_env.py
    ```

## 前提条件与身份验证

### 库与身份验证

确保已安装最新的 Google Cloud 凭据和库。

```bash
# Install required libraries
pip install google-auth requests

# Authenticate with Google Cloud
gcloud auth application-default login
```

### 环境变量

执行操作需要以下变量：

-   `GCP_PROJECT_ID`：你的 Google Cloud 项目 ID。
-   `GCP_LOCATION`：区域（例如 `us-central1`）。

--------------------------------------------------------------------------------

## 快速入门

快速搜索注册表中的可用技能：

```bash
python3 scripts/skill_registry_ops.py search \
  --query "test skill" \
  --top-k 5
```

--------------------------------------------------------------------------------

## 操作

-   **技能发现**：[query-skills.md](references/query-skills.md)
-   **技能生命周期**：[manage-skills.md](references/manage-skills.md)
-   **监控操作**：
    [monitor-operations.md](references/monitor-operations.md)
-   **生成技能**：[generate-skill.md](references/generate-skill.md)