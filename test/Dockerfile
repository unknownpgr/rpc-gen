FROM node:16

WORKDIR /app

RUN yarn add @types/node
COPY ./ ./
RUN chmod 700 init.sh

ENTRYPOINT [ "sh", "init.sh" ]