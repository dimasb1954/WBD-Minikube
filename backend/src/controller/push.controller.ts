import {Response, Request} from "express";
import pushService from "../service/push.service";
import webPush from "../config/notification";

class PushController {
    async saveSubscription(req: Request, res: Response) {
        try {
            const subscription = req.body;

            // Validate the JWT
            if (!req.jwt) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            webPush.setVapidDetails('mailto:bagassambega@gmail.com',
                "BEC2OoCVwbXlV2rYR9uJDZyWlybNXCi2X2A-QDamSI1hACoTtofOpu5hpB1kS2tJZMFwa-zNQuSRzkgA57bNQaY",
                "iIOaflt0e7qYJ5JBM8f7ZeNd1HUc8IfcZ1JDufQo8c4")

            if (!subscription) {
                return res.status(400).json({
                    success: false,
                    message: 'Subscription is required'
                });
            }

            const userId = req.jwt?.userId; // Get user id (remember this is already checked by middleware)

            // Dummy notification
            webPush.sendNotification(subscription, JSON.stringify({
                title: 'Welcome to the club!',
                body: 'You are now subscribed to our notifications. You will receive notifications from now on.'
            })).catch(error => {
                console.error('Notification Error:', error);
            })

            // Check first if the subscription already exists
            const existingSubscription = await pushService.checkEndpointExists(subscription.endpoint);
            if (existingSubscription) {
                return res.status(200).json({
                    success: false,
                    message: 'Subscription already exists'
                });
            }

            // If don't, save the subscription
            try {
                await pushService.saveSubscription(
                    BigInt(userId),
                    subscription
                );
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save subscription'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Subscription saved'
            });

            const payload = JSON.stringify({
                title: "You're subscribed!",
                body: "You'll now receive notifications from now on. Just keep in touch, or we'll touch you (by the notif ofc)"
            });
            await webPush.sendNotification(subscription, payload).catch(error => {
                console.error('Detailed Notification Error:', {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    errno: error.errno,
                    syscall: error.syscall,
                    hostname: error.hostname,
                    stack: error.stack
                });
            });
        } catch (error) {
            console.error('Subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save subscription'
            });
        }
    }

    async checkNotificationRegistered(req: Request, res: Response) {
        if (!req.jwt) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const subscription = req.body;

        // Check if user and the browser already registered
        const exists = await pushService.checkEndpointExists(subscription);

        try {
            if (exists != null) {
                await webPush.sendNotification(subscription, JSON.stringify({
                    title: "You're already subscribed!",
                    body: "Hello!"
                }))
                return res.status(200);
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not registered'
                });
            }
        } catch (error) {
            console.error('Check notification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check notification'
            });
        }
    }
}

export default new PushController();