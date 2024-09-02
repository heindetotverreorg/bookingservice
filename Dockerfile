FROM --platform=arm64 node:18

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

USER root

WORKDIR /app

COPY package.json .
COPY package-lock.json .

ARG VUE_APP_SERVERPORT 
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
ARG PUPPETEER_EXECUTABLE_PATH
ARG PROD_LIKE

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
