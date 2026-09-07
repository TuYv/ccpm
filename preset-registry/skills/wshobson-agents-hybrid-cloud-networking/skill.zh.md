---
name: hybrid-cloud-networking
description: Configure secure, high-performance connectivity between on-premises infrastructure and cloud platforms using VPN and dedicated connections. Use when building hybrid cloud architectures, connecting data centers to cloud, or implementing secure cross-premises networking.
---
# 混合云网络

使用 VPN、Direct Connect、ExpressRoute、Interconnect 和 FastConnect，在本地环境与云环境之间配置安全、高性能的连接。

## 目的

在本地数据中心与云提供商（AWS、Azure、GCP、OCI）之间建立安全、可靠的网络连接。

## 适用场景

- 将本地环境连接到云
- 将数据中心扩展到云
- 实现混合云双活（Active-Active）部署
- 满足合规要求
- 逐步迁移到云

## 连接选项

### AWS 连接

#### 1. Site-to-Site VPN

- 基于互联网的 IPSec VPN
- 每条隧道最高 1.25 Gbps
- 对中等带宽而言具有成本效益
- 延迟较高，依赖互联网

```hcl
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "main-vpn-gateway"
  }
}

resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  ip_address = "203.0.113.1"
  type       = "ipsec.1"
}

resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = false
}
```

#### 2. AWS Direct Connect

- 专用网络连接
- 1 Gbps 至 100 Gbps
- 延迟更低，带宽稳定
- 价格更高，需要一定的搭建时间

**参考：** 参见 `references/direct-connect.md`

### Azure 连接

#### 1. Site-to-Site VPN

```hcl
resource "azurerm_virtual_network_gateway" "vpn" {
  name                = "vpn-gateway"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  type     = "Vpn"
  vpn_type = "RouteBased"
  sku      = "VpnGw1"

  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}
```

#### 2. Azure ExpressRoute

- 通过连接服务提供商建立的专用连接
- 最高 100 Gbps
- 低延迟、高可靠性
- 高级版（Premium）支持全球连通

### GCP 连接

#### 1. Cloud VPN

- IPSec VPN（Classic 或 HA VPN）
- HA VPN：99.99% SLA
- 每条隧道最高 3 Gbps

#### 2. Cloud Interconnect

- 专用连接（Dedicated，10 Gbps、100 Gbps）
- 合作伙伴连接（Partner，50 Mbps 至 50 Gbps）
- 延迟低于 VPN

### OCI 连接

#### 1. IPSec VPN Connect

- 带冗余隧道的 IPSec VPN
- 通过 DRG 进行动态路由
- 非常适合分支机构 office 和迁移阶段

#### 2. OCI FastConnect

- 通过 Oracle 或合作伙伴边缘节点提供的私有专用连接
- 适合需要可预测吞吐量和更低延迟的混合流量
- 通常与 DRG 搭配用于轮辐式（hub-and-spoke）设计

## 混合网络模式

### 模式 1：轮辐式（Hub-and-Spoke）

```
On-Premises Datacenter
         ↓
    VPN/Direct Connect
         ↓
    Transit Gateway (AWS) / vWAN (Azure)
         ↓
    ├─ Production VPC/VNet
    ├─ Staging VPC/VNet
    └─ Development VPC/VNet
```

### 模式 2：多区域混合

```
On-Premises
    ├─ Direct Connect → us-east-1
    └─ Direct Connect → us-west-2
            ↓
        Cross-Region Peering
```

### 模式 3：多云混合

```
On-Premises Datacenter
    ├─ Direct Connect → AWS
    ├─ ExpressRoute → Azure
    ├─ Interconnect → GCP
    └─ FastConnect → OCI
```

## 路由配置

### BGP 配置

```
On-Premises Router:
- AS Number: 65000
- Advertise: 10.0.0.0/8

Cloud Router:
- AS Number: 64512 (AWS), 65515 (Azure), provider-assigned for GCP/OCI
- Advertise: Cloud VPC/VNet CIDRs
```

### 路由传播

- 在路由表上启用路由传播
- 使用 BGP 实现动态路由
- 实施路由过滤
- 监控路由通告

## 安全最佳实践

1. **使用私有连接**（Direct Connect/ExpressRoute/Interconnect/FastConnect）
2. **为 VPN 隧道实施加密**
3. **使用 VPC 端点**避免经由互联网路由
4. **配置网络 ACL**和安全组
5. **启用 VPC Flow Logs** 进行监控
6. **实施 DDoS 防护**
7. **使用 PrivateLink/Private Endpoints**
8. **监控连接**，配合 CloudWatch/Azure Monitor/Cloud Monitoring/OCI Monitoring
9. **实施冗余**（双隧道）
10. **定期进行安全审计**

## 高可用性

### 双 VPN 隧道

```hcl
resource "aws_vpn_connection" "primary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.primary.id
  type                = "ipsec.1"
}

resource "aws_vpn_connection" "secondary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.secondary.id
  type                = "ipsec.1"
}
```

### 双活（Active-Active）配置

- 来自不同地点的多条连接
- 使用 BGP 实现自动故障切换
- 等价多路径（ECMP）路由
- 监控所有连接的健康状况

## 监控与故障排查

### 关键指标

- 隧道状态（up/down）
- 进出字节数
- 丢包率
- 延迟
- BGP 会话状态

### 故障排查

```bash
# AWS VPN
aws ec2 describe-vpn-connections
aws ec2 get-vpn-connection-telemetry

# Azure VPN
az network vpn-connection show
az network vpn-connection show-device-config-script

# OCI IPSec VPN
oci network ip-sec-connection list
oci network cpe list
```

## 成本优化

1. **根据流量合理调整连接规格**
2. **对低带宽**工作负载使用 VPN
3. **整合流量**，减少连接数量
4. **尽量降低数据传输**成本
5. **使用专用私有链路**应对高带宽场景
6. **实施缓存**以减少流量


## 相关技能

- `multi-cloud-architecture` - 用于架构决策
- `terraform-module-library` - 用于 IaC 实现
