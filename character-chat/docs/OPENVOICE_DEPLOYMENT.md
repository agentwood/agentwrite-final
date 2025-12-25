# OpenVoice Deployment Guide

## Overview

This guide covers deploying the OpenVoice server to cloud infrastructure for production use.

## Local Development

### Using Docker Compose

```bash
cd services/openvoice
docker-compose up -d
```

### Manual Setup

```bash
cd services/openvoice
pip install -r requirements.txt
python server.py
```

## Cloud Deployment

### AWS ECS

1. **Build and push image to ECR:**

```bash
# Create ECR repository
aws ecr create-repository --repository-name openvoice

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t openvoice:latest .
docker tag openvoice:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/openvoice:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/openvoice:latest
```

2. **Create ECS task definition** (task-definition.json):

```json
{
  "family": "openvoice",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "containerDefinitions": [{
    "name": "openvoice",
    "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/openvoice:latest",
    "portMappings": [{
      "containerPort": 8000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "PORT", "value": "8000"},
      {"name": "ALLOWED_ORIGINS", "value": "https://your-app.com"}
    ],
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
      "interval": 30,
      "timeout": 5,
      "retries": 3
    }
  }]
}
```

3. **Register task definition:**

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

4. **Create ECS service:**

```bash
aws ecs create-service \
  --cluster your-cluster \
  --service-name openvoice \
  --task-definition openvoice \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### GCP Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy openvoice \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "ALLOWED_ORIGINS=https://your-app.com"
```

### Azure Container Instances

```bash
# Create resource group
az group create --name openvoice-rg --location eastus

# Create container registry
az acr create --resource-group openvoice-rg \
  --name openvoiceregistry --sku Basic

# Login and push
az acr login --name openvoiceregistry
docker tag openvoice:latest openvoiceregistry.azurecr.io/openvoice:latest
docker push openvoiceregistry.azurecr.io/openvoice:latest

# Deploy
az container create \
  --resource-group openvoice-rg \
  --name openvoice \
  --image openvoiceregistry.azurecr.io/openvoice:latest \
  --dns-name-label openvoice \
  --ports 8000 \
  --memory 2 \
  --cpu 2 \
  --environment-variables \
    PORT=8000 \
    ALLOWED_ORIGINS=https://your-app.com
```

## Environment Variables

Required:
- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

Optional:
- `LOG_LEVEL`: Logging level (default: INFO)
- `CACHE_ENABLED`: Enable caching (default: true)
- `RATE_LIMIT_ENABLED`: Enable rate limiting (default: false)

## Health Checks

The server provides a health check endpoint:

```bash
curl http://your-server/health
```

Response:
```json
{
  "status": "ok",
  "openvoice_ready": true,
  "version": "1.0.0"
}
```

## Monitoring

### Logs

- **Docker**: `docker logs openvoice-production`
- **AWS ECS**: CloudWatch Logs
- **GCP Cloud Run**: Cloud Logging
- **Azure**: Container Insights

### Metrics

Monitor:
- Request latency
- Error rates
- CPU/Memory usage
- OpenVoice initialization status

## Scaling

### Auto-scaling

Configure based on:
- Request rate
- CPU utilization
- Memory usage

### Manual Scaling

- **AWS ECS**: Update service desired count
- **GCP Cloud Run**: Adjust min/max instances
- **Azure**: Scale container group

## Security

1. **CORS**: Configure `ALLOWED_ORIGINS` properly
2. **API Keys**: Add authentication if needed
3. **Network**: Use VPC/private networking
4. **Secrets**: Store sensitive data in secrets manager

## Troubleshooting

### Server not starting

- Check Docker logs
- Verify model checkpoints are present
- Check environment variables

### High latency

- Increase CPU/memory allocation
- Enable caching
- Optimize model loading

### Out of memory

- Increase container memory
- Reduce batch sizes
- Optimize model usage

## Cost Optimization

- Use spot instances (AWS)
- Right-size containers
- Enable auto-scaling
- Cache voice embeddings

## Next Steps

1. Set up monitoring and alerts
2. Configure auto-scaling
3. Set up backup/disaster recovery
4. Document runbooks




