import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'winbar_calculator_history';

// Safe math evaluator using Shunting-yard algorithm (No eval)
function safeEvaluate(expression) {
    if (!expression || expression.trim() === '') return 0;

    // Normalize operators: '×' -> '*', '÷' -> '/'
    const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

    // Tokenize
    const tokens = [];
    let i = 0;
    while (i < sanitized.length) {
        const char = sanitized[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d|\./.test(char)) {
            let numStr = '';
            while (i < sanitized.length && (/\d|\./.test(sanitized[i]))) {
                numStr += sanitized[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            continue;
        }

        if (['+', '-', '*', '/', '%', '^'].includes(char)) {
            // Check for unary minus
            if (char === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'operator' || tokens[tokens.length - 1].value === '(')) {
                // Negative number following
                i++;
                let numStr = '-';
                while (i < sanitized.length && (/\d|\./.test(sanitized[i]))) {
                    numStr += sanitized[i];
                    i++;
                }
                tokens.push({ type: 'number', value: parseFloat(numStr) });
                continue;
            }

            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }

        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }

        i++; // skip unknown
    }

    if (tokens.length === 0) return 0;

    // Shunting-yard to RPN (Reverse Polish Notation)
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
    const outputQueue = [];
    const operatorStack = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        } else if (token.type === 'operator') {
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type === 'operator' &&
                precedence[operatorStack[operatorStack.length - 1].value] >= precedence[token.value]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token.value === '(') {
            operatorStack.push(token);
        } else if (token.value === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop(); // pop '('
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop());
    }

    // Evaluate RPN
    const evalStack = [];
    for (const token of outputQueue) {
        if (token.type === 'number') {
            evalStack.push(token.value);
        } else if (token.type === 'operator') {
            const b = evalStack.pop();
            const a = evalStack.pop();
            if (a === undefined || b === undefined) return NaN;

            let res = 0;
            switch (token.value) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/':
                    if (b === 0) return Infinity;
                    res = a / b;
                    break;
                case '%': res = a % b; break;
                case '^': res = Math.pow(a, b); break;
                default: return NaN;
            }
            evalStack.push(res);
        }
    }

    const finalVal = evalStack.pop();
    if (isNaN(finalVal)) return 'Error';
    if (!isFinite(finalVal)) return 'Infinity';

    // Round to avoid float precision issues (e.g. 0.1 + 0.2)
    return parseFloat(finalVal.toFixed(10));
}

export function useCalculator() {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isResult, setIsResult] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const containerRef = useRef(null);

    const saveHistory = (item) => {
        const updated = [item, ...history.slice(0, 29)]; // keep 30 items
        setHistory(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
    };

    const handleClearHistory = () => {
        setHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {}
    };

    const handleDigit = useCallback((digit) => {
        if (isResult) {
            setDisplay(digit === '.' ? '0.' : digit);
            setEquation('');
            setIsResult(false);
            return;
        }

        if (digit === '.') {
            if (display.includes('.')) return;
            setDisplay(prev => prev + '.');
            return;
        }

        if (display === '0') {
            setDisplay(digit);
        } else {
            // Cap at 16 digits
            if (display.replace(/[^0-9]/g, '').length < 16) {
                setDisplay(prev => prev + digit);
            }
        }
    }, [display, isResult]);

    const handleOperator = useCallback((op) => {
        const symbolMap = { '*': '×', '/': '÷', '-': '−', '+': '+' };
        const normOp = symbolMap[op] || op;

        if (isResult) {
            setEquation(`${display} ${normOp} `);
            setDisplay('0');
            setIsResult(false);
            return;
        }

        if (display === '0' && equation !== '') {
            // Update last operator
            setEquation(prev => prev.trim().slice(0, -1) + ` ${normOp} `);
            return;
        }

        setEquation(prev => `${prev}${display} ${normOp} `);
        setDisplay('0');
    }, [display, equation, isResult]);

    const handleCalculate = useCallback(() => {
        if (equation === '' && !isResult) return;

        const fullExpression = `${equation}${display}`;
        const res = safeEvaluate(fullExpression);

        if (res !== 'Error') {
            saveHistory({
                id: Date.now().toString(),
                expression: fullExpression,
                result: res.toString()
            });
        }

        setDisplay(res.toString());
        setEquation('');
        setIsResult(true);
    }, [equation, display, isResult, history]);

    const handleClear = useCallback(() => {
        setDisplay('0');
        setEquation('');
        setIsResult(false);
    }, []);

    const handleBackspace = useCallback(() => {
        if (isResult) {
            setEquation('');
            setIsResult(false);
            return;
        }
        if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
            setDisplay('0');
        } else {
            setDisplay(prev => prev.slice(0, -1));
        }
    }, [display, isResult]);

    const handleToggleSign = useCallback(() => {
        if (display === '0') return;
        setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    }, [display]);

    const handleSpecial = useCallback((fn) => {
        const val = parseFloat(display);
        if (isNaN(val)) return;

        let res = 0;
        let expr = '';

        if (fn === 'sqrt') {
            if (val < 0) {
                setDisplay('Error');
                setIsResult(true);
                return;
            }
            res = Math.sqrt(val);
            expr = `√(${display})`;
        } else if (fn === 'sqr') {
            res = val * val;
            expr = `sqr(${display})`;
        } else if (fn === 'reciprocal') {
            if (val === 0) {
                setDisplay('Infinity');
                setIsResult(true);
                return;
            }
            res = 1 / val;
            expr = `1/(${display})`;
        } else if (fn === 'percent') {
            res = val / 100;
            expr = `${display}%`;
        }

        const finalVal = parseFloat(res.toFixed(10));
        saveHistory({
            id: Date.now().toString(),
            expression: expr,
            result: finalVal.toString()
        });

        setDisplay(finalVal.toString());
        setIsResult(true);
    }, [display]);

    const handleSelectHistory = useCallback((item) => {
        setDisplay(item.result);
        setEquation('');
        setIsResult(true);
        setIsHistoryOpen(false);
    }, []);

    const copyToClipboard = useCallback(() => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(display);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [display]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if active element is an input outside calculator
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

            const key = e.key;

            if (/\d/.test(key)) {
                e.preventDefault();
                handleDigit(key);
            } else if (key === '.') {
                e.preventDefault();
                handleDigit('.');
            } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
                e.preventDefault();
                handleOperator(key);
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                handleCalculate();
            } else if (key === 'Backspace') {
                e.preventDefault();
                handleBackspace();
            } else if (key === 'Escape' || key.toLowerCase() === 'c') {
                e.preventDefault();
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDigit, handleOperator, handleCalculate, handleBackspace, handleClear]);

    return {
        display,
        equation,
        isResult,
        history,
        isHistoryOpen,
        setIsHistoryOpen,
        copied,
        containerRef,
        handleDigit,
        handleOperator,
        handleCalculate,
        handleClear,
        handleBackspace,
        handleToggleSign,
        handleSpecial,
        handleSelectHistory,
        handleClearHistory,
        copyToClipboard
    };
}
