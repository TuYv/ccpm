---
name: finding-google-skills
metadata:
  category: MultiProductSolutions
description: >-
  Locates and loads the right Google product skill on demand from a remote
  catalog index, instead of preloading every skill. Use at the START of any
  request touching a Google product, API, or developer platform - including
  Google Cloud (GKE, Cloud Run, IAM, BigQuery, Vertex AI, Spanner), Google Ads,
  Google Analytics, Google Workspace (Gmail, Drive, Admin SDK), Chrome and
  Chrome extensions, Android, Firebase, YouTube, Google Maps, Gemini and the
  Gemini API, Google Play, and Flutter. Consult the index before answering from
  memory or searching the web. Don't use for non-Google products.
---
# Google Skill Finder

将请求路由到适用的已发布 Google skills。目录位于此文件之外，并按需获取，因此在实际发生查找之前，加载此 skill 几乎不会产生开销。

## Workflow

1.  **逐字节获取目录。** 使用原始 shell 获取方式（`curl`、`wget`；Windows PowerShell 中使用 `curl.exe`）获取
    `https://raw.githubusercontent.com/google/skills/main/index.json`。内容必须逐字节保持一致，每个 `entrypoint` URL 都必须完整且未经修改地保留。

    如果没有 shell 获取工具但存在 Node，也可以使用 `node -e
    "fetch(process.argv[1]).then(r=>r.text()).then(t=>console.log(t))" {url}`
    返回字节内容。

    目录约为 75 KB，可能无法在单次工具结果中完整显示；截断的预览按字母顺序排列，因此看起来好像只有前几个产品。优先在读取前缩小范围。使用 `jq`：
    `curl -sSL {url} | jq -r '.skills[] | select((.name+" "+.description)|test("gke";"i")) | "\(.name)\t\(.entrypoint)"'`。
    在 Windows PowerShell 中：`(Invoke-RestMethod {url}).skills | Where-Object {
    $_.description -match "gke" } | Select-Object name, entrypoint -First 3`。
    如果两者都没有，直接对原始 JSON 使用 `grep -o` 也可以隔离候选名称。

    如果没有任何过滤工具，将目录写入文件并分段读取（`curl -sSL {url} -o skills-index.json`，或 `Invoke-WebRequest {url}
    -OutFile skills-index.json`）。无论如何，这通常都是更好的选择：它可以避免截断，而且重新读取本地文件不会产生额外开销。请求完成后删除它。

    如果只能使用摘要式获取工具，请将请求表述为提取，而不是抄录：*"列出此文档中的每个 `entrypoint` 字段，每行一个，并严格按照原样输出。"*
    请求逐字返回内容会得到无法使用的结果。

2.  **在使用获取结果之前确认获取成功。** 工具调用未抛出错误并不代表成功。只有当响应正文能够解析为 JSON，并且包含 `skills` 数组时，才算成功。404 页面、HTML 错误页面、TLS 或连接错误、空正文，或任何无法解析的内容，都属于获取失败，即使工具报告没有错误。
    证书错误属于获取失败，并且是最终失败。绝不能关闭验证后重试。不能使用 `curl -k` 或 `--insecure`。不能使用 `-SkipCertificateCheck`；在不存在该参数的 Windows PowerShell 5.1 中，也不能使用 `ServicePointManager` 证书回调。任何语言中的等效方式同样不允许。
    你即将遵循返回内容中的指令，因此未经验证的目录比没有目录更糟糕。获取失败时，在此停止，并转到“获取失败时”。

3.  **根据描述匹配请求。** 每个描述都会说明 skill 的功能、适用时机，以及通常还会说明不适用的情况。将它们作为路由标准来阅读，而不是摘要。最多选出三个 `description` 能够覆盖该请求的条目。如果有超过三个条目看起来同样相关，应优先选择更具体的条目，而不是更通用的条目。

4.  **仅获取匹配项。** 以相同方式获取每个入选条目的 `entrypoint` URL，并遵循该技能的说明。不要获取那些仅仅看起来相关的条目。

5.  **如结果为空，应如实报告。** 如果没有任何描述涵盖该请求，请说明没有已发布的 Google 技能适用，并继续处理，不要使用技能。绝不要编造技能名称或入口点 URL。

路由过程在匹配项获取完成后结束。从你开始遵循某个已获取技能的说明时起，该技能就负责处理此请求，且不会再次为此请求重新进入。

## 规则

-   **每个会话只获取一次；绝不要跨会话保留。** 在本会话早些时候成功获取的目录可以重复使用。不得以任何形式将其带入后续运行：目录会定期变更，而保存的副本会在不知不觉中过时。会话内复用不能替代失败后的重新获取。

-   **绝不要将目录保留到请求结束之后。** 在筛选期间将工作副本保存在磁盘上是可以的。但不得将其作为保存的参考，也不得将其总结后写回对话。这样做的目的是避免将 100 多个技能的完整文本带入上下文。

-   **优先使用已获取的 SKILL.md，而不是先前的知识。** 目录由已发布的技能生成，因此入口点中的内容是当前文本，即使它与您记忆中的内容相矛盾，也应以入口点为准。

-   **不要将此技能视为前置条件。** 如果某个特定的 Google 技能已经加载并且涵盖了该请求，请直接使用它。

## 获取失败时

从第 2 步进入。按以下顺序处理，直到第一项成功为止：

1.  **使用 `curl -sSL` 重试一次。** 如果第一次尝试使用了摘要式获取工具，或遇到了传输错误，这通常就能解决问题。

2.  **改为列出仓库树。** 运行

    ```bash
    curl -sSL 'https://api.github.com/repos/google/skills/git/trees/main?recursive=1'
    ```

    并读取以 `SKILL.md` 结尾的路径。每个路径都是候选项。从 `https://raw.githubusercontent.com/google/skills/main/{path}` 获取其中目录名称与请求最匹配的两三个候选项，并按照第 2 步中的方式逐一检查。

3.  **在回复中说明。** 如果两种方式都未成功，请明确说明无法访问 Google 技能目录，并在不使用该目录的情况下回答。用一句话说明即可，并且应将其写在给用户的回复中，而不只是写在推理中。

获取失败绝不意味着可以假装获取成功后再回答。在本会话中解析出 `skills` 数组之前，你并不知道有哪些技能存在：不要命名任何技能，不要描述任何技能，也不要声称没有技能适用。凭记忆想起某个技能并将其作为目录结果呈现，是最糟糕的做法，因为回复中没有任何内容能够证明它不是一次真实查询。