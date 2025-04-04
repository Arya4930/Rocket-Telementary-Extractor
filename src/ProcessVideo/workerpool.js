import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';

const NUM_WORKERS = Math.max(2, Math.floor(os.cpus().length / 2));

class WorkerPool {
    constructor(workerScript) {
        this.workers = [];
        this.queue = [];
        this.activeworkers = 0;
        this.workerScript = workerScript;

        for (let i = 0; i < NUM_WORKERS; i++) {
            this.workers.push(new Worker(workerScript));
        }
    }

    runTask(data) {
        return new Promise((resolve, reject) => {
            // console.log(`Queue length before task: ${this.queue.length}`);
            const worker = this.workers.pop();

            if (!worker) {
                this.queue.push({ data, resolve, reject });
                return;
            }

            this.activeworkers++;
            // console.log(`Active workers: ${this.activeworkers}`);

            worker.once('message', (result) => {
                // console.log(`Task completed, releasing worker`);
                resolve(result);
                this.activeworkers--;
                this.workers.push(worker);
                if (this.queue.length > 0) {
                    const nextTask = this.queue.shift();
                    this.runTask(nextTask.data)
                        .then(nextTask.resolve)
                        .catch(nextTask.reject);
                }
            });

            worker.once('error', (err) => {
                console.error(`Worker error: ${err.message}`);
                reject(err);
                this.activeworkers--;
                this.workers.push(worker);
            });

            worker.postMessage(data);
        });
    }

    close() {
        for (const workers of this.workers) {
            workers.terminate();
        }
    }
}

export const fuelWorkerPool = new WorkerPool(
    path.resolve('src/ProcessVideo/fuel/pythonWorker.js')
);
export const tiltWorkerPool = new WorkerPool(
    path.resolve('src/ProcessVideo/tilt/pythonWorker.js')
);
export const EngineWorkerPool = new WorkerPool(
    path.resolve('src/ProcessVideo/engines/pythonWorker.js')
);

// export const AnalyzeWorkerPool = new WorkerPool(
//     path.resolve('src/ProcessVideo/jsworker.js')
// );
