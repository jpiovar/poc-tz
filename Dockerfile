FROM docker.io/library/centos:7

RUN yum install -y epel-release
RUN /usr/bin/curl --silent --location https://rpm.nodesource.com/setup_12.x | bash -
RUN yum install -y nodejs


# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash 
#--------------------------------------------------------------------

#NVM PART
ENV NVM_DIR /usr/local

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash 

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#--------------------------------------------------------------------
RUN mkdir -p /app

# make the 'app' folder the current working directory
WORKDIR /app

# add '/app/node_modules/.bin' to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

#20201009 JHUSAK try to fix  Error: Cannot find "/app/tsconfig.json" file. Please check webpack and ForkTsCheckerWebpackPlugin configuration.
#COPY tsconfig.json ./

#20201014b
RUN npm i  && ln -s /app/node_modules/ /node_modules
RUN npm cache clean --force && npm cache verify && npm i -g npm-check-updates
RUN npm-check-updates -u
RUN npm install

# install project dependencies
RUN npm install @vue/cli@3.7.0 -g \
&& npm install

#20201014 Added Jhusak 
npm cache clean --force && npm cache verify && npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN  npm run build

EXPOSE 8080
CMD ["npm", "run", "serve"]
