import { send, doWork } from "./lib.mjs";

const NAME = process.env.NAME;
const lockState = {};
let processingQueue = [];

export async function onMessage(message) {
  if (lockState[message]) {
    return;
  }
  lockState[message] = true;

  console.log(`WORK @ ${NAME}: ${await doWork(message)}`);

  processQueue();
}

export async function onStart() {
  console.log(`START: ${NAME}`);
}

export async function onRequest(word) {
  if (lockState[word]) {
    return;
  }
  lockState[word] = true;

  processingQueue.push(word);

  if (processingQueue.length === 1) {
    processQueue();
  }
}

async function processQueue() {
  const word = processingQueue.shift();

  if (word) {
    await send(word);
  }

  delete lockState[word];

  if (processingQueue.length > 0) {
    processQueue();
  }
}
