FROM node:14-alpine

RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3030

CMD ["npm", "run", "start"]