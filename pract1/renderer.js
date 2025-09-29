const consoleEl = document.getElementById('console');
const inputForm = document.getElementById('inputForm');
const cmdInput = document.getElementById('cmdInput');

let scriptRunning = false;
let scriptAborted = false;

let vfs = null;
let currentDir = null;
const context = [];

function findChild(dir, name) {
    if (!(name[0] === '/')) {
        name = '/' + name;
    }
    return dir.children.find(c => c.name === name);
}

function appendToConsole(text, className = '') {
    const el = document.createElement('div');
    if (className) el.className = className;
    el.textContent = text;
    consoleEl.appendChild(el);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function parseInput(raw) {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    return { command, args };
}

async function handleCommandLine(line, fromScript = false) {
    appendToConsole(`> ${line}`, 'input-line');

    const parsed = parseInput(line);
    if (!parsed) return;

    const { command, args } = parsed;

    if (command === 'exit') {
        appendToConsole('exit: закрытие приложения...');
        if (!fromScript && window.vfsAPI && typeof window.vfsAPI.exitApp === 'function') {
            window.vfsAPI.exitApp();
        }
        return;
    }


    if (command === 'ls') {
        if (!currentDir) {
            appendToConsole("[error] VFS not loaded");
            return;
        }
        const list = currentDir.children.map(c => `${c.type}: ${c.name}`).join(", ");
        appendToConsole(list || "(пусто)");
        return;
    }

    if (command === 'cd') {
        if (!currentDir) {
            appendToConsole("[error] VFS not loaded");
            return;
        }
        if (args.length === 0) {
            appendToConsole("[error] cd: укажите директорию");
            return;
        }
        if (args[0] === '..' || args[0] === '../') {
            currentDir = context[context.length - 1] ?? currentDir;
            appendToConsole(`вернулись в ${context.pop().name}`);
            return;
        }
        const target = findChild(currentDir, args[0]);
        if (!target || target.type !== "dir") {
            appendToConsole(`[error] cd: нет такой директории: ${args[0]}`);
            if (fromScript) scriptAborted = true;
            return;
        }
        context.push(currentDir);
        currentDir = target;
        appendToConsole(`перешли в ${args[0]}`);
        return;
    }

    if (command === 'echo') {
        const parsedArg = args.join(" ");
        const regExp = /^["']+.*["']$/;
        if (regExp.test(parsedArg)) {
            appendToConsole(parsedArg.slice(1, -1));
        }
        else {
            appendToConsole(parsedArg);
        }
        return;
    }

    if (command === 'tail') {
        if (!currentDir) {
            appendToConsole("[error] VFS not loaded");
            return;
        }
        const file = currentDir.children.find(c => c.name === args[0]);
        if (!file) {
            appendToConsole("[error] no such file");
            return;
        }
        const lines = file.content.split('\n');
        for (let i = (lines.length - 11 || 0); i < lines.length; i++) {
            appendToConsole(lines[i].trim());
        }
        return;
    }

    if (command === 'rmdir') {
        if (!currentDir) {
            appendToConsole("[error] VFS not loaded");
            return;
        }
        const dir = currentDir.children.find(c => (c.name === args[0] && c.type === "dir"));
        if (!dir) {
            appendToConsole("[error] directory is not empty or no such directory");
        }
        currentDir.children = currentDir.children.filter(item => !(item.name === dir.name && item.type === "dir"));
        return;
    }

    appendToConsole(`[error] Unknown command: ${command}`);
    if (fromScript) {
        scriptAborted = true;
    }
}

inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const line = cmdInput.value;
    if (!line.trim()) {
        cmdInput.value = '';
        return;
    }
    handleCommandLine(line);
    cmdInput.value = '';
    cmdInput.focus();
});

if (window.vfsAPI) {
    window.vfsAPI.onOutput((msg) => {
        if (msg.type === 'vfs-loaded') {
            vfs = msg.vfs;
            currentDir = vfs;
            appendToConsole("VFS успешно загружен");
        } else if (msg.type === 'run-script') {
            scriptRunning = true;
            scriptAborted = false;

            for (const line of msg.lines) {
                if (scriptAborted) {
                    appendToConsole('[script stopped due to error]');
                    break;
                }
                handleCommandLine(line, true);
            }

            scriptRunning = false;
        } else if (msg.type === 'error') {
            appendToConsole(`[error] ${msg.message}`);
        }
    });
}

