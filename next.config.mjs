const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' && !process.env.STATIC_EXPORT;

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: isVercel ? undefined : 'export', // Required for Capacitor, but disabled on Vercel
    distDir: isVercel ? '.next' : 'out',
    images: {
        unoptimized: true, // Required for Capacitor
    },
};

export default nextConfig;
