function parseImageRemoteHosts() {
  const raw = process.env.NEXT_IMAGE_REMOTE_HOSTS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Keep external image URLs fully flexible for admin-provided product links.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.wired.com",
        pathname: "/**",
      },
      ...parseImageRemoteHosts(),
      ...(process.env.NODE_ENV === "development"
        ? [
            { protocol: "http", hostname: "localhost", pathname: "/**" },
            { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
          ]
        : []),
    ],
  },
};

export default nextConfig;
