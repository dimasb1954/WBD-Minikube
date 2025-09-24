import { Request, Response } from 'express';
import connectionService from "../service/connection.service";

class ConnectionController {
    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const content = await connectionService.getAllUsers();
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getUserNetwork(req: Request, res: Response): Promise<void> {
        try {
            const id: number = parseInt(req.jwt?.userId as string)
            const content = await connectionService.getUserNetwork(id);
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getConnectedUsers(req: Request, res: Response): Promise<void> {
        try {
            const fromId = req.jwt?.userId
            const content = await connectionService.getConnectedUsers(parseInt(fromId as string));
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getConnectedUsersIdParam(req: Request, res: Response): Promise<void> {
        try {
            const fromId = req.params.id;
            const content = await connectionService.getConnectedUsers(parseInt(fromId as string));
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getRequestedUsers(req: Request, res: Response): Promise<void> {
        try {
            const toId = req.jwt?.userId;
            const content = await connectionService.getRequestedUsers(parseInt(toId as string));
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async insertConnection(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const toId = req.params.id;
            if (idOwn != null){
                const content = await connectionService.insertConnection(parseInt(toId), parseInt(idOwn));
                res.json(content);
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    // public async insertRequest(req: Request, res: Response): Promise<void> {
    //     try {
    //         const fromId : number = parseInt(req.jwt?.userId as string);
    //         const toId : number = parseInt(req.query.to as string);
    //         const content = await connectionService.insertRequest(fromId, toId);
    //         res.json(content);
    //     } catch (error: Error | any) {
    //         res.status(500).json({ error: error.message });
    //     }
    // }

    // public async deleteConnection(req: Request, res: Response): Promise<void> {
    //     try {
    //         const fromId : number = parseInt(req.query.from as string);
    //         const toId : number = parseInt(req.query.to as string);
    //         const content = await connectionService.deleteConnection(fromId, toId);
    //         res.json(content);
    //     } catch (error: Error | any) {
    //         res.status(500).json({ error: error.message });
    //     }
    // }

    public async ignoreRequest(req: Request, res: Response): Promise<void> {
        try {
            const fromId : number = parseInt(req.query.from as string);
            const toId : number = parseInt(req.query.to as string);
            const content = await connectionService.deleteRequest(fromId, toId);
            res.json(content);
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async newRequest(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const toId = req.params.id;
            if (idOwn != null){
                const content = await connectionService.insertRequest(parseInt(idOwn), parseInt(toId));
                res.json(content);
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async cancelRequest(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const toId = req.params.id;
            if (idOwn != null){
                const content = await connectionService.deleteRequest(parseInt(idOwn), parseInt(toId));
                res.json(content);
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async deleteConnectionFromProfile(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            const toId = req.params.id;
            if (idOwn != null){
                const content = await connectionService.deleteConnection(parseInt(idOwn), parseInt(toId));
                res.json(content);
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getRecomendation(req: Request, res: Response): Promise<void> {
        try {
            const idOwn = req.jwt?.userId;
            if (idOwn != null){
                const content = await connectionService.getRecomendation(BigInt(idOwn));
                res.json(content);
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ConnectionController();