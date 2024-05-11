FROM node:22 as build

WORKDIR /home/node/app

COPY . /home/node/app/

RUN npm install
RUN npm run front:build

FROM ubuntu
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=build /home/node/app/dist /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
