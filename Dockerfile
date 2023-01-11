FROM ubuntu:22.04

WORKDIR ~
# Without interactive dialogue
ARG DEBIAN_FRONTEND=noninteractive
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN apt-get update
RUN apt-get install -y wget curl gnupg2 software-properties-common git apt-utils vim dirmngr apt-transport-https ca-certificates

ENV NODE_VERSION 16.13.1
ENV NVM_DIR /root/.nvm

# Installing NVM, NodeJS and NPM
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.39.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default


ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

## Install Wine from WineHQ Repository
RUN dpkg --add-architecture i386
RUN wget -nc https://dl.winehq.org/wine-builds/winehq.key
RUN apt-key add winehq.key


RUN apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ bionic main'
RUN apt-get update
RUN apt-get install -y --install-recommends winehq-stable
## Installing mono
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN sh -c 'echo "deb https://download.mono-project.com/repo/ubuntu stable-bionic main" > /etc/apt/sources.list.d/mono-official-stable.list'
RUN apt-get update
RUN apt-get install -y mono-complete

# RUN PROJECT_DIR=/root/project
# RUN mkdir /project
# WORKDIR $PROJECT_DIR
