pipeline {
    agent any

    parameters {
        string(name: 'AWS_REGION', defaultValue: 'ap-south-2', description: 'AWS region')
        string(name: 'EKS_CLUSTER_NAME', defaultValue: 'aws-deploy-eks-cluster', description: 'EKS cluster name')
        string(name: 'ECR_REGISTRY', defaultValue: '885686551889.dkr.ecr.ap-south-2.amazonaws.com', description: 'ECR registry host')
        string(name: 'ECR_REPO', defaultValue: 'explore/aws-sample-deployment', description: 'ECR repository name')
        string(name: 'BACKEND_URL', defaultValue: 'k8s-default-awssampl-a16a29c299-8a0820fd0683abe9.elb.ap-south-2.amazonaws.com:3000', description: 'Backend LoadBalancer EXTERNAL-IP')
        string(name: 'NAMESPACE', defaultValue: 'default', description: 'Kubernetes namespace')
        string(name: 'BUILD_TAG', defaultValue: 'latest', description: 'Docker image tag')
    }

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        BACKEND_IMAGE  = "${params.ECR_REGISTRY}/${params.ECR_REPO}:backend-${params.BUILD_TAG}"
        FRONTEND_IMAGE = "${params.ECR_REGISTRY}/${params.ECR_REPO}:frontend-${params.BUILD_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========== Checking out code =========='
                checkout scm
            }
        }

        stage('Configure AWS Credentials') {
            steps {
                echo '========== Configuring AWS credentials =========='
                bat '''
                    aws configure set region %AWS_REGION%
                    aws sts get-caller-identity
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                echo '========== Logging in to ECR =========='
                bat '''
                    aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                echo '========== Building backend Docker image =========='
                bat '''
                    cd backend
                    docker build -t %BACKEND_IMAGE% .
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo '========== Building frontend Docker image =========='
                bat '''
                    cd frontend
                    docker build --build-arg VITE_BACKEND_URL="http://%BACKEND_URL%/" -t %FRONTEND_IMAGE% .
                '''
            }
        }

        stage('Push Backend Image to ECR') {
            steps {
                echo '========== Pushing backend image to ECR =========='
                bat '''
                    docker push %BACKEND_IMAGE%
                '''
            }
        }

        stage('Push Frontend Image to ECR') {
            steps {
                echo '========== Pushing frontend image to ECR =========='
                bat '''
                    docker push %FRONTEND_IMAGE%
                '''
            }
        }

        stage('Update kubeconfig') {
            steps {
                echo '========== Updating kubeconfig =========='
                bat '''
                    aws eks update-kubeconfig --name %EKS_CLUSTER_NAME% --region %AWS_REGION%
                '''
            }
        }

        stage('Create Namespace') {
            steps {
                echo '========== Creating Kubernetes namespace =========='
                bat '''
                    kubectl create namespace %NAMESPACE% --dry-run=client -o yaml | kubectl apply -f -
                '''
            }
        }

        stage('Deploy Backend to EKS') {
            steps {
                echo '========== Deploying backend to EKS =========='
                bat '''
                    kubectl set image deployment/aws-sample-backend aws-sample-backend=%BACKEND_IMAGE% -n %NAMESPACE% || kubectl apply -f k8s/backend-deployment.yaml -n %NAMESPACE%
                '''
            }
        }

        stage('Deploy Frontend to EKS') {
            steps {
                echo '========== Deploying frontend to EKS =========='
                bat '''
                    kubectl set image deployment/aws-sample-frontend aws-sample-frontend=%FRONTEND_IMAGE% -n %NAMESPACE% || kubectl apply -f k8s/frontend-deployment.yaml -n %NAMESPACE%
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo '========== Verifying deployment =========='
                bat '''
                    kubectl rollout status deployment/aws-sample-backend -n %NAMESPACE% --timeout=5m
                    kubectl rollout status deployment/aws-sample-frontend -n %NAMESPACE% --timeout=5m
                    echo Pods status:
                    kubectl get pods -n %NAMESPACE%
                    echo Services:
                    kubectl get svc -n %NAMESPACE%
                '''
            }
        }
    }

    post {
        always {
            echo '========== Cleaning up =========='
            bat '''
                docker logout %ECR_REGISTRY%
            '''
        }
        success {
            echo '========== Pipeline completed successfully =========='
        }
        failure {
            echo '========== Pipeline failed =========='
        }
    }
}
