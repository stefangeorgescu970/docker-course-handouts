import { ceva, errorHandlerMiddleware, logRequest } from "./helpers/global.middleware";
import express, { json } from "express";
import cors from "cors";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { Configuration } from "../utils/Configuration";
import { Server } from "http";
import compression from "compression";

export const spawnServer: (config: Configuration) => Promise<Server> = (config: Configuration): Promise<Server> => {
    return new Promise<Server>((resolve, reject) => {
        const app: express.Application = express();
        const port: number = config.getExpressConfig().port;

        app.use(compression()); // GZip compression middleware
        app.use(cors()); // CORS configuration
        app.use(json({ limit: "50mb" }));
        app.use(logRequest);

        app.get("/:user_id", ceva)

        app.use(errorHandlerMiddleware);

        // Root
        app.all("/", (req, res) => res.redirect("/health"));

        const server: Server = app.listen(port, () => {
            console.log(`Started the server on port ${port} with`);
            resolve(server);
        });

        const httpTerminator: HttpTerminator = createHttpTerminator({
            server: server,
            gracefulTerminationTimeout: 60000, // max request timeout
        });

        const shutdown: (code: number) => Promise<void> = async (code: number): Promise<void> => {
            await httpTerminator.terminate();
            // This log might be lost due the way winston flushes logs to files. https://github.com/winstonjs/winston/issues/228
            console.log(`Server gracefully terminated`);
            process.exit(code);
        };

        process.once("unhandledRejection", async (reason: {} | null | undefined) => {
            console.log("worker unhandledRejection", { reason });
            await shutdown(1);
        });

        process.once("SIGTERM", async () => {
            console.log("Got SIGTERM starting graceful shutdown");
            await shutdown(0);
        });
    });
};
