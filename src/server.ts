import errorHandler from "errorhandler";
import app from "./app";


/**
 * Error Handler. Provides full stack
 */

if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    console.log(
        "Trendscads app is running at %d in %s mode",
        app.get("port"),
        app.get("env")
    );
});

export default server;