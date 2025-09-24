import { Request, Response } from 'express';
import profileService from "../service/profile.service";

class ProfileController {
    public async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if (req.isjwt == true) {
                const idOwn = req.jwt?.userId;
                const idTarget = req.params.id;
                if(idOwn == null){
                    res.json(await profileService.getProfileOtherNoAuth(BigInt(idTarget)))
                } else {
                    if(idOwn != idTarget){
                        res.json(await profileService.getProfileOther(BigInt(idOwn), BigInt(idTarget)));
                    } else {
                        res.json(await profileService.getProfileOwn(BigInt(idOwn)))
                    }
                }
            } else {
                const idTarget = req.params.id;
                res.json(await profileService.getProfileOtherNoAuth(BigInt(idTarget)))
            }
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }

    public async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { username, name, work_history, skills } = req.body;
            const result = await profileService.editProfile(BigInt(id), username, name, work_history, skills)
            res.json(result)
        } catch (error: Error | any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }
}

export default new ProfileController();