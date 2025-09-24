import {NextFunction, Request, Response} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import config from '../config/environment';
import {AuthService} from "../service/auth.service";

const authService = new AuthService();

interface CustomPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
}

declare global {
    namespace Express {
        interface Request {
            jwt?: CustomPayload;
            isjwt?: boolean;
        }
    }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No token provided',
            code: 1
        })
    }
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token === null || token === undefined || token === '' || !token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided',
            code: 1
        });
    }

    try {
        req.jwt = validateJwt(token);
        if (!checkJwtContent(req.jwt)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token',
                code: 3
            });
        }
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 2
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({
                success: false,
                message: error.message,
                code: 3
            });
        }
        else {
            return res.status(403).json({
                success: false,
                message: error,
                code: 3
            });
        }
    }
}

export function checkTokenLoginRegister(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token === null || token === undefined || token === '' || !token) {
        next(); // No JWT, so continue to login/register
    } else {
        try {
            req.jwt = validateJwt(token);
            if (!checkJwtContent(req.jwt)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid token. Please log out first',
                    code: 3
                }); // Token invalid (user incorrect in database) and return to FE, so FE will delete JWT
            } else {
                console.log('User already logged in');
                return res.status(200).json({
                    success: true,
                    message: 'Already logged in',
                    code: 0
                }); // User already logged in, so FE will redirect to profile
            }
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token. Please log out first',
                code: 3
            }); // Token invalid (manipulated) and return to FE, so FE will delete JWT
        }
    }
}

export function checkJwtExistProfile(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    req.isjwt = false;
    if (!authHeader) {
        req.isjwt = false;
    } else {
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        // Validate jwt if exist
        if (!token || token == null || token == '') {
            req.isjwt = false;
        } else {
            req.jwt = validateJwt(token);
            if (!checkJwtContent(req.jwt)) {
                req.isjwt = false;
            } else {
                req.isjwt = true;
                console.log(req.jwt)
            }
        }

    }
    console.log(req.isjwt)
    next();

}

export function validateJwt(token: string): CustomPayload {
    return jwt.verify(token, config.jwtSecret) as CustomPayload;
}

export function createJwt(payload: CustomPayload): string {
    return jwt.sign(payload, config.jwtSecret, {expiresIn: '1h'});
}

export async function checkJwtContent(jwt: CustomPayload): Promise<boolean> {
    if (jwt === undefined) {
        return false;
    } else {
        if (jwt.userId === undefined || jwt.email === undefined || jwt.userId === '' || jwt.email === '') {
            return false;
        } else {
            if (await authService.validateUser(jwt.email, jwt.userId)) {
                return true;
            }
        }
    }
    return false;
}

function invalidateJwt(req: Request, res: Response) {
    res.cookie('token', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: 'localhost',
        path: '/',
        expires: new Date(0),
        maxAge: 0
    }).json(
        {
            success: true,
            message: 'Logged out'
        }
    );
}