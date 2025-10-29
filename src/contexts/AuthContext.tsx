import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'jobseeker' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  cvUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, company?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'jobfinder_auth';
const USERS_KEY = 'jobfinder_users';

// Initialize with demo accounts
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const demoUsers: User[] = [
      {
        id: '1',
        email: 'jobseeker@demo.com',
        name: 'Nguyễn Văn A',
        role: 'jobseeker',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jobseeker',
      },
      {
        id: '2',
        email: 'employer@demo.com',
        name: 'Công ty ABC',
        role: 'employer',
        company: 'Công ty TNHH ABC',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ABC',
      },
      {
        id: '3',
        email: 'admin@demo.com',
        name: 'Admin',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
    localStorage.setItem('jobfinder_passwords', JSON.stringify({
      'jobseeker@demo.com': 'demo123',
      'employer@demo.com': 'demo123',
      'admin@demo.com': 'admin123',
    }));
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeUsers();
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      setUser(JSON.parse(savedAuth));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const passwords = JSON.parse(localStorage.getItem('jobfinder_passwords') || '{}');
    
    const foundUser = users.find(u => u.email === email);
    if (foundUser && passwords[email] === password) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    company?: string
  ): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const passwords = JSON.parse(localStorage.getItem('jobfinder_passwords') || '{}');
    
    if (users.find(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      company,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    users.push(newUser);
    passwords[email] = password;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem('jobfinder_passwords', JSON.stringify(passwords));
    
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
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
