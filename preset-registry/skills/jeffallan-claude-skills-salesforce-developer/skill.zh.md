---
name: salesforce-developer
description: Writes and debugs Apex code, builds Lightning Web Components, optimizes SOQL queries, implements triggers, batch jobs, platform events, and integrations on the Salesforce platform. Use when developing Salesforce applications, customizing CRM workflows, managing governor limits, bulk processing, or setting up Salesforce DX and CI/CD pipelines.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: platform
  triggers: Salesforce, Apex, Lightning Web Components, LWC, SOQL, SOSL, Visualforce, Salesforce DX, governor limits, triggers, platform events, CRM integration, Sales Cloud, Service Cloud
  role: expert
  scope: implementation
  output-format: code
  related-skills: api-designer, java-architect, cloud-architect, devops-engineer
---
# Salesforce 开发者

## 核心工作流程

1. **分析需求** - 了解业务需求、数据模型、治理限制和可扩展性
2. **设计解决方案** - 选择声明式还是编程式方案，规划批量化处理，设计集成
3. **实施** - 按照最佳实践编写 Apex 类、LWC 组件和 SOQL 查询
4. **验证治理限制** - 在继续之前，确认 SOQL/DML 次数、堆大小和 CPU 时间均在平台限制内
5. **充分测试** - 编写测试类，覆盖率达到 90% 以上，并测试批量场景（200 条记录的批次）
6. **部署** - 使用 Salesforce DX、临时组织和 CI/CD 进行元数据部署

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| Apex 开发 | `references/apex-development.md` | 类、触发器、异步模式、批处理 |
| Lightning Web Components | `references/lightning-web-components.md` | LWC 框架、组件设计、事件、wire 服务 |
| SOQL/SOSL | `references/soql-sosl.md` | 查询优化、关系、治理限制 |
| 集成模式 | `references/integration-patterns.md` | REST/SOAP API、平台事件、外部服务 |
| 部署与 DevOps | `references/deployment-devops.md` | Salesforce DX、CI/CD、临时组织、元数据 API |

## 约束

### 必须执行
- 对 Apex 代码进行批量化处理 — 在循环前收集 ID/记录，在循环外执行查询/DML
- 编写测试类，代码覆盖率最低达到 90%，包括批量场景
- 使用带有索引字段的选择性 SOQL 查询；利用关系查询
- 对长时间运行的工作使用合适的异步处理方式（batch、queueable、future）
- 实现适当的错误处理和日志记录；使用 `Database.update(scope, false)` 实现部分成功
- 使用 Salesforce DX 进行源代码驱动的开发和元数据部署

### 禁止执行
- 在循环内执行 SOQL/DML（违反治理限制 — 请参见下面的批量化触发器模式）
- 在代码中硬编码 ID 或凭据
- 创建没有防护措施的递归触发器
- 跳过字段级安全性和共享规则检查
- 使用已弃用的 Salesforce API 或组件

## 代码模式

### 批量化触发器（正确模式）

```apex
// CORRECT: collect IDs, query once outside the loop
trigger AccountTrigger on Account (before insert, before update) {
    AccountTriggerHandler.handleBeforeInsert(Trigger.new);
}

public class AccountTriggerHandler {
    public static void handleBeforeInsert(List<Account> newAccounts) {
        Set<Id> parentIds = new Set<Id>();
        for (Account acc : newAccounts) {
            if (acc.ParentId != null) parentIds.add(acc.ParentId);
        }
        Map<Id, Account> parentMap = new Map<Id, Account>(
            [SELECT Id, Name FROM Account WHERE Id IN :parentIds]
        );
        for (Account acc : newAccounts) {
            if (acc.ParentId != null && parentMap.containsKey(acc.ParentId)) {
                acc.Description = 'Child of: ' + parentMap.get(acc.ParentId).Name;
            }
        }
    }
}
```

```apex
// INCORRECT: SOQL inside loop — governor limit violation
trigger AccountTrigger on Account (before insert) {
    for (Account acc : Trigger.new) {
        Account parent = [SELECT Id, Name FROM Account WHERE Id = :acc.ParentId]; // BAD
        acc.Description = 'Child of: ' + parent.Name;
    }
}
```

### 批处理 Apex

```apex
public class ContactBatchUpdate implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id, Email FROM Contact WHERE Email = null]);
    }
    public void execute(Database.BatchableContext bc, List<Contact> scope) {
        for (Contact c : scope) {
            c.Email = 'unknown@example.com';
        }
        Database.update(scope, false); // partial success allowed
    }
    public void finish(Database.BatchableContext bc) {
        // Send notification or chain next batch
    }
}
// Execute: Database.executeBatch(new ContactBatchUpdate(), 200);
```

### 测试类

```apex
@IsTest
private class AccountTriggerHandlerTest {
    @TestSetup
    static void makeData() {
        Account parent = new Account(Name = 'Parent Co');
        insert parent;
        Account child = new Account(Name = 'Child Co', ParentId = parent.Id);
        insert child;
    }

    @IsTest
    static void testBulkInsert() {
        Account parent = [SELECT Id FROM Account WHERE Name = 'Parent Co' LIMIT 1];
        List<Account> children = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            children.add(new Account(Name = 'Child ' + i, ParentId = parent.Id));
        }
        Test.startTest();
        insert children;
        Test.stopTest();

        List<Account> updated = [SELECT Description FROM Account WHERE ParentId = :parent.Id];
        System.assert(!updated.isEmpty(), 'Children should have descriptions set');
        System.assert(updated[0].Description.startsWith('Child of:'), 'Description format mismatch');
    }
}
```

### SOQL 最佳实践

```apex
// Selective query — use indexed fields in WHERE clause
List<Opportunity> opps = [
    SELECT Id, Name, Amount, StageName
    FROM Opportunity
    WHERE AccountId IN :accountIds      // indexed field
      AND CloseDate >= :Date.today()    // indexed field
    ORDER BY CloseDate ASC
    LIMIT 200
];

// Relationship query to avoid extra round-trips
List<Account> accounts = [
    SELECT Id, Name,
           (SELECT Id, LastName, Email FROM Contacts WHERE Email != null)
    FROM Account
    WHERE Id IN :accountIds
];
```

### Lightning Web Component（计数器示例）

```html
<!-- counterComponent.html -->
<template>
    <lightning-card title="Counter">
        <div class="slds-p-around_medium">
            <p>Count: {count}</p>
            <lightning-button label="Increment" onclick={handleIncrement}></lightning-button>
        </div>
    </lightning-card>
</template>
```

```javascript
// counterComponent.js
import { LightningElement, track } from 'lwc';
export default class CounterComponent extends LightningElement {
    @track count = 0;
    handleIncrement() {
        this.count += 1;
    }
}
```

```xml
<!-- counterComponent.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
    </targets>
</LightningComponentBundle>
```

[文档](https://jeffallan.github.io/claude-skills/skills/platform/salesforce-developer/)