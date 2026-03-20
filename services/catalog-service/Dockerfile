# Debian slim: Prisma engine потребує сумісного OpenSSL (у чистому Alpine часто бракує libssl.so.1.1 для musl-бінарника).
FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY prisma ./prisma
RUN npm install && npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4001
CMD ["node", "dist/index.js"]
