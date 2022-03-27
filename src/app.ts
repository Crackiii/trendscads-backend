import express from "express";
import { getFullStories, getWebsiteData, getWebsiteDataBySearch } from "./controllers/website";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 8000);

app.use(function (_, res, next) {

  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Pass to next layer of middleware
  next();
});

/**
 * API examples routes.
 */
app.get("/", (_, res) => res.send("Welcome to Trendscads backend app"));

app.get("/story/:id", getWebsiteData);

app.get("/stories", getFullStories);

app.get("/search", getWebsiteDataBySearch);



export default app;