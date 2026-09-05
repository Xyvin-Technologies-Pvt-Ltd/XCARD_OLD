# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.5.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy package definition and source code
COPY . .

# Install production dependencies
RUN npm ci --omit=dev

# Create uploads directory and set permissions
RUN mkdir -p /usr/src/app/uploads && \
    chown -R node:node /usr/src/app && \
    chmod 755 /usr/src/app/uploads

USER node

EXPOSE 8000

CMD ["npm", "start"]

