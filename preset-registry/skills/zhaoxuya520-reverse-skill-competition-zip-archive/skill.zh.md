---
name: competition-zip-archive
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for ZIP and PKZIP archive challenges, legacy ZipCrypto identification, known-plaintext recovery with bkcrack, key-based decryption, and reproducible extraction. Use when the user asks to solve an encrypted ZIP challenge, inspect ZipCrypto metadata, recover keys from a known file prefix, or unlock an archive without starting with password brute force. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 ZIP 归档

本技能仅作为下游专门化技能使用，前提是 `$ctf-sandbox-orchestrator` 已激活并已确定沙箱假设、证据优先级和分析项目根目录。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径是加密的 ZIP/PKZIP 归档（而非上传解析器或通用加密数据块）时使用本技能。当题目给出了可预测的文件、格式头、模板或其他可恢复的明文时，优先采用旧式 ZipCrypto 已知明文路径。不要以盲目暴力破解密码作为起点。

除非用户明确要求英文，否则请以简体中文回复。命令和工具输出保持原样。

## 快速开始

1. 保留原始归档，计算哈希，并在分析项目的 `work/<case>/` 目录下的副本上进行操作。
2. 在尝试密码攻击之前，确认实际的归档格式并列出条目。
3. 确定条目是否使用旧式 ZipCrypto。`bkcrack` 无法恢复 WinZip AES 或其他现代加密。
4. 构造精确的已知明文候选。该攻击需要至少 12 字节的已知明文，其中包括至少 8 字节的连续字节。
5. 使用 `bkcrack` 恢复内部密钥，然后创建一个未加密副本并解压。
6. 将命令、条目名、已知明文来源、恢复出的密钥、输出哈希以及最终 flag 作为证据保存。

## 工具设置

在猜测可执行文件位置之前，先使用常规的工具索引和引导路径：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File skills/scripts/refresh-tool-index.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File skills/scripts/bootstrap-reverse.ps1 -Capability bkcrack
```

在 Kali 上，使用等效的能力命令：

```bash
bash kali/scripts/bootstrap-reverse.sh bkcrack
```

Windows 能力固定为 `v1.8.1` 版本，并会校验 GitHub 资产的摘要。如果手动安装了该工具，请随后刷新 `skills/tool-index.md`。

## 工作流程

### 1. 确立归档事实

保持原始文件不可变，并记录：

```bash
sha256sum challenge.zip
file challenge.zip
bkcrack -L challenge.zip
```

在 Windows 上，用 `Get-FileHash` 代替 `sha256sum`。`bkcrack -L` 会显示条目名称、压缩方法和加密状态。不要仅凭 `.zip` 扩展名推断加密类型。

检查将提供已知明文的条目。有用的候选是采用存储（stored）方式或其他可预测的文件，例如 PNG、PDF、文本模板或题目生成的配置。本地 ZIP 头（`PK\x03\x04`）是归档条目的元数据，不是加密成员内部的明文，因此其本身不是有用的已知明文样本。

### 2. 利用已知明文恢复密钥

当密文条目为 `flag.txt` 且 `known.zip` 中存在匹配的明文条目时：

```bash
bkcrack -C challenge.zip -c flag.txt -P known.zip -p flag.txt
```

对于原始密文和明文文件：

```bash
bkcrack -c cipherfile -p plainfile
```

明文必须与加密条目所表示的字节一致。如果该条目使用了 deflate 压缩，文件的未压缩副本并不自动就是正确的输入；请使用匹配的 ZIP 样本文件或精确的压缩字节。

如果已知字节从某个偏移量开始，请加上 `-o <offset>`。如果只有 8-11 字节是连续的，可以使用稀疏提示将其与其他已知字节组合：

```bash
bkcrack -c cipherfile -p plainfile -x 25 4b4f -x 30 21
```

成功的运行会得到三个内部 ZipCrypto 密钥。请按打印出的样子原样记录；它们不是原始密码。

### 3. 解锁并验证

使用恢复出的密钥生成新的归档，保持源文件不变：

```bash
bkcrack -C challenge.zip -k K0 K1 K2 -D unlocked.zip
7z t unlocked.zip
7z x unlocked.zip -ounpacked
```

将 `K0 K1 K2` 替换为 `bkcrack` 打印的十六进制值。使用归档测试命令以及哈希或精确的 flag 比对来验证输出。如果只需要一个原始成员，`-d` 可以写出其解密后的字节；经过 deflate 压缩的原始数据可能需要 bkcrack 自带的 `inflate.py` 辅助脚本。

### 4. 前提条件不满足时重新分流

- WinZip AES 或其他现代加密模式：终止此路径，并确定题目特定的原语。
- 没有可靠的已知明文：在考虑密码恢复之前，检查文件名、元数据、压缩方式选择、题目来源及其他条目。
- 已知明文短于要求：寻找更多连续字节，或使用有证据支撑的稀疏偏移。
- 问题属于应用上传/解析器链：移交至 `$competition-file-parser-chain`。
- 问题属于归档解压后的通用密文或自定义密码算法：移交至 `$competition-crypto-mobile`。

## 需要保存的证据

- 原始文件和工作副本的路径以及 SHA-256 哈希
- `bkcrack -L` 输出以及所选的加密成员
- 精确的明文样本文件、压缩方法、偏移量和稀疏字节提示
- 密钥恢复命令以及恢复出的三个内部密钥
- `unlocked.zip` 验证输出、解压路径和最终产物的哈希

阅读 `references/zip-archive.md` 以获取决策表和证据清单。
