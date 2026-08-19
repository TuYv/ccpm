# 功能跟踪

使用功能跟踪来记录功能级项目记忆。

开始功能开发前：

1. 如果存在，请阅读 `docs/features/README.md`。
2. 根据请求、代码模块、路由、域名或现有文档确定功能 id。
3. 如果存在，请阅读 `docs/features/<feature-id>/README.md`。
4. 如果不存在跟踪记录，请创建一个，并将其添加到索引中。

开发过程中，当行为、决策、端点、数据模型、依赖项、发布约束、测试或事实来源链接发生变化时，更新功能跟踪记录。

完成前，更新功能跟踪记录并运行：

```bash
python3 cli/feature_track.py validate --root .
```

功能跟踪规范：`spec/feature-track-spec.md`