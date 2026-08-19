---
name: cirq
description: Google quantum computing framework. Use when targeting Google Quantum AI hardware, designing noise-aware circuits, or running quantum characterization experiments. Best for Google hardware, noise modeling, and low-level circuit design. For IBM hardware use qiskit; for quantum ML with autodiff use pennylane; for physics simulations use qutip.
license: Apache-2.0 license
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.0"
  skill-author: K-Dense Inc.
---
# Cirq - 使用 Python 进行量子计算

Cirq 是 Google Quantum AI 的开源框架，用于在量子计算机和模拟器上设计、模拟和运行量子线路。

## 何时使用此 Skill

在以下情况下使用此 skill：
- 在 Python 中构建、模拟或优化 NISQ 线路
- 在 Google Quantum AI 处理器（通过 `cirq-google`）或合作伙伴后端（IonQ、Azure Quantum、AQT、Pasqal）上运行任务
- 建模噪声、编译为硬件门集，或设计表征实验
- 使用参数扫描、转换器或 ReCirq 实验模式

对于 IBM 硬件，请使用 **qiskit**；对于使用自动微分的量子机器学习，请使用 **pennylane**；对于物理模拟，请使用 **qutip**。

## 安装

需要 Python 3.11+。当前稳定版本：**1.6.1**（2025 年 8 月）。供应商软件包使用相同的版本号。

```bash
uv pip install "cirq==1.6.1"
```

对于硬件集成（为确保可复现性，请固定匹配的版本）：
```bash
# Google Quantum Engine (requires approved GCP project access)
uv pip install "cirq-google==1.6.1"

# IonQ
uv pip install "cirq-ionq==1.6.1"

# AQT (Alpine Quantum Technologies)
uv pip install "cirq-aqt==1.6.1"

# Pasqal
uv pip install "cirq-pasqal==1.6.1"

# Azure Quantum (IonQ, Honeywell/Quantinuum backends)
uv pip install "azure-quantum[cirq]"
```

开发期间如需使用最新功能，可省略版本固定；对于生产环境或硬件运行，请将所有软件包固定到同一 Cirq 版本。

## 快速开始

### 基本线路

```python
import cirq
import numpy as np

# Create qubits
q0, q1 = cirq.LineQubit.range(2)

# Build circuit
circuit = cirq.Circuit(
    cirq.H(q0),              # Hadamard on q0
    cirq.CNOT(q0, q1),       # CNOT with q0 control, q1 target
    cirq.measure(q0, q1, key='result')
)

print(circuit)

# Simulate
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)

# Display results
print(result.histogram(key='result'))
```

### 参数化线路

```python
import sympy

# Define symbolic parameter
theta = sympy.Symbol('theta')

# Create parameterized circuit
circuit = cirq.Circuit(
    cirq.ry(theta)(q0),
    cirq.measure(q0, key='m')
)

# Sweep over parameter values
sweep = cirq.Linspace('theta', start=0, stop=2*np.pi, length=20)
results = simulator.run_sweep(circuit, params=sweep, repetitions=1000)

# Process results
for params, result in zip(sweep, results):
    theta_val = params['theta']
    counts = result.histogram(key='m')
    print(f"θ={theta_val:.2f}: {counts}")
```

## 核心功能

### 线路构建
有关构建量子线路的完整信息，包括量子比特、门、操作、自定义门和线路模式，请参阅：
- **[references/building.md](references/building.md)** - 线路构建完整指南

常见主题：
- 量子比特类型（GridQubit、LineQubit、NamedQubit）
- 单量子比特门和双量子比特门
- 参数化门和操作
- 自定义门分解
- 使用 moments 组织线路
- 标准线路模式（Bell 态、GHZ、QFT）
- 导入/导出（OpenQASM、JSON）
- 使用 qudit 和可观测量

### 模拟
有关量子电路模拟的详细信息，包括精确模拟、有噪声模拟、参数扫描和 Quantum Virtual Machine，请参阅：
- **[references/simulation.md](references/simulation.md)** - 量子模拟完整指南

