import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  avatar?: string;
  company?: string;
  cvUrl?: string;
  phone?: string;
  gender?: string; // backend uses gender codes (e.g. 'MALE', 'FEMALE')
  dob?: string; // "YYYY-MM-DD"
}

type RegisterInput = {
  username?: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  gender?: string; // send backend gender code (e.g. 'MALE')
  dob?: string; // "YYYY-MM-DD"
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'jobfinder_auth';
const TOKEN_KEY = 'jobfinder_tokens';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

async function postJSON(url: string, body: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
}

async function getJSON(url: string, token?: string) {
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user synchronously from localStorage so page refresh preserves session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const saveUserAndTokens = (u: User, tokens?: { access: string; refresh?: string }) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // use username to obtain token
      const tokenResp = await postJSON(`${API_BASE}/api/users/token/`, { username, password });
      const access = tokenResp.access;
      const refresh = tokenResp.refresh;

      // fetch current user and profile, then merge
      const me = await getJSON(`${API_BASE}/api/users/me/`, access);
      try {
        const profile = await getJSON(`${API_BASE}/api/users/profiles/me/`, access);
        if (profile) {
          me.dob = profile.dob ?? me.dob;
          me.gender = profile.gender ?? me.gender;
        }
      } catch (e) {
        // profile may not exist yet
      }
      const fullName = [me.first_name, me.last_name].filter(Boolean).join(' ').trim();
      const avatar = me.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(me.email || me.username || String(me.id))}`;
      const u: User = {
        id: String(me.id),
        email: me.email,
        username: me.username,
        first_name: me.first_name,
        last_name: me.last_name,
        name: fullName || undefined,
        avatar,
        phone: me.phone,
        gender: me.gender,
        dob: me.dob,
      };
      saveUserAndTokens(u, { access, refresh });
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (data: RegisterInput): Promise<boolean> => {
    try {
      // split name
      const name = data.name.trim();
      const [first_name, ...rest] = name.split(/\s+/);
      const last_name = rest.join(' ');

      // prepare payload for backend
      const payload = {
        username: data.username || data.email, // prefer explicit username, fall back to email
        password: data.password,
        first_name: first_name || '',
        last_name: last_name || '',
        email: data.email,
        phone: data.phone || '',
        role_code: 'USER',
        status_code: 'PENDING_VERIFICATION',
      };

      await postJSON(`${API_BASE}/api/users/register/`, payload);

      // immediately obtain tokens and fetch profile
      const tokenResp = await postJSON(`${API_BASE}/api/users/token/`, { username: data.email, password: data.password });
      const access = tokenResp.access;
      const refresh = tokenResp.refresh;

      // If dob or gender provided, set profile via protected endpoint first
      if (data.dob || data.gender) {
        try {
          await fetch(`${API_BASE}/api/users/profiles/me/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access}`,
            },
            body: JSON.stringify({ dob: data.dob || null, gender: data.gender || null }),
          });
        } catch (e) {
          // ignore
        }
      }

      // fetch current user and profile, then merge
      const me = await getJSON(`${API_BASE}/api/users/me/`, access);
      try {
        const profile = await getJSON(`${API_BASE}/api/users/profiles/me/`, access);
        if (profile) {
          me.dob = profile.dob ?? me.dob;
          me.gender = profile.gender ?? me.gender;
        }
      } catch (e) {
        // ignore
      }
      const fullNameR = [me.first_name, me.last_name].filter(Boolean).join(' ').trim();
      const avatarR = me.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(me.email || me.username || String(me.id))}`;
      const u: User = {
        id: String(me.id),
        email: me.email,
        username: me.username,
        first_name: me.first_name,
        last_name: me.last_name,
        name: fullNameR || undefined,
        avatar: avatarR,
        phone: me.phone,
        gender: me.gender,
        dob: me.dob,
      };

      saveUserAndTokens(u, { access, refresh });

      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const tok = localStorage.getItem(TOKEN_KEY);
      if (!tok) throw new Error('Not authenticated');
      const { access } = JSON.parse(tok);

      // update user basic fields via /api/users/me/
      const body: any = {};
      if (data.first_name !== undefined) body.first_name = data.first_name;
      if (data.last_name !== undefined) body.last_name = data.last_name;
      if (data.email !== undefined) body.email = data.email;
      if (data.phone !== undefined) body.phone = data.phone;

      if (Object.keys(body).length > 0) {
        await fetch(`${API_BASE}/api/users/me/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          body: JSON.stringify(body),
        });
      }

      // update profile (dob/gender) via profiles/me/
      const profileBody: any = {};
      if (data.dob !== undefined) profileBody.dob = data.dob;
      if (data.gender !== undefined) {
        // frontend should provide backend gender code (e.g. 'MALE') — pass through
        profileBody.gender = data.gender as any;
      }
      if (Object.keys(profileBody).length > 0) {
        await fetch(`${API_BASE}/api/users/profiles/me/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          body: JSON.stringify(profileBody),
        });
      }

      // refresh local user and merge profile
      const me = await getJSON(`${API_BASE}/api/users/me/`, access);
      try {
        const profile = await getJSON(`${API_BASE}/api/users/profiles/me/`, access);
        if (profile) {
          me.dob = profile.dob ?? me.dob;
          me.gender = profile.gender ?? me.gender;
        }
      } catch (e) {
        // ignore
      }
      const fullNameU = [me.first_name, me.last_name].filter(Boolean).join(' ').trim();
      const avatarU = me.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(me.email || me.username || String(me.id))}`;
      const u: User = {
        id: String(me.id),
        email: me.email,
        username: me.username,
        first_name: me.first_name,
        last_name: me.last_name,
        name: fullNameU || undefined,
        avatar: avatarU,
        phone: me.phone,
        gender: me.gender,
        dob: me.dob,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
