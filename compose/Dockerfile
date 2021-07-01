FROM node:12.20.1

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y dirmngr && \
    apt-get install -y htop && \
    apt-get install -y apt-transport-https && \
    apt-get install -y lsb-release && \
    apt-get install -y ca-certificates && \
    apt-get install -y psmisc && \
    apt-get clean

COPY ./src /var/app/src
COPY ./package.json /var/app/package.json
COPY ./tsconfig.json /var/app/tsconfig.json
COPY ./yarn.lock /var/app/yarn.lock

WORKDIR /var/app

RUN yarn && yarn build

CMD ["node", "/var/app/build/api/cluster.js"]

