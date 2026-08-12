---
name: cpp-testing
description: Use only when writing/updating/fixing C++ tests, configuring GoogleTest/CTest, diagnosing failing or flaky tests, or adding coverage/sanitizers.
origin: ECC
---
# C++ 测试（Agent Skill）

面向智能体的现代 C++（C++17/20）测试工作流，使用 GoogleTest/GoogleMock 以及 CMake/CTest。

## 何时使用

- 编写新的 C++ 测试或修复现有测试
- 为 C++ 组件设计单元测试/集成测试覆盖范围
- 增加测试覆盖率、CI 门禁或回归保护
- 配置 CMake/CTest 工作流以确保执行一致性
- 调查测试失败或不稳定行为
- 启用消毒器以诊断内存/竞态问题

### 何时不应使用

- 在不改动测试的情况下实现新的产品功能
- 与测试覆盖率或测试失败无关的大规模重构
- 在没有测试回归可供验证的情况下进行性能调优
- 非 C++ 项目或非测试任务

## 核心概念

- **TDD 循环**：红 → 绿 → 重构（先编写测试，进行最小修复，然后清理代码）。
- **隔离**：优先使用依赖注入和伪实现，而不是全局状态。
- **测试布局**：`tests/unit`、`tests/integration`、`tests/testdata`。
- **模拟对象与伪实现**：使用模拟对象测试交互，使用伪实现测试有状态行为。
- **CTest 测试发现**：使用 `gtest_discover_tests()` 实现稳定的测试发现。
- **CI 信号**：先运行测试子集，然后使用 `--output-on-failure` 运行完整测试套件。

## TDD 工作流

遵循红 → 绿 → 重构循环：

1. **红**：编写一个能够体现新行为的失败测试
2. **绿**：实现能够让测试通过的最小改动
3. **重构**：在测试保持通过的同时清理代码

```cpp
// tests/add_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Provided by production code.

TEST(AddTest, AddsTwoNumbers) { // RED
  EXPECT_EQ(Add(2, 3), 5);
}

// src/add.cpp
int Add(int a, int b) { // GREEN
  return a + b;
}

// REFACTOR: simplify/rename once tests pass
```

## 代码示例

### 基本单元测试（gtest）

```cpp
// tests/calculator_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Provided by production code.

TEST(CalculatorTest, AddsTwoNumbers) {
    EXPECT_EQ(Add(2, 3), 5);
}
```

### 测试夹具（gtest）

```cpp
// tests/user_store_test.cpp
// Pseudocode stub: replace UserStore/User with project types.
#include <gtest/gtest.h>
#include <memory>
#include <optional>
#include <string>

struct User { std::string name; };
class UserStore {
public:
    explicit UserStore(std::string /*path*/) {}
    void Seed(std::initializer_list<User> /*users*/) {}
    std::optional<User> Find(const std::string &/*name*/) { return User{"alice"}; }
};

class UserStoreTest : public ::testing::Test {
protected:
    void SetUp() override {
        store = std::make_unique<UserStore>(":memory:");
        store->Seed({{"alice"}, {"bob"}});
    }

    std::unique_ptr<UserStore> store;
};

TEST_F(UserStoreTest, FindsExistingUser) {
    auto user = store->Find("alice");
    ASSERT_TRUE(user.has_value());
    EXPECT_EQ(user->name, "alice");
}
```

### 模拟对象（gmock）

```cpp
// tests/notifier_test.cpp
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <string>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void Send(const std::string &message) = 0;
};

class MockNotifier : public Notifier {
public:
    MOCK_METHOD(void, Send, (const std::string &message), (override));
};

class Service {
public:
    explicit Service(Notifier &notifier) : notifier_(notifier) {}
    void Publish(const std::string &message) { notifier_.Send(message); }

private:
    Notifier &notifier_;
};

TEST(ServiceTest, SendsNotifications) {
    MockNotifier notifier;
    Service service(notifier);

    EXPECT_CALL(notifier, Send("hello")).Times(1);
    service.Publish("hello");
}
```

### CMake/CTest 快速入门

```cmake
# CMakeLists.txt (excerpt)
cmake_minimum_required(VERSION 3.20)
project(example LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
# Prefer project-locked versions. If using a tag, use a pinned version per project policy.
set(GTEST_VERSION v1.17.0) # Adjust to project policy.
FetchContent_Declare(
  googletest
  # Google Test framework (official repository)
  URL https://github.com/google/googletest/archive/refs/tags/${GTEST_VERSION}.zip
)
FetchContent_MakeAvailable(googletest)

add_executable(example_tests
  tests/calculator_test.cpp
  src/calculator.cpp
)
target_link_libraries(example_tests GTest::gtest GTest::gmock GTest::gtest_main)

enable_testing()
include(GoogleTest)
gtest_discover_tests(example_tests)
```

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
ctest --test-dir build --output-on-failure
```

## 运行测试

```bash
ctest --test-dir build --output-on-failure
ctest --test-dir build -R ClampTest
ctest --test-dir build -R "UserStoreTest.*" --output-on-failure
```

```bash
./build/example_tests --gtest_filter=ClampTest.*
./build/example_tests --gtest_filter=UserStoreTest.FindsExistingUser
```

## 调试失败

1. 使用 gtest 过滤器重新运行单个失败的测试。
2. 在失败的断言周围添加局部日志记录。
3. 启用 sanitizer 后重新运行。
4. 修复根本原因后，再扩展到完整测试套件。

## 覆盖率

优先使用目标级设置，而不是全局标志。

```cmake
option(ENABLE_COVERAGE "Enable coverage flags" OFF)

