import express from "express";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 4000);

/**
 * API examples routes.
 */
app.get("/", (req, res) => res.send("Welcome to my trendscads backend"));


export default app;