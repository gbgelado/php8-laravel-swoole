let fs = require("fs");
let chokidar = require("chokidar");
let colors = require("colors/safe");
let test = require("is-running");

// Define our watching parameters
let basePath = process.cwd();
let pidPath = basePath + "/storage/logs/swoole_http.pid";
let pid = fs.readFileSync(pidPath, "utf8");
let ready = false;

let logger = (color, message, level = "log", skipSignal = false) => {
    console[level](colors[color](message));

    if (ready && !skipSignal) {
        sendSignal();
    }
};

let isRunning = () => {
    const pids = pid.split(",");
    return pids.filter(p => !!test(parseInt(p)))
}

let sendSignal = () => {
    const getPid = fs.readFileSync(pidPath, "utf8");
    const pids = getPid.split(",")
    pids.map(p => {
        if (!test(parseInt(p))) {
            ready = false
            logger('red', `PID ${p} is not alive. Close watcher process.`, 'error')
            process.exit()
        }
    
        process.kill(parseInt(p), 'SIGKILL')
        // console.log(process.kill(parseInt(p), 'SIGUSR1'))
        logger('green', `Reloading process PID ${p}...`, 'log', true)
    })
  }

if (!isRunning(pid)) {
    logger("red", `PID ${pid} is not alive.`, "error");
    return;
} else {
    logger("green", `PID ${pid} is alive, start watching process...`);
}

// Initialize watcher.
// Define your paths here.
let watcher = chokidar.watch(
    [basePath + "/app", basePath + "/resources", basePath + "/routes"],
    {
        ignored: /(^|[\/\\])\../,
        persistent: true,
    }
);

// Add event listeners.
watcher
    .on("add", (path) => logger("yellow", `File ${path} has been added.`))
    .on("change", (path) => logger("yellow", `File ${path} has been changed.`))
    .on("unlink", (path) => logger("yellow", `File ${path} has been removed.`))
    .on("addDir", (path) =>
        logger("yellow", `Directory ${path} has been added.`)
    )
    .on("unlinkDir", (path) =>
        logger("yellow", `Directory ${path} has been removed.`)
    )
    .on("error", (error) => logger("red", `Watcher error: ${error}`))
    .on("ready", () => {
        logger(
            "green",
            "Initial scan is finished. Ready for watching changes..."
        );
        ready = true;
    });
