import { useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const callAPI = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Lỗi máy chủ");
    return data;
  };
  const LoginForm = () => {
    const [form, setForm] = useState({ username: "", password: "" });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = await callAPI("/api/login/", form);
        alert("Đăng nhập thành công!");
        setUser(data.data);
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <form className="form" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>
    );
  };

  // FORM ĐĂNG KÝ 
  const RegisterForm = () => {
    const [form, setForm] = useState({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (form.password !== form.confirmPassword)
        return alert("Mật khẩu xác nhận không khớp!");
      try {
        await callAPI("/api/register/", form);
        alert("Đăng ký thành công! Mời đăng nhập.");
        setPage("login");
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <form className="form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
        <input
          type="text"
          placeholder="Họ"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tên"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
    );
  };
  const ResetForm = () => {
    const [form, setForm] = useState({
      username: "",
      old_password: "",
      new_password: "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await callAPI("/api/reset_password/", form);
        alert("Thay đổi mật khẩu thành công!");
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <form className="form" onSubmit={handleSubmit}>
        <h2>Thay đổi mật khẩu</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu cũ"
          value={form.old_password}
          onChange={(e) => setForm({ ...form, old_password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={form.new_password}
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          required
        />
        <button type="submit">Cập nhật</button>
      </form>
    );
  };
  if (user) {
    return (
      <div className="dashboard">
        <h2>Xin chào, {user.username}</h2>
        <button onClick={() => setUser(null)}>Đăng xuất</button>
      </div>
    );
  }
  return (
    <div className="app-container">
      <div className="card">
        <div className="tab-buttons">
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
          <button
            className={page === "reset" ? "active" : ""}
            onClick={() => setPage("reset")}
          >
            Thay đổi mật khẩu
          </button>
        </div>

        {page === "login" && <LoginForm />}
        {page === "register" && <RegisterForm />}
        {page === "reset" && <ResetForm />}
      </div>
    </div>
  );
}

export default App;
