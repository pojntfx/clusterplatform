FROM fedora:29
RUN dnf install -y npm git gcc binutils make perl xz xz-devel
COPY package.json .
COPY package-lock.json .
RUN npm ci
ENV SERVICEDIR=src
ENV SERVICES=svc.js
ENV TRANSPORTER=TCP
COPY src src
CMD ["node_modules/.bin/moleculer-runner"]
