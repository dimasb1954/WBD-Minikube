import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { faker } from '@faker-js/faker';
import config from '../src/config/environment';
import {randomInt} from "node:crypto";

const prisma: PrismaClient = new PrismaClient();

async function seedUser(uniqueNumber: number) {
    const user: any = {
        username: faker.internet.userName() + uniqueNumber.toString(),
        email: uniqueNumber.toString() + faker.internet.email(),
        fullName: faker.person.fullName(),
        passwordHash: await hash("password_123", config.saltRounds),
        workHistory: faker.company.name(),
        skills: faker.person.jobTitle(),
        profilePic: "default-profpic.png"
    };

    await prisma.user.create({
        data: user,
    });
}

async function seedFeeds(numUser: number) {
    const feed: any = {
        content: faker.lorem.paragraph(),
        userId: randomInt(1, numUser),
    };

    await prisma.feed.create({
        data: feed,
    });
}

async function seedChat(numUser: number) {
    const chat: any = {
        fromId: randomInt(1, numUser),
        toId: randomInt(1, numUser),
        message: faker.lorem.sentence(),
    }

    await prisma.chat.create({
        data: chat,
    });
}

async function seedConnectionRequest(numUser: number) {
    let fromId = randomInt(1, numUser);
    let toId = randomInt(1, numUser);

    while (fromId === toId || await prisma.connectionRequest.findUnique({ where: { fromId_toId: { fromId, toId } } })) {
        fromId = randomInt(1, numUser);
        toId = randomInt(1, numUser);
    }

    await prisma.connectionRequest.create({
        data: { fromId, toId },
    });
}

async function seedConnection(numUser: number) {
    let fromId = randomInt(1, numUser);
    let toId = randomInt(1, numUser);

    while (fromId === toId || await prisma.connection.findUnique({ where: { fromId_toId: { fromId, toId } } })) {
        fromId = randomInt(1, numUser);
        toId = randomInt(1, numUser);
    }

    await prisma.$transaction(async (prisma) => {
        await prisma.connection.create({
            data: { fromId, toId },
        });

        await prisma.connection.create({
            data: { fromId: toId, toId: fromId },
        });

        await prisma.connectionRequest.deleteMany({
            where: {
                OR: [
                    { fromId, toId },
                    { fromId: toId, toId: fromId },
                ],
            },
        });
    });
}

async function main() {
    let numUser = 50;
    for (let i = 0; i < numUser; i++) {
        await seedUser(i+1);
    }
    for (let i = 0; i < numUser * 3; i++) {
        await seedFeeds(numUser);
    }
    for (let i = 0; i < numUser * 4; i++) {
        await seedChat(numUser);
    }
    for (let i = 0; i < Math.floor(numUser / 3); i++) {
        await seedConnectionRequest(numUser);
    }
    for (let i = Math.ceil(numUser / 3); i < Math.floor(2 * numUser / 3); i++) {
        await seedConnection(numUser);
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });