---
name: alterlab-pydicom
description: Reads, writes, and manipulates DICOM (Digital Imaging and Communications in Medicine) medical imaging files with the pydicom Python library. Use when reading/writing/modifying DICOM data, extracting pixel data from CT, MRI, X-ray, or ultrasound images, anonymizing DICOM files, working with DICOM metadata and tags, converting DICOM to other formats, handling compressed DICOM, or processing medical imaging datasets for PACS systems, radiology workflows, and healthcare imaging applications. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Pydicom

## 概述

Pydicom 是一个用于处理 DICOM 文件的纯 Python 软件包。DICOM 是医学影像数据的标准格式。本技能提供读取、写入和操作 DICOM 文件的指导，包括处理像素数据、元数据和各种压缩格式。

## 何时使用本技能

在处理以下内容时使用本技能：
- 医学影像文件（CT、MRI、X 射线、超声、PET 等）
- 需要提取或修改元数据的 DICOM 数据集
- 从医学扫描中提取像素数据并进行图像处理
- 用于研究或数据共享的 DICOM 匿名化
- 将 DICOM 文件转换为标准图像格式
- 需要解压缩的压缩 DICOM 数据
- DICOM 序列和结构化报告
- 多切片体数据重建
- PACS（图像归档和通信系统）集成

## 安装

适用于 **pydicom 3.x**（3.0 重组了像素 API——请参阅下方的版本说明）。安装 pydicom 和常用依赖项：

```bash
uv pip install "pydicom>=3.0"
uv pip install pillow  # For image format conversion
uv pip install numpy   # For pixel array manipulation
uv pip install matplotlib  # For visualization
```

处理压缩的 DICOM 文件时，可能需要额外的软件包：

```bash
uv pip install pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg  # JPEG / JPEG 2000
uv pip install python-gdcm  # Alternative compression handler
uv pip install pyjpegls     # JPEG-LS encode/decode (replaces older JPEG-LS handlers)
```

### pydicom 3.0 API 变更（重要）

3.0 将所有像素处理功能移至 `pydicom.pixels` 模块，并弃用了一些长期使用的 API（旧名称仍然有效，但会发出警告，并将在 4.0 中移除）：

- `from pydicom.pixel_data_handlers.util import apply_voi_lut` → **`from pydicom.pixels import apply_voi_lut`**（`convert_color_space` 同样如此）。
- `pydicom.encoders` → **`pydicom.pixels.encoders`**。
- `ds.save_as(path, write_like_original=False)` → **`ds.save_as(path, enforce_file_format=True)`**（默认值为 `write_like_original=True` 的行为变为隐式行为，因此不再需要指定）。

以下所有示例均使用 3.x API。

## 核心工作流

### 读取 DICOM 文件

使用 `pydicom.dcmread()` 读取 DICOM 文件：

```python
import pydicom

# Read a DICOM file
ds = pydicom.dcmread('path/to/file.dcm')

# Access metadata
print(f"Patient Name: {ds.PatientName}")
print(f"Study Date: {ds.StudyDate}")
print(f"Modality: {ds.Modality}")

# Display all elements
print(ds)
```

**要点：**
- `dcmread()` 返回一个 `Dataset` 对象
- 使用属性表示法（例如 `ds.PatientName`）或标签表示法（例如 `ds[0x0010, 0x0010]`）访问数据元素
- 使用 `ds.file_meta` 访问传输语法 UID 等文件元数据
- 使用 `getattr(ds, 'AttributeName', default_value)` 或 `hasattr(ds, 'AttributeName')` 处理缺失的属性

### 处理像素数据

从 DICOM 文件中提取和操作图像数据：

