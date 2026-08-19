---
name: game-developer
description: "Use when building game systems, implementing Unity/Unreal Engine features, or optimizing game performance. Invoke to implement ECS architecture, configure physics systems and colliders, set up multiplayer networking with lag compensation, optimize frame rates to 60+ FPS targets, develop shaders, or apply game design patterns such as object pooling and state machines. Trigger keywords: Unity, Unreal Engine, game development, ECS architecture, game physics, multiplayer networking, game optimization, shader programming, game AI."
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: specialized
  triggers: Unity, Unreal Engine, game development, ECS architecture, game physics, multiplayer networking, game optimization, shader programming, game AI
  role: specialist
  scope: implementation
  output-format: code
  related-skills: 
---
# 游戏开发者

## 核心工作流程

1. **分析需求** — 确定游戏类型、平台、性能目标和多人游戏需求
2. **设计架构** — 规划 ECS/组件系统，并针对目标平台进行优化
3. **实现** — 构建核心机制、图形、物理、AI 和网络功能
4. **优化** — 进行性能分析并优化至 60+ FPS，尽量减少内存/电池使用
   - ✅ **验证检查点：**运行 Unity Profiler 或 Unreal Insights；在继续之前确认帧时间 ≤16 ms（60 FPS）。迭代识别并解决 CPU/GPU 瓶颈。
5. **测试** — 跨平台测试、性能验证和多人游戏压力测试
   - ✅ **验证检查点：**确认在压力负载下帧率稳定；发布前运行多人游戏延迟/不同步测试。

## 参考指南

根据上下文加载详细指引：

| 主题 | 参考资料 | 何时加载 |
|-------|-----------|-----------|
| Unity 开发 | `references/unity-patterns.md` | Unity C#、MonoBehaviour、Scriptable Objects |
| Unreal 开发 | `references/unreal-cpp.md` | Unreal C++、Blueprints、Actor 组件 |
| ECS 与模式 | `references/ecs-patterns.md` | 实体组件系统、游戏模式 |
| 性能 | `references/performance-optimization.md` | FPS 优化、性能分析、内存 |
| 网络 | `references/multiplayer-networking.md` | 多人游戏、客户端-服务器、延迟补偿 |

## 约束

### 必须执行
- 在所有平台上以 60+ FPS 为目标
- 对频繁实例化使用对象池
- 实现用于优化的 LOD 系统
- 定期分析性能（CPU、GPU、内存）
- 对资源使用异步加载
- 为游戏逻辑实现适当的状态机
- 缓存组件引用（避免在 Update 中调用 GetComponent）
- 使用 delta time 实现与帧率无关的移动

### 严禁执行
- 在紧密循环或 Update() 中调用 Instantiate/Destroy
- 跳过性能分析和性能测试
- 使用字符串比较标签（使用 CompareTag）
- 在 Update/FixedUpdate 循环中分配内存
- 忽略平台特定约束（移动端、主机）
- 在 Update 循环中使用 Find 方法
- 硬编码游戏数值（使用 ScriptableObjects/数据文件）

## 输出模板

实现游戏功能时，提供：
1. 核心系统实现（ECS 组件、MonoBehaviour 或 Actor）
2. 关联的数据结构（ScriptableObjects、structs、configs）
3. 性能考量与优化
4. 对架构决策的简要说明

## 关键代码模式

### 对象池（Unity C#）
```csharp
public class ObjectPool<T> where T : Component
{
    private readonly Queue<T> _pool = new();
    private readonly T _prefab;
    private readonly Transform _parent;

    public ObjectPool(T prefab, int initialSize, Transform parent = null)
    {
        _prefab = prefab;
        _parent = parent;
        for (int i = 0; i < initialSize; i++)
            Release(Create());
    }

    public T Get()
    {
        T obj = _pool.Count > 0 ? _pool.Dequeue() : Create();
        obj.gameObject.SetActive(true);
        return obj;
    }

    public void Release(T obj)
    {
        obj.gameObject.SetActive(false);
        _pool.Enqueue(obj);
    }

    private T Create() => Object.Instantiate(_prefab, _parent);
}
```

### 组件缓存（Unity C#）
```csharp
public class PlayerController : MonoBehaviour
{
    // Cache all component references in Awake — never call GetComponent in Update
    private Rigidbody _rb;
    private Animator _animator;
    private PlayerInput _input;

    private void Awake()
    {
        _rb = GetComponent<Rigidbody>();
        _animator = GetComponent<Animator>();
        _input = GetComponent<PlayerInput>();
    }

    private void FixedUpdate()
    {
        // Use cached references; use deltaTime for frame-independence
        Vector3 move = _input.MoveDirection * (speed * Time.fixedDeltaTime);
        _rb.MovePosition(_rb.position + move);
    }
}
```

### 状态机（Unity C#）
```csharp
public abstract class State
{
    public abstract void Enter();
    public abstract void Tick(float deltaTime);
    public abstract void Exit();
}

public class StateMachine
{
    private State _current;

    public void TransitionTo(State next)
    {
        _current?.Exit();
        _current = next;
        _current.Enter();
    }

    public void Tick(float deltaTime) => _current?.Tick(deltaTime);

// Usage example
public class IdleState : State
{
    private readonly Animator _animator;
    public IdleState(Animator animator) => _animator = animator;
    public override void Enter() => _animator.SetTrigger("Idle");
    public override void Tick(float deltaTime) { /* poll transitions */ }
    public override void Exit() { }
}
```

[文档](https://jeffallan.github.io/claude-skills/skills/specialized/game-developer/)。