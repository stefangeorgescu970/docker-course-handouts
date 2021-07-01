import cluster, { Worker } from "cluster";
import { Configuration } from "../utils/Configuration";
import { spawnServer } from "./server";
import { cpus } from "os";

if (process.env.NODE_ENV === "local") {
    const config: Configuration = Configuration.getInstance();
    spawnServer(config);
} else if (cluster.isMaster) {
    let finishing: boolean = false;
    const config: Configuration = Configuration.getInstance();

    const forkConsumer: () => void = () => {
        const worker: cluster.Worker = cluster.fork();
    };

    const noWorkers: number = cpus().length > 1 ? cpus().length - 1 : 1;
    console.log(`[master] Spawning ${noWorkers} workers`);

    for (let i: number = 0; i < noWorkers; i++) {
        forkConsumer();
    }

    process.once("SIGTERM", () => {
        finishing = true;
        // send signal to close all workers
        if (!cluster.workers) {
            return;
        }
        for (const id in cluster.workers) {
            cluster.workers[id]?.disconnect();
        }
    });

    cluster.on("exit", (worker: Worker, code: number, signal: string) => {
        // relaunch another worker in case one crashes
        if (!finishing) {
            console.log(`worker ${worker.process.pid} exit with code ${code}`);
            if (process.env.NODE_ENV === "prod") {
                forkConsumer();
            }
        } else {
            console.log(`worker ${worker.process.pid} exit normally`);
        }
    });
} else if (cluster.isWorker) {
    const config: Configuration = Configuration.getInstance();
    spawnServer(config);
}
