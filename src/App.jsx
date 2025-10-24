import { useState, useEffect } from "react";
import "./App.css";

import SiteLogo from "./assets/Logo.png";
import SiteBg from "./assets/Background.jpg";
import Welcome from "./pages/Welcome";

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

    // Backend API endpoints (use relative URLs so Vite dev proxy forwards them to backend)
    const url = page === "login" ? `/api/sessions/` : `/api/users/`;

    fetch(url, {
      method: "POST",
      credentials: 'include', // include cookies so backend can set/send session cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok) {
          const errMsg = json.detail || text || `${page === "login" ? "Login" : "Register"} failed`;
          throw new Error(errMsg);
        }
        return json;
      })
      .then((resp) => {
        if (page === "login") {
          // Backend returns { detail: 'Login successful.', data: { ...user... } }
          const user = resp.data || {};
          // Store minimal user info in localStorage (no token returned by current API)
          localStorage.setItem('sya_user', JSON.stringify(user));
          alert('Đăng nhập thành công!');
          // show welcome page
          setPage('welcome');
        } else {
          alert(resp.detail || 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
          setPage('login');
          setForm({
            username: '',
            password: '',
            confirmPassword: '',
            first_name: '',
            last_name: '',
            email: '',
          });
        }
      })
      .catch((err) => {
        console.error(`${page} error:`, err);
        alert(`${page === 'login' ? 'Đăng nhập' : 'Đăng ký'} thất bại: ` + err.message);
      });
  };

  // Check backend session on app load (used after social redirect)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/me/`, {
          method: 'GET',
          credentials: 'include', // include cookies from backend domain (proxied)
        });
        if (!res.ok) return; // not authenticated
        const json = await res.json();
        const user = json.data || {};
        // store minimal user info and show welcome
        localStorage.setItem('sya_user', JSON.stringify(user));
        setPage('welcome');
      } catch (e) {
        // ignore
      }
    };
    checkSession();
    
    // If the social adapter redirected back with social params, try to link
    const q = new URLSearchParams(window.location.search);
    const provider = q.get('social_provider');
    const uid = q.get('social_uid');
    const email = q.get('social_email');
    if (provider && uid && email) {
      // Only attempt linking if user is logged into SYA (we stored sya_user)
      const stored = localStorage.getItem('sya_user');
      if (stored) {
        (async () => {
          try {
            const resp = await fetch('/api/social/link/', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider, uid, email, extra_data: {} }),
            });
            const text = await resp.text();
            const json = text ? JSON.parse(text) : {};
            if (!resp.ok) {
              alert('Liên kết thất bại: ' + (json.detail || text));
            } else {
              alert('Liên kết Google thành công!');
            }
          } catch (err) {
            console.error('link social error', err);
            alert('Liên kết thất bại: ' + err.message);
          } finally {
            // remove social params from URL
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('social_provider');
              url.searchParams.delete('social_uid');
              url.searchParams.delete('social_email');
              window.history.replaceState({}, document.title, url.pathname + url.search);
            } catch (e) {}
          }
        })();
      } else {
        // Not logged into SYA — clear params and show message
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('social_provider');
          url.searchParams.delete('social_uid');
          url.searchParams.delete('social_email');
          window.history.replaceState({}, document.title, url.pathname + url.search);
        } catch (e) {}
        alert('Vui lòng đăng nhập vào SYA trước khi liên kết tài khoản Google.');
      }
    }
  }, []);

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
      {page === "login" && (
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

            {/* Social login (Google) */}
            <button
              type="button"
              className="btn btn-google"
              onClick={() => {
                // Use relative path so Vite dev server proxies to backend
                window.location.href = `/accounts/google/login/`;
              }}
            >
              Đăng nhập với Google
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
      )}

      {page === "register" && (
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

      {page === "welcome" && <Welcome />}
    </div>
  );
}

export default App;
