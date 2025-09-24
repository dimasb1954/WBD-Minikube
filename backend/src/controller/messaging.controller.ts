import { Request, Response } from 'express';
import messagingService from "../service/messaging.service";
import {findSubscriptionById} from "../repository/push.repository";
import webPush from "../config/notification";

class MessagingController {
    public async getChatExists(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            if (idOwn != null){
                const getMessage = await messagingService.getChatExists(BigInt(idOwn));
                res.status(200).json(getMessage);
            } else {
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }

    public async getMessage(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const idTarget = parseInt(req.params.id);
            if (idOwn != null){
                const getMessage = await messagingService.getMessage(BigInt(idOwn), BigInt(idTarget));
                res.status(200).json({
                    userId: idOwn.toString(),
                    targetId: idTarget.toString(),
                    getMessage
                });
            } else {
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }

    public async postMessage(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const idTarget = parseInt(req.params.id);
            const { content } = req.body;
            if (idOwn != null){
                const newMessage = await messagingService.postMessage(BigInt(idOwn), BigInt(idTarget), content);
                // Notify the target user
                const targetUserEndpoint = await findSubscriptionById(BigInt(idTarget));

                webPush.setVapidDetails(
                    'mailto:your-email@example.com',
                    process.env.VAPID_PUBLIC_KEY ?? '',
                    process.env.VAPID_PRIVATE_KEY ?? ''
                );

                // Iterate one by one
                for (const endpoint of targetUserEndpoint) {
                    const payload = JSON.stringify({
                        title: "New message",
                        body: `You have a new message from ${idOwn}`
                    });

                    if (!endpoint.keys || typeof endpoint.keys != 'object') {
                        continue;
                    }

                    webPush.setVapidDetails('mailto:bagassambega@gmail.com',
                        "BEC2OoCVwbXlV2rYR9uJDZyWlybNXCi2X2A-QDamSI1hACoTtofOpu5hpB1kS2tJZMFwa-zNQuSRzkgA57bNQaY",
                        "iIOaflt0e7qYJ5JBM8f7ZeNd1HUc8IfcZ1JDufQo8c4")

                    // Check if endpoint keys contain p256dh and auth
                    let authKeys: string = "";
                    let p256dhKeys: string = "";
                    if ('auth' in endpoint.keys || 'p256dh' in endpoint.keys) {
                        if (typeof endpoint.keys.auth == 'string' && typeof endpoint.keys.p256dh == 'string') {
                            authKeys = endpoint.keys.auth ?? "";
                            p256dhKeys = endpoint.keys.p256dh ?? "";
                        }
                    }
                    // Convert endpoint keys to the format that webPush expects
                    const PushSubscription = {
                        endpoint: endpoint.endpoint,
                        keys: {
                            p256dh: p256dhKeys,
                            auth: authKeys
                        }
                    }
                    await webPush.sendNotification(PushSubscription, payload).catch(error => {
                        console.error('Failed to send notification:', error);
                    });


                }
                res.status(200).json(newMessage);
            } else {
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }

}

export default new MessagingController();