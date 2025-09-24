import messagingRepository from '../repository/messaging.repository';

class MessagingService {
    public async getChatExists(fromId: bigint) {
        try {
            return await messagingRepository.getChatExists(fromId);
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getMessage(fromId: bigint, toId: bigint) {
        try {
            return await messagingRepository.getMessage(fromId, toId);
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async postMessage(fromId: bigint, toId: bigint, content: string) {
        try {
            return await messagingRepository.postMessage(fromId, toId, content);
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }
}

export default new MessagingService();
