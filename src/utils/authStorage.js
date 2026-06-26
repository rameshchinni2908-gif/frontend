export const USER_KEY = 'authUser';

let accessTokenMemory = null;

export const getAccessToken = () => accessTokenMemory;

export const setAccessToken = (token) => {
    accessTokenMemory = token || null;
};


export const getStoredUser = () => {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        return null;
    }
};

export const persistAuthSession = ({ user, accessToken }) => {
    setAccessToken(accessToken);

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    window.dispatchEvent(new CustomEvent('auth:session-updated', {
        detail: {
            user,
            token: accessToken
        }
    }));
};

export const clearAuthSession = () => {
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);

    window.dispatchEvent(new Event('auth:logout'));
};