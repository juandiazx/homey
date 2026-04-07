FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 4173

CMD ["pnpm", "preview", "--host"]
