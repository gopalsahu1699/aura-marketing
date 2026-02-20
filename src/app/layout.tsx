import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Aura Marketing | AI-Powered Social Media Automation",
    description: "Revolutionize your presence across Instagram, Facebook, YouTube, and Google Business with our all-in-one AI-powered marketing orchestration platform.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0" />
            </head>
            <body suppressHydrationWarning className="bg-background text-foreground font-sans overflow-x-hidden antialiased">
                {children}
            </body>
        </html>
    );
}
