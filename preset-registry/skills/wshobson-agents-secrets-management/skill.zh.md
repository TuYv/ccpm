---
name: secrets-management
description: Implement secure secrets management for CI/CD pipelines using Vault, AWS Secrets Manager, or native platform solutions. Use when handling sensitive credentials, rotating secrets, or securing CI/CD environments.
---
# 机密管理

使用 Vault、AWS Secrets Manager 及其他工具，为 CI/CD 流水线提供安全的机密管理实践。

## 目的

在 CI/CD 流水线中实现安全的机密管理，避免对敏感信息进行硬编码。

## 适用场景

- 存储 API 密钥和凭证
- 管理数据库密码
- 处理 TLS 证书
- 自动轮换机密
- 实现最小权限访问

## 机密管理工具

### HashiCorp Vault

- 集中式机密管理
- 动态机密生成
- 机密轮换
- 审计日志
- 细粒度访问控制

### AWS Secrets Manager

- AWS 原生解决方案
- 自动轮换
- 与 RDS 集成
- 支持 CloudFormation

### Azure Key Vault

- Azure 原生解决方案
- 基于 HSM 的密钥
- 证书管理
- RBAC 集成

### Google Secret Manager

- GCP 原生解决方案
- 版本管理
- IAM 集成

## HashiCorp Vault 集成

### 设置 Vault

```bash
# Start Vault dev server
vault server -dev

# Set environment
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# Enable secrets engine
vault secrets enable -path=secret kv-v2

# Store secret
vault kv put secret/database/config username=admin password=secret
```

### 在 GitHub Actions 中使用 Vault

```yaml
name: Deploy with Vault Secrets

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Import Secrets from Vault
        uses: hashicorp/vault-action@v2
        with:
          url: https://vault.example.com:8200
          token: ${{ secrets.VAULT_TOKEN }}
          secrets: |
            secret/data/database username | DB_USERNAME ;
            secret/data/database password | DB_PASSWORD ;
            secret/data/api key | API_KEY

      - name: Use secrets
        run: |
          echo "Connecting to database as $DB_USERNAME"
          # Use $DB_PASSWORD, $API_KEY
```

### 在 GitLab CI 中使用 Vault

```yaml
deploy:
  image: vault:1.17
  before_script:
    - export VAULT_ADDR=https://vault.example.com:8200
    - export VAULT_TOKEN=$VAULT_TOKEN
    - apk add curl jq
  script:
    - |
      DB_PASSWORD=$(vault kv get -field=password secret/database/config)
      API_KEY=$(vault kv get -field=key secret/api/credentials)
      echo "Deploying with secrets..."
      # Use $DB_PASSWORD, $API_KEY
```

**参考：** 参见 `references/vault-setup.md`

## AWS Secrets Manager

### 存储机密

```bash
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password"
```

### 在 GitHub Actions 中获取机密

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-west-2

- name: Get secret from AWS
  run: |
    SECRET=$(aws secretsmanager get-secret-value \
      --secret-id production/database/password \
      --query SecretString \
      --output text)
    echo "::add-mask::$SECRET"
    echo "DB_PASSWORD=$SECRET" >> $GITHUB_ENV

- name: Use secret
  run: |
    # Use $DB_PASSWORD
    ./deploy.sh
```

### 在 Terraform 中使用 AWS Secrets Manager

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

resource "aws_db_instance" "main" {
  allocated_storage    = 100
  engine              = "postgres"
  instance_class      = "db.t3.large"
  username            = "admin"
  password            = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

## GitHub Secrets

### 组织/仓库机密

```yaml
- name: Use GitHub secret
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    # Secrets are injected as env vars — never print them to logs
    ./deploy.sh
```

### 环境机密

```yaml
deploy:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - name: Deploy
      env:
        PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
      run: |
        # Secret injected as env var — never print to logs
        ./deploy.sh
```

**参考：** 参见 `references/github-secrets.md`

## GitLab CI/CD 变量

### 项目变量

```yaml
deploy:
  script:
    - echo "Deploying with $API_KEY"
    - echo "Database: $DATABASE_URL"
```

### 受保护变量和掩码变量

- 受保护（Protected）：仅在受保护分支中可用
- 掩码（Masked）：在作业日志中隐藏
- 文件类型（File）：以文件形式存储

## 最佳实践

1. **绝不将机密提交**到 Git
2. 每个环境**使用不同的机密**
3. **定期轮换机密**
4. **实现最小权限访问**
5. **启用审计日志**
6. **使用机密扫描**（GitGuardian、TruffleHog）
7. **在日志中对机密进行掩码处理**
8. **对静态机密进行加密**
9. 尽可能**使用短期令牌**
10. **记录机密需求**

## 机密轮换

### 使用 AWS 进行自动轮换

```python
import boto3
import json

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')

    # Get current secret
    response = client.get_secret_value(SecretId='my-secret')
    current_secret = json.loads(response['SecretString'])

    # Generate new password
    new_password = generate_strong_password()

    # Update database password
    update_database_password(new_password)

    # Update secret
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({
            'username': current_secret['username'],
            'password': new_password
        })
    )

    return {'statusCode': 200}
```

### 手动轮换流程

1. 生成新机密
2. 更新机密存储中的机密
3. 更新应用程序以使用新机密
4. 验证功能
5. 吊销旧机密

## External Secrets Operator

### Kubernetes 集成

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.example.com:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "production"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
    - secretKey: username
      remoteRef:
        key: database/config
        property: username
    - secretKey: password
      remoteRef:
        key: database/config
        property: password
```

## 机密扫描

### Pre-commit 钩子

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for secrets with TruffleHog
docker run --rm -v "$(pwd):/repo" \
  trufflesecurity/trufflehog:3.88 \
  filesystem --directory=/repo

if [ $? -ne 0 ]; then
  echo "❌ Secret detected! Commit blocked."
  exit 1
fi
```

### CI/CD 机密扫描

```yaml
secret-scan:
  stage: security
  image: trufflesecurity/trufflehog:3.88
  script:
    - trufflehog filesystem .
  allow_failure: false
```


## 相关技能

- `github-actions-templates` - 用于 GitHub Actions 集成
- `gitlab-ci-patterns` - 用于 GitLab CI 集成
- `deployment-pipeline-design` - 用于流水线架构
