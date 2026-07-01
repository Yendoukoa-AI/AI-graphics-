#!/bin/bash

# AWS Deployment Script for Global DesignAI Studio

echo "🚀 Preparing for AWS Deployment..."

# 1. Build the frontend
echo "📦 Building frontend..."
npm install
npm run build

# 2. Package the application
echo "🎁 Packaging application..."
npm run package

# 3. Create a basic AppSpec or Docker Compose for AWS
# For this task, we will create a docker-compose.aws.yml
cat <<EOF > docker-compose.aws.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - AWS_REGION=\${AWS_REGION}
      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=\${AWS_S3_BUCKET}
      - GOOGLE_AI_API_KEY=\${GOOGLE_AI_API_KEY}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
    restart: always
EOF

echo "✅ AWS Deployment preparation complete."
echo "You can now deploy using AWS Elastic Beanstalk, ECS, or EC2 with Docker Compose."
