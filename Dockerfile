FROM node:carbon

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 3000
EXPOSE 27017

CMD ["node", "server.js" ]