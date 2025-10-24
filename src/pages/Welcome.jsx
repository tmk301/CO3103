import React from "react";
import "../App.css";

export default function Welcome() {
  const raw = localStorage.getItem("sya_user");
  let user = {};
  try {
    user = raw ? JSON.parse(raw) : {};
  } catch (e) {
    user = {};
  }

  const name = user.first_name || user.username || "Người dùng";

  const handleLinkGoogle = () => {
    // Prefer an explicit google auth URL from env, otherwise use backend allauth entrypoint
    const GOOGLE = import.meta.env.VITE_GOOGLE_AUTH_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/accounts/google/login/`;
    window.location.href = GOOGLE;
  };

  const handleLogout = () => {
    // Call backend logout so the Django session is cleared as well.
    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };

    (async () => {
      try {
        // call our API to clear server session
        await fetch('/api/logout/', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        // ignore
      } finally {
        localStorage.removeItem('sya_user');
        // navigate to login/page root
        window.location.href = '/';
      }
    })();
  };

  // show linked google account info
  const [linked, setLinked] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/social/me/', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || [];
        const g = data.find((d) => d.provider === 'google');
        if (g) setLinked(g);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="page" style={{ padding: 40 }}>
      <section className="auth-card" aria-label="Welcome">
        <h2>Welcome, {name}!</h2>
        <p>Bạn đã đăng nhập thành công.</p>
        {linked ? (
          <p>Đã liên kết Google: <strong>{linked.email}</strong></p>
        ) : (
          <p>Chưa liên kết Google</p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button className="btn btn-google" onClick={handleLinkGoogle}>
            Liên kết với Google
          </button>

          <button className="btn btn-text" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </section>
    </div>
  );
}
