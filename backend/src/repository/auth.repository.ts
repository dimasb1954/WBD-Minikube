import {User} from '@prisma/client';
import prisma from '../database/prisma'
import bcrypt from 'bcrypt';
import config from '../config/environment';

class AuthRepository {
    async findUserByIdentifier(identifier: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                OR: [
                    {email: identifier},
                    {username: identifier}
                ]
            }
        });
    }

    async validateUserByIdentifier(email: string, id: bigint): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                AND: [
                    {email: email},
                    {id: id}
                ]
            }
        });
    }

    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, config.saltRounds);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        if (!userData.email || !userData.username || !userData.passwordHash) {
            throw new Error('Missing required fields: email, username, or passwordHash');
        }

        const hashedPassword = await this.hashPassword(userData.passwordHash || '');

        return prisma.user.create({
            data: {
                email: userData.email,
                username: userData.username,
                passwordHash: hashedPassword,
                fullName: userData.fullName || userData.username,
                createdAt: userData.createdAt || new Date(),
                updatedAt: userData.updatedAt || new Date(),
                profilePic: userData.profilePic || 'default-profpic.png'
            }
        });
    }
}

export default new AuthRepository();