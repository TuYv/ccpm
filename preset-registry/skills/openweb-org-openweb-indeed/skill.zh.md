# Indeed

## 概述
职位搜索平台。搜索职位、查看招聘信息、薪资数据、公司资料和评价。

## 工作流

### 查找并申请职位
1. `searchJobs(q, l)` → `jobkey`、职位名称、公司、薪资
2. `getJobDetail(jk=jobkey)` → 完整招聘信息，包括职位描述、薪资、福利和公司信息

### 研究薪资
1. `autocompleteJobTitle(q)` → `title`（标准化）
2. `getSalary(title)` → 中位数、范围、热门城市、热门公司
3. `getSalary(title, location)` → 特定地点的薪资

### 研究公司
以下操作均使用相同的 `company` slug（入口点）：
1. `getCompanyOverview(company)` → 评分、公司简介、职位、地点
2. `getCompanyReviews(company)` → 包含优缺点的员工评价
3. `getCompanySalaries(company)` → 按职位名称划分的薪资

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchJobs | 按关键词和地点搜索职位 | q, l（可选） | jobkey、职位名称、公司、薪资、摘要 | 入口点；使用 start=10,20,... 进行分页 |
| getJobDetail | 获取完整招聘信息 | jk ← searchJobs → jobkey | 职位名称、描述、薪资、福利、公司 | LD+JSON + _initialData |
| getSalary | 获取某个职位的薪资数据 | title ← autocompleteJobTitle，location（可选） | 中位数、最低值、最高值、热门城市、热门公司 | Next.js __NEXT_DATA__ |
| getCompanyOverview | 获取公司信息和评分 | company slug | 公司简介、评分、薪资、职位、地点 | 入口点；_initialData |
| getCompanyReviews | 获取员工评价 | company slug | reviews[].rating、评价文本、jobTitle、子类别评分 | 入口点；_initialData + LD+JSON |
| getCompanySalaries | 获取某家公司的薪资数据 | company slug | categories[].salaries[].jobTitle、薪资；popularJobs | 入口点；_initialData |
| autocompleteJobTitle | 获取职位名称建议 | q（部分文本） | 标准化的职位名称 | 入口点；为 getSalary 提供输入 |
| autocompleteLocation | 获取地点建议 | q（部分文本） | 城市/州/国家建议 | 入口点；为 getSalary、searchJobs 提供输入 |

## 快速开始

```bash
# Search for jobs
openweb indeed exec searchJobs '{"q":"software engineer","l":"San Francisco, CA"}'

# Get job details (use jobkey from search results)
openweb indeed exec getJobDetail '{"jk":"72046173738a7637"}'

# Get salary data
openweb indeed exec getSalary '{"title":"software engineer"}'

# Company overview
openweb indeed exec getCompanyOverview '{"company":"Google"}'

# Company reviews
openweb indeed exec getCompanyReviews '{"company":"Google"}'

# Autocomplete job title
openweb indeed exec autocompleteJobTitle '{"q":"softw"}'
```