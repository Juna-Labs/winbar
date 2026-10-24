import { History, Copy, Check, Trash2, X, Delete } from 'lucide-react';
import CalcButton from './CalcButton';

const KEYPAD_KEYS = [
    { key: 'clear', label: 'C', variant: 'danger', action: 'clear', title: 'Clear' },
    { key: 'paren_open', label: '(', variant: 'function', action: 'digit', value: '(', title: 'Left Parenthesis' },
    { key: 'paren_close', label: ')', variant: 'function', action: 'digit', value: ')', title: 'Right Parenthesis' },
    { key: 'backspace', icon: Delete, variant: 'function', action: 'backspace', title: 'Backspace' },

    { key: 'sqrt', label: '√', variant: 'function', action: 'special', value: 'sqrt', title: 'Square Root (√)' },
    { key: 'sqr', label: 'x²', variant: 'function', action: 'special', value: 'sqr', title: 'Square (x²)' },
    { key: 'percent', label: '%', variant: 'function', action: 'special', value: 'percent', title: 'Percent (%)' },
    { key: 'div', label: '÷', variant: 'operator', action: 'operator', value: '/', title: 'Divide (÷)' },

    { key: '7', label: '7', variant: 'digit', action: 'digit', value: '7' },
    { key: '8', label: '8', variant: 'digit', action: 'digit', value: '8' },
    { key: '9', label: '9', variant: 'digit', action: 'digit', value: '9' },
    { key: 'mul', label: '×', variant: 'operator', action: 'operator', value: '*', title: 'Multiply (×)' },

    { key: '4', label: '4', variant: 'digit', action: 'digit', value: '4' },
    { key: '5', label: '5', variant: 'digit', action: 'digit', value: '5' },
    { key: '6', label: '6', variant: 'digit', action: 'digit', value: '6' },
    { key: 'sub', label: '−', variant: 'operator', action: 'operator', value: '-', title: 'Subtract (−)' },

    { key: '1', label: '1', variant: 'digit', action: 'digit', value: '1' },
    { key: '2', label: '2', variant: 'digit', action: 'digit', value: '2' },
    { key: '3', label: '3', variant: 'digit', action: 'digit', value: '3' },
    { key: 'add', label: '+', variant: 'operator', action: 'operator', value: '+', title: 'Add (+)' },

    { key: 'toggle_sign', label: '±', variant: 'function', action: 'toggleSign', title: 'Toggle Positive/Negative' },
    { key: '0', label: '0', variant: 'digit', action: 'digit', value: '0' },
    { key: 'dot', label: '.', variant: 'digit', action: 'digit', value: '.' },
    { key: 'calculate', label: '=', variant: 'action', action: 'calculate', title: 'Calculate (=)' }
];

export default function CalculatorView({
    display = '0',
    equation = '',
    history = [],
    isHistoryOpen = false,
    setIsHistoryOpen,
    copied = false,
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
}) {
    const handleKeyAction = (item) => {
        switch (item.action) {
            case 'digit':
                handleDigit(item.value);
                break;
            case 'operator':
                handleOperator(item.value);
                break;
            case 'special':
                handleSpecial(item.value);
                break;
            case 'clear':
                handleClear();
                break;
            case 'backspace':
                handleBackspace();
                break;
            case 'toggleSign':
                handleToggleSign();
                break;
            case 'calculate':
                handleCalculate();
                break;
            default:
                break;
        }
    };

    const getFontSizeClass = (text) => {
        const len = text.length;
        if (len > 15) return 'text-xl';
        if (len > 10) return 'text-2xl';
        return 'text-3xl';
    };

    return (
        <div className="flex-1 flex flex-col justify-between p-3 select-none relative overflow-y-auto scrollable min-h-0">
            {/* Top Display Screen */}
            <div className="flex flex-col justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 mb-2 relative group shadow-inner">
                {/* Upper row: Equation and History toggle */}
                <div className="flex items-center justify-between text-xs text-white/50 font-mono h-5 overflow-hidden">
                    <span className="truncate max-w-55 tracking-wide">
                        {equation || '\u00A0'}
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                            isHistoryOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/50 hover:text-white'
                        }`}
                        title="Calculation History"
                    >
                        <History size={13} />
                        {history.length > 0 && (
                            <span className="text-[10px] px-1 rounded-full bg-white/20 font-bold">
                                {history.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Lower row: Primary Number Display & Copy Button */}
                <div className="flex items-center justify-between mt-0.5">
                    <span className={`font-mono font-bold tracking-tight text-white drop-shadow truncate ${getFontSizeClass(display)}`}>
                        {display}
                    </span>

                    <button
                        type="button"
                        onClick={copyToClipboard}
                        className="p-1.5 rounded opacity-40 group-hover:opacity-100 hover:bg-white/10 text-white transition-all cursor-pointer"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                </div>
            </div>

            {/* History Overlay Panel (Slide down when open) */}
            {isHistoryOpen && (
                <div className="absolute inset-x-3 top-3 bottom-3 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl z-20 flex flex-col p-3 shadow-2xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                            <History size={15} style={{ color: 'var(--color-widget-active)' }} />
                            <span className="text-xs font-bold uppercase tracking-wider text-white">History</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="p-1 text-white/50 hover:text-red-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                                    title="Clear all history"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-1.5 pr-0.5">
                        {history.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-xs text-white/40 italic py-10">
                                No calculations yet
                            </div>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectHistory(item)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/15 cursor-pointer transition-all flex flex-col items-end group"
                                >
                                    <span className="text-[11px] font-mono text-white/50 truncate max-w-full">
                                        {item.expression} =
                                    </span>
                                    <span className="text-sm font-mono font-bold text-white group-hover:text-widget-active transition-colors">
                                        {item.result}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Keypad Grid: Clean Loop over KEYPAD_KEYS using CalcButton */}
            <div className="flex-1 grid grid-cols-4 grid-rows-6 gap-1.5 min-h-0">
                {KEYPAD_KEYS.map(item => (
                    <CalcButton
                        key={item.key}
                        label={item.label}
                        icon={item.icon}
                        variant={item.variant}
                        title={item.title}
                        onClick={() => handleKeyAction(item)}
                    />
                ))}
            </div>
        </div>
    );
}
