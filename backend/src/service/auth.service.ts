import jwt from 'jsonwebtoken';
import authRepository from '../repository/auth.repository';
import config from '../config/environment';
import {User} from '@prisma/client';


export class AuthService {
    async login(identifier: string, password: string) {
        const user = await authRepository.findUserByIdentifier(identifier);

        if (!user) {
            throw new Error('Email or username not found');
        }

        const isMatch = await authRepository.verifyPassword(
            password,
            user.passwordHash
        );

        if (!isMatch) {
            throw new Error('Wrong password. Please try again');
        }

        return this.generateJWTToken(user);
    }

    async register(userData: Partial<User>) {
        if (!userData.email || !userData.username || !userData.passwordHash) {
            throw new Error('Incomplete user data');
        }

        if (!this.validateEmail(userData.email)) {
            throw new Error('Invalid email address');
        }

        if (!this.validateUsername(userData.username)) {
            throw new Error('Invalid username');
        }

        if (!userData.fullName) {
            throw new Error('Invalid name');
        }

        const existingUser = await authRepository.findUserByIdentifier(userData.email) || await authRepository.findUserByIdentifier(userData.username);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = await authRepository.createUser(userData);

        return this.generateJWTToken(newUser);
    }

    private generateJWTToken(user: User) {
        const iat = Date.now() ;
        return jwt.sign(
            {
                userId: user.id.toString(),
                email: user.email,
                role: 'job_seeker',
                iat: iat
            },
            config.jwtSecret,
            {
                expiresIn: config.jwtExpiration
            }
        );
    }

    async validateUser(email: string, id: string): Promise<boolean> {
        try {
            const user = await authRepository.validateUserByIdentifier(email, BigInt(id));
            return user !== null;
        } catch (error) {
            return false;
        }
    }

    async hashPassword(password: string) {
        return authRepository.hashPassword(password);
    }

    // Validate email
    validateEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email !== '';
    }

    validateUsername(username: string) {
        return !this.validateEmail(username);
    }
}