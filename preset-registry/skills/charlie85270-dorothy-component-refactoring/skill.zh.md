---
name: component-refactoring
description: Refactor high-complexity React components in Dify frontend. Use when `pnpm analyze-component --json` shows complexity > 50 or lineCount > 300, when the user asks for code splitting, hook extraction, or complexity reduction, or when `pnpm analyze-component` warns to refactor before testing; avoid for simple/well-structured components, third-party wrappers, or when the user explicitly wants testing without refactoring.
---
# Dify 组件重构技能

使用以下模式和工作流，重构 Dify 前端代码库中高复杂度的 React 组件。

> **复杂度阈值**：复杂度 > 50（通过 `pnpm analyze-component` 测量）的组件应在测试前进行重构。

## 快速参考

### 命令（从 `web/` 目录运行）

使用相对于 `web/` 的路径（例如 `app/components/...`）。
使用 `refactor-component` 生成重构提示，使用 `analyze-component` 生成测试提示和指标。

```bash
cd web

# Generate refactoring prompt
pnpm refactor-component <path>

# Output refactoring analysis as JSON
pnpm refactor-component <path> --json

# Generate testing prompt (after refactoring)
pnpm analyze-component <path>

# Output testing analysis as JSON
pnpm analyze-component <path> --json
```

### 复杂度分析

```bash
# Analyze component complexity
pnpm analyze-component <path> --json

# Key metrics to check:
# - complexity: normalized score 0-100 (target < 50)
# - maxComplexity: highest single function complexity
# - lineCount: total lines (target < 300)
```

### 复杂度分数解读

| 分数 | 级别 | 操作 |
|-------|-------|--------|
| 0-25 | 🟢 简单 | 可以进行测试 |
| 26-50 | 🟡 中等 | 考虑进行小幅重构 |
| 51-75 | 🟠 复杂 | **测试前进行重构** |
| 76-100 | 🔴 非常复杂 | **必须重构** |

## 核心重构模式

### 模式 1：提取自定义 Hook

**适用场景**：组件包含复杂的状态管理、多个 `useState`/`useEffect`，或业务逻辑与 UI 混合在一起。

**Dify 约定**：将 Hook 放在 `hooks/` 子目录中，或以 `use-<feature>.ts` 的形式放在组件旁边。

```typescript
// ❌ Before: Complex state logic in component
const Configuration: FC = () => {
  const [modelConfig, setModelConfig] = useState<ModelConfig>(...)
  const [datasetConfigs, setDatasetConfigs] = useState<DatasetConfigs>(...)
  const [completionParams, setCompletionParams] = useState<FormValue>({})
  
  // 50+ lines of state management logic...
  
  return <div>...</div>
}

// ✅ After: Extract to custom hook
// hooks/use-model-config.ts
export const useModelConfig = (appId: string) => {
  const [modelConfig, setModelConfig] = useState<ModelConfig>(...)
  const [completionParams, setCompletionParams] = useState<FormValue>({})
  
  // Related state management logic here
  
  return { modelConfig, setModelConfig, completionParams, setCompletionParams }
}

// Component becomes cleaner
const Configuration: FC = () => {
  const { modelConfig, setModelConfig } = useModelConfig(appId)
  return <div>...</div>
}
```

**Dify 示例**：
- `web/app/components/app/configuration/hooks/use-advanced-prompt-config.ts`
- `web/app/components/app/configuration/debug/hooks.tsx`
- `web/app/components/workflow/hooks/use-workflow.ts`

### 模式 2：提取子组件

**适用场景**：单个组件包含多个 UI 区块、条件渲染代码块或重复模式。

**Dify 约定**：将子组件放在子目录中，或作为单独的文件放在同一目录中。

```typescript
// ❌ Before: Monolithic JSX with multiple sections
const AppInfo = () => {
  return (
    <div>
      {/* 100 lines of header UI */}
      {/* 100 lines of operations UI */}
      {/* 100 lines of modals */}
    </div>
  )
}

// ✅ After: Split into focused components
// app-info/
//   ├── index.tsx           (orchestration only)
//   ├── app-header.tsx      (header UI)
//   ├── app-operations.tsx  (operations UI)
//   └── app-modals.tsx      (modal management)

const AppInfo = () => {
  const { showModal, setShowModal } = useAppInfoModals()
  
  return (
    <div>
      <AppHeader appDetail={appDetail} />
      <AppOperations onAction={handleAction} />
      <AppModals show={showModal} onClose={() => setShowModal(null)} />
    </div>
  )
}
```

**Dify 示例**：
- `web/app/components/app/configuration/` 目录结构
- `web/app/components/workflow/nodes/` 按节点组织

### 模式 3：简化条件逻辑

**适用场景**：深层嵌套（> 3 层）、复杂的三元表达式或多个 `if/else` 链。

