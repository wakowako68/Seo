import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export function getPrisma() {
    if (typeof window !== 'undefined') {
        throw new Error('Prisma cannot be used on the client side.');
    }

    if (!globalThis.prisma) {
        globalThis.prisma = prismaClientSingleton();
    }
    return globalThis.prisma;
}

// Keep the default export but make it the getter for backward compatibility or just export the getter
const prisma = getPrisma;
export default prisma;
