import { jwtDecode } from "jwt-decode";

export type UserRole = "super_admin" | "admin" | "teacher" | "student" | "parent";

interface JWTPayload {
  sub: string;
  email: string;
  app_metadata: {
    role: UserRole;
    school_id?: string;
  };
  user_metadata?: Record<string, unknown>;
  exp: number;
}

const SESSION_KEY = "sms_session";

export interface Session {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    school_id: string;
    name?: string;
  };
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
}

export function saveSession(data: { session: { access_token: string; refresh_token: string }; user: { id: string; email: string; app_metadata: { role: UserRole; school_id?: string }; user_metadata?: { name?: string } } }): Session {
  const session: Session = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.app_metadata.role,
      school_id: data.user.app_metadata.school_id ?? "",
      name: data.user.user_metadata?.name as string | undefined,
    },
  };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function updateSessionTokens(tokens: { access_token: string; refresh_token: string }): Session | null {
  const session = getSession();
  if (!session) return null;
  const updated: Session = { ...session, access_token: tokens.access_token, refresh_token: tokens.refresh_token };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getRoleRedirect(role: UserRole): string | null {
  const map: Record<UserRole, string> = {
    super_admin: "/super-admin/dashboard",
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    student: "/student/dashboard",
    parent: "/parent/dashboard",
  };
  return map[role] ?? null;
}

export function updateSessionName(name: string) {
  const session = getSession();
  if (!session) return;
  session.user.name = name;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateSessionEmail(email: string) {
  const session = getSession();
  if (!session) return;
  session.user.email = email;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