```typescript
// ❌ Before: Deeply nested conditionals
const Template = useMemo(() => {
  if (appDetail?.mode === AppModeEnum.CHAT) {
    switch (locale) {
      case LanguagesSupported[1]:
        return <TemplateChatZh />
      case LanguagesSupported[7]:
        return <TemplateChatJa />
      default:
        return <TemplateChatEn />
    }
  }
  if (appDetail?.mode === AppModeEnum.ADVANCED_CHAT) {
    // Another 15 lines...
  }
  // More conditions...
}, [appDetail, locale])

// ✅ After: Use lookup tables + early returns
const TEMPLATE_MAP = {
  [AppModeEnum.CHAT]: {
    [LanguagesSupported[1]]: TemplateChatZh,
    [LanguagesSupported[7]]: TemplateChatJa,
    default: TemplateChatEn,
  },
  [AppModeEnum.ADVANCED_CHAT]: {
    [LanguagesSupported[1]]: TemplateAdvancedChatZh,
    // ...
  },
}

const Template = useMemo(() => {
  const modeTemplates = TEMPLATE_MAP[appDetail?.mode]
  if (!modeTemplates) return null
  
  const TemplateComponent = modeTemplates[locale] || modeTemplates.default
  return <TemplateComponent appDetail={appDetail} />
}, [appDetail, locale])
```

### 模式 4：提取 API/数据逻辑

**适用场景**：组件直接处理 API 调用、数据转换或复杂的异步操作。

**Dify 约定**：使用来自 `web/service/use-*.ts` 的 `@tanstack/react-query` hooks，或创建自定义数据 hooks。

```typescript
// ❌ Before: API logic in component
const MCPServiceCard = () => {
  const [basicAppConfig, setBasicAppConfig] = useState({})
  
  useEffect(() => {
    if (isBasicApp && appId) {
      (async () => {
        const res = await fetchAppDetail({ url: '/apps', id: appId })
        setBasicAppConfig(res?.model_config || {})
      })()
    }
  }, [appId, isBasicApp])
  
  // More API-related logic...
}

// ✅ After: Extract to data hook using React Query
// use-app-config.ts
import { useQuery } from '@tanstack/react-query'
import { get } from '@/service/base'

const NAME_SPACE = 'appConfig'

export const useAppConfig = (appId: string, isBasicApp: boolean) => {
  return useQuery({
    enabled: isBasicApp && !!appId,
    queryKey: [NAME_SPACE, 'detail', appId],
    queryFn: () => get<AppDetailResponse>(`/apps/${appId}`),
    select: data => data?.model_config || {},
  })
}

// Component becomes cleaner
const MCPServiceCard = () => {
  const { data: config, isLoading } = useAppConfig(appId, isBasicApp)
  // UI only
}
```

**Dify 中的 React Query 最佳实践**：
- 定义 `NAME_SPACE` 以组织查询键
- 使用 `enabled` 选项进行条件式数据获取
- 使用 `select` 进行数据转换
- 导出失效处理 Hook：`useInvalidXxx`

**Dify 示例**：
- `web/service/use-workflow.ts`
- `web/service/use-common.ts`
- `web/service/knowledge/use-dataset.ts`
- `web/service/knowledge/use-document.ts`

### 模式 5：提取模态框/对话框管理逻辑

**适用场景**：组件管理多个具有复杂打开/关闭状态的模态框。

**Dify 约定**：应将模态框及其状态管理逻辑提取出来。

```typescript
// ❌ Before: Multiple modal states in component
const AppInfo = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [showImportDSLModal, setShowImportDSLModal] = useState(false)
  // 5+ more modal states...
}

// ✅ After: Extract to modal management hook
type ModalType = 'edit' | 'duplicate' | 'delete' | 'switch' | 'import' | null

const useAppInfoModals = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  
  const openModal = useCallback((type: ModalType) => setActiveModal(type), [])
  const closeModal = useCallback(() => setActiveModal(null), [])
  
  return {
    activeModal,
    openModal,
    closeModal,
    isOpen: (type: ModalType) => activeModal === type,
  }
}
```

### 模式 6：提取表单逻辑

**适用场景**：复杂的表单验证、提交处理或字段转换。

**Dify 约定**：使用 `web/app/components/base/form/` 中的 `@tanstack/react-form` 模式。

```typescript
// ✅ Use existing form infrastructure
import { useAppForm } from '@/app/components/base/form'

const ConfigForm = () => {
  const form = useAppForm({
    defaultValues: { name: '', description: '' },
    onSubmit: handleSubmit,
  })
  
  return <form.Provider>...</form.Provider>
}
```

## Dify 特定的重构指南

### 1. 提取上下文提供者

**适用场景**：组件提供包含多个状态的复杂上下文值。

