import { useState } from "react";
import "./App.css";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password || (page === "register" && (!form.first_name || !form.last_name || !form.email))) {
      alert("Vui lòng nhập đầy đủ thông tin!");
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

    if (page === "register" && form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

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
    <div className="login-container">
      <div className="button-switch">
        <button className={page === "login" ? "active" : ""} onClick={() => setPage("login")}>
          Đăng nhập
        </button>
        <button className={page === "register" ? "active" : ""} onClick={() => setPage("register")}>
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
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </>
        )}
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
