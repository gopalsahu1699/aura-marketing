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

export const nvidia = {
    /**
     * Chat/Text Completion (Llama 3.1)
     * Used for Marketing Analysis, Description Generation, etc.
     */
    chat: async (prompt: string, model: NvidiaModel = "meta/llama-3.1-70b-instruct"): Promise<string> => {
        const apiKey = process.env.NVIDIA_API_KEY_CHAT || process.env.NVIDIA_API_KEY;
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
        const apiKey = process.env.NVIDIA_API_KEY_RESEARCH || process.env.NVIDIA_API_KEY;
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
        const apiKey = process.env.NVIDIA_API_KEY_IMAGE || process.env.NVIDIA_API_KEY;
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

