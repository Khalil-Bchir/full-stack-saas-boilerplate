# ArgoCD GitOps

ArgoCD watches [github.com/Khalil-Bchir/full-stack-saas-boilerplate](https://github.com/Khalil-Bchir/full-stack-saas-boilerplate) and syncs Kubernetes manifests from `deploy/k8s/overlays/`.

## Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Bootstrap

```bash
kubectl apply -f deploy/argocd/projects/
kubectl apply -f deploy/argocd/app-of-apps.yaml
```

## Applications

| Application | Git branch | Manifest path | Namespace |
| --- | --- | --- | --- |
| `saas-staging` | `staging` | `deploy/k8s/overlays/staging` | `saas-staging` |
| `saas-production` | `main` | `deploy/k8s/overlays/production` | `saas-production` |

Repository URL in all manifests:

`https://github.com/Khalil-Bchir/full-stack-saas-boilerplate.git`

## Sync policy

Applications use automated sync with self-heal and `CreateNamespace=true`.

## Secrets

Create secrets before the first sync:

```bash
./deploy/scripts/bootstrap-secrets.sh saas-staging .env.staging
./deploy/scripts/bootstrap-secrets.sh saas-production .env.production
```

ArgoCD syncs manifests only — it does not create application secrets.
