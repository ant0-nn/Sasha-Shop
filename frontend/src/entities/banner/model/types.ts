export interface Banner {
    id: string;
    imageUrl: string;
    title: string;
    description?: string;
    linkUrl?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}
