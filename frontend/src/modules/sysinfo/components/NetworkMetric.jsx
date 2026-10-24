export default function NetworkMetric({ icon: Icon, label, value, iconColorClass = "text-widget-active", bgClass = "bg-widget" }) {
    return (
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div
                className={`p-2 ${bgClass} border border-border/40 rounded-lg ${iconColorClass}`}
                style={{
                    backgroundColor: 'var(--color-widget)',
                    color: 'var(--color-widget-active)'
                }}
            >
                <Icon size={18} />
            </div>
            <div>
                <div className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">{label}</div>
                <div className="text-white font-bold">{value?.toFixed(2) || '0.00'} <span className="text-xs text-white/60 font-medium">MB/s</span></div>
            </div>
        </div>
    );
}
