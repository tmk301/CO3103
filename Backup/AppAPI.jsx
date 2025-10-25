import { useState } from "react";
import "./App.css";

import SiteLogo from "./assets/Logo.png";
import SiteBg from "./assets/Background.jpg";

function App() {
  const [page, setPage] = useState("login");

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.username ||
      !form.password ||
      (page === "register" && (!form.first_name || !form.last_name || !form.email))
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (page === "register" && form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const payload =
      page === "login"
        ? { username: form.username, password: form.password, email: form.email }
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
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `${page === "login" ? "Login" : "Register"} failed`);
        }
        return res.json();
      })
      .then((data) => {
        if (page === "login") {
          if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Đăng nhập thành công!");
          } else {
            alert("Đăng nhập thành công (không có token trả về)");
          }
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
      .catch((err) => {
        console.error(`${page} error:`, err);
        alert(`${page === "login" ? "Đăng nhập" : "Đăng ký"} thất bại: ` + err.message);
      });
  };

  return (
    <div
      className="page"
      style={{
        backgroundImage: `url(${SiteBg})`,
      }}>
      <section className="brand">
        <div className="brand-row">
          <img src={SiteLogo} alt="Synapse logo" className="brand-logo" />
          <h1 className="brand-name">Synapse</h1>
        </div>
        <p className="brand-tagline">
          Synapse giúp bạn quản lý thông báo hộp thư và tăng hiệu suất công việc.
        </p>
      </section>
      {page === "login" ? (
        <section className="auth-card" aria-label="Đăng nhập">
          <form onSubmit={handleSubmit} className="auth-form">
            {/* 2 ô nhập nằm trên cùng */}
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

            {/* Nút đăng nhập xanh dương đậm */}
            <button type="submit" className="btn btn-primary">
              Đăng nhập
            </button>

            {/* Link Quên mật khẩu? */}
            <a className="link-forgot" href="#">
              Quên mật khẩu?
            </a>

            {/* Nút tạo tài khoản xanh lục đậm (mở giao diện register) */}
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setPage("register")}
            >
              Tạo tài khoản mới
            </button>
          </form>
        </section>
      ) : (
        <section className="auth-card" aria-label="Đăng ký">
          <h3 className="register-title">Tạo tài khoản mới</h3>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="name-row">
              <input
                type="text"
                name="first_name"
                placeholder="Tên"
                value={form.first_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Họ"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
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
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="btn btn-success">
              Đăng ký
            </button>
            <button
              type="button"
              className="btn btn-text"
              onClick={() => setPage("login")}
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default App;
