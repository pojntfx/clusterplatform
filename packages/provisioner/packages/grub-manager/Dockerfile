FROM node:lts-alpine
COPY package.json .
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
CMD npm set registry ${NPM_REGISTRY} && npm install && node --inspect=0.0.0.0:9229 node_modules/moleculer/bin/moleculer-runner
