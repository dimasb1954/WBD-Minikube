import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';

class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response) => {
        try {
            const identifier = req.body.identifier;
            const password = req.body.password;
            if (!identifier || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter both email and password',
                    code: 5
                });
            }

            const token = await this.authService.login(identifier, password);
            res.cookie('token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                domain: 'localhost',
                path: '/',
                maxAge: 1000 * 60 * 60
            }).json({
                success: true,
                message: 'Login successful',
                body: {

                }
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(401).json({
                    success: false,
                    message: error.message,
                    code: 5
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error:' + error.message,
                code: 6
            });
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const userData = req.body;
            if (!userData.email || !userData.username || !userData.password || !userData.fullName) {
                return res.status(400).json({
                    success: false,
                    message: 'Incomplete user data'
                });
            }
            userData.passwordHash = await this.authService.hashPassword(userData.password);
            const token = await this.authService.register(userData);

            res.status(201).cookie('token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                domain: 'localhost',
                path: '/',
                maxAge: 1000 * 60 * 60
            }).json({
                success: true,
                message: 'Registration successful'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'User already exists') {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists'
                });
            } else if (error instanceof Error && error.message === 'Incomplete user data') {
                return res.status(400).json({
                    success: false,
                    message: 'Incomplete user data'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error: ' + error?.message
            });
        }
    };
}

export default new AuthController();