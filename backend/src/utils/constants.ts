// leading endpoints
export const BACKEND_API = `http://localhost:${import.meta.env.SERVER_PORT}` || "http://localhost:8080";

// apis
export const REFRESH_ACCESS_URL = `${BACKEND_API}/api/auth/refresh`;
export const VALIDATE_TOKENS_URL = `${BACKEND_API}/api/auth/validate`;
export const LOGIN_URL = `${BACKEND_API}/api/auth/login`;
export const REGISTER_URL = `${BACKEND_API}/api/auth/register`;

export const ALL_USERS_URL = `${BACKEND_API}/api/user/`;
export const ONE_USER_URL = `${BACKEND_API}/api/user`;

export const ALL_ATTENDANCES_URL = `${BACKEND_API}/api/attendance/`;
export const ONE_ATTENDANCE_URL = `${BACKEND_API}/api/attendance`;