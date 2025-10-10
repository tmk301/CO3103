import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login"); // "login" hoặc "register"
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [users, setUsers] = useState([]); // lưu tạm danh sách tài khoản

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    // Use backend API instead of local-only mock
    const payload = { username: form.username, password: form.password };

    if (page === "login") {
      fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Login failed');
          }
          return res.json();
        })
        .then((data) => {
          // Assumption: backend returns { token: '...' } on success
          if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Đăng nhập thành công!');
          } else {
            alert('Đăng nhập thành công (không có token trả về)');
          }
        })
        .catch((err) => {
          console.error('Login error:', err);
          alert('Đăng nhập thất bại: ' + err.message);
        });
    } else {
      if (form.password !== form.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Register failed');
          }
          return res.json();
        })
        .then((data) => {
          alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
          setPage('login');
          setForm({ username: '', password: '', confirmPassword: '' });
        })
        .catch((err) => {
          console.error('Register error:', err);
          alert('Đăng ký thất bại: ' + err.message);
        });
    }
  };

  return (
    <div className="login-container">
      <div className="button-switch">
        <button
          className={page === "login" ? "active" : ""}
          onClick={() => setPage("login")}
        >
          Đăng nhập
        </button>
        <button
          className={page === "register" ? "active" : ""}
          onClick={() => setPage("register")}
        >
          Đăng ký
        </button>
      </div>

      <h2>{page === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />
        {page === "register" && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        )}
        <button type="submit">{page === "login" ? "Đăng nhập" : "Đăng ký"}</button>
      </form>
    </div>
  );
}

export default App;