```python
import pydicom
import numpy as np
import matplotlib.pyplot as plt

# Read DICOM file
ds = pydicom.dcmread('image.dcm')

# Get pixel array (requires numpy)
pixel_array = ds.pixel_array

# Image information
print(f"Shape: {pixel_array.shape}")
print(f"Data type: {pixel_array.dtype}")
print(f"Rows: {ds.Rows}, Columns: {ds.Columns}")

# Apply windowing for display (CT/MRI)
if hasattr(ds, 'WindowCenter') and hasattr(ds, 'WindowWidth'):
    from pydicom.pixels import apply_voi_lut  # pydicom 3.x location
    windowed_image = apply_voi_lut(pixel_array, ds)
else:
    windowed_image = pixel_array

# Display image
plt.imshow(windowed_image, cmap='gray')
plt.title(f"{ds.Modality} - {ds.StudyDescription}")
plt.axis('off')
plt.show()
```

**处理彩色图像：**

```python
# RGB images have shape (rows, columns, 3)
if ds.PhotometricInterpretation == 'RGB':
    rgb_image = ds.pixel_array
    plt.imshow(rgb_image)
elif ds.PhotometricInterpretation == 'YBR_FULL':
    from pydicom.pixels import convert_color_space  # pydicom 3.x location
    rgb_image = convert_color_space(ds.pixel_array, 'YBR_FULL', 'RGB')
    plt.imshow(rgb_image)
```

**多帧图像（视频/序列）：**

```python
# For multi-frame DICOM files
if hasattr(ds, 'NumberOfFrames') and ds.NumberOfFrames > 1:
    frames = ds.pixel_array  # Shape: (num_frames, rows, columns)
    print(f"Number of frames: {frames.shape[0]}")

    # Display specific frame
    plt.imshow(frames[0], cmap='gray')
```

### 将 DICOM 转换为图像格式

使用提供的 `dicom_to_image.py` 脚本或手动转换：

```python
from PIL import Image
import pydicom
import numpy as np

ds = pydicom.dcmread('input.dcm')
pixel_array = ds.pixel_array

# Normalize to 0-255 range
if pixel_array.dtype != np.uint8:
    pixel_array = ((pixel_array - pixel_array.min()) /
                   (pixel_array.max() - pixel_array.min()) * 255).astype(np.uint8)

# Save as PNG
image = Image.fromarray(pixel_array)
image.save('output.png')
```

使用该脚本：`python scripts/dicom_to_image.py input.dcm output.png`

### 修改元数据

修改 DICOM 数据元素：

```python
import pydicom
from datetime import datetime

ds = pydicom.dcmread('input.dcm')

# Modify existing elements
ds.PatientName = "Doe^John"
ds.StudyDate = datetime.now().strftime('%Y%m%d')
ds.StudyDescription = "Modified Study"

# Add new elements
ds.SeriesNumber = 1
ds.SeriesDescription = "New Series"

# Remove elements
if hasattr(ds, 'PatientComments'):
    delattr(ds, 'PatientComments')
# Or using del
if 'PatientComments' in ds:
    del ds.PatientComments

# Save modified file
ds.save_as('modified.dcm')
```

### 匿名化 DICOM 文件

移除或替换可识别患者身份的信息：

```python
import pydicom
from datetime import datetime

ds = pydicom.dcmread('input.dcm')

# Tags commonly containing PHI (Protected Health Information)
tags_to_anonymize = [
    'PatientName', 'PatientID', 'PatientBirthDate',
    'PatientSex', 'PatientAge', 'PatientAddress',
    'InstitutionName', 'InstitutionAddress',
    'ReferringPhysicianName', 'PerformingPhysicianName',
    'OperatorsName', 'StudyDescription', 'SeriesDescription',
]

# Remove or replace sensitive data
for tag in tags_to_anonymize:
    if hasattr(ds, tag):
        if tag in ['PatientName', 'PatientID']:
            setattr(ds, tag, 'ANONYMOUS')
        elif tag == 'PatientBirthDate':
            setattr(ds, tag, '19000101')
        else:
            delattr(ds, tag)

# Update dates to maintain temporal relationships
if hasattr(ds, 'StudyDate'):
    # Shift dates by a random offset
    ds.StudyDate = '20000101'

# Keep pixel data intact
ds.save_as('anonymized.dcm')
```

