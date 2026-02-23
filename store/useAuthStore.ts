/* ------------------------------------------------------------------ */
/*  Auth Store — persisted via AsyncStorage                           */
/* ------------------------------------------------------------------ */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserProfile = {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    authMethod: 'google' | 'apple' | 'email';
    avatarUrl?: string;
};

type AuthState = {
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    user: UserProfile | null;
    login: (user: UserProfile) => void;
    signup: (user: UserProfile) => void;
    logout: () => void;
    skipOnboarding: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            user: null,

            login: (user) =>
                set({
                    isAuthenticated: true,
                    hasCompletedOnboarding: true,
                    user,
                }),

            signup: (user) =>
                set({
                    isAuthenticated: true,
                    hasCompletedOnboarding: true,
                    user,
                }),

            logout: () =>
                set({
                    isAuthenticated: false,
                    user: null,
                }),

            skipOnboarding: () =>
                set({
                    hasCompletedOnboarding: true,
                }),
        }),
        {
            name: 'al-quran-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
