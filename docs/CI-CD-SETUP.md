# 🚀 CI/CD Pipeline Setup Guide

## ✅ What's Been Created

Your automated CI/CD pipeline is now configured with:

### 📁 New Files Added:
- `.github/workflows/deploy.yml` - Main CI/CD pipeline
- `package.json` - Project dependencies and scripts  
- `.eslintrc.json` - Code quality configuration

### 🔧 Pipeline Features:
- **Quality Checks**: ESLint, security audit, dependency checks
- **Automated Deployment**: Auto-deploy to Firebase on main branch push
- **Multi-stage Pipeline**: Quality → Build → Deploy → Notify
- **Error Handling**: Continues on warnings, fails on critical errors

## 🔑 Required: GitHub Secrets Setup

**CRITICAL STEP**: Add your Firebase token to GitHub repository secrets:

### Steps:
1. **Get Firebase Token**: Run `npx firebase-tools login:ci` in terminal
2. **Copy the token** that starts with `1//0g...`
3. Go to your GitHub repository: `https://github.com/nuwnian/nan-diary`
4. Click **Settings** → **Secrets and variables** → **Actions**
5. Click **New repository secret**
6. Name: `FIREBASE_TOKEN`
7. Value: `[PASTE YOUR FIREBASE TOKEN HERE]`
8. Click **Add secret**

## 🚀 How It Works

### Trigger Events:
- **Push to main branch** → Full deployment pipeline
- **Pull Request** → Quality checks only (no deployment)

### Pipeline Stages:
```
📥 Code Checkout
    ↓
🔍 Quality Checks (ESLint, Security Audit)
    ↓
🏗️ Build Preparation 
    ↓
🔥 Firebase Deployment
    ↓
🎉 Success Notification
```

### Deployment Flow:
1. Code pushed to `main` branch
2. GitHub Actions automatically triggers
3. Runs code quality checks
4. Copies files to deploy directory
5. Deploys to Firebase Hosting
6. Updates live site: https://nan-diary-6cdba.web.app

## 📋 Available NPM Scripts

```bash
# Development
npm run dev          # Start local development server

# Build & Deploy
npm run build        # Prepare files for deployment
npm run deploy       # Deploy to Firebase manually
npm run deploy:full  # Deploy hosting + rules

# Quality Assurance  
npm run lint         # Check code quality
npm run security-check # Run security audit
npm test             # Run tests (placeholder)
```

## 🔧 Next Steps

1. **Get Firebase token**: Run `npx firebase-tools login:ci`
2. **Add token to GitHub secrets** (see steps above)
3. **Commit and push these changes**:
   ```bash
   git add .
   git commit -m "Add automated CI/CD pipeline with GitHub Actions"
   git push origin main
   ```
4. **Watch the magic happen** in GitHub Actions tab!

## 🎯 Benefits You'll Get

- ✅ **Zero-downtime deployments**
- ✅ **Automated code quality checks**
- ✅ **Security vulnerability scanning**
- ✅ **Consistent deployment process**
- ✅ **Integration with GitHub workflow**
- ✅ **Professional DevOps practices**

## 🚨 Troubleshooting

**If deployment fails**:
1. Check GitHub Actions tab for error details
2. Verify Firebase token in repository secrets
3. Ensure Firebase project permissions
4. Check console logs in Actions runner

## 🔮 Future Enhancements

Ready for more advanced DevOps practices:
- Docker containerization
- Multiple environment deployments (dev/staging/prod)
- Automated testing integration
- Performance monitoring
- Slack/Discord notifications
- Blue-green deployments