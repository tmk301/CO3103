// src/Dashboard.jsx
import React from "react";
import "./Dashboard.css"; // có thể giữ style riêng hoặc dùng chung App.css

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Chào mừng, {user.username || user.first_name}</h1>
        <button onClick={onLogout} className="logout-btn">
          Đăng xuất
        </button>
      </header>

      <main className="dashboard-main">
        <div className="card">Quản lý hồ sơ</div>
        <div className="card">Cài đặt</div>
        <div className="card">Báo cáo</div>
        <div className="card">Thông báo</div>
      </main>
    </div>
  );
}

export default Dashboard;
