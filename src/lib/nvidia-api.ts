/**
 * NVIDIA AI API Utility
 * Provides a unified interface for calling NVIDIA NIMs for text, image, and video generation.
 */

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export type NvidiaModel =
    | "meta/llama-3.1-70b-instruct"
    | "meta/llama-3.1-405b-instruct"
    | "nvidia/sdxl-turbo"
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

export const nvidia = {
    /**
     * Chat/Text Completion (Llama 3.1)
     * Used for Marketing Analysis, Description Generation, etc.
     */
    chat: async (prompt: string, model: NvidiaModel = "meta/llama-3.1-70b-instruct"): Promise<string> => {
        const apiKey = process.env.NVIDIA_API_KEY;
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
            const error = await response.json();
            throw new Error(error.message || "Failed to generate text");
        }

        const data: NvidiaChatResponse = await response.json();
        return data.choices[0].message.content;
    },

    /**
     * Image Generation (SDXL Turbo)
     */
    generateImage: async (prompt: string): Promise<string> => {
        const apiKey = process.env.NVIDIA_API_KEY;
        if (!apiKey) throw new Error("NVIDIA API Key is missing");

        const response = await fetch(`${NVIDIA_BASE_URL}/genai/nvidia/sdxl-turbo`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                num_images: 1,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to generate image");
        }

        const data: NvidiaImageResponse = await response.json();
        return data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`;
    },

    /**
     * Video/Reel Generation (Cosmos 1B)
     */
    generateVideo: async (prompt: string): Promise<{ job_id: string }> => {
        const apiKey = process.env.NVIDIA_API_KEY;
        if (!apiKey) throw new Error("NVIDIA API Key is missing");

        const response = await fetch(`${NVIDIA_BASE_URL}/genai/nvidia/cosmos-1b-predict`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                video_config: { aspect_ratio: "9:16" },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to queue video generation");
        }

        return await response.json();
    }
};

