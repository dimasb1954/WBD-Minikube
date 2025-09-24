import prisma from '../database/prisma';

class MessagingRepository {
    public async getChatExists(userId: bigint) {
        const connections = await prisma.connection.findMany({
            where: {
                toId: userId
            },
            select: {
              from: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          })
          return connections.map(connection => ({
            id: connection.from.id.toString(),
            fullName: connection.from.fullName,
        }));
    }
    

    public async getMessage(fromId: bigint, toId: bigint) {
        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    { fromId: fromId, toId: toId },
                    { fromId: toId, toId: fromId }
                ]
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        return chats.map(chat => ({
            ...chat,
            id: chat.id.toString(),
            timestamp: chat.timestamp,
            fromId: chat.fromId.toString(),
            toId: chat.toId.toString(),
            message: chat.message
        }));

    }

    public async postMessage(fromId: bigint, toId: bigint, content: string) {
        try {
            await prisma.chat.create({
                data: {
                    fromId: fromId,
                    toId: toId,
                    message: content,
                    timestamp: new Date(), // Automatically set current timestamp
                }
            });
            const chats = await prisma.chat.findMany({
                where: {
                    OR: [
                        { fromId: fromId, toId: toId },
                        { fromId: toId, toId: fromId }
                    ]
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1,
            });
    
            return chats.map(chat => ({
                ...chat,
                id: chat.id.toString(),
                timestamp: chat.timestamp,
                fromId: chat.fromId.toString(),
                toId: chat.toId.toString(),
                message: chat.message
            }));
        } catch (error: unknown) {
            console.error('Error posting message:', error);
            throw error;
        }
        
    }
}

export default new MessagingRepository();