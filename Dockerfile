FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env .env ./
RUN yarn build

# Expose the port on which the app will run
EXPOSE 3001

# Start the server using the production build
CMD ["yarn", "start:prod"]