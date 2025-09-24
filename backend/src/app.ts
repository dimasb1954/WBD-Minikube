import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/environment';
import router from './routes/router';
import { time } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Application {
    private app: Express;
    private port: number;
    private httpServer: http.Server;
    private io: Server;
    private rooms: string[] = [];

    constructor() {
        this.app = express();
        this.port = config.port;
        this.httpServer = http.createServer(this.app);
        this.io = new Server(this.httpServer, {
            cors: {
                origin: "http://localhost:5137", // Frontend URL
                credentials: true
            },
        });

        this.configureMiddlewares();
        this.configureRateLimiting();
        this.configureRoutes();
        this.configureSocketIO();
    }

    private configureMiddlewares(): void {
        const corsOptions = {
            origin: config.frontendUrl,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth'],
            credentials: true,
            maxAge: 3600
        };

        this.app.use(helmet());
        this.app.use(cors(corsOptions));
        this.app.use(express.json({
            limit: '5mb', // Prevents large payload attacks
            verify: (req, res, buf) => {
                if (buf.toString().length > 1024 * 1024 * 5) {
                    throw new Error('Request entity too large');
                }
            }
        }));
    }

    private configureRateLimiting(): void {
        const limiter = rateLimit({
            windowMs: config.rateLimitWindowMs || 15 * 60 * 1000, // Default 15 minutes
            limit: config.rateLimitMaxRequests || 100, // Default 100 requests
            message: 'Too many requests, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
        });

        // this.app.use(limiter);
    }

    private configureRoutes(): void {
        this.app.use('/api', router);
        this.app.use('/uploads', express.static(path.join(__dirname, 'public/upload')));
    }

    private configureSocketIO(): void {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('joinRoom', ({ fromId, toId }) => {
                const roomId = this.createRoomId(fromId, toId);

                if (!this.rooms.includes(roomId)) {
                    this.rooms.push(roomId);
                    console.log(`Room created: ${roomId}`);
                }

                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);
            });

            socket.on('sendMessage', ({ fromId, toId, message, timestamp }) => {
                const roomId = this.createRoomId(fromId, toId);

                if (this.rooms.includes(roomId)) {
                    this.io.to(roomId).emit('newMessage', { fromId, toId, message, timestamp });
                    console.log(`Message sent to room ${roomId}: ${message}`);
                } else {
                    console.error(`Room ${roomId} not found!`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    private createRoomId(fromId: number, toId: number): string {
        const [minId, maxId] = [Math.min(fromId, toId), Math.max(fromId, toId)];
        return `${minId}-${maxId}`;
    }

    public start(): void {
        this.httpServer.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}
