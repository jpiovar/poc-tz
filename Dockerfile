#FROM node:lts-alpine
FROM node:12.2.0-alpine
#FROM docker.io/library/centos:7

# Replace shell with bash so we can source files
# RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#20201009 JHUSAK to try to fix Error: could not get uid/gid   [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

# make sure apt is up to date
##RUN apk add update --fix-missing
RUN apk add --allow-untrusted curl \
&&  apk add bash \
&& touch ~/.bash_profile

##RUN apk add -y build-essential libssl-dev

ENV NVM_DIR /usr/local
##ENV NODE_VERSION 4.2.4

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash 

#RUN ${NVM_DIR}/nvm --version \
#&& source $NVM_DIR/nvm.sh \
#&& ${NVM_DIR}/nvm install node

##RUN nvm install #$NODE_VERSION 
##RUN nvm alias default #$NODE_VERSION 
#RUN ${NVM_DIR}/nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install simple http server for serving static content
#RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# add '/app/node_modules/.bin' to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
#COPY package.json /app/package.json

# install project dependencies
RUN npm install @vue/cli@3.7.0 -g \
&& npm install 

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
#RUN nvm use 10.15 \
RUN  npm run build

EXPOSE 8080
CMD ["npm", "run", "serve"]
