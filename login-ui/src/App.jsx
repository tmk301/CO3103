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

    if (page === "login") {
      const userExists = users.find(
        (u) => u.username === form.username && u.password === form.password
      );
      if (userExists) {
        alert("Đăng nhập thành công!");
      } else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } else {
      if (form.password !== form.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }
      const userExists = users.find((u) => u.username === form.username);
      if (userExists) {
        alert("Tên đăng nhập đã tồn tại!");
        return;
      }
      setUsers([...users, { username: form.username, password: form.password }]);
      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      setPage("login");
      setForm({ username: "", password: "", confirmPassword: "" });
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
