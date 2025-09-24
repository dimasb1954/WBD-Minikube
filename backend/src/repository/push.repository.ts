import prisma from '../database/prisma';
import { PushSubscription } from '@prisma/client';

export async function create(data: {
        endpoint: string,
        userId: bigint,
        keys: any
}): Promise<PushSubscription> {
    return prisma.pushSubscription.create({
        data: {
            endpoint: data.endpoint,
            userId: data.userId,
            keys: data.keys
        }
    });
}

export async function findSubscriptionById(userId: bigint): Promise<PushSubscription[]> {
    return prisma.pushSubscription.findMany({
        where: {
            userId: userId
        }
    });
}

export async function findSubscriptionByEndpoint(endpoint: string) {
    return prisma.pushSubscription.findUnique({
        where: {
            endpoint: endpoint
        }
    });
}

export async function findSubscriptionByIdEndpoint(endpoint: string, id: bigint) {
    return prisma.pushSubscription.findFirst({
        where: {
            userId: id,
            endpoint: {
                contains: endpoint
            }
        }
    })
}

export async function deleteSubscription(subscriptionId: string): Promise<PushSubscription> {
    return prisma.pushSubscription.delete({
        where: {
            endpoint: subscriptionId
        }
    });
}