```typescript
// ❌ Before: Large context value object
const value = {
  appId, isAPIKeySet, isTrailFinished, mode, modelModeType,
  promptMode, isAdvancedMode, isAgent, isOpenAI, isFunctionCall,
  // 50+ more properties...
}
return <ConfigContext.Provider value={value}>...</ConfigContext.Provider>

// ✅ After: Split into domain-specific contexts
<ModelConfigProvider value={modelConfigValue}>
  <DatasetConfigProvider value={datasetConfigValue}>
    <UIConfigProvider value={uiConfigValue}>
      {children}
    </UIConfigProvider>
  </DatasetConfigProvider>
</ModelConfigProvider>
```

**Dify 参考**：`web/context/` 目录结构

### 2. 工作流节点组件

**适用场景**：重构工作流节点组件（`web/app/components/workflow/nodes/`）。

**约定**：
- 将节点逻辑保留在 `use-interactions.ts` 中
- 将面板 UI 提取到单独的文件中
- 对通用模式使用 `_base` 组件

```
nodes/<node-type>/
  ├── index.tsx              # Node registration
  ├── node.tsx               # Node visual component
  ├── panel.tsx              # Configuration panel
  ├── use-interactions.ts    # Node-specific hooks
  └── types.ts               # Type definitions
```

### 3. 配置组件

**适用场景**：重构应用配置组件。

**约定**：
- 将配置区块拆分到子目录中
- 使用 `web/app/components/app/configuration/` 中的现有模式
- 将功能开关保留在专用组件中

### 4. 工具/插件组件

**适用场景**：重构工具相关组件（`web/app/components/tools/`）。

**约定**：
- 遵循现有的模态框模式
- 使用 `web/service/use-tools.ts` 中的服务钩子
- 隔离特定于提供商的逻辑

## 重构工作流

### 第 1 步：生成重构提示词

```bash
pnpm refactor-component <path>
```

此命令将：
- 分析组件复杂度和功能
- 确定所需的具体重构操作
- 为 AI 助手生成提示词（在 macOS 上自动复制到剪贴板）
- 根据检测到的模式提供详细要求

### 第 2 步：分析详情

```bash
pnpm analyze-component <path> --json
```

确定：
- 总复杂度分数
- 最大函数复杂度
- 行数
- 检测到的功能（状态、副作用、API 等）

### 第 3 步：制定计划

根据检测到的功能制定重构计划：

| 检测到的功能 | 重构操作 |
|------------------|-------------------|
| `hasState: true` + `hasEffects: true` | 提取自定义钩子 |
| `hasAPI: true` | 提取数据/服务钩子 |
| `hasEvents: true`（较多） | 提取事件处理器 |
| `lineCount > 300` | 拆分为子组件 |
| `maxComplexity > 50` | 简化条件逻辑 |

### 第 4 步：增量执行

1. **一次提取一个部分**
2. **每次提取后运行代码检查、类型检查和测试**
3. **进入下一步前验证功能**

```
For each extraction:
  ┌────────────────────────────────────────┐
  │ 1. Extract code                        │
  │ 2. Run: pnpm lint:fix                  │
  │ 3. Run: pnpm type-check:tsgo           │
  │ 4. Run: pnpm test                      │
  │ 5. Test functionality manually         │
  │ 6. PASS? → Next extraction             │
  │    FAIL? → Fix before continuing       │
  └────────────────────────────────────────┘
```

### 第 5 步：验证

重构后：

```bash
# Re-run refactor command to verify improvements
pnpm refactor-component <path>

# If complexity < 25 and lines < 200, you'll see:
# ✅ COMPONENT IS WELL-STRUCTURED

# For detailed metrics:
pnpm analyze-component <path> --json

# Target metrics:
# - complexity < 50
# - lineCount < 300
# - maxComplexity < 30
```

## 应避免的常见错误

### ❌ 过度设计

```typescript
// ❌ Too many tiny hooks
const useButtonText = () => useState('Click')
const useButtonDisabled = () => useState(false)
const useButtonLoading = () => useState(false)

// ✅ Cohesive hook with related state
const useButtonState = () => {
  const [text, setText] = useState('Click')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  return { text, setText, disabled, setDisabled, loading, setLoading }
}
```

### ❌ 破坏现有模式

- 遵循现有目录结构
- 保持命名约定
- 保留导出模式以确保兼容性

### ❌ 过早抽象

- 仅在复杂度明显降低时才进行提取
- 不要为仅使用一次的代码创建抽象
- 将重构后的代码保留在相同的领域区域中

## 参考资料

### Dify 代码库示例

- **Hook 提取**：`web/app/components/app/configuration/hooks/`
- **组件拆分**：`web/app/components/app/configuration/`
- **服务 Hook**：`web/service/use-*.ts`
- **工作流模式**：`web/app/components/workflow/hooks/`
- **表单模式**：`web/app/components/base/form/`

### 相关技能

- `frontend-testing` - 用于测试重构后的组件
- `web/testing/testing.md` - 测试规范