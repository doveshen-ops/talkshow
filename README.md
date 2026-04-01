# 🎤 Talkshow - 话题秀投稿平台

一个为话题秀节目打造的投稿管理系统。支持多个赛道（少年组、青年组、成人赛道），完整的投稿生命周期管理，以及在线视频投稿功能。

## 功能特性

✨ **投稿管理**
- 提交、编辑、删除投稿
- 支持多个赛道分类
- 📹 **在线视频提交** - 支持 YouTube、B站、抖音等视频链接

👤 **管理员功能**
- 🔐 管理员登录（默认密码：`admin123`）
- 更新投稿进度状态
- 查看所有投稿内容

🎯 **赛道体系**
- 少年组（11+）🐱
- 青年组（14+）🔥
- 成人赛道 🎓

📊 **进度追踪**
- 已报名 📝
- 八强·录制中 🎙️
- 决赛选手 🏆
- 未晋级 💤

💾 **数据持久化**
- 基于浏览器 LocalStorage
- 数据会自动保存在本地

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:5173` 即可查看应用

### 3. 构建生产版本
```bash
npm run build
```

## 🚀 免费部署到 Vercel（推荐国内用户）

### 步骤 1: 推送代码到 GitHub
```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 步骤 2: 在 Vercel 上一键部署

