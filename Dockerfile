FROM node:carbon
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN git clone https://github.com/legaard/au-schedule.git
RUN cd au-schedule && npm install && npm run build && cp -R dist/ ../public
COPY . .
EXPOSE 80
CMD ["npm", "start", "80"]