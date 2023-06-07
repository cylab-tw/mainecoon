FROM node:18.16-buster-slim
#return to root
WORKDIR /

RUN apt-get update
RUN apt-get install vim -y

RUN mkdir -p  /app/
WORKDIR /app/
COPY package*.json /app/

RUN npm install && npm install -g nodemon
#RUN npm install pm2@latest -g

COPY . /app/

EXPOSE 8080

CMD [ "npm" , "run", "dev"]
