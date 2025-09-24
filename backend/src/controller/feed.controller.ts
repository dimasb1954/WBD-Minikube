import { Request, Response } from 'express';
import feedService from '../service/feed.service';
import {getAllEndpointOfConnection} from "../repository/profile.repository";

class FeedController {
    public async getAllFeedContent(req: Request, res: Response): Promise<void> {
        try {
            const id = req.jwt?.userId;
            const limit: number = parseInt(req.query.limit as string);
            const cursor : string = req.query.cursor as string;
            if (id != null){
                const content = await feedService.getAllFeedContent(BigInt(id), limit, cursor);
                res.json(content);
            } else {
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            console.log(error.message)
            res.status(500).json({ error: error.message });
        }
    }

    public async getFeedContent(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (!id) {
                res.status(400).json({ error: 'ID is required' });
                return;
            }
            const content = await feedService.getFeedContent(id);
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getFeedText(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (!id) {
                res.status(400).json({ error: 'ID is required' });
                return;
            }
            const content = await feedService.getFeedText(BigInt(id));
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async updateFeedContent(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { content } = req.body;
            if (!id || !content) {
                res.status(400).json({ error: 'ID and data are required' });
                return;
            }
            const updatedContent = await feedService.updateFeedContent(BigInt(id), content);
            res.json(updatedContent);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async addFeed(req: Request, res: Response): Promise<void> {
        try {
            const userid = req.jwt?.userId;
            const { content } = req.body;
            if (userid != null){
                const result = await feedService.addFeed(BigInt(userid), content);
                res.json(result);
                // Send notification to all user connected to him
                const allConnectionEndpoint = await getAllEndpointOfConnection(BigInt(userid));
                for (const endpoint of allConnectionEndpoint) {
                    const payload = JSON.stringify({
                        title: "New post",
                        body: `You have a new feed from ${userid}`
                    });
                    // webPush.sendNotification(endpoint, payload).catch(error => {
                    //     console.error('Detailed Notification Error:', {
                    //         name: error.name,
                    //         message: error.message,
                    //         code: error.code,
                    //     });
                    // });
                }
            } else {
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            console.log(error.message)
            res.status(500).json({ error: error.message });
        }
    }

    public async deleteFeed(req: Request, res: Response): Promise<void> {
        try {
            const userid = req.jwt?.userId;
            const id = parseInt(req.params.id);
            if (userid != null){
                const result = await feedService.deleteFeed(BigInt(id));
                res.json(result);
            } else {
                console.log(userid)
                res.status(500).json({ error: "Not login yet" });
            }
        } catch (error: Error | any) {
            console.log(error.message)
            res.status(500).json({ error: error.message });
        }
    }
}

export default new FeedController();