使用提供的脚本：`python scripts/anonymize_dicom.py input.dcm output.dcm`

### 写入 DICOM 文件

从头创建 DICOM 文件：

```python
import pydicom
from pydicom.dataset import Dataset, FileDataset, FileMetaDataset
from datetime import datetime
import numpy as np

# Create file meta information (use FileMetaDataset, not a bare Dataset)
file_meta = FileMetaDataset()
file_meta.MediaStorageSOPClassUID = pydicom.uid.CTImageStorage
file_meta.MediaStorageSOPInstanceUID = pydicom.uid.generate_uid()
file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian

# Create the FileDataset instance
ds = FileDataset('new_dicom.dcm', {}, file_meta=file_meta, preamble=b"\0" * 128)

# Add required DICOM elements
ds.PatientName = "Test^Patient"
ds.PatientID = "123456"
ds.Modality = "CT"
ds.StudyDate = datetime.now().strftime('%Y%m%d')
ds.StudyTime = datetime.now().strftime('%H%M%S')
ds.ContentDate = ds.StudyDate
ds.ContentTime = ds.StudyTime

# Add image-specific elements
ds.SamplesPerPixel = 1
ds.PhotometricInterpretation = "MONOCHROME2"
ds.Rows = 512
ds.Columns = 512
ds.BitsAllocated = 16
ds.BitsStored = 16
ds.HighBit = 15
ds.PixelRepresentation = 0

# Create pixel data
pixel_array = np.random.randint(0, 4096, (512, 512), dtype=np.uint16)
ds.PixelData = pixel_array.tobytes()

# Add required UIDs
ds.SOPClassUID = pydicom.uid.CTImageStorage
ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
ds.SeriesInstanceUID = pydicom.uid.generate_uid()
ds.StudyInstanceUID = pydicom.uid.generate_uid()

# Save the file
ds.save_as('new_dicom.dcm')
```

### 压缩与解压缩

处理压缩的 DICOM 文件：

```python
import pydicom

# Read compressed DICOM file
ds = pydicom.dcmread('compressed.dcm')

# Check transfer syntax
print(f"Transfer Syntax: {ds.file_meta.TransferSyntaxUID}")
print(f"Transfer Syntax Name: {ds.file_meta.TransferSyntaxUID.name}")

# Decompress and save as uncompressed (Transfer Syntax becomes Explicit VR LE)
ds.decompress()
ds.save_as('uncompressed.dcm', enforce_file_format=True)

# Or compress when saving (requires appropriate encoder)
ds_uncompressed = pydicom.dcmread('uncompressed.dcm')
ds_uncompressed.compress(pydicom.uid.JPEGBaseline8Bit)
ds_uncompressed.save_as('compressed_jpeg.dcm')
```

**常见传输语法：**
- `ExplicitVRLittleEndian` - 未压缩，最常用
- `JPEGBaseline8Bit` - JPEG 有损压缩
- `JPEGLossless` - JPEG 无损压缩
- `JPEG2000Lossless` - JPEG 2000 无损压缩
- `RLELossless` - 游程编码无损压缩

完整列表请参阅 `references/transfer_syntaxes.md`。

### 使用 DICOM 序列

处理嵌套数据结构：

```python
import pydicom

ds = pydicom.dcmread('file.dcm')

# Access sequences
if 'ReferencedStudySequence' in ds:
    for item in ds.ReferencedStudySequence:
        print(f"Referenced SOP Instance UID: {item.ReferencedSOPInstanceUID}")

# Create a sequence
from pydicom.sequence import Sequence

sequence_item = Dataset()
sequence_item.ReferencedSOPClassUID = pydicom.uid.CTImageStorage
sequence_item.ReferencedSOPInstanceUID = pydicom.uid.generate_uid()

ds.ReferencedImageSequence = Sequence([sequence_item])
```

### 处理 DICOM 序列

处理多个相互关联的 DICOM 文件：

