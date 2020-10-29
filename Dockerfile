# set the base image to Debian
# https://www.brianchristner.io/docker-image-base-os-size-comparison/
# https://hub.docker.com/_/debian/
#FROM debian:jessie-slim
FROM debian:stable

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install base dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        python \
        rsync \
        software-properties-common \
        devscripts \
        autoconf \
        ssl-cert \
    && apt-get clean

# update the repository sources list
# and install dependencies
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# confirm installation
RUN node -v
RUN npm -v

# Use latest npm
#RUN npm install -g npm@7.0.6
RUN npm i npm@latest -g

# make the 'app' folder the current working directory
WORKDIR /app

# add '/app/node_modules/.bin' to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

#20201009 JHUSAK try to fix  Error: Cannot find "/app/tsconfig.json" file. Please check webpack and ForkTsCheckerWebpackPlugin configuration.
#COPY tsconfig.json ./

# install project dependencies
#RUN npm install @vue/cli@4.5.8 -g \
RUN npm install -g @vue/cli \
&& npm install && npm update \
&& npm audit fix --force


#20201014 Added Jhusak 
#npm cache clean --force && npm cache verify && npm install && npm update

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
#RUN nvm use 10.15 \
RUN npm run build
RUN npm update

EXPOSE 8080
CMD ["npm", "run", "serve"]
