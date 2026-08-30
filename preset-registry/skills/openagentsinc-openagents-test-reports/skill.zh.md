---
name: test-reports
description: Canonical structured-report invocations for suite runners, so failure names are read from a file instead of recovered by re-running a suite. Use whenever a test run might fail, or whenever you need the list of failing tests from a run you already paid for.
---
# 测试报告：一次套件运行，后续重复查询无需再次付费

完整套件运行需要几分钟。对其报告执行 grep 只需几毫秒。区别在于这次运行是否留下了可寻址的内容。

## 规则

每当你运行一个可能失败的套件——并且你不是刚在几秒钟前运行过它并确认其通过——都要将机器可读的报告写入原始输出旁边的磁盘。这样，后续的每个问题（“哪些测试失败了？”“其中有 X 吗？”）都可以从文件中得到答案，而无需再次执行。

本会话中的长命令已经会将完整输出保存为会话目录中的 `cmd-N.log`；结果中会给出该路径。结构化报告优于对该日志执行 grep，因为它将失败测试名称作为数据保存，而不是作为终端渲染结果。

## 规范调用方式

### vitest / vp（TypeScript）

```sh
vp test --run --reporter=json --outputFile=/tmp/vitest-last.json 2>&1 | tail -20
```

失败的测试：

```sh
jq -r '.testResults[].assertionResults[] | select(.status=="failed") | .fullName' /tmp/vitest-last.json
```

仅查看某个文件中的失败：

```sh
jq -r --arg f thresholds.test.ts '.testResults[] | select(.name|contains($f)) | .assertionResults[] | select(.status=="failed") | .fullName' /tmp/vitest-last.json
```

（当某个包未提供 `vp` 时，`npx vitest …` 使用相同的标志。）

### cargo（Rust）

```sh
cargo test 2>&1 | tee /tmp/cargo-test-last.log | tail -5
```

在提供该 reporter 的情况下，JUnit 形式为：

```sh
cargo test -- --format json > /tmp/cargo-test-last.json 2>/dev/null || cargo test 2>&1 | tee /tmp/cargo-test-last.log | tail -5
```

失败的测试：

```sh
grep -E '^test .* FAILED' /tmp/cargo-test-last.log
```

然后不要再次运行任何命令：每个失败测试的名称都单独占一行，并带有其模块路径，而这正是你需要的内容。

### pytest（Python）

```sh
python -m pytest -q --junitxml=/tmp/pytest-last.xml 2>&1 | tail -5
```

失败的测试：

```sh
xpath -q -e '//failure/ancestor::testcase/@classname | //failure/ancestor::testcase/@name' /tmp/pytest-last.xml 2>/dev/null \
  || python3 -c "import xml.etree.ElementTree as ET; [print(t.get('classname'), t.get('name')) for t in ET.parse('/tmp/pytest-last.xml').getroot().iter('testcase') if t.find('failure') is not None]"
```

## 不要做什么

- 不要在一条命令中运行同一个套件两次（`suite | grep A; suite | grep B`）。本会话会直接拒绝重复执行。
- 不要只将长时间运行的命令通过 `tail` 管道传递，然后假定摘要就是你今后需要的全部内容：`tail` 会丢弃名称，而名称才是重点。
- 不要为了查看你之前已经获得的输出中的“不同列”而重新运行。读取日志文件或报告。

## 报告存放位置

`/tmp/<runner>-last.<json|log|xml>`，除非任务指定了其他路径。每个 runner 一个文件意味着“昨晚失败的运行”始终有一个可寻址的位置。