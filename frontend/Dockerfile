FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --loglevel verbose

COPY . .

EXPOSE 5137

CMD ["npm", "run", "dev"]