import feedRepository from '../repository/feed.repository';
import profileRepository from '../repository/profile.repository';
import redis from '../config/redis';
import connectionRepository from '../repository/connection.repository';
import { fromUnixTime } from 'date-fns';

class FeedService {
    private cacheKey(id: number): string {
        return `feed:${id}`;
    }

    public async getAllFeedContent(id: bigint, limit: number, lastCursor: string) {
        // Fetch feeds and user profile data
        const connections = await connectionRepository.getConnectedUsers(Number(id));
        let ids = connections.map(user => user.toId);
        ids.push(id);
        let feeds = [];
        if (lastCursor == "" || lastCursor == null) {
            feeds = await feedRepository.getAllFeedContent(limit, ids);
        } else {
            feeds = await feedRepository.getAllFeedContentWithCursor(limit, ids, parseInt(lastCursor));
        }
        const profile = await profileRepository.getProfile(id);
    
        // Process feeds to include user details with connection counts
        const formattedFeeds = feeds.map(feed => ({
            ...feed,
            id: feed.id.toString(),
            userId: feed.userId.toString(),
            user: {
                ...feed.user,
                connectionsCount: feed.user._count.connectionsInitiated,
                id: feed.user.id.toString(),
                username: feed.user.username,
            }
        }));

        const cursor = feeds.at(-1)?.id;
        
        return {
            success: true,
            message: "Retrieved feed",
            body: {
                cursor: cursor,
                feeds: formattedFeeds,
                profile: profile ? {
                    ...profile,
                    id: profile.id.toString(),
                    connectionsCount:
                        (profile._count?.connectionsInitiated || 0)
                } : null,
            }
        };
    }
    

    public async getFeedContent(id: number) {
        const cacheKey = this.cacheKey(id);
        const cachedContent = await redis.get(cacheKey);

        if (cachedContent) {
            return JSON.parse(cachedContent);
        }
        console.log('Cache miss');

        const feeds = await feedRepository.getFeedContent(BigInt(id));
        const formattedFeeds = feeds.map(feed => ({
            ...feed,
            id: feed.id.toString(),
            userId: feed.userId.toString(),
        }));

        return formattedFeeds;

    }

    public async getFeedText(id: bigint) {
        const result = await feedRepository.getFeedText(id);
        return {
            success: true,
            message: "Retrieved post",
            body:
                {
                    id: result?.id.toString,
                    content: result?.content,
                }
        }
    }

    public async updateFeedContent(id: bigint, data: string) {
        const updatedContent = await feedRepository.updateFeedContent(id, data);
        await redis.del(this.cacheKey(Number(id)));
        return {
            success: true,
            message: "Post updated"
        }
    }

    public async addFeed(userid: bigint, content: string) {
        await feedRepository.addFeed(userid, content);
        return {
            success: true,
            message: "Post added"
        }
    }

    public async deleteFeed(id: bigint) {
        await feedRepository.deleteFeed(id);
        return {
            success: true,
            message: "Post deleted",
        }
    }
}

export default new FeedService();