
import { Category, Item, User } from './types';

export const CURRENT_USER_ID = 'me';

// Curated list of reliable high-quality images
export const CATEGORY_IMAGES: Record<Category, string[]> = {
    [Category.ELECTRONICS]: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80', // Laptop
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', // Camera
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Headphones
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80', // Phone
        'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=600&q=80', // Monitor
    ],
    [Category.FASHION]: [
        'https://images.unsplash.com/photo-1551028919-ac76c90b8565?auto=format&fit=crop&w=600&q=80', // Jacket
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', // Shoe
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', // Bag
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', // Jacket 2
    ],
    [Category.HOME]: [
        'https://images.unsplash.com/photo-1583847661441-89b750a694ef?auto=format&fit=crop&w=600&q=80', // Plant
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', // Furniture
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', // Decor
    ],
    [Category.FITNESS]: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80', // Dumbbells
        'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=600&q=80', // Yoga Mat
    ],
    [Category.BOOKS]: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', // Books
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', // Library
    ],
    [Category.GAMING]: [
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80', // Controller
        'https://images.unsplash.com/photo-1593118247619-e7d6f2079219?auto=format&fit=crop&w=600&q=80', // Console
    ],
    [Category.MUSIC]: [
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', // Music
        'https://images.unsplash.com/photo-1525711857929-42726519296f?auto=format&fit=crop&w=600&q=80', // Vinyl
    ],
    [Category.OTHER]: [
        'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=600&q=80', // Abstract
    ]
};

export const getRandomImage = (category: Category): string => {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES[Category.OTHER];
    return images[Math.floor(Math.random() * images.length)];
};

export const INITIAL_INVENTORY: Item[] = [
    {
        id: 'item-1',
        ownerId: CURRENT_USER_ID,
        title: 'Vintage Film Camera',
        description: 'Canon AE-1 in working condition with 50mm lens.',
        category: Category.ELECTRONICS,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'],
        condition: 'Good',
        estimatedValue: 150
    },
    {
        id: 'item-2',
        ownerId: CURRENT_USER_ID,
        title: 'Leather Jacket',
        description: 'Genuine leather biker jacket, size M. Barely worn.',
        category: Category.FASHION,
        images: ['https://images.unsplash.com/photo-1551028919-ac76c90b8565?auto=format&fit=crop&w=600&q=80'],
        condition: 'Like New',
        estimatedValue: 200
    }
];

export const CATEGORIES = Object.values(Category);

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 4.8 },
    { id: 'u2', name: 'Bob', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80', rating: 4.5 },
    { id: 'u3', name: 'Charlie', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 4.9 },
    { id: 'u4', name: 'Diana', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', rating: 4.7 },
];
