
export enum Category {
    ELECTRONICS = 'Electronics',
    FASHION = 'Fashion',
    HOME = 'Home',
    FITNESS = 'Fitness',
    BOOKS = 'Books',
    GAMING = 'Gaming',
    MUSIC = 'Music',
    OTHER = 'Other'
}

export interface Item {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    category: Category;
    images: string[];
    condition: 'New' | 'Like New' | 'Good' | 'Fair';
    estimatedValue: number;
}

export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
}

export interface MeetingDetails {
    location: string;
    datetime: string;
    notes?: string;
}

export interface Offer {
    id: string;
    myItemId: string;
    theirItem: Item;
    theirUser: User;
    status: 'pending' | 'accepted' | 'declined' | 'swapped';
    chatId: string;
    createdAt: number;
    meetingDetails?: MeetingDetails;
    isPinned?: boolean;
    isHidden?: boolean;
    swapStep?: 'logistics' | 'verify' | 'complete';
    myCode?: string;
    theirCode?: string;
    userRating?: number;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
}

export interface ChatSession {
    id: string;
    messages: Message[];
}
