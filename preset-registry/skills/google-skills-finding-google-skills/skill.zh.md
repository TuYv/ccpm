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

将请求路由到适用的已发布 Google skills。目录位于此文件之外，并按需获取，因此在实际发生查找之前，加载此 skill 几乎不会产生任何开销。

## 工作流

1.  **逐字节获取目录。** 使用原始 shell 获取命令（`curl`、`wget`；Windows PowerShell 使用 `curl.exe`）获取
    `https://raw.githubusercontent.com/google/skills/main/index.json`。获取结果必须逐字节一致，其中每个
    `entrypoint` URL 都必须完整且未经修改。

    如果没有 shell 获取工具但存在 Node，也可以使用 `node -e
    "fetch(process.argv[1]).then(r=>r.text()).then(t=>console.log(t))" {url}`
    返回字节内容。

    目录约为 75 KB，可能无法在单次工具结果中完整显示；截断的预览按字母顺序排列，因此看起来仿佛只有前几个产品。优先在读取前缩小范围。使用 `jq`：
    `curl -sS {url} | jq -r '.skills[] | select((.name+" "+.description)|test("gke";"i")) | "\(.name)\t\(.entrypoint)"'`。在 Windows PowerShell 中：
    `(Invoke-RestMethod {url}).skills | Where-Object {
    $_.description -match "gke" } | Select-Object name, entrypoint -First 3`。如果两者都没有，直接对原始 JSON 使用
    `grep -o` 仍可筛选出候选名称。

    如果没有任何筛选工具，请将目录写入文件并分段读取（`curl -sS {url} -o skills-index.json`，或 `Invoke-WebRequest {url}
    -OutFile skills-index.json`）。无论如何，这通常都是更好的选择：它可以避免截断问题，并且重新读取本地文件无需任何成本。请求完成后删除该文件。

    如果只有摘要式获取工具可用，请将请求表述为提取，而不是逐字转录：*“列出此文档中的每个 `entrypoint` 字段，每行一个，并严格按照原文书写。”* 要求逐字返回会得到无法使用的结果。

2.  **在使用获取结果之前确认检索成功。** 工具调用未抛出错误并不表示成功。只有当响应正文能够解析为 JSON 且包含 `skills` 数组时，才算成功。404 页面、HTML 错误页面、TLS 或连接错误、空响应，或任何无法解析的内容，即使工具报告没有错误，也都属于检索失败。
    证书失败属于检索失败，并且是最终结果。绝不要在禁用验证的情况下重试。不要使用 `curl -k` 或 `--insecure`。不要使用 `-SkipCertificateCheck`；在不支持该参数的 Windows PowerShell 5.1 中，也不要使用 `ServicePointManager` 证书回调。任何语言中的等效方式都不行。
    你即将遵循返回内容中的指令，因此未经验证的目录比没有目录更糟糕。检索失败时，在此停止，并转到“获取失败时”。

3.  **将请求与描述进行匹配。** 每个描述都会说明 skill 的功能、适用时机，以及通常不适用的情况。将它们作为路由标准来阅读，而不是摘要。最多列出三个 `description` 覆盖该请求的条目。当超过三个条目看起来同样相关时，优先选择更具体的，而不是更通用的。

4.  **仅获取匹配项。** 以相同方式获取每个入选条目的 `entrypoint` URL，并遵循该技能的说明。不要获取那些只是看起来相关的条目。

5.  **如结果为空，务必如实报告。** 如果没有任何描述涵盖该请求，请说明没有适用的已发布 Google 技能，并继续执行而不使用技能。绝不要编造技能名称或入口点 URL。

匹配项获取完毕后，路由流程即告结束。从你开始遵循某个已获取技能的说明时起，该技能就负责处理此次请求，并且不会再次为此请求进入本技能。

## 规则

-   **每个会话只获取一次；绝不要将其保留到会话之外。** 在本次会话中重复使用此前成功获取的目录是可以的。但以任何形式将目录带入后续运行都不可以：目录会定期发生变化，而保存的副本会在不知不觉中过时。会话内复用不能替代失败的获取操作。

-   **绝不要将目录保留到请求之外。** 在筛选目录时将工作副本保存在磁盘上是可以的。但不能将其作为保存的参考资料，也不能将其总结后写回对话。保留目录的目的，是避免将 100 多个技能的完整文本全部放入上下文。

-   **优先使用已获取的 SKILL.md，而不是先前的知识。** 目录是根据技能发布时的内容生成的，因此即使入口点中的内容与你记忆中的内容相矛盾，入口点仍然代表当前文本。

-   **不要将本技能视为前置条件。** 如果某个具体的 Google 技能已经加载且能够涵盖该请求，请直接使用它。

## 获取失败时

从第 2 步进入此流程。按以下顺序逐项处理，在第一个成功的步骤处停止：

1.  **使用 `curl -sS` 重试一次。** 如果第一次尝试使用了会进行总结的获取工具，或遇到了传输错误，通常仅此操作就能解决问题。

2.  **改为列出仓库树。** 运行

    ```bash
    curl -sS 'https://api.github.com/repos/google/skills/git/trees/main?recursive=1'
    ```

    并读取以 `SKILL.md` 结尾的路径。每个路径都是候选项。从 `https://raw.githubusercontent.com/google/skills/main/{path}` 获取其中目录名称与请求最匹配的两三个路径，并按照第 2 步所述的方式逐一检查。

3.  **在回复中说明情况。** 如果两种方式都失败，请明确说明你无法访问 Google skills 目录，并将在不使用该目录的情况下作答。一行即可，且应放在给用户的回复中，而不只是放在你的推理中。

获取失败绝不是可以假装获取成功并作答的许可。在本次会话中解析出 `skills` 数组之前，你并不知道有哪些技能存在：不要提及某个技能，不要描述某个技能，也不要声称没有技能适用。凭记忆想起某个技能并将其说成目录结果，是最糟糕的结果，因为回复中没有任何内容能将其与真实查询结果区分开来。