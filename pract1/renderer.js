const consoleEl = document.getElementById('console');
const inputForm = document.getElementById('inputForm');
const cmdInput = document.getElementById('cmdInput');

let scriptRunning = false;
let scriptAborted = false;

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

function handleCommandLine(line, fromScript = false) {
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
        appendToConsole(`ls вызвана с аргументами: ${args.length ? args.join(' ') : '(нет)'}`);
        return;
    }

    if (command === 'cd') {
        appendToConsole(`cd вызвана с аргументами: ${args.length ? args.join(' ') : '(нет)'}`);
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
        if (msg.type === 'run-script') {
            scriptRunning = true;
            scriptAborted = false;

            for (const line of msg.lines) {
                if (scriptAborted) break;
                handleCommandLine(line, true);
            }

            if (scriptAborted) {
                appendToConsole('[script stopped due to error]');
            }

            scriptRunning = false;
        } else if (msg.type === 'error') {
            appendToConsole(`[error] ${msg.message}`);
        }
    });
}

