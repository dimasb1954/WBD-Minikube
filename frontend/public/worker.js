console.log('Service worker loaded...');

self.addEventListener('push', async (event) => {
    try {
        const data = event.data.json();
        await self.registration.showNotification(data.title, {
            body: data.body,
        })
    } catch (error) {
        console.error('Error fetching push data: ', error, " by event: ", event);
    }
})