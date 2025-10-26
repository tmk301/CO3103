// App.jsx (Đã cập nhật)

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
  FiLogOut,
  FiLink,
  FiUsers, // Icon cho Admin: User Management
  FiShield, // Icon cho Admin Panel
  FiActivity, // Icon cho Dashboard Admin
  FiFileText, // Icon cho Logs Admin
  FiAlertOctagon, // Icon cảnh báo
  FiDownload, // Icon tải xuống
  FiPlus, // Icon thêm mới
  FiKey, // Icon bảo mật
  FiEye,
  FiEyeOff
} from "react-icons/fi";

// === API base URL ===
// Vite: tạo .env -> VITE_API_BASE_URL=http://localhost:8000
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8000";

// Dữ liệu người dùng giả (ĐÃ CẬP NHẬT)
let fakeUser = {
  name: "Regular User",
  email: "user@gmail.com",
  password: "123456",
  role: "user"
};

let fakeAdmin = {
  name: "System Admin",
  email: "admin@gmail.com",
  password: "adminpassword", // Mật khẩu Admin riêng
  role: "admin"
}

function App() {
  // State điều hướng
  const [page, setPage] = useState("login"); // login | register | forgot | dashboard | admin
  const [activeView, setActiveView] = useState("inbox"); // inbox | all |link account| junk | filters | settings | dashboard | users | logs | admin_settings

  // State xác thực
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [captchaOk, setCaptchaOk] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // State Dashboard User
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

  // State Admin
  const [adminCurrentTab, setAdminCurrentTab] = useState('dashboard'); // tab hiện tại trong Admin Panel

  // --- HÀM XÁC THỰC & ĐIỀU HƯỚNG ---

  const clearAuthForms = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirm("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setCaptchaOk(false);
    setMessage("");
  };

  const clearSettingsForms = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNew("");
    setSettingsMessage("");
  };

  // Xử lý đăng nhập (ĐÃ CẬP NHẬT)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setAuthLoading(true);

    // Ô "Email/Username" của bạn đang dùng state 'email'
    const identifier = email.trim();
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    const payload = isEmail
      ? { email: identifier, password }
      : { username: identifier, password };

    try {
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }
      const role = data?.data?.role || "user";

      setMessage("✅ Login successfully!");
      setUserRole(role);
      // nếu BE trả name/email thì lấy; không thì giữ như cũ
      if (data?.data?.name) setProfileName(data.data.name);
      if (isEmail) setProfileEmail(identifier);

      setTimeout(() => {
        if (role === "admin") {
          setPage("admin");
          setAdminCurrentTab("dashboard");
        } else {
          setPage("dashboard");
          setActiveView("inbox");
        }
        setMessage("");
      }, 500);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Xử lý đăng ký (Giữ nguyên)
  const handleRegister = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !username || !email || !password || !confirm) {
      setMessage("⚠️ Please fill in all fields."); return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_]{2,7}$/.test(username)) {
      setMessage("⚠️ Invalid Username."); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("⚠️ Invalid email."); return;
    }
    const phoneClean = phone.replace(/[^\d]/g, "");
    if (phoneClean.length < 10) {
      setMessage("⚠️ Invalid phone number."); return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Password must have at least 6 characters."); return;
    }
    if (password !== confirm) {
      setMessage("⚠️ Passwords do not match yet."); return;
    }
    if (!captchaOk) {
      setMessage("⚠️ Confirm captcha before registration."); return;
    }
    setMessage("🎉 Registration successful! Please login.");
    setTimeout(() => {
      setPage("login");
      clearAuthForms();
    }, 1500);
  };

  // Xử lý quên mật khẩu (Giữ nguyên)
  const handleForgot = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your linked email."); return;
    }
    setMessage(`📧 A password reset link has been sent to ${email}`);
    setTimeout(() => {
      setPage("login");
      clearAuthForms();
    }, 1500);
  };

  // XỬ LÝ ĐĂNG XUẤT (CẬP NHẬT)
  const handleLogout = () => {
    // Reset tất cả state về mặc định
    clearAuthForms();
    clearSettingsForms();
    setNotifications([]);
    setLoading(true);
    setProfileName(fakeUser.name);
    setProfileEmail(fakeUser.email);
    setUserRole(null); // Reset role

    // Chuyển về trang đăng nhập
    setPage("login");
  };

  // --- TẢI DỮ LIỆU ---

  // Tải dữ liệu thông báo (giả) khi vào dashboard
  useEffect(() => {
    // Chỉ tải khi ở dashboard (User) và xem inbox
    if (page !== "dashboard" || activeView !== "inbox") {
      setLoading(true);
      return;
    }
    // Logic tải dữ liệu... (Giữ nguyên)
    setLoading(true);
    setTimeout(() => {
      setNotifications([
        { id: 1, title: "Meeting Reminder", source: "calendar@google.com", content: "Your team meeting starts in 30 minutes. Join via Google Meet.", time: "10:30 AM", priority: true, read: false },
        { id: 2, title: "New Message from John", source: "john.doe@example.com", content: "Hey, just checking in about the project proposal.", time: "9:45 AM", priority: false, read: true },
        { id: 3, title: "New Facebook Message", source: "Sarah Johnson", content: "Are we still on for dinner this Friday?", time: "Yesterday", priority: false, read: true },
      ]);
      setLoading(false);
    }, 1000);
  }, [page, activeView]);

  // Chuyển đổi trạng thái ưu tiên
  const togglePriority = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, priority: !n.priority } : n))
    );
  };


  // --- COMPONENT CON CHO CÁC VIEW (USER) ---

  // Component cho trang Account Settings (Giữ nguyên)
  const AccountSettingsPage = () => {
    // ... (Giữ nguyên logic Profile và Password update) ...
    const handleUpdateProfile = (e) => {
      e.preventDefault();
      // Logic cập nhật fakeUser/fakeAdmin (phức tạp hơn)
      if (userRole === 'admin') {
        fakeAdmin.name = profileName;
        fakeAdmin.email = profileEmail;
      } else {
        fakeUser.name = profileName;
        fakeUser.email = profileEmail;
      }
      setSettingsMessage("✅ Information updated successfully!");
      setTimeout(() => setSettingsMessage(""), 2000);
    };

    const handleChangePassword = (e) => {
      e.preventDefault();
      setSettingsMessage("");
      let targetUser = userRole === 'admin' ? fakeAdmin : fakeUser;

      if (!oldPassword || !newPassword || !confirmNew) {
        setSettingsMessage("⚠️ Please fill in all fields."); return;
      }
      if (oldPassword !== targetUser.password) {
        setSettingsMessage("❌ Old password is incorrect."); return;
      }
      if (newPassword.length < 6) {
        setSettingsMessage("⚠️ New password must have at least 6 characters."); return;
      }
      if (newPassword !== confirmNew) {
        setSettingsMessage("⚠️ Password do not match yet."); return;
      }

      // Thành công
      targetUser.password = newPassword; // Cập nhật mật khẩu (giả)
      setSettingsMessage("✅ Password updated successfully!");
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

  // Component cho trang Inbox (chính) (Giữ nguyên)
  const InboxPage = () => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Priority Inbox</h1>
        <button className="refresh-btn">
          <FiRefreshCw className="refresh-icon" />
          Refresh
        </button>
      </div>
      {/* Thẻ thống kê (Giữ nguyên) */}
      <div className="stats-container">
        <div className="stat-card"><div className="stat-info"><p className="stat-title">Total Notifications</p><p className="stat-value">124</p></div><div className="stat-icon"> <FiBell /> </div></div>
        <div className="stat-card"><div className="stat-info"><p className="stat-title">Priority Items</p><p className="stat-value">28</p></div><div className="stat-icon warning"> <FiAlertCircle /> </div></div>
        <div className="stat-card"><div className="stat-info"><p className="stat-title">Accuracy Rate</p><p className="stat-value">92%</p></div><div className="stat-icon success"> <FiCheckCircle /> </div></div>
      </div>
      {/* Danh sách thông báo (Giữ nguyên) */}
      <div className="notifications-list">
        {loading ? (<div className="loading">Loading notifications...</div>) : (
          notifications.map((n) => (
            <div key={n.id} className={`notification-card ${n.priority ? "priority" : ""}`} >
              <div className="notification-content">
                <div className="notification-icon">{n.priority ? (<FiAlertCircle className="priority-icon" />) : (<FiMail />)}</div>
                <div className="notification-details">
                  <h3>{n.title}</h3>
                  <p className="notification-source">From: {n.source}</p>
                  <p className="notification-message">{n.content}</p>
                </div>
              </div>
              <div className="notification-actions">
                <span className="notification-time">{n.time}</span>
                <div className="action-buttons">
                  <button className={`priority-btn ${n.priority ? "active" : ""}`} onClick={() => togglePriority(n.id)}>{n.priority ? "Important" : "Not Important"}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );


  // Trang All Notifications (MỚI)
  const AllNotificationsPage = () => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>All Notifications</h1>
        <button className="refresh-btn">
          <FiRefreshCw className="refresh-icon" />
          Mark All As Read
        </button>
      </div>
      <div className="notifications-list">
        <div className="notification-card">
          <div className="notification-content">
            <div className="notification-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><FiMail /></div>
            <div className="notification-details">
              <h3>[Slack] New Channel Message</h3>
              <p className="notification-source">From: #general-team</p>
              <p className="notification-message">John: We'll launch the update at 3 PM UTC. Please confirm readiness.</p>
            </div>
          </div>
          <div className="notification-actions">
            <span className="notification-time">1 min ago</span>
            <div className="action-buttons">
              <button className="priority-btn" style={{ background: '#06d6a0', color: 'white' }}>Archive</button>
            </div>
          </div>
        </div>
        <div className="notification-card">
          <div className="notification-content">
            <div className="notification-icon" style={{ background: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }}><FiAlertCircle /></div>
            <div className="notification-details">
              <h3>[Google] Critical Security Alert</h3>
              <p className="notification-source">From: security-alerts@google.com</p>
              <p className="notification-message">Suspicious login detected in Vietnam. Review and secure your account immediately.</p>
            </div>
          </div>
          <div className="notification-actions">
            <span className="notification-time">30 mins ago</span>
            <div className="action-buttons">
              <button className="priority-btn active">Review</button>
            </div>
          </div>
        </div>
        <div className="notification-card">
          <div className="notification-content">
            <div className="notification-icon" style={{ background: 'rgba(255, 190, 11, 0.1)', color: '#ffbe0b' }}><FiAlertCircle /></div>
            <div className="notification-details">
              <h3>[Facebook] 5 Birthday Reminders</h3>
              <p className="notification-source">From: Facebook Notifications</p>
              <p className="notification-message">5 of your friends have birthdays today. Say hi!</p>
            </div>
          </div>
          <div className="notification-actions">
            <span className="notification-time">1 hour ago</span>
            <div className="action-buttons">
              <button className="priority-btn">Snooze</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Trang Junk & Spam (MỚI)
  const JunkSpamPage = () => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Junk & Spam</h1>
        <button className="refresh-btn" style={{ background: '#ef476f' }} onClick={() => alert("Đã xóa vĩnh viễn tất cả thư rác")}>
          <FiTrash2 className="refresh-icon" />
          Delete All
        </button>
      </div>
      <div className="notifications-list">
        <div className="notification-card" style={{ borderLeftColor: '#ef476f' }}>
          <div className="notification-content">
            <div className="notification-icon" style={{ background: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }}><FiTrash2 /></div>
            <div className="notification-details">
              <h3>**SPAM:** WIN a FREE iPhone 16!</h3>
              <p className="notification-source">From: rewards@fake-promo.net</p>
              <p className="notification-message">Congratulations! You've been selected as our lucky winner. Click to claim now!</p>
            </div>
          </div>
          <div className="notification-actions">
            <span className="notification-time">2 days ago</span>
            <div className="action-buttons">
              <button className="priority-btn active" style={{ background: '#06d6a0', color: 'white' }}>Not Spam</button>
            </div>
          </div>
        </div>
        <div className="notification-card">
          <div className="notification-content">
            <div className="notification-icon" style={{ background: 'rgba(255, 190, 11, 0.1)', color: '#ffbe0b' }}><FiAlertCircle /></div>
            <div className="notification-details">
              <h3>[Promo] 50% Off All Items!</h3>
              <p className="notification-source">From: store@marketing-deals.com</p>
              <p className="notification-message">Limited time offer! Use code 'FLASH50' at checkout.</p>
            </div>
          </div>
          <div className="notification-actions">
            <span className="notification-time">1 week ago</span>
            <div className="action-buttons">
              <button className="priority-btn">Restore</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Trang Filter Settings (MỚI)
  const FilterSettingsPage = () => (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Filter & Rule Settings</h1>
      </div>
      <div className="settings-container">
        {/* Card 1: Priority Rules */}
        <div className="setting-card">
          <h2>Priority Rules</h2>
          <p className="text-light-sm">Thiết lập các quy tắc để tự động đánh dấu thông báo là **Ưu tiên (Important)**.</p>
          <div className="login-form" style={{ gap: '0.5rem', marginTop: '1rem' }}>
            <label className="remember" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              Mark all notifications from `google.com` as Important.
            </label>
            <label className="remember" style={{ fontSize: '0.9rem' }}>
              <input type="checkbox" defaultChecked={false} />
              Mark all notifications containing the word "URGENT" as Important.
            </label>
            <button className="signin-btn" style={{ background: '#3b82f6', marginTop: '1rem' }} onClick={() => alert("Đã thêm quy tắc ưu tiên mới")}>
              <FiPlus style={{ marginRight: '0.5rem' }} /> Add New Priority Rule
            </button>
          </div>
        </div>

        {/* Card 2: Muting Rules */}
        <div className="setting-card">
          <h2>Muting & Spam Rules</h2>
          <p className="text-light-sm">Thiết lập các quy tắc để tự động **Ẩn (Mute)** hoặc **Chuyển vào Thư rác (Spam)**.</p>
          <div className="login-form" style={{ gap: '0.5rem', marginTop: '1rem' }}>
            <label className="remember" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              Send all notifications from `fake-promo.net` to Junk & Spam.
            </label>
            <label className="remember" style={{ fontSize: '0.9rem' }}>
              <input type="checkbox" defaultChecked={false} />
              Mute all TikTok notifications from 10 PM to 7 AM.
            </label>
            <button className="signin-btn" style={{ background: '#ef476f', marginTop: '1rem' }} onClick={() => alert("Đã thêm quy tắc chặn mới")}>
              <FiTrash2 style={{ marginRight: '0.5rem' }} /> Add New Mute Rule
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // Trang Link Account (MỚI)
  const LinkAccountPage = () => (
    <section className="dashboard link-account-page">
      <div className="dashboard-header">
        <h1>Link Accounts</h1>
      </div>
      <div className="settings-container" style={{ gridTemplateColumns: 'minmax(300px, 600px)' }}> {/* Điều chỉnh layout */}
        {/* Card Gộp: Tất cả các tùy chọn Liên kết */}
        <div className="setting-card">
          <h2>Connect External Services</h2>
          <p className="text-light-sm">Liên kết các tài khoản bên ngoài để Synapse có thể tổng hợp thông báo của bạn. (Chức năng giả lập)</p>

          <div className="login-form" style={{ gap: '0.75rem', marginTop: '1.5rem' }}>

            {/* 1. Google/Email */}
            <label>Email & Calendar Integration</label>
            <button className="signin-btn" style={{ background: '#13daddff', marginTop: 0 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Google" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(0)' }} />
              Link Google (Gmail, Meet, Calendar)
            </button>
            <button className="signin-btn" style={{ background: '#b7d410ff', marginTop: '0.25rem' }} onClick={() => alert('Đã liên kết với Teams (Giả lập)')}>
              <img src="By Microsoft 365 - https://www.microsoft.com/en-au/microsoft-365, Public Domain, https://en.wikipedia.org/w/index.php?curid=81305946" alt="Teams" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link Teams
            </button>

            <div style={{ borderBottom: '1px solid #e5e7eb', margin: '1rem 0' }}></div>

            {/* 2. Social Media */}
            <label>Social Media Integrations</label>
            <button className="signin-btn" style={{ background: '#3b5998', marginTop: 0 }} onClick={() => alert('Đã liên kết với Facebook (Giả lập)')}>
              <img src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg" alt="Facebook" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link Facebook
            </button>
            <button className="signin-btn" style={{ background: '#000000', marginTop: '0.25rem' }} onClick={() => alert('Đã liên kết với TikTok (Giả lập)')}>
              <img src="https://tse3.mm.bing.net/th/id/OIP.47I_BdET_fqF0-ZdNc25kAHaIY?rs=1&pid=ImgDetMain&o=7&rm=3" alt="TikTok" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link TikTok
            </button>
            <button className="signin-btn" style={{ background: '#00acee', marginTop: '0.25rem' }} onClick={() => alert('Đã liên kết với Twitter (Giả lập)')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X/Twitter" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link X (Twitter)
            </button>
            <button className="signin-btn" style={{ background: '#E1306C', marginTop: '0.25rem' }} onClick={() => alert('Đã liên kết với Instagram (Giả lập)')}>
              <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fvi.m.wikipedia.org%2Fwiki%2FT%25E1%25BA%25ADp_tin%3AInstagram_logo_2016.svg&psig=AOvVaw1X6CNZvv3yaxCuUM7n74Eo&ust=1761414216969000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCIiaj7ixvZADFQAAAAAdAAAAABAE" alt="Instagram" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link Instagram
            </button>

            <div style={{ borderBottom: '1px solid #e5e7eb', margin: '1rem 0' }}></div>

            {/* 3. Work/Dev */}
            <label>Work & Development Tools</label>
            <button className="signin-btn" style={{ background: '#61DAFB', color: 'black', marginTop: 0 }} onClick={() => alert('Đã liên kết với Slack (Giả lập)')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(0)' }} />
              Link Slack
            </button>
            <button className="signin-btn" style={{ background: '#000000', marginTop: '0.25rem' }} onClick={() => alert('Đã liên kết với GitHub (Giả lập)')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" style={{ width: '18px', marginRight: '0.5rem', filter: 'invert(1)' }} />
              Link GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // --- COMPONENT ADMIN (MỚI) ---

  // Dữ liệu menu Admin
  const adminNav = [
    { id: 'dashboard', name: 'Admin Dashboard', icon: FiActivity, color: '#3b82f6' },
    { id: 'users', name: 'User Management', icon: FiUsers, color: '#06d6a0' },
    { id: 'logs', name: 'System Logs', icon: FiFileText, color: '#ffbe0b' },
    { id: 'admin_settings', name: 'Admin Settings', icon: FiSettings, color: '#ef476f' },
  ];

  // Component Nội dung Tab Admin
  const AdminContent = ({ currentTab }) => {
    const handleAdminAction = (action) => alert(`Action: ${action} - Executed (Simulated)`);

    const DashboardContent = () => (
      <div id="admin-dashboard">
        <h1 className="admin-title">System Overview</h1>
        <div className="stats-container admin-stats">
          <div className="stat-card admin-stat-card">
            <div className="stat-info">
              <p className="stat-title">Total Users</p>
              <p className="stat-value">1,248</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><FiUsers /></div>
          </div>
          <div className="stat-card admin-stat-card">
            <div className="stat-info">
              <p className="stat-title">Critical Errors</p>
              <p className="stat-value">12</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }}><FiAlertOctagon /></div>
          </div>
          <div className="stat-card admin-stat-card">
            <div className="stat-info">
              <p className="stat-title">System Uptime</p>
              <p className="stat-value">99.98%</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: '#06d6a0' }}><FiCheckCircle /></div>
          </div>
        </div>

        <div className="setting-card">
          <h2>Global Notification Broadcast</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAdminAction('Send Global Message'); }} className="login-form">
            <label>Message Content</label>
            <textarea rows="3" placeholder="Enter message to all users..." className="admin-textarea" required></textarea>
            <button type="submit" className="signin-btn" style={{ background: '#ef476f' }}>Send Critical Alert</button>
          </form>
        </div>
      </div>
    );

    const UserManagementContent = () => (
      <div id="user-management">
        <h1 className="admin-title">User Management</h1>
        <div className="admin-actions">
          <button className="refresh-btn" onClick={() => handleAdminAction('Add User')}><FiPlus className="refresh-icon" />Add New User</button>
          <button className="refresh-btn" onClick={() => handleAdminAction('Export Data')}><FiDownload className="refresh-icon" />Export Data</button>
        </div>

        <div className="notifications-list"> {/* Tái sử dụng style list */}
          <div className="notification-card">
            <div className="notification-content">
              <div className="notification-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FiUsers />
              </div>
              <div className="notification-details">
                <h3>John Doe (Admin)</h3>
                <p className="notification-source">john.doe@notifruit.com | Role: **Admin**</p>
                <p className="notification-message">Last login: 2 minutes ago | Status: Active</p>
              </div>
            </div>
            <div className="notification-actions">
              <button className="priority-btn active" onClick={() => handleAdminAction('Edit John')}>Edit</button>
              <button className="priority-btn" style={{ background: '#ef476f', color: 'white' }} onClick={() => handleAdminAction('Suspend John')}>Suspend</button>
            </div>
          </div>
          <div className="notification-card">
            <div className="notification-content">
              <div className="notification-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: '#06d6a0' }}>
                <FiUsers />
              </div>
              <div className="notification-details">
                <h3>{fakeUser.name} (User)</h3>
                <p className="notification-source">{fakeUser.email} | Role: User</p>
                <p className="notification-message">Last login: 5 hours ago | Status: Active</p>
              </div>
            </div>
            <div className="notification-actions">
              <button className="priority-btn active" onClick={() => handleAdminAction('Edit User')}>Edit</button>
              <button className="priority-btn" style={{ background: '#ffbe0b', color: 'white' }} onClick={() => handleAdminAction('Force Logout User')}>Force Logout</button>
            </div>
          </div>
        </div>
      </div>
    );

    const SystemLogsContent = () => (
      <div id="system-logs">
        <h1 className="admin-title">System Logs (Simulated)</h1>
        <div className="notifications-list">
          <div className="notification-card priority" style={{ borderLeftColor: '#ef476f' }}>
            <div className="notification-content">
              <div className="notification-icon" style={{ background: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }}>
                <FiAlertOctagon />
              </div>
              <div className="notification-details">
                <h3>CRITICAL: Database Failure</h3>
                <p className="notification-source">Source: DB-Server-01</p>
                <p className="notification-message">Connection pool exhausted. Attempted 5 auto-reconnects. Status: Offline.</p>
              </div>
            </div>
            <div className="notification-actions"><span className="notification-time">2 mins ago</span></div>
          </div>
          <div className="notification-card">
            <div className="notification-content">
              <div className="notification-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: '#06d6a0' }}>
                <FiCheckCircle />
              </div>
              <div className="notification-details">
                <h3>SUCCESS: User Login</h3>
                <p className="notification-source">User: {fakeAdmin.email}</p>
                <p className="notification-message">IP: 203.0.113.45 | Session created successfully.</p>
              </div>
            </div>
            <div className="notification-actions"><span className="notification-time">5 mins ago</span></div>
          </div>
        </div>
      </div>
    );

    const AdminSettingsContent = () => (
      <div id="admin-settings">
        <h1 className="admin-title">Global System Settings</h1>
        <div className="settings-container">
          <div className="setting-card">
            <h2>Maintenance Mode</h2>
            <p className="text-light-sm">Toggle để kích hoạt hoặc hủy kích hoạt chế độ bảo trì toàn hệ thống.</p>
            <div className="form-row" style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <label className="remember">
                <input type="checkbox" onChange={() => handleAdminAction('Toggle Maintenance')} />
                Activate Maintenance Mode
              </label>
              <button className="signin-btn" style={{ background: '#ffbe0b', padding: '0.5rem 1rem', marginTop: 0 }} onClick={() => handleAdminAction('Schedule Downtime')}>Schedule</button>
            </div>
          </div>
          <div className="setting-card">
            <h2>API Keys & Security</h2>
            <p className="text-light-sm">Quản lý Master API Key và cài đặt bảo mật. **Hành động không thể hoàn tác.**</p>
            <div className="login-form" style={{ marginTop: '1rem' }}>
              <button className="signin-btn" style={{ background: '#ef476f', marginTop: 0 }} onClick={() => handleAdminAction('Regenerate Master Key')}>
                <FiKey className="nav-icon" style={{ marginRight: '0.5rem' }} /> Regenerate Master API Key
              </button>
              <button className="signin-btn" style={{ background: '#9ca3af', marginTop: '0.5rem' }} onClick={() => handleAdminAction('Flush Cache')}>
                <FiRefreshCw className="nav-icon" style={{ marginRight: '0.5rem' }} /> Flush Global Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    switch (currentTab) {
      case 'dashboard': return <DashboardContent />;
      case 'users': return <UserManagementContent />;
      case 'logs': return <SystemLogsContent />;
      case 'admin_settings': return <AdminSettingsContent />;
      default: return <DashboardContent />;
    }
  };

  // Component Khung Admin Dashboard
  const AdminDashboard = () => (
    <div className="app-container">
      {/* --- SIDEBAR ADMIN --- */}
      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div>
          <div className="logo-container">
            <FiShield className="logo-icon" style={{ color: adminNav.find(n => n.id === adminCurrentTab)?.color || '#3b82f6' }} />
            <span className="logo-text">ADMIN PANEL</span>
          </div>

          <nav className="nav-menu">
            {adminNav.map(item => (
              <button
                key={item.id}
                className={`nav-item ${adminCurrentTab === item.id ? 'active' : ''}`}
                onClick={() => setAdminCurrentTab(item.id)}
                style={adminCurrentTab === item.id ? { backgroundColor: `${item.color}1A`, color: item.color } : {}}
              >
                <item.icon className="nav-icon" style={adminCurrentTab === item.id ? { color: item.color } : {}} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* NÚT ĐĂNG XUẤT */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FiLogOut className="nav-icon" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT ADMIN --- */}
      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
          </div>

          <div className="header-right">
            <p className="text-light-sm" style={{ marginRight: '1rem' }}>Logged in as: **{fakeAdmin.name}**</p>
            <button className="header-btn notification-btn">
              <FiBell />
              <span className="badge">12</span>
            </button>
            <div className="user-avatar"><img src="https://i.pravatar.cc/40?img=6" alt="Admin Avatar" /></div>
          </div>
        </header>

        <div className="dashboard admin-panel">
          <AdminContent currentTab={adminCurrentTab} />
        </div>
      </main>
    </div>
  );


  // --- RENDER CHÍNH ---

  // ==== CÁC TRANG XÁC THỰC (Login, Register, Forgot) ====
  if (page === "login" || page === "register" || page === "forgot") {
    // ... (Giữ nguyên phần render Login/Register/Forgot) ...
    return (
      <div className="login-page">
        <div className="login-glass">
          <div className="text-center">
            <div className="logo-container">
              <img src="/logo.png" alt="Synapse" className="logo-img" />
              <span className="logo-text">SYNAPSE</span>
            </div>
            <p className="subtitle">Your smart notification hub</p>
          </div>

          {/* FORM LOGIN */}
          {page === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <label>Email/Username</label>
              <input type="text" placeholder="Your email or username" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

              <button type="submit" className="signin-btn" disabled={authLoading} > {authLoading ? "Signing in..." : "Sign in"} </button>
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
              <div className="two-col">
                <div>
                  <label>Firstname</label>
                  <input type="text" placeholder="Your firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label>Lastname</label>
                  <input type="text" placeholder="Your lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <label>Phone number (At least 10 numbers length)</label>
              <input type="tel" placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <label>Username (3~8 characters, do not include special characters & spaces)</label>
              <input type="text" placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

              {/* Password có toggle */}
              <label>Password (At least 6 characters)</label>
              <div className="input-with-toggle">
                <input type={showPass ? "text" : "password"} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="toggle-visibility" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"} > {showPass ? <FiEyeOff /> : <FiEye />} </button>
              </div>

              {/* Confirm Password có toggle */}
              <label>Confirm Password</label>
              <div className="input-with-toggle">
                <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                <button type="button" className="toggle-visibility" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"} > {showConfirm ? <FiEyeOff /> : <FiEye />} </button>
              </div>

              {/* Captcha đơn giản */}
              <label className="remember" style={{ marginTop: ".25rem" }}>
                <input type="checkbox" checked={captchaOk} onChange={(e) => setCaptchaOk(e.target.checked)} />
                I'm not a robot
              </label>

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
              <input type="email" placeholder="Enter your linked email" value={email} onChange={(e) => setEmail(e.target.value)} />
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

  // ==== TRANG ADMIN (MỚI) ====
  if (page === 'admin') {
    return <AdminDashboard />;
  }

  // ==== TRANG DASHBOARD USER ====
  // Phải đảm bảo chỉ hiển thị khi `page === 'dashboard'`
  return (
    <div className="app-container">
      {/* --- SIDEBAR --- */}
      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div>
          <div className="logo-container">
            <img src="/logo.png" alt="Synapse" className="logo-img" />
            <span className="logo-text">SYNAPSE</span>
          </div>


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
              className={`nav-item ${activeView === 'link_account' ? 'active' : ''}`} // <<< MỚI
              onClick={() => setActiveView('link_account')} // <<< MỚI
            >
              <FiLink className="nav-icon" /> {/* <<< MỚI */}
              Link Accounts {/* <<< MỚI */}
            </button>
            <button
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <FiSettings className="nav-icon" />
              Account Settings
            </button>
            {/* NÚT ADMIN PANEL (Chỉ hiển thị nếu user là admin) */}
            {userRole === 'admin' && (
              <button
                className={`nav-item admin-panel-btn`}
                onClick={() => setPage('admin')}
              >
                <FiShield className="nav-icon" />
                Admin Panel
              </button>
            )}
          </nav>
        </div>

        {/* NÚT ĐĂNG XUẤT */}
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

        {/* RENDER NỘI DUNG CHÍNH CÓ ĐIỀU KIỆN */}
        {activeView === 'inbox' && <InboxPage />}
        {activeView === 'settings' && <AccountSettingsPage />}
        {activeView === 'link_account' && <LinkAccountPage />} {/* <<< MỚI */}
        {activeView === 'all' && <AllNotificationsPage />}
        {activeView === 'junk' && <JunkSpamPage />}
        {activeView === 'filters' && <FilterSettingsPage />}

      </main>
    </div>
  );
}

export default App;