import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "owner" | "manager" | "teller";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  photo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

// Define granular permissions
export type Permission =
  | "view_cash_disbursed"
  | "view_cash_collected"
  | "view_total_capital"
  | "manage_users"
  | "view_reports"
  | "create_loan"
  | "process_redemption"
  | "process_renewal";

// Role-permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    "view_cash_disbursed",
    "view_cash_collected",
    "view_total_capital",
    "manage_users",
    "view_reports",
    "create_loan",
    "process_redemption",
    "process_renewal",
  ],
  manager: [
    "view_cash_collected",
    "view_reports",
    "create_loan",
    "process_redemption",
    "process_renewal",
  ],
  teller: [
    "create_loan",
    "process_redemption",
    "process_renewal",
  ],
};

// Mock users for demo
const mockUsers: AuthUser[] = [
  {
    id: "1",
    name: "Bob",
    email: "bob@gmail.com",
    role: "owner",
    branchId: "1",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Billy",
    email: "billy@gmail.com",
    role: "manager",
    branchId: "1",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Benson",
    email: "benson@gmail.com",
    role: "teller",
    branchId: "1",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];

const AUTH_STORAGE_KEY = "auth-user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login - find user by email
    const foundUser = mockUsers.find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
