# Boss直聘 (BOSS Zhipin)

## 概述
中国领先的直聘求职平台（中文网站 / 招聘信息平台范型）。求职者可直接与老板或 HR 沟通。支持搜索职位、查看包含薪资信息的职位详情、浏览公司资料，以及获取薪资统计数据。

## 工作流

### 查找和浏览职位
1. `searchJobs(query, city)` → 返回包含 `jobLink` 的职位卡片
2. `getJobDetail(jobId ← jobLink)` → 返回完整的职位信息，其中包含 `company.link`
3. `getCompanyProfile(companyId ← company.link)` → 返回公司信息和在招职位

### 研究薪资
1. `getSalary(query, city)` → 返回某城市中某职位的汇总薪资范围

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchJobs | 按关键词和城市搜索职位 | query, city | jobName, salaryDesc, company, jobLink, companyLink | 入口点；支持分页 |
| getJobDetail | 获取完整的职位信息 | jobId ← searchJobs.jobLink | jobName, salaryDesc, jobDescription, company, boss, tags | |
| getCompanyProfile | 获取公司资料 | companyId ← getJobDetail.company.link | name, industry, size, stage, description, jobs | |
| getSalary | 获取某职位的薪资统计数据 | query, city | averageMin, averageMax, minRange, maxRange, samples | 从搜索结果中的职位信息汇总得出 |
| getCities | 获取所有城市及其代码 | — | hotCityList, cityList (按省份分组) | 入口点；参考数据 |
| getIndustries | 获取行业分类 | — | code, name, subLevelModelList | 参考数据 |
| getFilterConditions | 获取搜索筛选选项 | — | salaryList, experienceList, degreeList, stageList, scaleList, jobTypeList | 参考数据 |

## 快速开始

```bash
# Search for Java jobs in Beijing
openweb boss exec searchJobs '{"query":"Java","city":"101010100"}'

# Get job details (use jobLink from search)
openweb boss exec getJobDetail '{"jobId":"/job_detail/xxx.html"}'

# Get company profile (use company.link from job detail)
openweb boss exec getCompanyProfile '{"companyId":"xxx.html"}'

# Get salary stats for product managers in Shanghai
openweb boss exec getSalary '{"query":"产品经理","city":"101020100"}'
```