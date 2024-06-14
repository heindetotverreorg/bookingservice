FROM ghcr.io/puppeteer/puppeteer:22.10.1

ENV VUE_APP_SEVERPORT=8080

USER heindetotverre

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
