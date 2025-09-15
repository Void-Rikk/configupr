const consoleEl = document.getElementById('console');
const inputForm = document.getElementById('inputForm');
const cmdInput = document.getElementById('cmdInput');

function appendToConsole(text, className = '') {
    const el = document.createElement('div');
    if (className) el.className = className;
    el.textContent = text;
    consoleEl.appendChild(el);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// простой парсер: разделяет по пробелам (несколько пробелов считаются одним)
function parseInput(raw) {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    // разделяем по пробелам (включая табы) - регулярка \s+
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    return { command, args };
}

function handleCommandLine(line) {
    appendToConsole(`> ${line}`, 'input-line');

    const parsed = parseInput(line);
    if (!parsed) return;

    const { command, args } = parsed;

    if (command === 'exit') {
        appendToConsole('exit: закрытие приложения...');
        // вызываем метод из preload -> main
        if (window.vfsAPI && typeof window.vfsAPI.exitApp === 'function') {
            window.vfsAPI.exitApp();
        } else {
            appendToConsole('Невозможно закрыть приложение из renderer (API не доступен).');
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

    appendToConsole(`Unknown command: ${command}`);
}

inputForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const line = cmdInput.value;
    if (!line.trim()) {
        cmdInput.value = '';
        return;
    }
    handleCommandLine(line);
    cmdInput.value = '';
    cmdInput.focus();
});
