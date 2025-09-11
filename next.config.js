/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: true,
    },

    images: {
        remotePatterns: [
            {
                // Allow all https domains
                protocol: 'https',
                hostname: '*',
            },
            {
                // Allow all http domains
                protocol: 'http',
                hostname: '*',
            },
            {
                protocol: 'https',
                hostname: 'leptonstoragedev.blob.core.windows.net',
                pathname: '/**', // Restrict to the path `/imagejpeg/*`
            },
            {
                protocol: 'https',
                hostname: 'leptonstoragepro.blob.core.windows.net',
                pathname: '/**', // Restrict to the path `/imagejpeg/*`
            },
        ],
    },
};

export default config;
