FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps ./apps
COPY tailwind.config.js postcss.config.js tsconfig.base.json ./

ARG VITE_API_URL=https://api.altisonelabz.com
ARG VITE_LANDING_URL=https://altisonelabz.com
ARG VITE_ADMIN_URL=https://admin.altisonelabz.com
ARG VITE_LMS_URL=https://lms.altisonelabz.com
ARG VITE_MENTOR_URL=https://mentor.altisonelabz.com

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LANDING_URL=$VITE_LANDING_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
ENV VITE_LMS_URL=$VITE_LMS_URL
ENV VITE_MENTOR_URL=$VITE_MENTOR_URL

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm build:all

# Output stage - dist folders are in apps/*/dist
FROM alpine:3.19
WORKDIR /dist
COPY --from=builder /app/apps/landing/dist ./landing
COPY --from=builder /app/apps/admin/dist ./admin
COPY --from=builder /app/apps/lms/dist ./lms
COPY --from=builder /app/apps/mentor/dist ./mentor
