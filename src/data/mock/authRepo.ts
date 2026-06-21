import type { Profile } from '@/domain/types';
import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import type { AuthRepo, Session } from '@/data/repository';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

interface StoredUser extends Profile {
  password: string; // plaintext — mock only; never do this against a real backend
}

// Seed accounts so the app is usable immediately. Documented on the login page.
const SEED_USERS: StoredUser[] = [
  {
    id: 'admin-seed',
    email: 'admin@reframe.studio',
    password: 'reframe',
    displayName: 'Depot Admin',
    role: 'admin',
  },
  {
    id: 'user-seed',
    email: 'designer@reframe.studio',
    password: 'reframe',
    displayName: 'Sample Designer',
    role: 'user',
  },
];

function loadUsers(): StoredUser[] {
  const stored = readJSON<StoredUser[] | null>(STORAGE_KEYS.users, null);
  if (stored && stored.length) return stored;
  writeJSON(STORAGE_KEYS.users, SEED_USERS);
  return SEED_USERS;
}
function saveUsers(users: StoredUser[]): void {
  writeJSON(STORAGE_KEYS.users, users);
}

function toProfile(u: StoredUser): Profile {
  const { password: _password, ...profile } = u;
  return profile;
}

function setSession(profile: Profile): Session {
  writeJSON(STORAGE_KEYS.session, profile);
  return { profile };
}

export const mockAuthRepo: AuthRepo = {
  async signUp(email, password, displayName) {
    await delay();
    const users = loadUsers();
    const normalised = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalised)) {
      throw new Error('An account with that email already exists.');
    }
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: normalised,
      password,
      displayName: displayName.trim() || normalised.split('@')[0],
      role: 'user',
    };
    users.push(user);
    saveUsers(users);
    return setSession(toProfile(user));
  },

  async signIn(email, password) {
    await delay();
    const normalised = email.trim().toLowerCase();
    const user = loadUsers().find((u) => u.email.toLowerCase() === normalised);
    if (!user || user.password !== password) {
      throw new Error('Incorrect email or password.');
    }
    return setSession(toProfile(user));
  },

  async magicLink(email) {
    await delay();
    const normalised = email.trim().toLowerCase();
    const users = loadUsers();
    let user = users.find((u) => u.email.toLowerCase() === normalised);
    if (!user) {
      // Simulated magic link auto-provisions a fresh user account.
      user = {
        id: crypto.randomUUID(),
        email: normalised,
        password: crypto.randomUUID(),
        displayName: normalised.split('@')[0],
        role: 'user',
      };
      users.push(user);
      saveUsers(users);
    }
    return setSession(toProfile(user));
  },

  async signOut() {
    await delay(60);
    removeKey(STORAGE_KEYS.session);
  },

  async currentSession() {
    const profile = readJSON<Profile | null>(STORAGE_KEYS.session, null);
    return profile ? { profile } : null;
  },
};
