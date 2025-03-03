# About

This project provides a web interface for displaying next bus departures of the Tisseo network in a simple and pretty UI.
It also provides an API that can be added in Home-Assistant (WIP).

# Installation

The project has been packaged in a simple and light docker image. You can run it by leveraging the power of docker compose.
Here is an exemple `docker-compose.yaml` file :

```yaml
services:
  frontend:
    image: anguspllg/tisseo:latest
    ports:
      - '3000:3000'
    environment:
      - PORT=3000
      - NODE_ENV=production
      - TZ=Europe/Paris
    env_file:
      - .env
    volumes:
      - ./config:/app/config
```

As you can see, this compose file relies on a `.env` file. You will need to create one containing your Tisseo API key using the following command :

```bash
echo "TISSEO_API_KEY=YOUR_API_KEY" > .env
```

Once done, you can start the container with

```bash
docker compsoe up -d
```

# Configuration

Once your container is running, a directory called config (if you didn't change it in the compose file) should have been created.
Inside it, you will find the main config file : `config.json`.
By default, it's populated with some bus lines and other default config.
If you want to configure the site to your needs (whitch you probably want to do), please refere to the following properties :

| Property                    | Type      | Required | Possible values | Default | Description                                                     |
| --------------------------- | --------- | -------- | --------------- | ------- | --------------------------------------------------------------- |
| `toTrack`                   | `array`   | ✅       | `object`        |         |                                                                 |
| `toTrack[].stopId`          | `string`  | ✅       | `string`        |         | The ID of the stop to track. (ex: `stop_point:SP_1234`)         |
| `toTrack[].lineId`          | `string`  |          | `string`        |         | The ID of the line to track. (ex: `line:123`)                   |
| `toTrack[].walkTime`        | `integer` |          | `0 <= x `       |         | The time in minutes it takes you to reach the bus stop.         |
| `toTrack[].numberOfResults` | `integer` |          | `1 <= x <= 15`  |         | The number of results to display for this entry.                |
| `pollInterval`              | `integer` |          | `15 <= x `      | `60`    | The time in seconnds between each refresh of the departure time |

> [!IMPORTANT]
> If you do not specify `toTrack[].lineId` for each entry, all departures from the stop will be displayed.
> Due to the nature of the Tisseo API, we cannot offer filtering by bus line in the UI.
> So we recommend adding an entry for each line even tho it's not mendatory.
