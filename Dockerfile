FROM node:carbon-alpine
RUN npm install pm2 -g

# Configure log rotate

RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:retain 10


# Create app directory

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source

COPY OAuth2Server-app /usr/src/app

# Install app dependencies
RUN npm install
RUN npm install -g @angular/cli

RUN ng build --prod --build-optimizer

VOLUME /usr/src/app/images

EXPOSE 3005 3006

CMD [ "pm2-docker", "npm", "--", "start" ]
