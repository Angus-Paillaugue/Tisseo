#!/bin/bash

# Get the docker-compose.yaml file
curl -o docker-compose.yaml https://raw.githubusercontent.com/Angus-Paillaugue/Tisseo/refs/heads/main/docker-compose.yaml

# Get the exemple env file
curl -o .env https://raw.githubusercontent.com/Angus-Paillaugue/Tisseo/refs/heads/main/.env.exemple

echo "You can noy edit the .env file and put your API key."
echo "Once done, you can just run the frontend with : "
echo "docker compose up -d"
