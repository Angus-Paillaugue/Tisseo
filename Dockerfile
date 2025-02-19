FROM node:22-alpine AS build
WORKDIR /app

COPY ./package.json ./
RUN --mount=type=cache,target=/root/.npm npm install

COPY . .
RUN npm run build

# Prod server
FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=build /app/build build/
COPY --from=build /app/node_modules node_modules/
COPY package.json ./
EXPOSE ${PORT}
CMD [ "node", "build" ]
