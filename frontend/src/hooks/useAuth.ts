import { useAuthContext } from "@/context/AuthContext";
import * as authApi from "@/lib/api/authApi";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser } = useAuthContext();

  const login = async (email: string, password: string): Promise<void> => {
    await authApi.login({ email, password });
    const me = await authApi.getMe();
    setUser(me);
  };

  const signup = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    await authApi.signup({ email, password, name });
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
  };

  return { user, isAuthenticated, isLoading, login, signup, logout };
}