if(ENABLE_COVERAGE)
  if(CMAKE_CXX_COMPILER_ID MATCHES "GNU")
    target_compile_options(example_tests PRIVATE --coverage)
    target_link_options(example_tests PRIVATE --coverage)
  elseif(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(example_tests PRIVATE -fprofile-instr-generate -fcoverage-mapping)
    target_link_options(example_tests PRIVATE -fprofile-instr-generate)
  endif()
endif()
```

GCC + gcov + lcov：

```bash
cmake -S . -B build-cov -DENABLE_COVERAGE=ON
cmake --build build-cov -j
ctest --test-dir build-cov
lcov --capture --directory build-cov --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage
```

Clang + llvm-cov：

```bash
cmake -S . -B build-llvm -DENABLE_COVERAGE=ON -DCMAKE_CXX_COMPILER=clang++
cmake --build build-llvm -j
LLVM_PROFILE_FILE="build-llvm/default.profraw" ctest --test-dir build-llvm
llvm-profdata merge -sparse build-llvm/default.profraw -o build-llvm/default.profdata
llvm-cov report build-llvm/example_tests -instr-profile=build-llvm/default.profdata
```

## Sanitizer

```cmake
option(ENABLE_ASAN "Enable AddressSanitizer" OFF)
option(ENABLE_UBSAN "Enable UndefinedBehaviorSanitizer" OFF)
option(ENABLE_TSAN "Enable ThreadSanitizer" OFF)

if(ENABLE_ASAN)
  add_compile_options(-fsanitize=address -fno-omit-frame-pointer)
  add_link_options(-fsanitize=address)
endif()
if(ENABLE_UBSAN)
  add_compile_options(-fsanitize=undefined -fno-omit-frame-pointer)
  add_link_options(-fsanitize=undefined)
endif()
if(ENABLE_TSAN)
  add_compile_options(-fsanitize=thread)
  add_link_options(-fsanitize=thread)
endif()
```

## 不稳定测试的防护准则

- 绝不要使用 `sleep` 进行同步；应使用条件变量或锁存器。
- 为每个测试创建唯一的临时目录，并始终进行清理。
- 在单元测试中避免依赖真实时间、网络或文件系统。
- 为随机化输入使用确定性的种子。

## 最佳实践

### 应该做

- 保持测试具有确定性且彼此隔离
- 优先使用依赖注入而非全局变量
- 使用 `ASSERT_*` 检查前置条件，使用 `EXPECT_*` 执行多项检查
- 通过 CTest 标签或目录区分单元测试和集成测试
- 在 CI 中运行各类 sanitizer，以检测内存问题和竞态条件

### 不应该做

- 不要在单元测试中依赖真实时间或网络
- 当可以使用条件变量时，不要使用 sleep 进行同步
- 不要对简单值对象进行过度模拟
- 不要对非关键日志使用脆弱的字符串匹配

### 常见陷阱

- **使用固定的临时路径** → 为每个测试生成唯一的临时目录并进行清理。
- **依赖系统实际时间** → 注入时钟或使用虚假时间源。
- **不稳定的并发测试** → 使用条件变量/锁存器和有界等待。
- **隐藏的全局状态** → 在 fixture 中重置全局状态，或移除全局变量。
- **过度模拟** → 对有状态行为优先使用 fake，仅对交互进行 mock。
- **缺少 sanitizer 运行** → 在 CI 中添加 ASan/UBSan/TSan 构建。
- **仅在调试构建上统计覆盖率** → 确保覆盖率目标使用一致的标志。

## 可选附录：模糊测试 / 属性测试

仅当项目已经支持 LLVM/libFuzzer 或属性测试库时使用。

- **libFuzzer**：最适合 I/O 极少的纯函数。
- **RapidCheck**：用于验证不变量的属性测试。

最小化的 libFuzzer 测试框架（伪代码：请替换 ParseConfig）：

```cpp
#include <cstddef>
#include <cstdint>
#include <string>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    std::string input(reinterpret_cast<const char *>(data), size);
    // ParseConfig(input); // project function
    return 0;
}
```

## GoogleTest 的替代方案

- **Catch2**：仅含头文件，匹配器表达力强
- **doctest**：轻量，编译开销极低