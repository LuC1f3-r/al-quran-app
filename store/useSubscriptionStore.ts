/* ------------------------------------------------------------------ */
/*  Subscription Store — Zustand + AsyncStorage                        */
/* ------------------------------------------------------------------ */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PlanId = 'free' | 'basic' | 'premium';

export type SubscriptionState = {
    plan: PlanId;
    isPremium: boolean;
    expiresAt: string | null;
    /** ISO region code, e.g. 'IN', 'US', 'SA' */
    region: string;
    /* actions */
    activatePlan: (plan: PlanId, durationDays?: number) => void;
    deactivate: () => void;
    setRegion: (region: string) => void;
};

/** Reciters available on the free tier (first 2) */
export const FREE_RECITER_IDS = [
    'abdurrahman_as-sudais',
    'mishari_rashid',
] as const;

/** Check if a reciter is locked for free users */
export function isReciterLocked(reciterId: string, plan: PlanId): boolean {
    if (plan === 'premium') return false;
    return !(FREE_RECITER_IDS as readonly string[]).includes(reciterId);
}

/** Region-based pricing table (monthly, in local currency) */
export const PRICING: Record<string, { symbol: string; basic: number; premium: number }> = {
    IN: { symbol: '₹', basic: 49, premium: 99 },
    US: { symbol: '$', basic: 1.99, premium: 3.99 },
    GB: { symbol: '£', basic: 1.49, premium: 2.99 },
    AE: { symbol: 'د.إ', basic: 7, premium: 15 },
    SA: { symbol: '﷼', basic: 7, premium: 15 },
    PK: { symbol: 'Rs', basic: 99, premium: 199 },
    BD: { symbol: '৳', basic: 99, premium: 199 },
    MY: { symbol: 'RM', basic: 4, premium: 9 },
    ID: { symbol: 'Rp', basic: 15000, premium: 30000 },
    TR: { symbol: '₺', basic: 19, premium: 39 },
    NG: { symbol: '₦', basic: 500, premium: 999 },
    EG: { symbol: 'E£', basic: 29, premium: 59 },
    DEFAULT: { symbol: '$', basic: 1.99, premium: 3.99 },
};

export function getPricing(region: string) {
    return PRICING[region] ?? PRICING.DEFAULT;
}

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set) => ({
            plan: 'free',
            isPremium: false,
            expiresAt: null,
            region: 'IN',

            activatePlan: (plan, durationDays = 30) => {
                const expires = new Date();
                expires.setDate(expires.getDate() + durationDays);
                set({
                    plan,
                    isPremium: plan !== 'free',
                    expiresAt: expires.toISOString(),
                });
            },

            deactivate: () =>
                set({
                    plan: 'free',
                    isPremium: false,
                    expiresAt: null,
                }),

            setRegion: (region) => set({ region }),
        }),
        {
            name: 'al-quran-subscription',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