常见主题：
- 精确模拟（状态向量、密度矩阵）
- 采样与测量
- 参数扫描（单个和多个参数）
- 有噪声模拟
- 状态直方图与可视化
- Quantum Virtual Machine（QVM）
- 期望值与可观测量
- 性能优化

### 电路变换
有关优化、编译和操作量子电路的信息，请参阅：
- **[references/transformation.md](references/transformation.md)** - 电路变换完整指南

常见主题：
- 变换器框架
- 门分解
- 电路优化（合并门、移除 Z 门、丢弃可忽略操作）
- 面向硬件的电路编译
- 量子比特路由与 SWAP 插入
- 自定义变换器
- 变换流水线

### 硬件集成
有关从各种提供商的真实量子硬件上运行电路的信息，请参阅：
- **[references/hardware.md](references/hardware.md)** - 硬件集成完整指南

支持的提供商：
- **Google Quantum AI** (`cirq-google`) — 通过 Quantum Engine 使用 Sycamore、Weber、Willow 处理器（访问受限；需要已获批准的 GCP project）
- **IonQ** (`cirq-ionq`) — 离子阱 QPU 和模拟器
- **Azure Quantum** (`azure-quantum[cirq]`) — IonQ 和 Honeywell/Quantinuum 后端
- **AQT** (`cirq-aqt`) — Alpine Quantum Technologies
- **Pasqal** (`cirq-pasqal`) — 中性原子设备

