import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(140,43,238,0.15),transparent_70%)] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(140,43,238,0.1),transparent_70%)] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    );
}
