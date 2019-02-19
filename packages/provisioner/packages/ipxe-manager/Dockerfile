FROM node:lts-alpine
COPY package.json .
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
CMD npm set registry ${NPM_REGISTRY} && npm install && node_modules/.bin/moleculer-runner
