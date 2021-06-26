FROM node:lts-alpine

RUN mkdir -p /app/get-link-fs
WORKDIR /app/get-link-fs

COPY package*.json ./
RUN npm install
COPY . . 

EXPOSE 8080

CMD ["node", "src/index.js"]