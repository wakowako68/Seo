import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Lazy-loading proxy to prevent initialization during module evaluation (build-time)
const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
    get: (target, prop, receiver) => {
        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton();
        }
        return Reflect.get(globalThis.prisma, prop, receiver);
    },
});

export default prisma;
