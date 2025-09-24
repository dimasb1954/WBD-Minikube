import webPush from "web-push";
import config from "./environment";

// Config the web push
const publicKey = config.vapidPublicKey;
const privateKey = config.vapidPrivateKey;

if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not found');
}

webPush.setVapidDetails(
    'mailto:bagassambega@gmail.com',
    publicKey, privateKey
)

export default webPush;