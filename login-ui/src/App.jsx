// src/App.jsx
import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

function App() {
  const [page, setPage] = useState("login"); // "login" hoặc "register"
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [user, setUser] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra nhập đủ
    if (
      !form.username ||
      !form.password ||
      (page === "register" &&
        (!form.first_name || !form.last_name || !form.email))
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Kiểm tra khớp mật khẩu
    if (page === "register" && form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const payload =
      page === "login"
        ? { username: form.username, password: form.password }
        : {
            username: form.username,
            password: form.password,
            confirm_password: form.confirmPassword,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
          };

    const url = page === "login" ? "/api/login/" : "/api/register/";

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.text()) || "Lỗi server");
        return res.json();
      })
      .then((data) => {
        if (page === "login") {
          if (data.token) localStorage.setItem("token", data.token);
          setUser({
            username: form.username,
            first_name: form.first_name,
            last_name: form.last_name,
          });
          alert("Đăng nhập thành công!");
        } else {
          alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
          setPage("login");
          setForm({
            username: "",
            password: "",
            confirmPassword: "",
            first_name: "",
            last_name: "",
            email: "",
          });
        }
      })
      .catch((err) =>
        alert(
          `${page === "login" ? "Đăng nhập" : "Đăng ký"} thất bại: ` +
            err.message
        )
      );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("login");
  };

  // Nếu đã đăng nhập → hiển thị dashboard
  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  // Nếu chưa đăng nhập → hiển thị form
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
        {page === "register" && (
          <>
            <input
              type="text"
              name="first_name"
              placeholder="Nhập họ"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Nhập tên"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </>
        )}

        {page === "login" && (
          <>
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
          </>
        )}

        <button type="submit">
          {page === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}

export default App;
