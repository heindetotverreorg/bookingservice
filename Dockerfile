FROM --platform=arm64 node:16-alpine3.15

USER root

RUN apk add 
RUN apk add chromium

WORKDIR /app

COPY package.json .
COPY package-lock.json .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
ENV VUE_APP_SERVERPORT 8080
ENV PROD_LIKE true

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
