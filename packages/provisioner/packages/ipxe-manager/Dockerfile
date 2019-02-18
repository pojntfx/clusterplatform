FROM node:lts-alpine
COPY package.json .
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
# No package-lock.json in dev and this hack - fetch the latest version from verdaccio, which
# only works if no package-lock.json is set (due to the changing version)
CMD npm set registry ${NPM_REGISTRY} && npm install && node_modules/.bin/moleculer-runner
