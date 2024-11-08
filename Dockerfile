FROM arm64v8/amazonlinux:latest

ARG NODE_VERSION=18

# Set up container
RUN yum -y update \
    && yum -y groupinstall "Development Tools" \
    && curl --silent --location https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && yum install -y \
        nodejs \
        python3 \
        which \
        binutils \
        sed \
        gcc-c++ \
        cairo-devel \
        libjpeg-turbo-devel \
        pango-devel \
        giflib-devel \
    && yum clean all \
    && rm -rf /var/cache/yum

# Set working directory
WORKDIR /var/task

# Copy package.json and yarn.lock
COPY package.json yarn.lock tsconfig.json .yarnrc.yml ./
COPY src ./src


# Ensure compatibility by installing nan and node-gyp globally
RUN npm install -g node-gyp nan yarn

RUN yarn set version 3.5.1

# Install node modules
RUN yarn install

RUN npm rebuild --target_arch=arm64


# Build the TypeScript code (if you are using TypeScript)
RUN yarn build
RUN ls -la  dist
RUN mkdir dist/services/assets
RUN cp ./src/assets/* dist/services/assets -r
RUN chmod +x dist/index.js

CMD ["node", "/var/task/dist/index.js"]

