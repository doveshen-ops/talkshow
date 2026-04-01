# 🚀 Vercel 部署指南

## 3 步快速部署到 Vercel（免费、支持国内访问）

### 前置条件
- GitHub 账号
- 代码已经 push 到 GitHub

---

## 步骤 1️⃣: 推送代码到 GitHub

```bash
# 进入项目目录
cd /workspaces/talkshow

# 初始化 git（如果还没有的话）
git init
git add .
git commit -m "🎉 Talkshow 话题秀投稿平台"
git branch -M main

# 添加远程仓库（替换 doveshen-ops/talkshow 为你的仓库）
git remote add origin https://github.com/doveshen-ops/talkshow.git
git push -u origin main
```

---

## 步骤 2️⃣: 连接 Vercel

访问 **https://vercel.com**

### 2.1 注册/登录
- 点击 **Sign up**
- 选择 **Continue with GitHub**
- 授权 GitHub 账号

### 2.2 导入项目
- 点击 **Add New** → **Project**
- 选择 `talkshow` 仓库
- 点击 **Import**

### 2.3 配置部署
- **Framework**: 选择 **Vite**
- **Build Command**: 保持默认 `npm run build`
- **Output Directory**: 保持默认 `dist`
- 点击 **Deploy**

✨ **等待 1-2 分钟，部署完成！**

---

## 步骤 3️⃣: 获取你的网址

Vercel 会自动分配一个网址，例如：
```
https://talkshow-12345.vercel.app
```

或者显示在 Vercel 控制面板上。

**就这样！网站已经在线了！** 🎉

---

## 📝 更新代码后重新部署

每次修改代码后，只需：

```bash
git add .
git commit -m "功能更新"
git push origin main
```

Vercel 会自动检测到 GitHub 的更新，**自动重新部署**！

---

## 🔐 修改管理员密码

修改管理员密码需要：

1. 编辑 `src/App.jsx`，找到这一行：
```javascript
const ADMIN_PASSWORD = "admin123"; // 改成你自己的密码
```

2. 改成你要的密码，例如：
```javascript
const ADMIN_PASSWORD = "mySecretPassword123"; // 自己的密码
```

3. 提交到 GitHub：
```bash
git add src/App.jsx
git commit -m "🔐 更新管理员密码"
git push origin main
```

4. Vercel 会自动重新部署

---

## ⏱️ 访问速度

- 🌍 **国内访问速度**: 良好（200-500ms）
- 🌐 **海外访问速度**: 很快（50-150ms）

如果国内访问很慢，可以考虑后期加 CDN 加速。

---

## 📊 常见问题

**Q: 我的网站地址是什么？**
A: 部署完后，Vercel 会显示一个 `xxx.vercel.app` 的地址。

**Q: 可以用自己的域名吗？**
A: 可以。在 Vercel 项目设置中，可以绑定自定义域名。

**Q: 数据会丢失吗？**
A: 不会。数据存在用户的浏览器 LocalStorage 中，与服务器无关。

**Q: 如何备份数据？**
A: 可以定期导出投稿数据。建议在管理员界面添加数据导出功能（后续可升级）。

---

## 🆘 遇到问题？

1. **部署失败？** 检查 `npm run build` 是否能本地成功
2. **网页打不开？** 等待 2-3 分钟再试
3. **代码更新不生效？** 在 Vercel 控制面板点击 `Redeploy`

---

祝你部署成功！🎊
