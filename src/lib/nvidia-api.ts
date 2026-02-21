import { createClient } from '@supabase/supabase-js';

// Server-side only client for the API
const createServerClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

/**
 * NVIDIA AI API Utility
 * Provides a unified interface for calling NVIDIA NIMs for text, image, and video generation.
 */

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_GENAI_URL = "https://ai.api.nvidia.com/v1/genai";

export type NvidiaModel =
    | "meta/llama-3.1-70b-instruct"
    | "meta/llama-3.1-405b-instruct"
    | "meta/llama-3.3-70b-instruct"
    | "nvidia/sdxl-turbo"
    | "black-forest-labs/flux1-schnell"
    | "nvidia/cosmos-1b-predict";

export interface NvidiaChatResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export interface NvidiaImageResponse {
    data: {
        url: string;
        b64_json?: string;
    }[];
}

/**
 * Helper function to retrieve the correct API key.
 * Prioritizes user-specific keys from Supabase over global environment variables.
 */
async function getApiKey(type: 'chat' | 'research' | 'image' | 'video'): Promise<string> {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data } = await supabase
                .from('user_preferences')
                .select('api_keys')
                .eq('user_id', user.id)
                .single();

            if (data?.api_keys) {
                const keys = data.api_keys as any;
                if (type === 'chat' && keys.nvidia_chat) return keys.nvidia_chat;
                if (type === 'research' && keys.nvidia_research) return keys.nvidia_research;
                if (type === 'image' && keys.nvidia_image) return keys.nvidia_image;
                if (type === 'video' && keys.nvidia_video) return keys.nvidia_video;
            }
        }
    } catch (error) {
        console.error('Error fetching custom API key:', error);
    }

    // Fallback to environment variables
    if (type === 'chat') return process.env.NVIDIA_API_KEY_CHAT || process.env.NVIDIA_API_KEY || '';
    if (type === 'research') return process.env.NVIDIA_API_KEY_RESEARCH || process.env.NVIDIA_API_KEY || '';
    if (type === 'image') return process.env.NVIDIA_API_KEY_IMAGE || process.env.NVIDIA_API_KEY || '';
    if (type === 'video') return process.env.NVIDIA_API_KEY_VIDEO || process.env.NVIDIA_API_KEY || '';

    return '';
}

export const nvidia = {
    /**
     * Chat/Text Completion (Llama 3.1)
     * Used for Marketing Analysis, Description Generation, etc.
     */
    chat: async (prompt: string, model: NvidiaModel = "meta/llama-3.1-70b-instruct"): Promise<string> => {
        const apiKey = await getApiKey('chat');
        if (!apiKey) throw new Error("NVIDIA API Key is missing");

        const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            let errorMsg = "Failed to generate text";
            try {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    errorMsg = error.message || error.detail || errorMsg;
                } catch (e) {
                    errorMsg = `HTTP Error ${response.status}: ${text}`;
                }
            } catch (e) {
                errorMsg = `HTTP Error ${response.status}`;
            }
            throw new Error(errorMsg);
        }

        const data: NvidiaChatResponse = await response.json();
        return data.choices[0].message.content;
    },

    /**
     * Market Research Analysis (Llama 3.3)
     */
    marketResearch: async (prompt: string, model: NvidiaModel = "meta/llama-3.3-70b-instruct"): Promise<string> => {
        const apiKey = await getApiKey('research');
        if (!apiKey) throw new Error("NVIDIA API Key is missing");

        const systemMessage = {
            role: "system",
            content: "You are an expert market researcher and business analyst. Focus intensely on current internet trends, target audiences, and actionable business growth strategies. Provide clear, concise, and highly professional insights tailored for high-level marketing executives."
        };

        const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [systemMessage, { role: "user", content: prompt }],
                temperature: 0.5,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            let errorMsg = "Failed to generate market research";
            try {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    errorMsg = error.message || error.detail || errorMsg;
                } catch (e) {
                    errorMsg = `HTTP Error ${response.status}: ${text}`;
                }
            } catch (e) {
                errorMsg = `HTTP Error ${response.status}`;
            }
            throw new Error(errorMsg);
        }

        const data: NvidiaChatResponse = await response.json();
        return data.choices[0].message.content;
    },

    /**
     * Image Generation (SDXL Turbo)
     */
    generateImage: async (prompt: string): Promise<string> => {
        const apiKey = await getApiKey('image');
        if (!apiKey) throw new Error("NVIDIA API Key is missing");

        const response = await fetch(`${NVIDIA_GENAI_URL}/stabilityai/stable-diffusion-xl`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt, weight: 1 }],
                sampler: "K_EULER_ANCESTRAL",
                steps: 25,
                seed: 0,
                cfg_scale: 7,
            }),
        });

        if (!response.ok) {
            let errorMsg = "Failed to generate image";
            try {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    errorMsg = error.message || error.detail || errorMsg;
                } catch (e) {
                    errorMsg = `HTTP Error ${response.status}: ${text}`;
                }
            } catch (e) {
                errorMsg = `HTTP Error ${response.status}`;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        // SDXL returns: { artifacts: [{ base64: '...', finishReason: 'SUCCESS' }] }
        const base64 = data.artifacts?.[0]?.base64;
        if (!base64) throw new Error("No image data returned from API");
        return `data:image/jpeg;base64,${base64}`;
    },

    /**
     * Video/Reel Generation (Cosmos 1B)
     */
    generateVideo: async (prompt: string): Promise<{ job_id: string }> => {
        // Video generation via NVIDIA NIM is not yet available on this API key.
        // This function is reserved for when Cosmos video generation becomes accessible.
        throw new Error("Video generation is currently unavailable. NVIDIA Cosmos video NIM requires a separate enterprise API key. Please check build.nvidia.com for access.");
    }
};

