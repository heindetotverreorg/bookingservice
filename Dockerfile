# platform is set for a arm device because the server i deploy this to is an arm server. update to you personal needs
FROM --platform=linux/arm64 ubuntu:latest

ENV VUE_APP_SEVERPORT=8080

# update system add snap and add node user
RUN apt update -y
RUN useradd -m node

# install chromium
RUN apt install chromium -y

# install node
RUN apt install nodejs -y && apt install npm -y

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