主题包括设备表示、量子比特选择、身份验证、作业管理以及针对硬件的电路优化。有关 Google Cloud 设置，请参阅 [访问与身份验证](https://quantumai.google/cirq/google/access)。

### 噪声建模
有关噪声建模、有噪声模拟、表征和误差缓解的信息，请参阅：
- **[references/noise.md](references/noise.md)** - 噪声建模完整指南

常见主题：
- 噪声通道（去极化、振幅阻尼、相位阻尼）
- 噪声模型（恒定、特定门、特定量子比特、热噪声）
- 向电路中添加噪声
- 读出噪声
- 噪声表征（随机基准测试、XEB）
- 噪声可视化（热力图）
- 误差缓解技术

### 量子实验
有关实验设计、参数扫描、数据收集以及使用 ReCirq 框架的信息，请参阅：
- **[references/experiments.md](references/experiments.md)** - 量子实验完整指南

常见主题：
- 实验设计模式
- 参数扫描与数据收集
- ReCirq 框架结构
- 常见算法（VQE、QAOA、QPE）
- 数据分析与可视化
- 统计分析与保真度估计
- 并行数据收集

## 常见模式

### 变分算法模板

```python
import scipy.optimize

def variational_algorithm(ansatz, cost_function, initial_params):
    """Template for variational quantum algorithms."""

    def objective(params):
        circuit = ansatz(params)
        simulator = cirq.Simulator()
        result = simulator.simulate(circuit)
        return cost_function(result)

    # Optimize
    result = scipy.optimize.minimize(
        objective,
        initial_params,
        method='COBYLA'
    )

    return result

# Define ansatz
def my_ansatz(params):
    q = cirq.LineQubit(0)
    return cirq.Circuit(
        cirq.ry(params[0])(q),
        cirq.rz(params[1])(q)
    )

# Define cost function
def my_cost(result):
    state = result.final_state_vector
    # Calculate cost based on state
    return np.real(state[0])

# Run optimization
result = variational_algorithm(my_ansatz, my_cost, [0.0, 0.0])
```

### 硬件执行模板

```python
import os

def run_on_hardware(circuit, provider='google', processor_id=None, repetitions=1000):
    """Template for running on quantum hardware."""

    if provider == 'google':
        import cirq_google as cg

        project_id = os.environ['GOOGLE_CLOUD_PROJECT']
        engine = cg.Engine(project_id=project_id)

        # List available processors: engine.list_processors()
        processor_id = processor_id or 'weber'  # use your assigned processor_id
        sampler = engine.get_sampler(processor_id=processor_id)
        return sampler.run(circuit, repetitions=repetitions)

    elif provider == 'ionq':
        import cirq_ionq as ionq

        # Requires IONQ_API_KEY in environment
        service = ionq.Service()
        return service.run(circuit, repetitions=repetitions, target='qpu')

    elif provider == 'azure':
        from azure.quantum.cirq import AzureQuantumService

        service = AzureQuantumService(
            resource_id=os.environ['AZURE_QUANTUM_RESOURCE_ID'],
            location=os.environ['AZURE_QUANTUM_LOCATION'],
        )
        return service.run(circuit, repetitions=repetitions, target='ionq.qpu')

    else:
        raise ValueError(f"Unknown provider: {provider}")
```

### 噪声研究模板

```python
def noise_comparison_study(circuit, noise_levels):
    """Compare circuit performance at different noise levels."""

    results = {}

    for noise_level in noise_levels:
        # Create noisy circuit
        noisy_circuit = circuit.with_noise(cirq.depolarize(p=noise_level))

        # Simulate
        simulator = cirq.DensityMatrixSimulator()
        result = simulator.run(noisy_circuit, repetitions=1000)

        # Analyze
        results[noise_level] = {
            'histogram': result.histogram(key='result'),
            'dominant_state': max(
                result.histogram(key='result').items(),
                key=lambda x: x[1]
            )
        }

    return results

# Run study
noise_levels = [0.0, 0.001, 0.01, 0.05, 0.1]
results = noise_comparison_study(circuit, noise_levels)
```

## 最佳实践

1. **电路设计**
   - 为你的拓扑结构使用合适的量子比特类型
   - 保持电路模块化且可复用
   - 使用描述性键标记测量结果
   - 在执行前根据设备约束验证电路

2. **模拟**
   - 对纯态使用状态向量模拟（效率更高）
   - 仅在需要时使用密度矩阵模拟（混合态、噪声）
   - 使用参数扫描，而非单独运行
   - 监控大型系统的内存使用情况（2^n 增长很快）

3. **硬件执行**
   - 始终先在模拟器上进行测试
   - 使用校准数据选择最佳量子比特
   - 针对目标硬件门集优化电路
   - 为生产运行实现误差缓解
   - 立即存储昂贵的硬件运行结果

4. **电路优化**
   - 从高级内置转换器开始
   - 按顺序串联多个优化步骤
   - 跟踪深度和门数量的减少情况
   - 在转换后验证正确性

5. **噪声建模**
   - 使用校准数据中的真实噪声模型
   - 纳入所有误差来源（门、退相干、读出）
   - 在缓解之前进行表征
   - 保持电路较浅，以最大限度地减少噪声累积

6. **实验**
   - 通过明确分离数据生成、数据收集和分析来组织实验
   - 使用 ReCirq 模式确保可复现性
   - 频繁保存中间结果
   - 并行执行相互独立的任务
   - 使用元数据进行详尽记录

## 其他资源

- **官方文档**: https://quantumai.google/cirq
- **API 参考**: https://quantumai.google/reference/python/cirq
- **教程**: https://quantumai.google/cirq/tutorials
- **示例**: https://github.com/quantumlib/Cirq/tree/main/examples
- **版本策略**: https://quantumai.google/cirq/dev/versions
- **ReCirq**: https://github.com/quantumlib/ReCirq

## 常见问题

**电路对于硬件来说过深：**
- 使用电路优化转换器来降低深度
- 参见 `transformation.md` 了解优化技术

**模拟时出现内存问题：**
- 从密度矩阵模拟器切换到状态向量模拟器
- 减少量子比特数量，或对 Clifford 电路使用稳定子模拟器

**设备验证错误：**
- 使用 device.metadata.nx_graph 检查量子比特连接性
- 将门分解为设备原生门集
- 参见 `hardware.md` 了解特定于设备的编译

**含噪模拟速度过慢：**
- 密度矩阵模拟的复杂度为 O(2^2n)——考虑减少量子比特数量
- 仅在关键操作上选择性地使用噪声模型
- 参见 `simulation.md` 了解性能优化