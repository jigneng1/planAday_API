# PlanAday-WebAPI

## Prerequisites
- OS : Debians
- Bun environment https://bun.sh/docs/installation
- Docker CLI https://docs.docker.com/get-started/

## Installation

1.Clone

`https://github.com/jigneng1/planAday_API.git`

2.Install dependency

`bun install`

3.build image

`docker build -t {IMAGE_NAME} .`

For example 

`docker build -t planAday-API-image .`

4.Config Docker compose in `docker-compose.yml` file

```
version: "3.8"

services:
  app:
    image: "{IMAGE_NAME}" # OR your replace with docker registry image
    container_name: "${CONTAINER_NAME}"
    ports:
      - "${DOCKER_PORT}:3000"
    environment:
      - REDIS_URL=${REDIS_URL}
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URL=${MONGODB_URL}
    restart: unless-stopped
```

5. Run PLANADAY-API with DOCKER CONTAINER

   `cocker compose up -d`

**please ensure your are on the root path of this project**
