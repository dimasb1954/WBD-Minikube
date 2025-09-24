import { print } from 'ioredis';
import profileRepository from '../repository/profile.repository';
import { connect } from 'http2';

class ProfileService {
    public async getProfileOtherNoAuth(id: bigint) {
        try {
            const profile = await profileRepository.getProfile(id);
            if (profile) {
                return {
                    success: true,
                    message: "Profile found",
                    body: {
                        code: 0,
                        username: profile.username,
                        name: profile.fullName,
                        work_history: profile.workHistory,
                        skills: profile.skills,
                        connectionsCount: profile._count.connectionsInitiated,
                    }
                };
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getProfileOwn(id: bigint) {
        try {
            const profile = await profileRepository.getProfile(id);
            if (profile) {
                return {
                    success: true,
                    message: "Profile found",
                    body: {
                        code: 4,
                        username: profile.username,
                        name: profile.fullName,
                        work_history: profile.workHistory,
                        skills: profile.skills,
                        connectionsCount: profile._count.connectionsInitiated,
                    }
                };
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async getProfileOther(idOwn: bigint, idTarget: bigint) {
        try {
            const profile = await profileRepository.getProfile(idTarget);
            const isConnect = await profileRepository.getIsConnect(idOwn, idTarget);
            const isSentRequest = await profileRepository.getIsRequest(idOwn, idTarget);
            const isReceiveRequest = await profileRepository.getIsRequest(idTarget, idOwn);
            if (profile) {
                if (isConnect) {
                    return {
                        success: true,
                        message: "Profile found",
                        body: {
                            code: 3,
                            username: profile.username,
                            name: profile.fullName,
                            work_history: profile.workHistory,
                            skills: profile.skills,
                            connectionsCount: profile._count.connectionsInitiated,
                        }
                    };
                } else {
                    if (isSentRequest || isReceiveRequest) {
                        return {
                            success: true,
                            message: "Profile found",
                            body: {
                                code: 2,
                                username: profile.username,
                                name: profile.fullName,
                                work_history: profile.workHistory,
                                skills: profile.skills,
                                connectionsCount: profile._count.connectionsInitiated,
                                receiver: isSentRequest?.toId.toString(),
                                sender: isReceiveRequest?.fromId.toString(),
                            }
                        };
                    } else {
                        return {
                            success: true,
                            message: "Profile found",
                            body: {
                                code: 1,
                                username: profile.username,
                                name: profile.fullName,
                                work_history: profile.workHistory,
                                skills: profile.skills,
                                connectionsCount: profile._count.connectionsInitiated,
                            }
                        };
                    }
                }

            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }

    public async editProfile(id: bigint, userName: string, fullName: string, workHistory: string, skills: string) {
        try {
            const profile = await profileRepository.editProfile(id, userName, fullName, workHistory, skills);
            return {
                success: true,
                message: "Edited profile",
                body: {
                    fullName: profile.fullName,
                }
            }
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }
}

export default new ProfileService();

/*
* Format API
*
{
    “success”: boolean,
    “message”: string,
    “body”: {
        “username”: string,
        “name”: string,
        “work_history”: string,
        “skills”: string,
        “connection_count”: integer,
        “profile_photo”: string,
        “relevant_posts”: array of Posts
    }
}

code
0 = unlogin
1 = login, unconnect not request
2 = login, unconnect request
3 = login, connect
4 = owner
* */
