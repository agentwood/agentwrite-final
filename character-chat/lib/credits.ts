/**
 * Credit Management System
 * Handles credit deduction, checking, and transactions
 */

import { db } from './db'

// Pricing configuration
export const PRICING_CONFIG = {
    subscription: {
        premium: {
            name: 'Premium',
            priceMonthly: 6.99,
            stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
            benefits: [
                'Unlimited message generations',
                'Unlimited voice generations',
                '50% discount on credit packs',
                'Priority support',
                'Early access to new features',
            ],
        },
    },

    creditPacks: [
        { name: 'Starter', credits: 165, price: 1.99, stripePriceId: process.env.STRIPE_STARTER_PRICE_ID },
        { name: 'Plus', credits: 475, price: 5.99, stripePriceId: process.env.STRIPE_PLUS_PRICE_ID },
        { name: 'Pro', credits: 855, price: 10.99, stripePriceId: process.env.STRIPE_PRO_PRICE_ID },
        { name: 'Ultimate', credits: 9245, price: 119.99, stripePriceId: process.env.STRIPE_ULTIMATE_PRICE_ID },
    ],

    costPerAction: {
        message: 5,
        voice: 10,
        image: 15,
    },
}

export type ActionType = 'message' | 'voice' | 'image' | 'purchase' | 'refund'

interface CreditResult {
    success: boolean
    newBalance: number
    error?: string
}

/**
 * Deduct credits for an action
 */
export async function deductCredits(
    userId: string,
    actionType: Exclude<ActionType, 'purchase' | 'refund'>,
    description?: string
): Promise<CreditResult> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { creditsBalance: true, subscriptionTier: true },
    })

    if (!user) {
        return { success: false, newBalance: 0, error: 'User not found' }
    }

    // Premium users have unlimited generations
    if (user.subscriptionTier === 'premium') {
        return { success: true, newBalance: user.creditsBalance }
    }

    const cost = PRICING_CONFIG.costPerAction[actionType]

    if (user.creditsBalance < cost) {
        return {
            success: false,
            newBalance: user.creditsBalance,
            error: 'Insufficient credits',
        }
    }

    const newBalance = user.creditsBalance - cost

    // Update user balance and create transaction in a transaction
    const [updatedUser] = await db.$transaction([
        db.user.update({
            where: { id: userId },
            data: { creditsBalance: newBalance },
        }),
        db.creditTransaction.create({
            data: {
                userId,
                amount: -cost,
                actionType,
                description: description || `${actionType} generation`,
                balanceAfter: newBalance,
            },
        }),
    ])

    return { success: true, newBalance: updatedUser.creditsBalance }
}

/**
 * Check if user has enough credits
 */
export async function checkCredits(
    userId: string,
    actionType: Exclude<ActionType, 'purchase' | 'refund'>
): Promise<{ hasCredits: boolean; balance: number; required: number }> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { creditsBalance: true, subscriptionTier: true },
    })

    if (!user) {
        return { hasCredits: false, balance: 0, required: 0 }
    }

    // Premium users bypass credit checks
    if (user.subscriptionTier === 'premium') {
        return { hasCredits: true, balance: user.creditsBalance, required: 0 }
    }

    const required = PRICING_CONFIG.costPerAction[actionType]

    return {
        hasCredits: user.creditsBalance >= required,
        balance: user.creditsBalance,
        required,
    }
}

/**
 * Add credits (for purchases or refunds)
 */
export async function addCredits(
    userId: string,
    amount: number,
    actionType: 'purchase' | 'refund',
    description?: string,
    metadata?: Record<string, any>
): Promise<CreditResult> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { creditsBalance: true },
    })

    if (!user) {
        return { success: false, newBalance: 0, error: 'User  not found' }
    }

    const newBalance = user.creditsBalance + amount

    const [updatedUser] = await db.$transaction([
        db.user.update({
            where: { id: userId },
            data: { creditsBalance: newBalance },
        }),
        db.creditTransaction.create({
            data: {
                userId,
                amount,
                actionType,
                description: description || `${actionType}`,
                balanceAfter: newBalance,
                metadata: metadata ? JSON.stringify(metadata) : '{}',
            },
        }),
    ])

    return { success: true, newBalance: updatedUser.creditsBalance }
}

/**
 * Get user's credit balance and subscription status
 */
export async function getUserCredits(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            creditsBalance: true,
            subscriptionTier: true,
            subscriptionStatus: true,
        },
    })

    if (!user) {
        return null
    }

    return {
        balance: user.creditsBalance,
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        isPremium: user.subscriptionTier === 'premium' && user.subscriptionStatus === 'active',
    }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
    userId: string,
    limit: number = 50
): Promise<Array<{
    id: string
    amount: number
    actionType: string
    description: string | null
    balanceAfter: number
    createdAt: Date
}>> {
    const transactions = await db.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            amount: true,
            actionType: true,
            description: true,
            balanceAfter: true,
            createdAt: true,
        },
    })

    return transactions
}
