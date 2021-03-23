# Stage 0, "build-dev", based on Node.js, to build and compile the frontend
FROM node:15.12.0-alpine3.13 AS dev-build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
# Stage 1, install nginx and copy distributed package
FROM nginx:stable-alpine 
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=dev-build /usr/src/app/www /usr/share/nginx/html
