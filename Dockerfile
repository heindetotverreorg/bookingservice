FROM --platform=linux/arm64 node:18

USER root

RUN apt search chromium-browser \
    apt install chromium-browser

RUN apt-get update \
 && chromium --version

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
