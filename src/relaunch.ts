import { spawn } from 'child_process';

function startScript() {
    const script = spawn('node', ['--trace-uncaught', 'build/src/index.js']);

    script.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    script.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    script.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code !== 0) {
            console.log('Relaunching script...');
            startScript();
        }
    });
}

startScript();
