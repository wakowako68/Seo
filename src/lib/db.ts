import type { PrismaClient } from '@prisma/client';

declare global {
    var prisma: undefined | PrismaClient;
}

export async function getPrisma() {
    if (typeof window !== 'undefined') {
        throw new Error('Prisma cannot be used on the client side.');
    }

    if (!globalThis.prisma) {
        // Ultimate lazy: Only import when needed
        const { PrismaClient } = await import('@prisma/client');

        globalThis.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    }
    return globalThis.prisma;
}

// Keep the default export but make it the getter for backward compatibility
const prisma = getPrisma;
export default prisma;
