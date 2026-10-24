import useCalcConverter from './hooks/useCalcConverter';
import CalculatorView from './components/CalculatorView';
import ConverterView from './components/ConverterView';

export default function CalculatorModule() {
    const {
        activeTab,
        setActiveTab,
        tabs,
        calculator,
        converter
    } = useCalcConverter();

    return (
        <div
            className="flex flex-col text-white pointer-events-auto resize overflow-hidden relative shadow-2xl"
            style={{
                width: '360px',
                height: '530px',
                minWidth: '340px',
                minHeight: '480px',
                backgroundColor: 'rgba(8, 16, 39, 0.95)',
                backdropFilter: 'blur(20px)'
            }}
        >
            <style>{`
                .scrollable::-webkit-scrollbar { width: 6px; }
                .scrollable::-webkit-scrollbar-track { background: transparent; }
                .scrollable::-webkit-scrollbar-thumb { background: var(--color-widget); border-radius: 10px; }
            `}</style>

            {/* Top Module Header */}
            <div className="flex items-center justify-between p-2.5 mx-1 mt-0">
                <div className="flex items-center gap-2 ml-2">
                    <span className="font-serif font-bold text-lg text-white">Calculator & Converter</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex px-3 pt-2 gap-1.5 border-b border-white/10 bg-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-1.5 px-2 rounded-t font-serif text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer"
                            style={{
                                borderBottomColor: isActive ? 'var(--color-widget-active)' : 'transparent',
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: isActive ? 'var(--color-widget-text)' : 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <Icon
                                size={14}
                                style={{
                                    color: isActive ? 'var(--color-widget-active)' : 'currentColor'
                                }}
                            />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-view Container (Keep mounted to preserve state across tab switches) */}
            <div className="flex-1 overflow-hidden flex flex-col relative border-l border-white/10 min-h-0">
                <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'calculator' ? '' : 'hidden'}`}>
                    <CalculatorView {...calculator} />
                </div>
                <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'converter' ? '' : 'hidden'}`}>
                    <ConverterView {...converter} />
                </div>
            </div>

            {/* Resizing grip indicator */}
            <div
                className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 pointer-events-none rounded-br-sm z-50 opacity-40"
                style={{ borderColor: 'var(--color-widget-active)' }}
            />
        </div>
    );
}
