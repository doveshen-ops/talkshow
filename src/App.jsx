import { useState, useEffect, useCallback } from "react";

const TRACKS = [
  { id: "junior", label: "少年组 11+", icon: "🐱", color: "#8b5cf6", bg: "#f5f3ff", border: "#c4b5fd", dark: "#5b21b6", badge: "#ede9fe" },
  { id: "senior", label: "青年组 14+", icon: "🔥", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", dark: "#9d174d", badge: "#fce7f3" },
  { id: "adult", label: "成人赛道", icon: "🎓", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd", dark: "#1e40af", badge: "#dbeafe" },
];

const STAGES = [
  { id: "submitted", label: "已报名", icon: "📝" },
  { id: "video", label: "八强·录制中", icon: "🎙️" },
  { id: "finalist", label: "决赛选手", icon: "🏆" },
  { id: "eliminated", label: "未晋级", icon: "💤" },
];

const EMPTY_FORM = { name: "", content: "", track: "junior", videoUrl: "" };
const ADMIN_PASSWORD = "admin123"; // 改成你自己的密码

export default function SubmissionDashboard() {
  const [entries, setEntries] = useState([]);
  const [activeTrack, setActiveTrack] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [expandedId, setExpandedId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const result = localStorage.getItem("roast-submissions");
        if (result) {
          setEntries(JSON.parse(result));
        }
      } catch (e) {
        console.log("No existing data");
      }
      setLoaded(true);
    })();
  }, []);

  // Save to storage
  const saveEntries = useCallback((newEntries) => {
    setEntries(newEntries);
    try {
      localStorage.setItem("roast-submissions", JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed to save:", e);
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword("");
      alert("✅ 管理员登录成功");
    } else {
      alert("❌ 密码错误");
      setAdminPassword("");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    alert("已登出管理员");
  };

  const addEntry = () => {
    if (!form.name.trim() || !form.content.trim()) {
      alert("请填写姓名和内容");
      return;
    }
    const newEntry = {
      id: Date.now(),
      ...form,
      stage: "submitted",
      createdAt: new Date().toISOString(),
    };
    saveEntries([newEntry, ...entries]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    alert("✅ 投稿成功！");
  };

  const updateStage = (id, newStage) => {
    saveEntries(entries.map(e => e.id === id ? { ...e, stage: newStage } : e));
  };

  const deleteEntry = (id) => {
    if (window.confirm("确定删除吗？")) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const startEdit = (id, content) => {
    setEditingId(id);
    setEditContent(content);
  };

  const saveEdit = (id) => {
    saveEntries(entries.map(e => e.id === id ? { ...e, content: editContent } : e));
    setEditingId(null);
    setEditContent("");
  };

  const filteredEntries = activeTrack === "all" 
    ? entries 
    : entries.filter(e => e.track === activeTrack);

  if (!loaded) return <div style={styles.loading}>加载中...</div>;

  const getTrackStyle = (trackId) => {
    const track = TRACKS.find(t => t.id === trackId);
    return track ? { backgroundColor: track.bg, borderColor: track.border } : {};
  };

  const getTrackColor = (trackId) => {
    const track = TRACKS.find(t => t.id === trackId);
    return track ? track.color : "#666";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎤 Talkshow 话题秀</h1>
        <p style={styles.subtitle}>投稿管理平台</p>
        <div style={styles.headerButtons}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {showForm ? "✕ 关闭" : "+ 新投稿"}
          </button>
          {!isAdmin ? (
            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              style={{ ...styles.button, ...styles.adminButton }}
            >
              🔐 管理员
            </button>
          ) : (
            <button
              onClick={handleAdminLogout}
              style={{ ...styles.button, ...styles.logoutButton }}
            >
              👤 退出登录
            </button>
          )}
        </div>
      </div>

      {showAdminLogin && !isAdmin && (
        <div style={styles.adminLoginContainer}>
          <h2>管理员登录</h2>
          <input
            type="password"
            placeholder="输入管理员密码"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
            style={styles.input}
            autoFocus
          />
          <div style={styles.buttonGroup}>
            <button
              onClick={handleAdminLogin}
              style={{ ...styles.button, ...styles.successButton }}
            >
              登录
            </button>
            <button
              onClick={() => {
                setShowAdminLogin(false);
                setAdminPassword("");
              }}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={styles.formContainer}>
          <h2>提交投稿</h2>
          <input
            type="text"
            placeholder="你的名字"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.input}
          />
          <textarea
            placeholder="你的投稿内容..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={styles.textarea}
          />
          <input
            type="url"
            placeholder="视频链接 (可选) - 支持 YouTube、B站、抖音等分享链接"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            style={styles.input}
          />
          <div style={styles.trackSelect}>
            <label>选择赛道：</label>
            {TRACKS.map(track => (
              <label key={track.id} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="track"
                  value={track.id}
                  checked={form.track === track.id}
                  onChange={(e) => setForm({ ...form, track: e.target.value })}
                />
                {track.icon} {track.label}
              </label>
            ))}
          </div>
          <button
            onClick={addEntry}
            style={{ ...styles.button, ...styles.successButton }}
          >
            提交投稿
          </button>
        </div>
      )}

      <div style={styles.filterContainer}>
        <button
          onClick={() => setActiveTrack("all")}
          style={{
            ...styles.filterButton,
            ...(activeTrack === "all" ? styles.filterButtonActive : {}),
          }}
        >
          全部 ({entries.length})
        </button>
        {TRACKS.map(track => (
          <button
            key={track.id}
            onClick={() => setActiveTrack(track.id)}
            style={{
              ...styles.filterButton,
              ...(activeTrack === track.id ? styles.filterButtonActive : {}),
              borderColor: track.color,
              color: activeTrack === track.id ? track.color : "#666",
            }}
          >
            {track.icon} {track.label} ({entries.filter(e => e.track === track.id).length})
          </button>
        ))}
      </div>

      <div style={styles.entriesContainer}>
        {filteredEntries.length === 0 ? (
          <p style={styles.emptyState}>还没有投稿，来提交第一个吧！</p>
        ) : (
          filteredEntries.map(entry => {
            const track = TRACKS.find(t => t.id === entry.track);
            const stage = STAGES.find(s => s.id === entry.stage);
            return (
              <div
                key={entry.id}
                style={{
                  ...styles.entryCard,
                  ...getTrackStyle(entry.track),
                }}
              >
                <div style={styles.entryHeader}>
                  <div>
                    <h3 style={{ color: getTrackColor(entry.track), margin: 0 }}>
                      {track?.icon} {entry.name}
                    </h3>
                    <p style={styles.trackBadge}>
                      {track?.label} · {stage?.icon} {stage?.label}
                    </p>
                  </div>
                  <div style={styles.actions}>
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      style={styles.iconButton}
                    >
                      {expandedId === entry.id ? "▼" : "▶"}
                    </button>
                  </div>
                </div>

                {expandedId === entry.id && (
                  <div style={styles.entryContent}>
                    {editingId === entry.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={styles.textarea}
                        />
                        <div style={styles.buttonGroup}>
                          <button
                            onClick={() => saveEdit(entry.id)}
                            style={{ ...styles.button, ...styles.successButton }}
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ ...styles.button, ...styles.cancelButton }}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={styles.contentText}>{entry.content}</p>
                        {entry.videoUrl && (
                          <div style={styles.videoContainer}>
                            <p style={styles.videoLabel}>📹 投稿视频：</p>
                            <a
                              href={entry.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.videoLink}
                            >
                              🔗 点击查看视频
                            </a>
                            <p style={styles.videoUrl}>{entry.videoUrl}</p>
                          </div>
                        )}
                      </>
                    )}

                    <div style={styles.stageButtons}>
                      {STAGES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => updateStage(entry.id, s.id)}
                          style={{
                            ...styles.stageButton,
                            ...(entry.stage === s.id ? styles.stageButtonActive : {}),
                            borderColor: getTrackColor(entry.track),
                          }}
                        >
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>

                    <div style={styles.entryActions}>
                      {editingId !== entry.id && (
                        <button
                          onClick={() => startEdit(entry.id, entry.content)}
                          style={{ ...styles.button, ...styles.infoButton }}
                        >
                          编辑
                        </button>
                      )}
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        style={{ ...styles.button, ...styles.dangerButton }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #ddd",
  },
  headerButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "15px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    color: "#666",
    fontSize: "1rem",
    marginBottom: "20px",
  },
  adminLoginContainer: {
    backgroundColor: "#fef3c7",
    border: "2px solid #fbbf24",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  formContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "1rem",
    minHeight: "100px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  trackSelect: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  primaryButton: {
    backgroundColor: "#667eea",
    color: "white",
  },
  adminButton: {
    backgroundColor: "#f59e0b",
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    color: "white",
  },
  successButton: {
    backgroundColor: "#10b981",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    color: "white",
  },
  infoButton: {
    backgroundColor: "#3b82f6",
    color: "white",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "8px 16px",
    border: "2px solid #ddd",
    borderRadius: "24px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  filterButtonActive: {
    backgroundColor: "#667eea",
    color: "white",
    borderColor: "#667eea",
  },
  entriesContainer: {
    display: "grid",
    gap: "15px",
  },
  entryCard: {
    backgroundColor: "white",
    border: "2px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackBadge: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "5px 0 0 0",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  iconButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f3f4f6",
    cursor: "pointer",
    fontSize: "1rem",
  },
  entryContent: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e5e7eb",
  },
  contentText: {
    lineHeight: "1.6",
    color: "#333",
    marginBottom: "15px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  videoContainer: {
    backgroundColor: "#f0f9ff",
    border: "2px solid #0ea5e9",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
  },
  videoLabel: {
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  videoLink: {
    display: "inline-block",
    backgroundColor: "#0ea5e9",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
    marginRight: "10px",
    transition: "background-color 0.3s",
  },
  videoUrl: {
    fontSize: "0.85rem",
    color: "#666",
    wordBreak: "break-all",
    margin: "8px 0 0 0",
  },
  stageButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  stageButton: {
    padding: "6px 12px",
    border: "2px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "all 0.3s",
  },
  stageButtonActive: {
    backgroundColor: "#dbeafe",
    fontWeight: "600",
  },
  entryActions: {
    display: "flex",
    gap: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  emptyState: {
    textAlign: "center",
    color: "#999",
    padding: "40px 20px",
    fontSize: "1.1rem",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "1.2rem",
    color: "#666",
  },
};
