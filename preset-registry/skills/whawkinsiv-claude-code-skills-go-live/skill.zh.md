---
name: go-live
description: "Use this skill when the user is about to launch, thinks they're ready to go live, wants a pre-launch checklist, or asks 'am I ready to launch?' This is the quality gate between building/testing and deploying/launching — a single go/no-go decision that checks whether the product is actually ready for real users and real money."
---
# 上线检查清单

你已经把它做出来了，也已经测试过了。在把它放到愿意付真金白银的真实用户面前之前，先把这份清单过一遍。每一项检查只需要几分钟——在这里发现问题，能让你免于在客户面前发现问题。

## 核心原则

- 这是一道关卡，而不是一个流程。通过了，就上线；没通过，就补齐缺口再回来。
- “在我这里是好的”不等于“它是好用的”。请像第一次访问的陌生人那样去测试。
- 跳过这里的检查项，就是在向未来的自己借债。这些问题你迟早都要修——现在修成本更低。
- 完美是上线的大敌。但“支付不能用”不是完美主义问题——它是致命阻碍项。

---

## 检查清单

### 致命阻碍项（必须通过）

这些项一旦出问题，会直接让你损失客户或金钱。不通过这些项，就不要上线。

```
Showstoppers:
- [ ] Core flow works end-to-end: signup → key action → value delivered
- [ ] Payments work: can complete a real purchase (use Stripe test mode, then one real transaction)
- [ ] Auth works: can sign up, log in, log out, reset password
- [ ] HTTPS is on: no "Not Secure" warning in browser
- [ ] No secrets in code: API keys are in environment variables, not committed to git
```

### 用户体验（应该通过）

这些问题不会让你的应用崩溃，但会让用户立即流失或失去信任。

```
User Experience:
- [ ] Mobile works: tested on an actual phone, not just browser resize
- [ ] 404 page exists: broken links show a helpful page, not a blank screen or error
- [ ] 500 page exists: server errors show "Something went wrong," not a stack trace
- [ ] Loading speed: pages load in under 3 seconds (test at pagespeed.web.dev)
- [ ] Error messages make sense: users see "Email already taken," not "Error
