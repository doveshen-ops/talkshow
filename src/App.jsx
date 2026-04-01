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
const YOUTUBE_LATEST_VIDEO = "iocJc342Q8s"; // 最新视频
const YOUTUBE_PLAYLIST_ID = "PL8VQpb2MVdhHKgyvQfWnsXDqlJ7oHNpIO"; // 吐槽大会播放列表

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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoType, setSelectedVideoType] = useState("latest"); // "latest" 或 "playlist"

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

      {/* YouTube 视频入口 */}
      <div style={styles.youtubeSection}>
        <div style={styles.youtubeCard}>
          <div style={styles.youtubeBadge}>🎬 官方视频</div>
          <h2 style={styles.youtubeTitle}>吐槽大会</h2>
          <p style={styles.youtubeDescription}>观看精彩吐槽视频，获得灵感</p>
          <div style={styles.youtubeButtonGroup}>
            <button
              onClick={() => {
                setSelectedVideoType("latest");
                setShowVideoModal(true);
              }}
              style={{ ...styles.button, ...styles.youtubeButton }}
            >
              ▶️ 最新视频
            </button>
            <button
              onClick={() => {
                setSelectedVideoType("playlist");
                setShowVideoModal(true);
              }}
              style={{ ...styles.button, ...styles.youtubePlaylistButton }}
            >
              📺 全套视频
            </button>
          </div>
        </div>
      </div>

      {/* YouTube 视频播放模态框 */}
      {showVideoModal && (
        <div style={styles.modalOverlay} onClick={() => setShowVideoModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
            <div style={styles.videoTypeSelector}>
              <button
                onClick={() => setSelectedVideoType("latest")}
                style={{
                  ...styles.videoTypeButton,
                  ...(selectedVideoType === "latest" ? styles.videoTypeButtonActive : {}),
                }}
              >
                ▶️ 最新视频
              </button>
              <button
                onClick={() => setSelectedVideoType("playlist")}
                style={{
                  ...styles.videoTypeButton,
                  ...(selectedVideoType === "playlist" ? styles.videoTypeButtonActive : {}),
                }}
              >
                📺 全套视频
              </button>
            </div>
            <div style={styles.youtubePlayer}>
              {selectedVideoType === "latest" ? (
                <iframe
                  width="100%"
                  height="500"
                  src={`https://www.youtube.com/embed/${YOUTUBE_LATEST_VIDEO}`}
                  title="吐槽大会 - 最新视频"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "12px" }}
                ></iframe>
              ) : (
                <iframe
                  width="100%"
                  height="500"
                  src={`https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}`}
                  title="吐槽大会 - 全套视频"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "12px" }}
                ></iframe>
              )}
            </div>
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
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 100%)",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    paddingBottom: "30px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "8px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-1px",
  },
  subtitle: {
    background: "linear-gradient(135deg, #764ba2 0%, #f093fb 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  adminLoginContainer: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)",
    border: "3px solid #f59e0b",
    padding: "25px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.2)",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.15)",
    backdropFilter: "blur(10px)",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "all 0.3s",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "1rem",
    minHeight: "120px",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s",
    boxSizing: "border-box",
  },
  trackSelect: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "700",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  adminButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)",
    color: "white",
  },
  logoutButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
  },
  successButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
  dangerButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
  },
  infoButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
  },
  filterContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    flexWrap: "wrap",
    padding: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "14px",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.1)",
    backdropFilter: "blur(10px)",
  },
  filterButton: {
    padding: "10px 20px",
    border: "2px solid #e5e7eb",
    borderRadius: "20px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  filterButtonActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderColor: "transparent",
    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
  },
  entriesContainer: {
    display: "grid",
    gap: "18px",
  },
  entryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    border: "3px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(10px)",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },
  trackBadge: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#666",
    marginTop: "8px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  iconButton: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    cursor: "pointer",
    fontSize: "1.2rem",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  entryContent: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "2px solid #f0f0f0",
  },
  contentText: {
    lineHeight: "1.8",
    color: "#2d3748",
    marginBottom: "18px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "1.05rem",
  },
  videoContainer: {
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "3px solid #0ea5e9",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "18px",
    boxShadow: "0 4px 12px rgba(15, 165, 233, 0.1)",
  },
  videoLabel: {
    fontWeight: "700",
    background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "10px",
    fontSize: "1.05rem",
    margin: "0 0 10px 0",
  },
  videoLink: {
    display: "inline-block",
    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    color: "white",
    padding: "10px 18px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "700",
    marginRight: "10px",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(15, 165, 233, 0.3)",
  },
  videoUrl: {
    fontSize: "0.9rem",
    color: "#0369a1",
    wordBreak: "break-all",
    margin: "10px 0 0 0",
    fontFamily: "monospace",
  },
  stageButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  stageButton: {
    padding: "8px 14px",
    border: "2px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  stageButtonActive: {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    fontWeight: "700",
    borderColor: "#3b82f6",
  },
  entryActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "15px",
    flexWrap: "wrap",
  },
  emptyState: {
    textAlign: "center",
    color: "#ffffff",
    padding: "60px 30px",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    padding: "60px 30px",
    fontSize: "1.3rem",
    color: "#ffffff",
    fontWeight: "600",
  },
  youtubeSection: {
    marginBottom: "25px",
    marginTop: "25px",
  },
  youtubeCard: {
    background: "linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.02) 100%)",
    border: "3px solid #ef4444",
    borderRadius: "16px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(239, 68, 68, 0.15)",
    backdropFilter: "blur(10px)",
  },
  youtubeBadge: {
    display: "inline-block",
    backgroundColor: "#ef4444",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "700",
    marginBottom: "12px",
  },
  youtubeTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ef4444",
    marginBottom: "8px",
  },
  youtubeDescription: {
    fontSize: "1.05rem",
    color: "#666",
    marginBottom: "20px",
    fontWeight: "500",
  },
  youtubeButtonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  youtubeButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    padding: "14px 28px",
  },
  youtubePlaylistButton: {
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    color: "white",
    padding: "14px 28px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    padding: "30px",
    maxWidth: "90%",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
    cursor: "pointer",
    fontSize: "1.5rem",
    transition: "all 0.3s",
    zIndex: 1001,
  },
  videoTypeSelector: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  videoTypeButton: {
    padding: "10px 20px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  videoTypeButtonActive: {
    backgroundColor: "#ef4444",
    color: "white",
    borderColor: "#ef4444",
  },
  youtubePlayer: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "12px",
    overflow: "hidden",
  },
};