访问 [vercel.com](https://vercel.com)，选择：
1. **Sign up** - 用 GitHub 账号登录
2. **New Project** - 选择你的 talkshow 仓库
3. 点击 **Deploy** - 完成！

Vercel 会自动分配一个免费的 `xxx.vercel.app` 网址。

### 步骤 3: 自定义域名（可选）
如果你后续想用自己的域名，Vercel 也支持绑定自定义域名。

---

## 📝 管理员使用

### 登录管理员
1. 点击页面右上角 "🔐 管理员" 按钮
2. 输入密码：`admin123`
3. 登录后可以管理所有投稿

### 修改管理员密码
在 `src/App.jsx` 中修改这一行：
```javascript
const ADMIN_PASSWORD = "admin123"; // 改成你自己的密码
```
然后重新部署。

### 更新投稿进度
点击投稿卡片展开，选择新的进度状态：
- 📝 已报名
- 🎙️ 八强·录制中
- 🏆 决赛选手
- 💤 未晋级

---

## 🎥 视频投稿说明

用户可以在投稿时添加视频链接，支持的平台：
- ✅ YouTube 分享链接
- ✅ B站（哔哩哔哩）分享链接
- ✅ 抖音分享链接
- ✅ 其他视频平台的分享链接

提交后，管理员可以点击投稿卡片查看视频。

---

## 技术栈

- **React 18** - UI 框架
- **Vite** - 快速构建工具
- **LocalStorage** - 数据存储
- **Vercel** - 托管和部署

---

## 常见问题

**Q: 国内可以直接访问 Vercel 的网站吗？**
A: 可以的，Vercel 在国内的访问速度还不错。如果用户反馈太慢，后期可以考虑迁移到国内 CDN。

**Q: 数据会丢失吗？**
A: 数据存储在浏览器的 LocalStorage 中，清除浏览器缓存会丢失。建议定期备份重要数据。

**Q: 如何修改密码？**
A: 修改 `src/App.jsx` 中的 `ADMIN_PASSWORD` 常量，然后`git push` 重新部署即可。

**Q: 能支持更多投稿者吗？**
A: 可以，当前没有用户限制，数据量大可能需要迁移到真实数据库。
      console.error("Save failed:", e);
    }
  }, []);

  const addEntry = () => {
    if (!form.name.trim() || !form.content.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      name: form.name.trim(),
      content: form.content.trim(),
      track: form.track,
      stage: "submitted",
      rating: 0,
      notes: "",
      date: new Date().toLocaleDateString("zh-CN"),
    };
    saveEntries([newEntry, ...entries]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  const updateStage = (id, stage) => {
    saveEntries(entries.map(e => e.id === id ? { ...e, stage } : e));
  };

  const updateRating = (id, rating) => {
    saveEntries(entries.map(e => e.id === id ? { ...e, rating } : e));
  };

  const deleteEntry = (id) => {
    saveEntries(entries.filter(e => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const saveEdit = (id) => {
    saveEntries(entries.map(e => e.id === id ? { ...e, content: editContent } : e));
    setEditingId(null);
    setEditContent("");
  };

  const filtered = activeTrack === "all" ? entries : entries.filter(e => e.track === activeTrack);
  const trackOf = (id) => TRACKS.find(t => t.id === id);

  const stats = {
    total: entries.length,
    junior: entries.filter(e => e.track === "junior").length,
    senior: entries.filter(e => e.track === "senior").length,
    adult: entries.filter(e => e.track === "adult").length,
    finalists: entries.filter(e => e.stage === "finalist").length,
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans SC', sans-serif" }}>
        <div style={{ fontSize: 16, color: "#999" }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      fontFamily: "'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif",
      color: "#e2e8f0",
    }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 20px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 3, marginBottom: 4 }}>AI TECH WEEK 2026</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>🎤 吐槽大会 · 稿件中心</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
            background: showForm ? "#475569" : "linear-gradient(135deg, #ec4899, #8b5cf6)",
            color: "#fff", fontSize: 14, fontWeight: 700, transition: "all 0.2s",
          }}>
            {showForm ? "✕ 取消" : "+ 新稿件"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { label: "总投稿", value: stats.total, color: "#94a3b8" },
            { label: "🐱 少年", value: stats.junior, color: "#8b5cf6" },
            { label: "🔥 青年", value: stats.senior, color: "#ec4899" },
            { label: "🎓 成人", value: stats.adult, color: "#2563eb" },
            { label: "🏆 决赛", value: stats.finalists, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "10px 6px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Track Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setActiveTrack("all")} style={{
            padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
            background: activeTrack === "all" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
            color: activeTrack === "all" ? "#f1f5f9" : "#64748b",
            fontSize: 13, fontWeight: 600,
          }}>全部</button>
          {TRACKS.map(t => (
            <button key={t.id} onClick={() => setActiveTrack(t.id)} style={{
              padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: activeTrack === t.id ? `${t.color}30` : "rgba(255,255,255,0.04)",
              color: activeTrack === t.id ? t.color : "#64748b",
              fontSize: 13, fontWeight: 600,
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Add Form */}
        {showForm && (
          <div style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)", padding: "20px",
            marginBottom: 20, animation: "slideDown 0.2s ease",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#f1f5f9" }}>📝 录入新稿件</div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {TRACKS.map(t => (
                <button key={t.id} onClick={() => setForm({ ...form, track: t.id })} style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: form.track === t.id ? `${t.color}25` : "rgba(255,255,255,0.04)",
                  color: form.track === t.id ? t.color : "#64748b",
                  fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                }}>{t.icon} {t.label}</button>
              ))}
            </div>

            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="选手姓名"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)",
                color: "#e2e8f0", fontSize: 14, marginBottom: 10, outline: "none",
                boxSizing: "border-box",
              }}
            />

            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="粘贴吐槽稿件内容……"
              rows={5}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)",
                color: "#e2e8f0", fontSize: 14, marginBottom: 12, outline: "none",
                resize: "vertical", lineHeight: 1.7, boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {form.content.length} 字
                {form.content.length > 0 && form.content.length < 150 && " · 还差" + (150 - form.content.length) + "字达到最低要求"}
                {form.content.length >= 150 && " ✓"}
              </span>
              <button onClick={addEntry} disabled={!form.name.trim() || !form.content.trim()} style={{
                padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
                background: form.name.trim() && form.content.trim() ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : "#334155",
                color: "#fff", fontSize: 14, fontWeight: 700,
                opacity: form.name.trim() && form.content.trim() ? 1 : 0.4,
              }}>录入</button>
            </div>
          </div>
        )}

        {/* Entry List */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "#475569",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>还没有稿件</div>
            <div style={{ fontSize: 13 }}>点击右上角「+ 新稿件」开始录入</div>
          </div>
        ) : (
          filtered.map(entry => {
            const track = trackOf(entry.track);
            const expanded = expandedId === entry.id;
            const stage = STAGES.find(s => s.id === entry.stage);
            const isEditing = editingId === entry.id;

            return (
              <div key={entry.id} style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                border: `1px solid ${entry.stage === "finalist" ? "#f59e0b40" : "rgba(255,255,255,0.06)"}`,
                marginBottom: 10,
                overflow: "hidden",
                transition: "all 0.2s",
              }}>
                {/* Card Header - always visible */}
                <div
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  style={{
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    minWidth: 42, height: 42, borderRadius: 12,
                    background: `${track.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>{track.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{entry.name}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 10,
                        background: `${track.color}20`, color: track.color,
                      }}>{track.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{entry.date}</span>
                      <span>·</span>
                      <span>{entry.content.length}字</span>
                      <span>·</span>
                      <span>{stage.icon} {stage.label}</span>
                    </div>
                  </div>

                  {/* Rating stars */}
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map(s => (
                      <span
                        key={s}
                        onClick={e => { e.stopPropagation(); updateRating(entry.id, entry.rating === s ? 0 : s); }}
                        style={{
                          cursor: "pointer", fontSize: 16,
                          color: entry.rating >= s ? "#f59e0b" : "#334155",
                          transition: "color 0.15s",
                        }}
                      >★</span>
                    ))}
                  </div>

                  {/* Expand arrow */}
                  <span style={{
                    fontSize: 12, color: "#475569",
                    transform: expanded ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}>▼</span>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div style={{ padding: "0 16px 16px" }}>
                    {/* Content */}
                    <div style={{
                      background: "rgba(0,0,0,0.25)", borderRadius: 12,
                      padding: "14px 16px", marginBottom: 12,
                    }}>
                      {isEditing ? (
                        <>
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={6}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
                              color: "#e2e8f0", fontSize: 14, outline: "none",
                              resize: "vertical", lineHeight: 1.7, boxSizing: "border-box",
                            }}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setEditingId(null)} style={{
                              padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                              background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer",
                            }}>取消</button>
                            <button onClick={() => saveEdit(entry.id)} style={{
                              padding: "6px 14px", borderRadius: 8, border: "none",
                              background: track.color, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600,
                            }}>保存</button>
                          </div>
                        </>
                      ) : (
                        <div style={{
                          fontSize: 14, color: "#cbd5e1", lineHeight: 1.9,
                          whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>{entry.content}</div>
                      )}
                    </div>

                    {/* Stage buttons */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      {STAGES.map(s => (
                        <button key={s.id} onClick={() => updateStage(entry.id, s.id)} style={{
                          padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                          background: entry.stage === s.id ? (s.id === "finalist" ? "#f59e0b25" : s.id === "eliminated" ? "#47556925" : `${track.color}20`) : "rgba(255,255,255,0.04)",
                          color: entry.stage === s.id ? (s.id === "finalist" ? "#f59e0b" : s.id === "eliminated" ? "#64748b" : track.color) : "#475569",
                          fontSize: 12, fontWeight: entry.stage === s.id ? 700 : 400,
                          transition: "all 0.15s",
                        }}>{s.icon} {s.label}</button>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => startEdit(entry)} style={{
                        padding: "6px 14px", borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
                        color: "#94a3b8", fontSize: 12, cursor: "pointer",
                      }}>✏️ 编辑</button>
                      <button onClick={() => { if (confirm("确定删除「" + entry.name + "」的稿件？")) deleteEntry(entry.id); }} style={{
                        padding: "6px 14px", borderRadius: 8,
                        border: "1px solid rgba(239,68,68,0.2)", background: "transparent",
                        color: "#ef4444", fontSize: 12, cursor: "pointer",
                      }}>🗑 删除</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder, textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}