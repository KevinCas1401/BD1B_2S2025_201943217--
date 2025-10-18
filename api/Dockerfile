FROM oraclelinux:8

RUN dnf -y module enable nodejs:20 && \
    dnf -y install nodejs git && \
    dnf -y install oracle-instantclient-release-el8 && \
    dnf -y install oracle-instantclient-basiclite && \
    dnf clean all

WORKDIR /app
COPY package.json .
RUN npm ci --omit=dev || npm i --omit=dev

COPY src ./src
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