```python
import pydicom
import numpy as np
from pathlib import Path

# Read all DICOM files in a directory
dicom_dir = Path('dicom_series/')
slices = []

for file_path in dicom_dir.glob('*.dcm'):
    ds = pydicom.dcmread(file_path)
    slices.append(ds)

# Sort by slice location or instance number
slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))
# Or: slices.sort(key=lambda x: int(x.InstanceNumber))

# Create 3D volume
volume = np.stack([s.pixel_array for s in slices])
print(f"Volume shape: {volume.shape}")  # (num_slices, rows, columns)

# Get spacing information for proper scaling
pixel_spacing = slices[0].PixelSpacing  # [row_spacing, col_spacing]
slice_thickness = slices[0].SliceThickness
print(f"Voxel size: {pixel_spacing[0]}x{pixel_spacing[1]}x{slice_thickness} mm")
```

## 辅助脚本

此 Skill 的 `scripts/` 目录中包含实用脚本：

### anonymize_dicom.py
通过移除或替换受保护健康信息（PHI）对 DICOM 文件进行匿名化处理。

```bash
python scripts/anonymize_dicom.py input.dcm output.dcm
```

### dicom_to_image.py
将 DICOM 文件转换为常见图像格式（PNG、JPEG、TIFF）。

```bash
python scripts/dicom_to_image.py input.dcm output.png
python scripts/dicom_to_image.py input.dcm output.jpg --format JPEG
```

### extract_metadata.py
以易读格式提取并显示 DICOM 元数据。

```bash
python scripts/extract_metadata.py file.dcm
python scripts/extract_metadata.py file.dcm --output metadata.txt
```

## 参考资料

详细参考信息位于 `references/` 目录中：

- **common_tags.md**：按类别（患者、检查、序列、图像等）整理的常用 DICOM 标签完整列表
- **transfer_syntaxes.md**：DICOM 传输语法和压缩格式的完整参考资料

## 常见问题及解决方案

**问题：“Unable to decode pixel data”**
- 解决方案：安装其他压缩处理程序：`uv pip install pylibjpeg pylibjpeg-libjpeg python-gdcm`

**问题：访问标签时出现“AttributeError”**
- 解决方案：使用 `hasattr(ds, 'AttributeName')` 检查属性是否存在，或使用 `ds.get('AttributeName', default)`

**问题：图像显示不正确（过暗或过亮）**
- 解决方案：应用 VOI LUT 窗口化：`apply_voi_lut(pixel_array, ds)`，或使用 `WindowCenter` 和 `WindowWidth` 手动调整

**问题：大型序列导致内存问题**
- 解决方案：迭代处理文件、使用内存映射数组，或对图像进行降采样

## 最佳实践

1. **始终检查必需属性是否存在**，然后再使用 `hasattr()` 或 `get()` 访问它们
2. **修改文件时保留原始编码**：直接使用 `ds.save_as(path)` 可保留源布局（pydicom 3.x 将此行为设为默认）；仅当需要完全符合标准的文件格式输出时，才传入 `enforce_file_format=True`
3. **使用传输语法 UID**，在处理像素数据前了解其压缩格式
4. **处理异常**，尤其是在读取来自不受信任来源的文件时
5. **应用适当的窗口化**（VOI LUT）以可视化医学图像
6. **保留空间信息**（像素间距、切片厚度），尤其是在处理 3D 体数据时
7. **彻底验证匿名化结果**，然后再共享医疗数据
8. **正确使用 UID**——创建新实例时生成新的 UID，修改实例时保留原 UID

## 文档

pydicom 官方文档（stable = 当前 3.x 版本）：https://pydicom.github.io/pydicom/stable/
- 用户指南：https://pydicom.github.io/pydicom/stable/guides/user/index.html
- 教程：https://pydicom.github.io/pydicom/stable/tutorials/index.html
- API 参考：https://pydicom.github.io/pydicom/stable/reference/index.html
- v3.0 发行说明（API 迁移）：https://pydicom.github.io/pydicom/stable/release_notes/v3.0.0.html