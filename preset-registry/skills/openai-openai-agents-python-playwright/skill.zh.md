---
name: "playwright"
description: "Use when the task requires capturing or automating a real browser from the terminal."
---
# Playwright

使用 Playwright 直接捕获静态站点。本示例无需启动服务器。

```sh
mkdir -p output/screenshots output/playwright/.tmp
export TMPDIR="$PWD/output/playwright/.tmp"
export TEMP="$TMPDIR"
export TMP="$TMPDIR"
npx --yes --package playwright@1.50.0 playwright install chromium
npx --yes --package playwright@1.50.0 playwright screenshot \
  --browser=chromium \
  --viewport-size=2048,1152 \
  "file://$PWD/output/site/index.html" \
  output/screenshots/draft-1.png
```

第二次执行时，将最终路径更改为 `output/screenshots/draft-2.png`。