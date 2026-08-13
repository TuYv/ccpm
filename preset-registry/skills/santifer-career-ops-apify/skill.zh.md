---
name: career-ops-plugin-apify
description: How to scan a job source through an Apify actor as a keyed provider.
license: MIT
---
# apify 插件

一个按键提供者：运行 Apify actor 并将其数据集条目映射到
扫描器中。它仅在设置了 `provider: apify` 的 `portals.yml` 条目上触发，
绝不会通过自动检测触发。将 `APIFY_TOKEN` 放在 `.env` 中。

## portals.yml 条目

```yaml
tracked_companies:
  - name: "Indeed — VP Engineering (Chicago)"
    provider: apify
    actor: misceres/indeed-scraper
    input: { position: "VP of Engineering", location: "Chicago, IL", maxItems: 25 }
    field_map:
      title:    [positionName, title]    # array = first non-empty wins
      url:      url
      company:  [company, companyName]
      location: [location, formattedLocation]
```

## 然后

`node scan.mjs` 为该条目运行提供者，并将结果像其他来源一样写入
pipeline。可选的 `field_map.description` 会将 JD 本地缓存到 `jds/`。
