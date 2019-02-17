FROM node:lts-alpine
RUN apk add git gcc binutils make
COPY package.json .
COPY package-lock.json .
RUN npm ci
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
CMD ["node_modules/.bin/moleculer-runner"]
