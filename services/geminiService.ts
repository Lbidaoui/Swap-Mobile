
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Item, User, Message } from '../types';
import { MOCK_USERS, getRandomImage } from '../constants';

// Helper to safely get API key
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("API_KEY is missing. Using mock fallback logic where possible.");
    return "";
  }
  return key;
};

// Generate mock items for the swipe deck based on category
export const generateSwipeItems = async (category: Category, count: number = 5): Promise<Item[]> => {
    const apiKey = getApiKey();
    
    // Fallback if no API key
    if (!apiKey) {
        return Array.from({ length: count }).map((_, i) => ({
            id: `mock-${Date.now()}-${i}`,
            ownerId: MOCK_USERS[i % MOCK_USERS.length].id,
            title: `Mock ${category} Item ${i + 1}`,
            description: 'This is a simulated item because the API key is missing.',
            category: category,
            images: [getRandomImage(category)],
            condition: 'Good',
            estimatedValue: 100 + i * 50
        }));
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate ${count} unique, realistic second-hand items for the category "${category}". 
            Return a JSON array. Do not include image URLs, I will handle those.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            condition: { type: Type.STRING, enum: ['New', 'Like New', 'Good', 'Fair'] },
                            estimatedValue: { type: Type.NUMBER },
                        }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '[]');
        
        return data.map((item: any, index: number) => ({
            id: `gen-${Date.now()}-${index}`,
            ownerId: MOCK_USERS[index % MOCK_USERS.length].id,
            title: item.title,
            description: item.description,
            category: category,
            images: [getRandomImage(category)],
            condition: item.condition,
            estimatedValue: item.estimatedValue
        }));

    } catch (error) {
        console.error("Failed to generate items with Gemini:", error);
        // Return fallback on error
        return Array.from({ length: count }).map((_, i) => ({
            id: `fallback-${i}`,
            ownerId: MOCK_USERS[i % MOCK_USERS.length].id,
            title: `${category} Item ${i + 1}`,
            description: 'Item description unavailable.',
            category: category,
            images: [getRandomImage(category)],
            condition: 'Good',
            estimatedValue: 50
        }));
    }
};

// Generate a chat response acting as the other user
export const generateChatResponse = async (
    history: Message[], 
    theirItem: Item, 
    myItem: Item,
    theirUserName: string
): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) return "Hey! I'm interested in trading. (AI Disabled)";

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const conversation = history.map(m => `${m.senderId === 'me' ? 'Me' : theirUserName}: ${m.text}`).join('\n');
        
        const prompt = `
        Act as ${theirUserName}. You own a ${theirItem.title} (${theirItem.condition}).
        You are negotiating a trade with a user who is offering a ${myItem.title}.
        
        Conversation history:
        ${conversation}
        
        Respond to the last message naturally. Be friendly but negotiate if the value difference is high.
        Keep it short (under 2 sentences).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return response.text || "Sounds good!";
    } catch (error) {
        return "I think that works for me!";
    }
};
