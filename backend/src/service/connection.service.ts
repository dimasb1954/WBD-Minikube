import connectionRepository from '../repository/connection.repository';
import profileRepository from '../repository/profile.repository';

class ConnectionService {
    public async getAllUsers() {
        try {
            const users = await connectionRepository.getAllUsers();
            return users.map(user => ({
                ...user,
                id: user.id.toString(),
            }));
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getUserNetwork(id: number) {
        try {
            const connections = await connectionRepository.getConnectedUsers(id);
            const received = await connectionRepository.getReceivedRequests(id);
            const sent = await connectionRepository.getSentRequests(id);

            return {
                id: id,
                connections: connections.map(c => c.toId.toString()),
                received: received.map(c => c.fromId.toString()),
                sent: sent.map(c => c.toId.toString()),
            }

        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getConnectedUsers(id: number) {
        try {
            const users = await connectionRepository.getConnectedUsers(id);
            return users.map(user => ({
                ...user,
                fromId: user.fromId.toString(),
                toId: user.toId.toString(),
            }));
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getRequestedUsers(id: number) {
        try {
            const users = await connectionRepository.getReceivedRequests(id);
            return users.map(user => ({
                        ...user,
                        fromId: user.fromId.toString(),
                        toId: user.toId.toString(),
                    }));
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async insertConnection(fromId: number, toId: number) {
        try {
            const isRequest = await profileRepository.getIsRequest(BigInt(fromId), BigInt(toId));
            if (isRequest) {
                const connection1 = await connectionRepository.insertConnection(fromId, toId);
                const connection2 = await connectionRepository.insertConnection(toId, fromId);
                const request = await connectionRepository.deleteRequest(fromId, toId);

                return {
                    connection: [
                        {...connection1, fromId: connection1.fromId.toString(), toId: connection1.toId.toString()},
                        {...connection2, fromId: connection2.fromId.toString(), toId: connection2.toId.toString()}
                    ],
                    request: {
                        ...request,
                        fromId: request.fromId.toString(),
                        toId: request.toId.toString()
                    }
                }
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async insertRequest(fromId: number, toId: number) {
        try {
            const isConnect = await profileRepository.getIsConnect(BigInt(fromId), BigInt(toId));
            if (!isConnect) {
                const request = await connectionRepository.insertRequest(fromId, toId);

                return {
                    ...request,
                    fromId: request.fromId.toString(),
                    toId: request.toId.toString(),
                };
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async deleteConnection(fromId: number, toId: number) {
        try {
            const connection1 = await connectionRepository.deleteConnection(fromId, toId);
            const connection2 = await connectionRepository.deleteConnection(toId, fromId);

            return {
                connection: [
                    {...connection1, fromId: connection1.fromId.toString(), toId: connection1.toId.toString()},
                    {...connection2, fromId: connection2.fromId.toString(), toId: connection2.toId.toString()}
                ],
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async deleteRequest(fromId: number, toId: number) {
        try {
            const request = await connectionRepository.deleteRequest(fromId, toId);

            return {
                request: {...request, fromId: request.fromId.toString(), toId: request.toId.toString()}
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getRecomendation(fromId: bigint) {
        try {
            const users = await connectionRepository.findIndirectConnections(fromId);
            return users.map(user => ({
                ...user,
                id: user.id.toString(),
            }));
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }
}

export default new ConnectionService();
