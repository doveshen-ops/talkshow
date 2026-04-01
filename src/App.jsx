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
  const [barrages, setBarrages] = useState([]); // 弹幕列表
  const [barrageUsername, setBarrageUsername] = useState("");
  const [barrageContent, setBarrageContent] = useState("");
  const [entryBarrageUsername, setEntryBarrageUsername] = useState(""); // 投稿弹幕昵称
  const [entryBarrageContent, setEntryBarrageContent] = useState(""); // 投稿弹幕内容
  const [entryBarrages, setEntryBarrages] = useState({}); // { entryId: [barrages] }
  const [reactions, setReactions] = useState({}); // { entryId: { reaction: count } }
  const [checkinToday, setCheckinToday] = useState(false); // 今天是否签到
  const [userPoints, setUserPoints] = useState(0); // 用户积分
  const [userBadges, setUserBadges] = useState([]); // 用户勋章
  const [showLeaderboard, setShowLeaderboard] = useState(false); // 是否显示排行榜
  const [showAchievements, setShowAchievements] = useState(false); // 是否显示成就
  const [theme, setTheme] = useState("light"); // 当前主题
  const [showThemeMenu, setShowThemeMenu] = useState(false); // 主题菜单
  const [showPersonalityTest, setShowPersonalityTest] = useState(false); // 性格测试
  const [personalityTestAnswers, setPersonalityTestAnswers] = useState({}); // 测试答案
  const [personalityResult, setPersonalityResult] = useState(null); // 测试结果

  // 表情反应类型
  const REACTIONS = [
    { emoji: "👍", label: "赞" },
    { emoji: "❤️", label: "爱" },
    { emoji: "😂", label: "笑"  },
    { emoji: "🔥", label: "火" },
  ];

  // 勋章定义
  const BADGES = [
    { id: "first_submission", icon: "🚀", name: "首次投稿", desc: "参与投稿" },
    { id: "commentator", icon: "💬", name: "评论王", desc: "发表10条评论" },
    { id: "popular", icon: "⭐", name: "爆款投稿", desc: "获赞20+" },
    { id: "checkin_3", icon: "🔥", name: "连续签到3天", desc: "坚持打卡" },
    { id: "checkin_7", icon: "⚡", name: "连续签到7天", desc: "签到达人" },
    { id: "reacter", icon: "👍", name: "点赞小能手", desc: "点赞30次" },
    { id: "social_butterfly", icon: "🦋", name: "社交达人", desc: "多种互动" },
  ];

  // 主题配置
  const THEMES = {
    light: { name: "☀️ 亮色", bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 100%)" },
    dark: { name: "🌙 暗黑", bgColor: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
    rainbow: { name: "🌈 彩虹", bgColor: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)" },
    cute: { name: "💕 可爱", bgColor: "linear-gradient(135deg, #ffc0cb 0%, #ffd4e5 25%, #ffb3d9 50%, #ff99cc 75%, #ff85c1 100%)" },
    cyberpunk: { name: "🤖 赛博", bgColor: "linear-gradient(135deg, #0a0e27 0%, #1a1a3e 30%, #00ff88 50%, #00d4ff 100%)" },
    funny: { name: "😂 搞笑", bgColor: "linear-gradient(90deg, #ff6b6b, #ff8c42, #ffd93d, #a8e6cf, #6bcf7f, #4d96ff, #c78bff, #ff6b9d)" },
  };

  // 性格测试问卷
  const PERSONALITY_TEST = [
    {
      question: "你朋友的笑话很冷，你会？",
      answers: [
        { text: "😂 哈哈大笑假笑", type: "actor" },
        { text: "😐 面无表情听着", type: "roaster" },
        { text: "💭 停顿后慢慢笑", type: "thinker" },
        { text: "📱 转发给群里", type: "meme" },
      ],
    },
    {
      question: "吐槽你最擅长什么？",
      answers: [
        { text: "表情包和语气", type: "meme" },
        { text: "段子和包袱", type: "thinker" },
        { text: "冷笑话和反转", type: "roaster" },
        { text: "夸张表演", type: "actor" },
      ],
    },
    {
      question: "看到尴尬的事你会？",
      answers: [
        { text: "大声吐槽", type: "roaster" },
        { text: "沉默观察", type: "thinker" },
        { text: "装作没看见", type: "meme" },
        { text: "表演出来", type: "actor" },
      ],
    },
    {
      question: "你的吐槽风格是？",
      answers: [
        { text: "温和幽默", type: "actor" },
        { text: "犀利直接", type: "roaster" },
        { text: "内涵深沉", type: "thinker" },
        { text: "搞怪逗笑", type: "meme" },
      ],
    },
    {
      question: "在聚会上，你通常是？",
      answers: [
        { text: "安静观察的人", type: "thinker" },
        { text: "搞笑活跃的人", type: "meme" },
        { text: "表情丰富的人", type: "actor" },
        { text: "嘴毒逗乐的人", type: "roaster" },
      ],
    },
    {
      question: "别人犯了错误，你会？",
      answers: [
        { text: "模仿他的样子", type: "actor" },
        { text: "尖刻地指出", type: "roaster" },
        { text: "深思他为什么", type: "thinker" },
        { text: "制造成表情包", type: "meme" },
      ],
    },
    {
      question: "你认为最有趣的事是？",
      answers: [
        { text: "精妙的反转和逻辑", type: "thinker" },
        { text: "夸张搞笑的表演", type: "actor" },
        { text: "一针见血的吐槽", type: "roaster" },
        { text: "新奇的网络热梗", type: "meme" },
      ],
    },
    {
      question: "当气氛冷场时，你会？",
      answers: [
        { text: "用肢体语言活跃", type: "actor" },
        { text: "讲个冷笑话", type: "roaster" },
        { text: "分享一个有意义的话题", type: "thinker" },
        { text: "发送表情包或梗图", type: "meme" },
      ],
    },
  ];

  // 性格测试结果
  const PERSONALITY_RESULTS = {
    roaster: {
      emoji: "🔥",
      name: "段子手型",
      description: "你是天生的吐槽大王！言语犀利，永远有笑点，能把再无聊的事讲得超有趣。",
      strengths: ["言语犀利", "观察敏锐", "临场反应快"],
    },
    actor: {
      emoji: "🎭",
      name: "表演家型",
      description: "你是肢体语言大师！表情丰富，能用夸张动作把冷笑话演成爆笑段子。",
      strengths: ["表现力强", "节奏感好", "现场感十足"],
    },
    thinker: {
      emoji: "💭",
      name: "思想家型",
      description: "你是思想家型吐槽手！逻辑清晰，段子精妙，每一句都能让人细品。",
      strengths: ["逻辑严密", "内涵丰富", "观点独特"],
    },
    meme: {
      emoji: "📱",
      name: "段子精型",
      description: "你是网络段子精！掌握最新梗，能快速调动观众情绪，是带动氛围的高手。",
      strengths: ["紧跟潮流", "反应迅速", "交互力强"],
    },
  };

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const result = localStorage.getItem("roast-submissions");
        if (result) {
          setEntries(JSON.parse(result));
        }
        // 加载弹幕
        const barragData = localStorage.getItem("video-barrages");
        if (barragData) {
          setBarrages(JSON.parse(barragData));
        }
        // 加载投稿弹幕
        const entryBarragesData = localStorage.getItem("entry-barrages");
        if (entryBarragesData) {
          setEntryBarrages(JSON.parse(entryBarragesData));
        }
        // 加载表情反应
        const reactionsData = localStorage.getItem("entry-reactions");
        if (reactionsData) {
          setReactions(JSON.parse(reactionsData));
        }
        // 加载用户数据
        const userData = localStorage.getItem("user-data");
        if (userData) {
          const data = JSON.parse(userData);
          setUserPoints(data.points || 0);
          setUserBadges(data.badges || []);
          setCheckinToday(data.lastCheckinDate === new Date().toDateString());
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

  // 发送弹幕
  const sendBarrage = () => {
    if (!barrageUsername.trim() || !barrageContent.trim()) {
      alert("请填写昵称和弹幕内容");
      return;
    }

    const newBarrage = {
      id: Date.now(),
      username: barrageUsername,
      content: barrageContent,
      color: getRandomColor(),
      timestamp: new Date().toISOString(),
    };

    const updatedBarrages = [newBarrage, ...barrages].slice(0, 100); // 只保存最新100条
    setBarrages(updatedBarrages);
    
    try {
      localStorage.setItem("video-barrages", JSON.stringify(updatedBarrages));
    } catch (e) {
      console.error("Failed to save barrage:", e);
    }

    setBarrageUsername("");
    setBarrageContent("");
    alert("🎉 弹幕已发送！");
  };

  // 添加表情反应
  const addReaction = (entryId, reactionEmoji) => {
    const newReactions = { ...reactions };
    if (!newReactions[entryId]) {
      newReactions[entryId] = {};
    }
    newReactions[entryId][reactionEmoji] = (newReactions[entryId][reactionEmoji] || 0) + 1;
    setReactions(newReactions);

    try {
      localStorage.setItem("entry-reactions", JSON.stringify(newReactions));
    } catch (e) {
      console.error("Failed to save reaction:", e);
    }

    // 增加积分
    const newPoints = userPoints + 1;
    setUserPoints(newPoints);
    updateUserData({ points: newPoints });
  };

  // 签到
  const handleCheckin = () => {
    if (checkinToday) {
      alert("今天已经签到过了！");
      return;
    }

    const newPoints = userPoints + 10;
    setUserPoints(newPoints);
    setCheckinToday(true);

    // 检查连续签到勋章
    checkBadges(newPoints, entryBarrages);

    updateUserData({
      points: newPoints,
      badges: userBadges,
      lastCheckinDate: new Date().toDateString(),
    });

    alert("🎉 签到成功！+10 积分");
  };

  // 更新用户数据保存
  const updateUserData = (data) => {
    try {
      const userData = {
        points: data.points || userPoints,
        badges: data.badges || userBadges,
        lastCheckinDate: data.lastCheckinDate || new Date().toDateString(),
      };
      localStorage.setItem("user-data", JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save user data:", e);
    }
  };

  // 检查并解锁勋章
  const checkBadges = (points, barragesData) => {
    const newBadges = [...userBadges];
    const entries = entries;

    // 检查首次投稿
    if (entries.length > 0 && !userBadges.includes("first_submission")) {
      newBadges.push("first_submission");
      alert("🚀 解锁勋章：首次投稿");
    }

    // 检查评论数量
    const totalComments = Object.values(barragesData).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
    if (totalComments >= 10 && !userBadges.includes("commentator")) {
      newBadges.push("commentator");
      alert("💬 解锁勋章：评论王");
    }

    // 检查点赞数量
    const totalReactions = Object.values(reactions).reduce((sum, obj) => {
      return sum + Object.values(obj).reduce((s, c) => s + c, 0);
    }, 0);
    if (totalReactions >= 30 && !userBadges.includes("reacter")) {
      newBadges.push("reacter");
      alert("👍 解锁勋章：点赞小能手");
    }

    setUserBadges(newBadges);
    return newBadges;
  };

  // 切换主题
  const switchTheme = (themeName) => {
    setTheme(themeName);
    setShowThemeMenu(false);
    try {
      localStorage.setItem("user-theme", themeName);
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  // 提交性格测试
  const submitPersonalityTest = () => {
    const answers = Object.values(personalityTestAnswers);
    if (answers.length < PERSONALITY_TEST.length) {
      alert("请答完所有问题！");
      return;
    }

    // 计算最多的性格类型
    const typeCount = {};
    answers.forEach((type) => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const resultType = Object.keys(typeCount).reduce((a, b) =>
      typeCount[a] > typeCount[b] ? a : b
    );

    setPersonalityResult(resultType);
    try {
      localStorage.setItem("user-personality", resultType);
    } catch (e) {
      console.error("Failed to save personality:", e);
    }
  };

  // 加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem("user-theme") || "light";
    setTheme(savedTheme);
  }, []);
  const sendEntryBarrage = (entryId) => {
    if (!entryBarrageUsername.trim() || !entryBarrageContent.trim()) {
      alert("请填写昵称和评论内容");
      return;
    }

    const newBarrage = {
      id: Date.now(),
      username: entryBarrageUsername,
      content: entryBarrageContent,
      color: getRandomColor(),
      timestamp: new Date().toISOString(),
    };

    const currentBarrages = entryBarrages[entryId] || [];
    const updatedEntryBarrages = {
      ...entryBarrages,
      [entryId]: [newBarrage, ...currentBarrages].slice(0, 50), // 每个投稿最多50条
    };

    setEntryBarrages(updatedEntryBarrages);
    
    try {
      localStorage.setItem("entry-barrages", JSON.stringify(updatedEntryBarrages));
    } catch (e) {
      console.error("Failed to save entry barrage:", e);
    }

    setEntryBarrageUsername("");
    setEntryBarrageContent("");
    alert("✅ 评论已发送！");
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
    <div style={{ ...styles.container, background: THEMES[theme].bgColor }}>
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
          <button
            onClick={handleCheckin}
            style={{ ...styles.button, ...styles.checkinButton }}
            disabled={checkinToday}
          >
            {checkinToday ? "✓ 已签到" : "📅 签到"} (+10分)
          </button>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            style={{ ...styles.button, ...styles.leaderboardButton }}
          >
            🏆 排行榜
          </button>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            style={{ ...styles.button, ...styles.achievementButton }}
          >
            🏅 成就 ({userBadges.length})
          </button>
          <button
            onClick={() => setShowPersonalityTest(true)}
            style={{ ...styles.button, ...styles.personalityButton }}
          >
            🎭 测试
          </button>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            style={{ ...styles.button, ...styles.themeButton }}
          >
            🎨 主题
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
              👤 退出
            </button>
          )}
        </div>

        {/* 用户积分面板 */}
        <div style={styles.userPanel}>
          <div style={styles.pointsCard}>
            💎 我的积分: <strong>{userPoints}</strong>
          </div>
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

      {/* 排行榜面板 */}
      {showLeaderboard && (
        <div style={styles.leaderboardPanel}>
          <h3 style={styles.panelTitle}>🏆 排行榜</h3>
          <h4 style={styles.tabTitle}>⭐ 最受欢迎投稿</h4>
          {filteredEntries.length === 0 ? (
            <p style={styles.noData}>还没有投稿</p>
          ) : (
            entries
              .sort((a, b) => {
                const aReactions = Object.values(reactions[a.id] || {}).reduce((s, c) => s + c, 0);
                const bReactions = Object.values(reactions[b.id] || {}).reduce((s, c) => s + c, 0);
                return bReactions - aReactions;
              })
              .slice(0, 5)
              .map((entry, idx) => {
                const total = Object.values(reactions[entry.id] || {}).reduce((s, c) => s + c, 0);
                return (
                  <div key={entry.id} style={styles.leaderboardItem}>
                    <span style={styles.rank}>{idx + 1}.</span>
                    <span>{entry.name}</span>
                    <span style={styles.badge}>👍 {total}</span>
                  </div>
                );
              })
          )}
          <button
            onClick={() => setShowLeaderboard(false)}
            style={{ ...styles.button, ...styles.cancelButton, marginTop: "15px" }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 成就面板 */}
      {showAchievements && (
        <div style={styles.achievementPanel}>
          <h3 style={styles.panelTitle}>🏅 我的成就</h3>
          <div style={styles.badgeGrid}>
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                style={{
                  ...styles.badgeCard,
                  ...(userBadges.includes(badge.id)
                    ? styles.badgeCardUnlocked
                    : styles.badgeCardLocked),
                }}
              >
                <div style={styles.badgeIcon}>{badge.icon}</div>
                <div style={styles.badgeName}>{badge.name}</div>
                <div style={styles.badgeDesc}>{badge.desc}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAchievements(false)}
            style={{ ...styles.button, ...styles.cancelButton, marginTop: "15px" }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 主题菜单 */}
      {showThemeMenu && (
        <div style={styles.themePanel}>
          <h3 style={styles.panelTitle}>🎨 选择主题</h3>
          <div style={styles.themeGrid}>
            <button
              onClick={() => {
                switchTheme("light");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "light" ? styles.themeOptionActive : {}) }}
            >
              ☀️ 亮色
            </button>
            <button
              onClick={() => {
                switchTheme("dark");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "dark" ? styles.themeOptionActive : {}) }}
            >
              🌙 暗黑
            </button>
            <button
              onClick={() => {
                switchTheme("rainbow");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "rainbow" ? styles.themeOptionActive : {}) }}
            >
              🌈 彩虹
            </button>
            <button
              onClick={() => {
                switchTheme("cute");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "cute" ? styles.themeOptionActive : {}) }}
            >
              💕 可爱
            </button>
            <button
              onClick={() => {
                switchTheme("cyberpunk");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "cyberpunk" ? styles.themeOptionActive : {}) }}
            >
              🤖 赛博
            </button>
            <button
              onClick={() => {
                switchTheme("funny");
                setShowThemeMenu(false);
              }}
              style={{ ...styles.button, ...styles.themeOptionButton, ...(theme === "funny" ? styles.themeOptionActive : {}) }}
            >
              😂 搞笑
            </button>
          </div>
          <button
            onClick={() => setShowThemeMenu(false)}
            style={{ ...styles.button, ...styles.cancelButton, marginTop: "15px" }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 性格测试模态框 */}
      {showPersonalityTest && (
        <div style={styles.personalityTestPanel}>
          <h3 style={styles.panelTitle}>🎭 吐槽者性格测试</h3>
          <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
            {personalityResult ? "你的吐槽类型是：" : "了解你的吐槽风格"}
          </p>
          
          {!personalityResult ? (
            <div style={styles.questionContainer}>
              {PERSONALITY_TEST.map((q, idx) => (
                <div key={idx} style={styles.questionBlock}>
                  <h4 style={{ marginBottom: "12px", color: "#333" }}>
                    {idx + 1}. {q.question}
                  </h4>
                  <div style={styles.answerGrid}>
                    {q.answers.map((answer, ansIdx) => (
                      <button
                        key={ansIdx}
                        onClick={() => {
                          const newAnswers = { ...personalityTestAnswers };
                          newAnswers[idx] = answer.type;
                          setPersonalityTestAnswers(newAnswers);
                        }}
                        style={{
                          ...styles.button,
                          ...styles.answerButton,
                          ...(personalityTestAnswers[idx] === answer.type
                            ? { backgroundColor: "#FF6B6B", color: "white" }
                            : {}),
                        }}
                      >
                        {answer.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  if (Object.keys(personalityTestAnswers).length === PERSONALITY_TEST.length) {
                    submitPersonalityTest();
                  } else {
                    alert("请回答所有问题！");
                  }
                }}
                style={{ ...styles.button, ...styles.submitButton, width: "100%", marginTop: "20px" }}
              >
                提交答案
              </button>
            </div>
          ) : (
            <div style={styles.resultContainer}>
              <div style={styles.resultCard}>
                <div style={styles.resultEmoji}>{PERSONALITY_RESULTS[personalityResult].emoji}</div>
                <h2 style={{ color: "#333", marginBottom: "10px" }}>
                  {PERSONALITY_RESULTS[personalityResult].name}
                </h2>
                <p style={{ color: "#666", marginBottom: "15px", fontSize: "14px" }}>
                  {PERSONALITY_RESULTS[personalityResult].description}
                </p>
                <div style={styles.strengthsList}>
                  <strong>特点：</strong>
                  <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
                    {PERSONALITY_RESULTS[personalityResult].strengths.map((s, i) => (
                      <li key={i} style={{ fontSize: "14px", marginBottom: "5px" }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowPersonalityTest(false);
              setPersonalityResult(null);
              setPersonalityTestAnswers({});
            }}
            style={{ ...styles.button, ...styles.cancelButton, marginTop: "15px", width: "100%" }}
          >
            {personalityResult ? "完成" : "取消"}
          </button>
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

            {/* 弹幕区域 */}
            <div style={styles.barrageSection}>
              <h3 style={styles.barrageTitle}>💬 实时弹幕 ({barrages.length})</h3>
              
              {/* 弹幕显示区域 */}
              <div style={styles.barrageContainer}>
                {barrages.length === 0 ? (
                  <p style={styles.noBarrage}>还没有弹幕，来发第一条吧！</p>
                ) : (
                  <div style={styles.barrageList}>
                    {barrages.slice(0, 15).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          ...styles.barrageItem,
                          animation: `barrageScroll 6s linear forwards`,
                        }}
                      >
                        <span style={{ color: b.color, fontWeight: "700" }}>
                          {b.username}:
                        </span>{" "}
                        <span style={{ color: b.color }}>{b.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 发送弹幕 */}
              <div style={styles.barrageSendBox}>
                <input
                  type="text"
                  placeholder="昵称"
                  value={barrageUsername}
                  onChange={(e) => setBarrageUsername(e.target.value)}
                  style={styles.barrageInput}
                  maxLength="20"
                />
                <input
                  type="text"
                  placeholder="发送弹幕..."
                  value={barrageContent}
                  onChange={(e) => setBarrageContent(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendBarrage()}
                  style={{ ...styles.barrageInput, flex: 1 }}
                  maxLength="50"
                />
                <button
                  onClick={sendBarrage}
                  style={{ ...styles.button, ...styles.barrageButton }}
                >
                  发送
                </button>
              </div>
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

                {/* 快速反应行 */}
                <div style={styles.quickReactionsBar}>
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => addReaction(entry.id, reaction.emoji)}
                      style={styles.reactionButton}
                      title={reaction.label}
                    >
                      {reaction.emoji}{" "}
                      {reactions[entry.id]?.[reaction.emoji] || 0}
                    </button>
                  ))}
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

                    {/* 投稿弹幕区域 */}
                    <div style={styles.entryBarrageSection}>
                      <h4 style={styles.entryBarrageTitle}>💬 评论 ({(entryBarrages[entry.id] || []).length})</h4>
                      
                      {/* 弹幕显示 */}
                      <div style={styles.entryBarrageList}>
                        {(entryBarrages[entry.id] || []).length === 0 ? (
                          <p style={styles.noEntryBarrage}>还没有评论，来评论第一个吧！</p>
                        ) : (
                          (entryBarrages[entry.id] || []).slice(0, 8).map((b) => (
                            <div key={b.id} style={styles.entryBarrageItem}>
                              <span style={{ color: b.color, fontWeight: "700" }}>
                                {b.username}:
                              </span>{" "}
                              <span style={{ color: b.color }}>{b.content}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* 发送评论 */}
                      <div style={styles.entryBarrageSendBox}>
                        <input
                          type="text"
                          placeholder="昵称"
                          value={entryBarrageUsername}
                          onChange={(e) => setEntryBarrageUsername(e.target.value)}
                          style={styles.barrageSendInput}
                          maxLength="20"
                        />
                        <input
                          type="text"
                          placeholder="发表评论..."
                          value={entryBarrageContent}
                          onChange={(e) => setEntryBarrageContent(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendEntryBarrage(entry.id)}
                          style={{ ...styles.barrageSendInput, flex: 1 }}
                          maxLength="60"
                        />
                        <button
                          onClick={() => sendEntryBarrage(entry.id)}
                          style={{ ...styles.button, ...styles.barrageButton, padding: "8px 16px" }}
                        >
                          发送
                        </button>
                      </div>
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
  barrageSection: {
    marginTop: "25px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "2px solid #e2e8f0",
  },
  barrageTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "15px",
  },
  barrageContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    height: "180px",
    overflow: "hidden",
    border: "2px solid #e5e7eb",
    marginBottom: "15px",
    position: "relative",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(240, 147, 251, 0.03) 100%)",
  },
  noBarrage: {
    textAlign: "center",
    color: "#999",
    padding: "70px 20px",
    fontSize: "1rem",
  },
  barrageList: {
    padding: "15px 0",
  },
  barrageItem: {
    padding: "8px 20px",
    fontSize: "0.95rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
    marginBottom: "5px",
  },
  barrageSendBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  barrageInput: {
    padding: "10px 15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    transition: "all 0.3s",
  },
  barrageButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "10px 20px",
    minWidth: "80px",
  },
  entryBarrageSection: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "2px solid #f0f0f0",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "15px",
  },
  entryBarrageTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "12px",
  },
  entryBarrageList: {
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "12px",
    border: "1px solid #e5e7eb",
    maxHeight: "150px",
    overflowY: "auto",
  },
  noEntryBarrage: {
    color: "#999",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "20px 10px",
  },
  entryBarrageItem: {
    padding: "6px 0",
    fontSize: "0.85rem",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  entryBarrageSendBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  barrageSendInput: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    transition: "all 0.3s",
    boxSizing: "border-box",
  },
  checkinButton: {
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    color: "white",
  },
  leaderboardButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
  },
  achievementButton: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    color: "white",
  },
  userPanel: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    margin: "15px 0",
    flexWrap: "wrap",
  },
  pointsCard: {
    backgroundColor: "#fff7ed",
    border: "3px solid #fb923c",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#c2410c",
  },
  quickReactionsBar: {
    display: "flex",
    gap: "8px",
    padding: "12px 0",
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
    flexWrap: "wrap",
  },
  reactionButton: {
    padding: "8px 12px",
    border: "2px solid #e5e7eb",
    borderRadius: "20px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  leaderboardPanel: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    border: "2px solid #f59e0b",
  },
  panelTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#f59e0b",
    marginBottom: "15px",
  },
  tabTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "12px",
  },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    marginBottom: "8px",
    gap: "15px",
  },
  rank: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f59e0b",
    minWidth: "30px",
  },
  badge: {
    marginLeft: "auto",
    fontWeight: "700",
    color: "#ec4899",
  },
  noData: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
  },
  achievementPanel: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    border: "2px solid #8b5cf6",
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "15px",
  },
  badgeCard: {
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    border: "2px solid #e5e7eb",
    transition: "all 0.3s",
  },
  badgeCardUnlocked: {
    backgroundColor: "#f0f9ff",
    borderColor: "#8b5cf6",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
  },
  badgeCardLocked: {
    backgroundColor: "#f3f4f6",
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: "2.5rem",
    marginBottom: "8px",
  },
  badgeName: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "4px",
  },
  badgeDesc: {
    fontSize: "0.75rem",
    color: "#666",
  },
  themePanel: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    border: "2px solid #10b981",
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "15px",
  },
  themeOptionButton: {
    padding: "12px 16px",
    fontSize: "0.95rem",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    backgroundColor: "#f3f4f6",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  themeOptionActive: {
    backgroundColor: "#10b981",
    color: "white",
    borderColor: "#10b981",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  personalityTestPanel: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    border: "2px solid #f59e0b",
  },
  questionContainer: {
    marginBottom: "15px",
  },
  questionBlock: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fffbf0",
    borderRadius: "10px",
    border: "1px solid #fed7aa",
  },
  answerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "8px",
  },
  answerButton: {
    padding: "10px 12px",
    fontSize: "0.9rem",
    backgroundColor: "#f3f4f6",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitButton: {
    padding: "12px 20px",
    fontSize: "0.95rem",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  resultContainer: {
    marginBottom: "15px",
  },
  resultCard: {
    padding: "20px",
    backgroundColor: "#fef3c7",
    borderRadius: "10px",
    border: "2px solid #fcd34d",
    textAlign: "center",
  },
  resultEmoji: {
    fontSize: "4rem",
    marginBottom: "15px",
  },
  strengthsList: {
    textAlign: "left",
    color: "#333",
    fontSize: "0.9rem",
  },
};
