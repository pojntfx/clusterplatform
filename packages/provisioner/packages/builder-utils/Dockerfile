FROM node:lts-alpine
RUN npm i -g npm-cli-login
RUN mkdir -p /app
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY src src
CMD npm-cli-login -u ${NPM_USER} -p ${NPM_PASS} -e ${NPM_EMAIL} -r ${NPM_REGISTRY}; \
    npm version prerelease --preid="$(cat /proc/sys/kernel/random/uuid)"; \
    npm publish --registry ${NPM_REGISTRY} --tag canary;
