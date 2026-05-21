type JwtPayload = Record<string, unknown>;

const ADMIN_ROLES = new Set(['admin', 'superadmin']);

const normalizeRole = (role: string) => role.replace(/[\s_-]/g, '').toLowerCase();

const parseClaimValue = (claimValue: unknown): string[] => {
    if (Array.isArray(claimValue)) {
        return claimValue.flatMap(parseClaimValue);
    }

    if (typeof claimValue !== 'string') {
        return [];
    }

    const trimmedValue = claimValue.trim();

    if (!trimmedValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(trimmedValue);
        if (Array.isArray(parsedValue)) {
            return parsedValue.flatMap(parseClaimValue);
        }
    } catch {
        // Some backends send a plain role string instead of a JSON array.
    }

    return [trimmedValue];
};

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split('.')[1];

        if (!base64Url) {
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
        const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map((char) => {
            return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export const getTokenRoles = (token: string | null): string[] => {
    if (!token) {
        return [];
    }

    const payload = decodeToken(token);

    if (!payload) {
        return [];
    }

    const roleClaim =
        payload.roles ??
        payload.role ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return parseClaimValue(roleClaim);
};

export const hasAdminRole = (token: string | null) => {
    return getTokenRoles(token).some((role) => ADMIN_ROLES.has(normalizeRole(role)));
};
