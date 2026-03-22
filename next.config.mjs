/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 禁用严格模式，提升开发环境性能
  poweredByHeader: false,
  //devIndicators: false,
  compress: true,
  images: {
    domains: ['oss.01bai.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oss.01bai.com',
        port: '99',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  }
}

export default nextConfig;
