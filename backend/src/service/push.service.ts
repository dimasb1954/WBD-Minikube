import * as pushRepository from '../repository/push.repository';
import {JsonValue} from "@prisma/client/runtime/library";

class PushService {

    async saveSubscription(userId: bigint, subscription: any) {
        await pushRepository.create({
            endpoint: subscription.endpoint,
            userId: userId,
            keys: subscription.keys
        });
    }

    async checkEndpointExists(endpoint: string) {
        return await pushRepository.findSubscriptionByEndpoint(endpoint);
    }
}

export async function convertToPushSubscription(endpoint: { keys: JsonValue; endpoint: any; }) {
    let authKeys: string = "";
    let p256dhKeys: string = "";
    if (!endpoint.keys || typeof endpoint.keys != 'object') {
        return;
    }
    if ('auth' in endpoint.keys || 'p256dh' in endpoint.keys) {
        if (typeof endpoint.keys.auth == 'string' && typeof endpoint.keys.p256dh == 'string') {
            authKeys = endpoint.keys.auth ?? "";
            p256dhKeys = endpoint.keys.p256dh ?? "";
        }
    }
    console.log(authKeys, p256dhKeys);
    // Convert endpoint keys to the format that webPush expects
    return {
        endpoint: endpoint.endpoint,
        keys: {
            p256dh: p256dhKeys,
            auth: authKeys
        }
    };
}

export default new PushService();