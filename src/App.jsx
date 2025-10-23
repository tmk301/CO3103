import React, { useState, useEffect } from "react";
import "./App.css";
import {
  FiBell,
  FiInbox,
  FiMail,
  FiTrash2,
  FiFilter,
  FiSettings,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiMenu,
  FiLogOut, // <-- THÊM ICON MỚI
} from "react-icons/fi";

// Dữ liệu người dùng giả (có thể thay đổi được)
let fakeUser = { 
  name: "User",
  email: "user@gmail.com", 
  password: "123456" 
};

function App() {
  // State điều hướng
  const [page, setPage] = useState("login"); // login | register | forgot | dashboard
  const [activeView, setActiveView] = useState("inbox"); // inbox | all | junk | filters | settings

  // State xác thực
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  // State Dashboard
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State cho trang Settings
  const [profileName, setProfileName] = useState(fakeUser.name);
  const [profileEmail, setProfileEmail] = useState(fakeUser.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");

  // --- HÀM XÁC THỰC & ĐIỀU HƯỚNG ---

  const clearAuthForms = () => {
    setEmail("");
    setPassword("");
    setConfirm("");
    setMessage("");
  };

  const clearSettingsForms = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNew("");
    setSettingsMessage("");
  };

  // Xử lý đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === fakeUser.email && password === fakeUser.password) {
      setMessage("✅ Đăng nhập thành công!");
      setTimeout(() => {
        setPage("dashboard");
        setActiveView("inbox"); // Luôn về inbox khi đăng nhập
        setMessage("");
      }, 800);
    } else {
      setMessage("❌ Email hoặc mật khẩu không chính xác.");
    }
  };

  // Xử lý đăng ký
  const handleRegister = (e) => {
    e.preventDefault();
    // ... (logic đăng ký giữ nguyên) ...
    if (!email || !password || !confirm) {
      setMessage("⚠️ Vui lòng điền tất cả các trường."); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("⚠️ Định dạng email không hợp lệ."); return;
    }
    if (password.length < 6) {
      setMessage("⚠️ Mật khẩu phải có ít nhất 6 ký tự."); return;
    }
    if (password !== confirm) {
      setMessage("⚠️ Mật khẩu không khớp."); return;
    }
    setMessage("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
    // Lưu ý: Đăng ký này chỉ là giả, không thực sự tạo user mới
    setTimeout(() => {
      setPage("login");
      clearAuthForms();
    }, 1500);
  };

  // Xử lý quên mật khẩu
  const handleForgot = (e) => {
    e.preventDefault();
    // ... (logic quên mật khẩu giữ nguyên) ...
    if (!email) {
      setMessage("Vui lòng nhập email của bạn."); return;
    }
    setMessage(`📧 Liên kết đặt lại mật khẩu đã được gửi đến ${email}`);
    setTimeout(() => {
      setPage("login");
      clearAuthForms();
    }, 1500);
  };

  // XỬ LÝ ĐĂNG XUẤT (MỚI)
  const handleLogout = () => {
    // Reset tất cả state về mặc định
    clearAuthForms();
    clearSettingsForms();
    setNotifications([]);
    setLoading(true);
    setProfileName(fakeUser.name); // Reset về tên ban đầu
    setProfileEmail(fakeUser.email); // Reset về email ban đầu
    
    // Chuyển về trang đăng nhập
    setPage("login");
  };

  // --- TẢI DỮ LIỆU ---

  // Tải dữ liệu thông báo (giả) khi vào dashboard
  useEffect(() => {
    // Chỉ tải khi ở dashboard và xem inbox
    if (page !== "dashboard" || activeView !== "inbox") {
      setLoading(true); // Đặt lại loading khi rời trang
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setNotifications([
        {
          id: 1, title: "Meeting Reminder", source: "calendar@google.com",
          content: "Your team meeting starts in 30 minutes. Join via Google Meet.",
          time: "10:30 AM", priority: true, read: false,
        },
        {
          id: 2, title: "New Message from John", source: "john.doe@example.com",
          content: "Hey, just checking in about the project proposal.",
          time: "9:45 AM", priority: false, read: true,
        },
        {
          id: 3, title: "New Facebook Message", source: "Sarah Johnson",
          content: "Are we still on for dinner this Friday?",
          time: "Yesterday", priority: false, read: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [page, activeView]); // Chạy lại khi 'page' hoặc 'activeView' thay đổi

  // Chuyển đổi trạng thái ưu tiên
  const togglePriority = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, priority: !n.priority } : n))
    );
  };


  // --- COMPONENT CON CHO CÁC VIEW ---

  // Component cho trang Account Settings (MỚI)
  const AccountSettingsPage = () => {
    
    const handleUpdateProfile = (e) => {
      e.preventDefault();
      fakeUser.name = profileName;
      fakeUser.email = profileEmail;
      setSettingsMessage("✅ Cập nhật thông tin thành công!");
      setTimeout(() => setSettingsMessage(""), 2000);
    };

    const handleChangePassword = (e) => {
      e.preventDefault();
      setSettingsMessage("");

      if (!oldPassword || !newPassword || !confirmNew) {
        setSettingsMessage("⚠️ Vui lòng điền tất cả các trường."); return;
      }
      if (oldPassword !== fakeUser.password) {
        setSettingsMessage("❌ Mật khẩu cũ không chính xác."); return;
      }
      if (newPassword.length < 6) {
        setSettingsMessage("⚠️ Mật khẩu mới phải có ít nhất 6 ký tự."); return;
      }
      if (newPassword !== confirmNew) {
        setSettingsMessage("⚠️ Mật khẩu mới không khớp."); return;
      }

      // Thành công
      fakeUser.password = newPassword; // Cập nhật mật khẩu (giả)
      setSettingsMessage("✅ Cập nhật mật khẩu thành công!");
      clearSettingsForms();
    };

    return (
      <section className="dashboard settings-page">
        <div className="dashboard-header">
          <h1>Account Settings</h1>
        </div>

        <div className="settings-container">
          {/* Card 1: Profile */}
          <div className="setting-card">
            <h2>Thông tin cá nhân</h2>
            <form onSubmit={handleUpdateProfile} className="login-form">
              <label>Tên hiển thị</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <label>Email</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
              <button type="submit" className="signin-btn">Cập nhật thông tin</button>
            </form>
          </div>

          {/* Card 2: Password */}
          <div className="setting-card">
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="login-form">
              <label>Mật khẩu cũ</label>
              <input type="password" placeholder="••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <label>Mật khẩu mới</label>
              <input type="password" placeholder="••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <label>Xác nhận mật khẩu mới</label>
              <input type="password" placeholder="••••••" value={confirmNew} onChange={(e) => setConfirmNew(e.target.value)} />
              <button type="submit" className="signin-btn">Đổi mật khẩu</button>
              {settingsMessage && <p className="message">{settingsMessage}</p>}
            </form>
          </div>
        </div>
      </section>
    );
  };

  // Component cho trang Inbox (chính)
  const InboxPage = () => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Priority Inbox</h1>
        <button className="refresh-btn">
          <FiRefreshCw className="refresh-icon" />
          Refresh
        </button>
      </div>

      {/* Thẻ thống kê */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-title">Total Notifications</p>
            <p className="stat-value">124</p>
          </div>
          <div className="stat-icon"> <FiBell /> </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-title">Priority Items</p>
            <p className="stat-value">28</p>
          </div>
          <div className="stat-icon warning"> <FiAlertCircle /> </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-title">Accuracy Rate</p>
            <p className="stat-value">92%</p>
          </div>
          <div className="stat-icon success"> <FiCheckCircle /> </div>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="notifications-list">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.priority ? "priority" : ""}`}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {n.priority ? ( <FiAlertCircle className="priority-icon" /> ) : ( <FiMail /> )}
                </div>
                <div className="notification-details">
                  <h3>{n.title}</h3>
                  <p className="notification-source">From: {n.source}</p>
                  <p className="notification-message">{n.content}</p>
                </div>
              </div>

              <div className="notification-actions">
                <span className="notification-time">{n.time}</span>
                <div className="action-buttons">
                  <button
                    className={`priority-btn ${n.priority ? "active" : ""}`}
                    onClick={() => togglePriority(n.id)}
                  >
                    {n.priority ? "Important" : "Not Important"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );

  // Component giữ chỗ cho các trang khác (MỚI)
  const PlaceholderPage = ({ title }) => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>{title}</h1>
      </div>
      <div className="placeholder-content">
        <h2>Chức năng đang được phát triển 🚧</h2>
        <p>Nội dung cho trang '{title}' sẽ sớm có mặt.</p>
      </div>
    </section>
  );


  // --- RENDER CHÍNH ---

  // ==== CÁC TRANG XÁC THỰC (Login, Register, Forgot) ====
  if (page === "login" || page === "register" || page === "forgot") {
    return (
      <div className="login-page">
        <div className="login-glass">
          <div className="text-center">
            <div className="logo-container">
              <i className="feather-icon">🔔</i>
              <span className="logo-text">SYNAPSE</span>
            </div>
            <p className="subtitle">Your smart notification hub</p>
          </div>

          {/* Chỉ hiển thị nút OAuth và Divider ở trang Login */}
          {page === "login" && (
            <>
              <div className="button-group">
                <button className="oauth-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Google" />
                  Continue with Google
                </button>
                <button className="oauth-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
                  Continue with Microsoft
                </button>
                <button className="oauth-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" />
                  Continue with GitHub
                </button>
              </div>
              <div className="divider"> <span>Or sign in with email</span> </div>
            </>
          )}

          {/* FORM LOGIN */}
          {page === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label>Password</label>
              <input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

              <div className="form-row">
                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" className="link" onClick={() => { setPage("forgot"); setMessage(""); }}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="signin-btn"> Sign in </button>
              {message && <p className="message">{message}</p>}

              <p className="signup-text">
                Don't have an account?{" "}
                <button type="button" className="link" onClick={() => { setPage("register"); setMessage(""); }}>
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* FORM REGISTER */}
          {page === "register" && (
            <form onSubmit={handleRegister} className="login-form">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>Password</label>
              <input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <label>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <button type="submit" className="signin-btn"> Register </button>
              {message && <p className="message">{message}</p>}

              <p className="signup-text">
                Already have an account?{" "}
                <button type="button" className="link" onClick={() => { setPage("login"); setMessage(""); }}>
                  Login
                </button>
              </p>
            </form>
          )}

          {/* FORM FORGOT PASSWORD */}
          {page === "forgot" && (
            <form onSubmit={handleForgot} className="login-form">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" className="signin-btn"> Send reset link </button>
              {message && <p className="message">{message}</p>}

              <p className="signup-text">
                Back to{" "}
                <button type="button" className="link" onClick={() => { setPage("login"); setMessage(""); }}>
                  login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==== TRANG DASHBOARD ====
  return (
    <div className="app-container">
      {/* --- SIDEBAR --- */}
      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div>
          <div className="logo-container">
            <FiBell className="logo-icon" />
            <span className="logo-text">SYNAPSE</span>
          </div>

          {/* Cập nhật nav-items thành button */}
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeView === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveView('inbox')}
            >
              <FiInbox className="nav-icon" />
              Priority Inbox
            </button>
            <button
              className={`nav-item ${activeView === 'all' ? 'active' : ''}`}
              onClick={() => setActiveView('all')}
            >
              <FiMail className="nav-icon" />
              All Notifications
            </button>
            <button
              className={`nav-item ${activeView === 'junk' ? 'active' : ''}`}
              onClick={() => setActiveView('junk')}
            >
              <FiTrash2 className="nav-icon" />
              Junk & Spam
            </button>
            <button
              className={`nav-item ${activeView === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveView('filters')}
            >
              <FiFilter className="nav-icon" />
              Filter Settings
            </button>
            <button
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <FiSettings className="nav-icon" />
              Account Settings
            </button>
          </nav>
        </div>

        {/* NÚT ĐĂNG XUẤT (MỚI) */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FiLogOut className="nav-icon" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu />
            </button>
          </div>

          <div className="header-right">
            <button className="header-btn"> <FiSearch /> </button>
            <button className="header-btn notification-btn">
              <FiBell />
              <span className="badge">
                {notifications.filter((n) => !n.read).length}
              </span>
            </button>
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/40" alt="User Avatar" />
            </div>
          </div>
        </header>

        {/* RENDER NỘI DUNG CHÍNH CÓ ĐIỀU KIỆN (MỚI) */}
        {activeView === 'inbox' && <InboxPage />}
        {activeView === 'settings' && <AccountSettingsPage />}
        {activeView === 'all' && <PlaceholderPage title="All Notifications" />}
        {activeView === 'junk' && <PlaceholderPage title="Junk & Spam" />}
        {activeView === 'filters' && <PlaceholderPage title="Filter Settings" />}
        
      </main>
    </div>
  );
}

export default App;