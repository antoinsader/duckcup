# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# ? why here not registered with compose env ? or do we need to set them here for build time ?

ARG REACT_APP_API_BASE_URL=/api/
ARG REACT_APP_LOGIN_GOOGLE_ROUTE=/api/auth/login_google
ARG REACT_APP_FRONT_END_NAME=ThreadMind
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_LOGIN_GOOGLE_ROUTE=$REACT_APP_LOGIN_GOOGLE_ROUTE
ENV REACT_APP_FRONT_END_NAME=$REACT_APP_FRONT_END_NAME
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
