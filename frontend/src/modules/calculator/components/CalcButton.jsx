export default function CalcButton({ label, icon: Icon, variant = 'digit', title, onClick }) {
    // Determine button variant style
    let style = {};
    let className = "flex items-center justify-center font-mono rounded-lg border transition-all active:scale-95 cursor-pointer text-base ";

    if (variant === 'action') {
        // Equal (=) button with primary active theme color
        style = {
            backgroundColor: 'var(--color-widget-active)',
            color: 'var(--color-widget-text)',
            border: '1px solid var(--color-widget-active-hover)'
        };
        className += "font-bold text-lg shadow-md hover:scale-[1.02] ";
    } else if (variant === 'danger') {
        // Clear (C) button
        className += "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-300 font-bold text-sm ";
    } else if (variant === 'operator') {
        // Arithmetic operators (+, -, ×, ÷)
        className += "bg-white/10 hover:bg-white/20 border-white/15 text-white font-bold ";
    } else if (variant === 'function') {
        // Functions (sqrt, sqr, %, parens, backspace, sign)
        className += "bg-white/5 hover:bg-white/15 border-white/10 text-white/80 text-sm ";
    } else {
        // Digits (0-9, .)
        className += "bg-white/5 hover:bg-white/15 border-white/10 text-white font-bold ";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            style={style}
            title={title || (typeof label === 'string' ? label : '')}
        >
            {Icon ? <Icon size={17} /> : label}
        </button>
    );
}
