"use server";

import { nvidia, NvidiaModel } from "@/lib/nvidia-api";

export async function generateChatContent(prompt: string, model?: NvidiaModel) {
    try {
        const content = await nvidia.chat(prompt, model);
        return { success: true, content };
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateContentImage(prompt: string) {
    try {
        const url = await nvidia.generateImage(prompt);
        return { success: true, url };
    } catch (error: any) {
        console.error("AI Image Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateContentVideo(prompt: string) {
    try {
        const result = await nvidia.generateVideo(prompt);
        return { success: true, job_id: result.job_id };
    } catch (error: any) {
        console.error("AI Video Error:", error);
        return { success: false, error: error.message };
    }
}
