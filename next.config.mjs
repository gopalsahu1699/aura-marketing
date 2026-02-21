/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    // Only use static export when explicitly building for Capacitor
    output: process.env.BUILD_MOBILE === '1' ? 'export' : undefined,
    distDir: process.env.BUILD_MOBILE === '1' ? 'out' : '.next',
    images: {
        unoptimized: true, // Required for Capacitor
    },
};

export default nextConfig;
