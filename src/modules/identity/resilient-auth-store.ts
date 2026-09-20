import { UserRole } from "@prisma/client";
import { TokenService } from "./token.service";
import { SessionWithUser } from "./session.service";

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: { role: UserRole }[];
  createdAt: Date;
}

export interface StoredSession {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  lastActiveAt: Date;
}

interface AuthStoreState {
  users: Map<string, StoredUser>;
  sessions: Map<string, StoredSession>;
}

// Precomputed scrypt hashes for instant offline demo account access
const DEMO_HASHES = {
  psychologist:
    "scrypt:822a832b12d2bdd4be574783a5be07e7:c756cc900c7d5335b65786295aeda56b4e0351bb096b4b9ea01e611a7cb5e0a67c95003eff8f5e5f132963391de848cdc87ab935bb31b0966e477163593b7c92", // PsychologistPassword!123
  client:
    "scrypt:c076d18f5baf2d08380e669b7fee848b:ca8d74d724fd97e0403347c64dd491797bc64892183b79b412d3bc7384017cfc06129ef8db0e4dadf11a432c58b4b26d49f17d363148da406f0a06ce2ae614a3", // ClientPassword!123
  admin:
    "scrypt:13d0775a2fa89f2e1f43fa361cc40c45:c1272447f70417cbcd257716aad18e2e601bc140456e6fd440c89ac0434f8a02f68259040f58843e702ed7a54672b79f474adfcd7fb96cfb0fefd17c7a6fb235", // AdminSecurePassword!123
};

function initStore(): AuthStoreState {
  const users = new Map<string, StoredUser>();
  const sessions = new Map<string, StoredSession>();

  // Seed default demo accounts
  const demoAccounts = [
    {
      id: "demo-psychologist-id",
      email: "psychologist@mindrefill.com",
      fullName: "Dr. Sarah Jenkins",
      passwordHash: DEMO_HASHES.psychologist,
      role: UserRole.PSYCHOLOGIST,
    },
    {
      id: "demo-client-id",
      email: "client@mindrefill.com",
      fullName: "Alex Rivera",
      passwordHash: DEMO_HASHES.client,
      role: UserRole.CLIENT,
    },
    {
      id: "demo-admin-id",
      email: "admin@mindrefill.com",
      fullName: "Mind Refill Administrator",
      passwordHash: DEMO_HASHES.admin,
      role: UserRole.ADMIN,
    },
  ];

  for (const acc of demoAccounts) {
    users.set(acc.email.toLowerCase(), {
      id: acc.id,
      email: acc.email.toLowerCase(),
      fullName: acc.fullName,
      passwordHash: acc.passwordHash,
      isActive: true,
      isEmailVerified: true,
      roles: [{ role: acc.role }],
      createdAt: new Date(),
    });
  }

  return { users, sessions };
}

const globalStore = globalThis as unknown as {
  __mindRefillAuthStore?: AuthStoreState;
};

if (!globalStore.__mindRefillAuthStore) {
  globalStore.__mindRefillAuthStore = initStore();
}

const store = globalStore.__mindRefillAuthStore;

export class ResilientAuthStore {
  static getUser(email: string): StoredUser | null {
    return store.users.get(email.trim().toLowerCase()) ?? null;
  }

  static getUserById(id: string): StoredUser | null {
    for (const user of store.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  static createUser(params: {
    email: string;
    fullName: string;
    passwordHash: string;
    role: UserRole;
  }): StoredUser {
    const emailNorm = params.email.trim().toLowerCase();
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const user: StoredUser = {
      id,
      email: emailNorm,
      fullName: params.fullName.trim(),
      passwordHash: params.passwordHash,
      isActive: true,
      isEmailVerified: true,
      roles: [{ role: params.role }],
      createdAt: new Date(),
    };
    store.users.set(emailNorm, user);
    return user;
  }

  static saveSession(params: {
    userId: string;
    tokenHash: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    expiresAt: Date;
  }): StoredSession {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const session: StoredSession = {
      id: sessionId,
      userId: params.userId,
      tokenHash: params.tokenHash,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      expiresAt: params.expiresAt,
      lastActiveAt: new Date(),
    };
    store.sessions.set(params.tokenHash, session);
    return session;
  }

  static validateSession(rawToken: string): SessionWithUser | null {
    if (!rawToken || typeof rawToken !== "string" || rawToken.length !== 64) {
      return null;
    }

    const tokenHash = TokenService.hashToken(rawToken);
    const session = store.sessions.get(tokenHash);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      store.sessions.delete(tokenHash);
      return null;
    }

    const user = this.getUserById(session.userId);
    if (!user || !user.isActive) return null;

    session.lastActiveAt = new Date();

    return {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  static deleteSession(rawToken: string): void {
    if (!rawToken) return;
    const tokenHash = TokenService.hashToken(rawToken);
    store.sessions.delete(tokenHash);
  }
}
