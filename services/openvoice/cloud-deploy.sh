#!/bin/bash
# Cloud deployment script for OpenVoice server
# Supports AWS ECS, GCP Cloud Run, and Azure Container Instances

set -e

ENVIRONMENT=${1:-production}
CLOUD_PROVIDER=${2:-aws}

echo "=========================================="
echo "OpenVoice Cloud Deployment"
echo "Environment: $ENVIRONMENT"
echo "Cloud Provider: $CLOUD_PROVIDER"
echo "=========================================="

# Build Docker image
echo ""
echo "Building Docker image..."
docker build -t openvoice:latest .

# Tag image
IMAGE_TAG="openvoice:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
docker tag openvoice:latest $IMAGE_TAG

case $CLOUD_PROVIDER in
  aws)
    echo ""
    echo "Deploying to AWS ECS..."
    echo "Note: Configure AWS credentials and ECR repository first"
    echo ""
    echo "Steps:"
    echo "1. Create ECR repository:"
    echo "   aws ecr create-repository --repository-name openvoice"
    echo ""
    echo "2. Login to ECR:"
    echo "   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com"
    echo ""
    echo "3. Push image:"
    echo "   docker tag openvoice:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/openvoice:latest"
    echo "   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/openvoice:latest"
    echo ""
    echo "4. Create/update ECS task definition and service"
    ;;
    
  gcp)
    echo ""
    echo "Deploying to GCP Cloud Run..."
    echo "Note: Configure gcloud CLI and project first"
    echo ""
    echo "Steps:"
    echo "1. Set project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    echo ""
    echo "2. Deploy:"
    echo "   gcloud run deploy openvoice \\"
    echo "     --source . \\"
    echo "     --platform managed \\"
    echo "     --region us-central1 \\"
    echo "     --allow-unauthenticated \\"
    echo "     --memory 2Gi \\"
    echo "     --cpu 2 \\"
    echo "     --timeout 300"
    ;;
    
  azure)
    echo ""
    echo "Deploying to Azure Container Instances..."
    echo "Note: Configure Azure CLI and resource group first"
    echo ""
    echo "Steps:"
    echo "1. Create resource group:"
    echo "   az group create --name openvoice-rg --location eastus"
    echo ""
    echo "2. Create container registry:"
    echo "   az acr create --resource-group openvoice-rg --name openvoiceregistry --sku Basic"
    echo ""
    echo "3. Push image:"
    echo "   az acr login --name openvoiceregistry"
    echo "   docker tag openvoice:latest openvoiceregistry.azurecr.io/openvoice:latest"
    echo "   docker push openvoiceregistry.azurecr.io/openvoice:latest"
    echo ""
    echo "4. Deploy:"
    echo "   az container create \\"
    echo "     --resource-group openvoice-rg \\"
    echo "     --name openvoice \\"
    echo "     --image openvoiceregistry.azurecr.io/openvoice:latest \\"
    echo "     --dns-name-label openvoice \\"
    echo "     --ports 8000 \\"
    echo "     --memory 2 \\"
    echo "     --cpu 2"
    ;;
    
  *)
    echo "Unknown cloud provider: $CLOUD_PROVIDER"
    echo "Supported: aws, gcp, azure"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "Deployment instructions displayed above"
echo "=========================================="




