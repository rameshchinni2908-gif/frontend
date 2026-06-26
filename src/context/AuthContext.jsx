import {
    default as React,
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo
} from "react";
import api from '../services/api';
import {
    clearAuthSession,
    getAccessToken,
    getStoredUser,
    persistAuthSession
} from '../utils/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({
    children
}) => {

    const [user, setUser] =
        useState(getStoredUser());
    const [token, setToken] =
        useState(getAccessToken() || null);
    const [isAuthLoading, setIsAuthLoading] =
        useState(true);

    const login = useCallback((userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        persistAuthSession({
            user: userData,
            accessToken: authToken
        });
    }, []);

    const logout = useCallback(async () => {
        try {
            if (getAccessToken()) {
                await api.post('/auth/logout');
            }
        } catch {
            // Best-effort logout; local cleanup still needs to happen.
        }

        setUser(null);
        setToken(null);
        clearAuthSession();
    }, []);

    useEffect(() => {
        const bootstrapSession = async () => {
            try {
                const response = await api.post('/auth/refresh-token', undefined, {
                    skipAuthRefresh: true
                });

                persistAuthSession({
                    user: response.data.user,
                    accessToken: response.data.accessToken
                });
            } catch {
                clearAuthSession();
            } finally {
                setIsAuthLoading(false);
            }
        };

        const handleSessionUpdated = (event) => {
            setUser(event.detail?.user || getStoredUser());
            setToken(event.detail?.token || getAccessToken());
        };

        const handleLogout = () => {
            setUser(null);
            setToken(null);
        };

        window.addEventListener('auth:session-updated', handleSessionUpdated);
        window.addEventListener('auth:logout', handleLogout);
        bootstrapSession();

        return () => {
            window.removeEventListener('auth:session-updated', handleSessionUpdated);
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, []);

    const value = useMemo(() => ({
        user,
        setUser,
        token,
        setToken,
        login,
        logout,
        isAuthLoading,
        isAuthenticated: !!token
    }), [user, token, login, logout, isAuthLoading]);

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);