import prisma from '../database/prisma';

class ProfileRepository {
    public async getProfile(id: bigint) {
        try {
            return await prisma.user.findUnique({
                where: {
                    id: id
                },
                include: {
                    _count: {
                        select: {
                            connectionsInitiated: true
                        },
                    },
                },
            });
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getIsConnect(idOwn: bigint, idTarget: bigint) {
        try {
            return prisma.connection.findUnique({
                where: {
                    fromId_toId: {
                      fromId: idOwn,
                      toId: idTarget,
                    },
                  },
              });

        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getIsRequest(idOwn: bigint, idTarget: bigint) {
        try {
            return prisma.connectionRequest.findUnique({
                where: {
                    fromId_toId: {
                      fromId: idOwn,
                      toId: idTarget,
                    },
                  },
              });

        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async editProfile(id: bigint, userName: string, fullName: string, workHistory: string, skills: string) {
        try {
            return await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    username: userName,
                    fullName: fullName,
                    workHistory: workHistory,
                    skills: skills

                },
            }); // Return the updated profile data
        } catch (error: any) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }
}


export async function getAllEndpointOfConnection(id: bigint) {
    return prisma.pushSubscription.findMany({
        where: {
            user: {
                connectionsInitiated: {
                    some: {
                        toId: id
                    }
                }
            }
        }
    });
}

export default new ProfileRepository();