import HyperExpress from "hyper-express";
import { linesIds } from "./config.js";
import { getNextDepartures } from "./index.js";

const port = 8193

const webserver = new HyperExpress.Server();

webserver.get("/", (request, response) => {
  response.send("Server is working");
});

webserver.get("/nextDepartures", async(request, response) => {
  try {
    const nextDepartures = await getNextDepartures(linesIds);

    response.json(nextDepartures);
  } catch(e) {
    response.status(500).send("An error occurred: " + e.message);
  }
});


webserver.listen(port);
