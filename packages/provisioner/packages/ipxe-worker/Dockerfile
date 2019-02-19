FROM fedora:29
RUN dnf install -y npm git gcc binutils make perl xz xz-devel
COPY package.json .
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
CMD npm set registry ${NPM_REGISTRY} && npm install && node_modules/.bin/moleculer-runner
