import prisma from '../database/prisma';

class ConnectionRepository {
    public async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                profilePic: true,
            }
        })
    }

    public async getConnectedUsers(id: number) {
        return prisma.connection.findMany({
            where: {
                fromId: id
            },
            include: {
                to: {
                    select: {
                        fullName: true,
                        profilePic: true
                    }
                }
            }
        })
    }

    public async getReceivedRequests(id: number) {
        return prisma.connectionRequest.findMany({
            where: {
                toId: id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                from: {
                    select: {
                        fullName: true,
                        profilePic: true
                    }
                }
            }
        })
    }

    public async getSentRequests(id: number) {
        return prisma.connectionRequest.findMany({
            where: {
                fromId: id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                from: {
                    select: {
                        fullName: true,
                        profilePic: true
                    }
                }
            }
        })
    }

    public async insertConnection(fromId: number, toId: number) {
        return prisma.connection.create({
            data: 
                {fromId: fromId, toId: toId}
        })
    }

    public async insertRequest(fromId: number, toId: number) {
        return prisma.connectionRequest.create({
            data: {
                fromId: fromId,
                toId: toId,
            }
        })
    }

    public async deleteConnection(fromId: number, toId: number) {
        return prisma.connection.delete({
            where: {
                fromId_toId: {fromId, toId}
            }
        })
    }

    public async deleteRequest(fromId: number, toId: number) {
        return prisma.connectionRequest.delete({
            where: {
                fromId_toId: {fromId, toId}
            }
        })
    }

    public async findIndirectConnections(userId: bigint) {
        const firstDegreeConnections = await prisma.connection.findMany({
            where: {
                fromId: userId
            },
            select: {
                fromId: true,
                toId: true
            }
        });
    
        const firstDegreeConnectionIds = new Set(
            firstDegreeConnections.flatMap(conn =>
                conn.fromId === userId ? [conn.toId] : [conn.fromId]
            )
        );
    
        const secondDegreeConnections = await prisma.connection.findMany({
            where: {
                fromId: { in: Array.from(firstDegreeConnectionIds) },
                toId: { not: userId },
            },
            select: {
                fromId: true,
                toId: true
            }
        });
    
        const secondDegreeConnectionIds = new Set(
            secondDegreeConnections.flatMap(conn =>
                firstDegreeConnectionIds.has(conn.fromId) ? [conn.toId] : [conn.fromId]
            )
        );

        const thirdDegreeConnections = await prisma.connection.findMany({
            where: {
                fromId: { in: Array.from(secondDegreeConnectionIds) },
                toId: { notIn: Array.from(secondDegreeConnectionIds).concat([userId]).concat(Array.from(firstDegreeConnectionIds)) }
            },
            select: {
                fromId: true,
                toId: true
            }
        });

        const thirdDegreeConnectionIds = new Set(
            thirdDegreeConnections.flatMap(conn => conn.toId)
        );

        let users2 = await prisma.user.findMany({
            where: {
                id: { in: Array.from(secondDegreeConnectionIds) }
            },
            take: 2,
            select: {
                id: true,
                fullName: true,
                skills: true,
            }
        });
        users2 = users2.map(user => ({
            ...user,
            degree: "2nd"
        }))

        let users3 = await prisma.user.findMany({
            where: {
                id: { in: Array.from(thirdDegreeConnectionIds) }
            },
            take: 2,
            select: {
                id: true,
                fullName: true,
                skills: true,
            }
        });
        users3 = users3.map(user => ({
            ...user,
            degree: "3rd"
        }))
    
        return users2.concat(users3);
    }
    
}
export default new ConnectionRepository();
