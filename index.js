const { exec, execSync } = require("child_process");
const isWin = process.platform.indexOf("win") > -1;
const where = isWin ? "where" : "which";
const whereStdout = execSync(where + " npm", { encoding: "utf8" });
const npmPath = whereStdout.split(/\n|\r\n/)[0].trim();
// basically this script allows to pass arguments to all build tasks without repeating them for each invocation

module.exports = function npmMultiTaskRunner(tasksArr, argsArr, parallelMode, cwd = process.cwd()) {

  function createTask(task, args) {
    return new Promise((resolve, reject) => {
      let cmd = task;
      if (args.length > 0) {
        cmd += " -- " + args.join(" "); // add '--' to args for npm commands to pass
      }
      console.log("stating task ", cmd);
      const child = exec(cmd, { cwd: cwd, encoding: "utf8" });
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
      child.on("exit", (code) => {
        if (code) {
          reject(code);
        } else {
          resolve();
        }
      });
      child.on("error", (e) => {
        throw new Error(`task ${task} failed: ${e.message || e}`);
      });
    });
  }
  try {
    (async () => {
      for (let task of tasksArr) {
        const promise = createTask(`"${npmPath}" run ${task}`, argsArr,cwd);
        if (!parallelMode) await promise;
      }
    })();
  } catch (e) {
    console.error("multi npm task failed: ", e.message || e);
    process.exit(1);
  }

};

