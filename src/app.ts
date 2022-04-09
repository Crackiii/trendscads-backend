import axios from "axios";
import express from "express";
import { getGoogleDailyTrends, getGoogleRealTimeTrends, getYoutubeTrends } from "./controllers/trends-handlers";
import { getFullStories, getWebsiteData, getWebsiteDataBySearch } from "./controllers/website";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 8000);

app.use(function (_, res, next) {

  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

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

const getVQD = async (query: string) => {
  const vqd = await axios.get(`https://duckduckgo.com/?q=${query}&ia=web`).then(res => {
    return res.data.match(/vqd=([0-9]+-[0-9]+-[0-9]+)/gm)[0].split("=")[1];
  });

  return vqd;
};


app.get("/search/videos", async (request, response)  => {
  try{
  const query = request.query.searchQuery;
  const vqd = await getVQD(query as string);
  const data = await axios.get(`https://duckduckgo.com/v.js?l=us-en&o=json&q=${query}&vqd=${vqd}`);

  response.send(data.data.results);
} catch(error) {
  response.send({error: error.message});
}
});

app.get("/search/news", async (request, response)  => {
  try {
    const query = request.query.searchQuery;
    const vqd = await getVQD(query as string);
    const data = await axios.get(`https://duckduckgo.com/news.js?l=us-en&o=json&q=${query}&vqd=${vqd}`);
  
    response.send(data.data.results);
  } catch(error) {
    response.send({error: error.message});
  }
  
});


app.get("/home/google/realtime", async (request, response)  => {
  try {
    const country = request.query.country;
    const data = await getGoogleRealTimeTrends(country as string);

    response.send(data);
  } catch(errror) {
    response.send({data: [], error: errror.message});
  }
});

app.get("/home/google/daily", async (request, response)  => {
  try {
    const country = request.query.country;
    const data = await getGoogleDailyTrends(country as string);

    response.send(data);
  } catch(errror) {
    response.send({data: [], error: errror.message});
  }
});

app.get("/home/youtube", async (_, response)  => {
  try {
    const data = await getYoutubeTrends();

    response.send(data);
  } catch(errror) {
    response.send({data: [], error: errror.message});
  }
});



export default app;

