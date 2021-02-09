FROM node:current-alpine3.12 AS builder

WORKDIR /home/app

COPY package.json ./

RUN npm install


FROM node:current-alpine3.12

# RUN addgroup -g 1001 deepmap \
#     && adduser -u 1001 -G deepmap -s /bin/sh -D deepmap

# USER deepmap

WORKDIR /home/deepmap/tmp

COPY --from=builder /home/app/node_modules ./node_modules

COPY . .

CMD ["node"]
