import prisma from '../database/prisma';

class FeedRepository {
    public async getAllFeedContent(limit: number, ids: bigint[]) {
        const feeds = await prisma.feed.findMany({
            where: {
                userId: {
                    in: ids
                }
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profilePic: true,
                        _count: {
                            select: {
                                connectionsInitiated: true
                            }
                        }
                    },
                },
            },
        })

        return feeds.map(feed => ({
            ...feed,
            id: feed.id.toString(),
            user: {
                ...feed.user,
                connectionsCount: feed.user._count.connectionsInitiated,
                id: feed.user.id.toString(),
                username: feed.user.username
            }
        }));
    }

    public async getAllFeedContentWithCursor(limit: number, ids: bigint[], cursor: number) {
        const feeds = await prisma.feed.findMany({
            where: {
                userId: {
                    in: ids
                }
            },
            take: limit,
            skip: 1,
            cursor: {
                id: cursor,
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profilePic: true,
                        _count: {
                            select: {
                                connectionsInitiated: true
                            }
                        }
                    }
                },
            },
        })

        return feeds.map(feed => ({
            ...feed,
            id: feed.id.toString(),
            user: {
                ...feed.user,
                connectionsCount: feed.user._count.connectionsInitiated,
                id: feed.user.id.toString(),
                username: feed.user.username
            }
        }));
    }

    public async getFeedContent(id: bigint) {
        const feeds = await prisma.feed.findMany({
            where: {userId: id},
            take: 3,
            orderBy: {
                createdAt: 'desc'
            },
        });

        return feeds.map(feed => ({
            ...feed,
            id: feed.id.toString(),
            userId: feed.userId.toString(),
        }));
    }

    public async getFeedText(id: bigint) {
        return await prisma.feed.findUnique({
            where: {id: id},
        });
    }

    public async updateFeedContent(id: bigint, content: string) {
        return prisma.feed.update({
            where: { id: id },
            data: { content: content },
        });
    }

    public async addFeed(userid: bigint, content: string) {
        return prisma.feed.create({
            data: {
                userId: userid,
                content: content,
                updatedAt: new Date()
            }
        });
    }

    public async deleteFeed(id: bigint) {
        return prisma.feed.delete({
            where: { id: id },
        });
    }

}

export default new FeedRepository();