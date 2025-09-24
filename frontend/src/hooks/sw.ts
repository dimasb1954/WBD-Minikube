import api, {isJwtExist} from '../api/api';

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

if (!publicVapidKey) {
    console.error('VAPID_PUBLIC_KEY is not defined');
}

if ('serviceWorker' in navigator && isJwtExist()) {
    checkNotificationAlreadyRegistered().catch(err => console.error(err));
}

async function checkNotificationAlreadyRegistered() {
    // await api.get('/push/check').then(response => {
    //     if (response.status === 200) {
    //         console.log('Notification already registered');
    //     } else {
    //         checkNotificationPermission().catch(err => console.error(err));
    //     }
    // })
    await checkNotificationPermission();
}

async function checkNotificationPermission() {
    // Try 4 times in 1 second each
    for (let i = 0; i < 4; i++) {
        const permission = await Notification.requestPermission();
        await new Promise(resolve => setTimeout(resolve, 2500));
        if (permission === 'granted') {
            await send().catch(err => console.error(err));
            return;
        } else if (permission === 'denied') {
            console.log('Notification permission not granted');
            return;
        }
    }
}

async function send() {
    console.log('Registering service worker...');
    const isRegistered = await navigator.serviceWorker.getRegistration();
    if (isRegistered) {
        console.log("Already registered");
        return;
    }
    const register = await navigator.serviceWorker.register('/worker.js', {
        scope: '/'
    });
    console.log('Service worker registered...');

    // Register push
    console.log('Registering push...');
    console.log(publicVapidKey);
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await urlBase64ToUint8Array(publicVapidKey)
    })
    console.log("Push registered");

    // Send push notification
    console.log('Sending push...');
    await api.post('/push/subscribe', subscription).then(response => {
        if (response.status === 201) {
            console.log('Subscription saved');
        } else if (response.status === 200) {
            console.log(response.data.message);
        } else {
            console.error('Failed to save subscription');
        }
    });
}

async function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const output = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        output[i] = rawData.charCodeAt(i);
    }

    return output;
}