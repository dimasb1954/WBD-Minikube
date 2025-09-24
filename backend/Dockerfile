FROM node:20-alpine

RUN apk add --no-cache openssl

RUN apk add --no-cache postgresql postgresql-contrib redis

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma/

# COPY package*.json ./

# RUN npm install
RUN npm cache clean --force && \
    npm install --loglevel verbose

#COPY prisma ./prisma/
RUN npx prisma generate

COPY --chown=node:node . .

EXPOSE ${PORT} 5432 6379

COPY start.sh /home/node/app/start.sh

COPY ./.env.example ./.env

USER root
RUN chmod +x /home/node/app/start.sh

USER node
# CMD ["/usr/src/app/start.sh"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthcheck lagi')" || exit 1

CMD ["npm", "run", "dev"]

