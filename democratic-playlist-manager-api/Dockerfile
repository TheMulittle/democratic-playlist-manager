FROM node:lts-alpine

ENV SPOTIFY_CALLBACK=http://localhost:8080/callback
ENV WEB_APP_BASE_URL=http://localhost:3000

WORKDIR /app

COPY ./node_modules ./node_modules

COPY ./src ./src

COPY ./package.json .

EXPOSE 8080

CMD ["npm", "run", "start"]