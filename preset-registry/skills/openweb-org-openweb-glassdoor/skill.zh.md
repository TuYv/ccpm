# Glassdoor

## 概述
Glassdoor 是一个公司评价与职位研究平台（原型：招聘网站）。所有数据均通过基于浏览器的适配器访问，并绕过 Cloudflare 验证；不提供官方 API。

## 工作流

### 研究一家公司
1. `searchCompanies(query)` → 包含雇主 ID 和评分的公司列表
2. `getReviews(employerId)` → 包含优点、缺点和评分的员工评价
3. `getSalaries(employerId)` → 按职位划分的薪资数据及薪酬范围
4. `getInterviews(employerId)` → 包含难度和结果的面试经历

### 比较公司薪酬
1. `searchCompanies(query)` → 获取公司 A 的 employerId
2. `getSalaries(employerId)` → 获取公司 A 的薪资范围
3. 对公司 B 重复上述步骤

## 操作

| 操作 | 目的 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchCompanies | 按名称查找公司 | query | employerId, name, overallRating | 入口点 |
| getReviews | 员工评价 | employerId ← searchCompanies | rating, title, pros, cons, jobTitle | SSR + DOM |
| getSalaries | 按职位获取薪资数据 | employerId ← searchCompanies | jobTitle, payRange, salaryCount | DOM 提取 |
| getInterviews | 面试经历 | employerId ← searchCompanies | role, difficulty, experience, description | DOM 提取 |

## 快速开始

```bash
openweb glassdoor exec searchCompanies '{"query":"Google"}'
openweb glassdoor exec getReviews '{"employerId":9079}'
openweb glassdoor exec getSalaries '{"employerId":9079}'
openweb glassdoor exec getInterviews '{"employerId":9079}'
```