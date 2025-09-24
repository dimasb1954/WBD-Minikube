export interface ProfileType {
    id: string;
    fullName: string;
    workHistory: string;
    skills: string;
    profilePic: string;
    connectionsCount: number;
    relevantPosts: Post[];
}

export interface Post {
    id: string;
    content: string;
    updatedAt: Date;
}