# NPM Multi task runner

really  simple helper to allow to get typescript compilation in watch mode with multiple compilation that exist in the same project
feel free to adapt to your needs

example use - build a script 'run-all-task.js'
````javascript
const multiTaskRunner = require("npm-mutli-task-runner");
// basically this script allows to pass arguments to all build tasks without repeating them for each invocation
const args = process.argv.slice(2); // slice off node and this script
const parallelMode = args[0] && args[0].trim() === "-p"; // parallel mode is good for non-dependant or long running tasks (watch mode etc)
if (parallelMode) {
  args.splice(0, 1); // remove '-p' - directed at this script
}
const buildType = "build:";
const targets = ["node", "browser"].map((target) => buildType + target);
const projectPath = __dirname;
console.log(targets);

try {
  (async () => {
      await multiTaskRunner(targets, args, parallelMode, projectPath);
    }
  )();
} catch (e) {
  console.error("build failed: ", e.message || e);
  process.exit(1);
}

````
in package.json use it as follows
````json
{
...
"scripts": {
	"build": "node ./build_all_configurations.js -p",
	"build:browser": "tsc -p ./src/browser",
	"build:node": "tsc -p ./src",
	"dev": "npm run build -- -w",
	}
}
````
