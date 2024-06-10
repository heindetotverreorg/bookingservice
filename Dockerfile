# platform is set for a arm device because the server i deploy this to is an arm server. update to you personal needs
FROM --platform=linux/arm64 ubuntu:latest

ENV VUE_APP_SEVERPORT=8080

# update system and add node user
RUN apt update -y && apt upgrade -y && useradd -m node

# install deps
RUN apt install -y --no-install-recommends \
curl jq build-essential libssl-dev libffi-dev python3 python3-venv python3-dev python3-pip 

# install chromium
RUN apt install chromium -y && chromium-browser -y

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
