import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import ModuleRenderer from '../renderer/ModuleRenderer';

const DraggableModule = ({ id, modName, position, onStop, isVisible }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            position={position}
            onDrag={() => window.dispatchEvent(new Event('resize'))}
            onStop={(e, data) => {
                window.dispatchEvent(new Event('resize'));
                onStop(id, data);
            }}
            bounds="parent"
            handle=".drag-handle"
        >
            <div
                ref={nodeRef}
                className="absolute flex flex-col group items-center pointer-events-auto rounded-xl overflow-hidden bg-background/90 border border-border shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
                style={{ display: isVisible ? 'flex' : 'none' }}
            >
                <div className="drag-handle w-full h-5 cursor-move bg-black/20 hover:bg-black/40 border-b border-white/5 transition-all duration-200 z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
                </div>
                <div className="relative w-full h-full">
                    <ModuleRenderer name={modName} />
                </div>
            </div>
        </Draggable>
    );
};

const CATEGORY_MAP = {
    yamw: 'Home',
    sysinfo: 'Home',
    control: 'Home',
    launcher: 'Home',

    todo: 'Notes',
    notepad: 'Notes',
    drawing: 'Notes',

    companion: 'AI',

    serverinfo: 'Server',
    container: 'Server',
    terminal: 'Server'
};

const ScrollableContainer = ({ children, maxWidthClass = 'max-w-[300px]' }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const hasOverflow = el.scrollWidth > el.clientWidth + 2;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
                checkScroll();
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('resize', checkScroll);

        const observer = new ResizeObserver(checkScroll);
        observer.observe(el);

        return () => {
            el.removeEventListener('wheel', handleWheel);
            window.removeEventListener('resize', checkScroll);
            observer.disconnect();
        };
    }, [children]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = 140;
        el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        setTimeout(checkScroll, 200);
    };

    return (
        <div className={`flex items-center gap-1 min-w-0 ${maxWidthClass}`}>
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Scroll left"
                >
                    <ChevronLeft size={16} />
                </button>
            )}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth py-0.5 px-0.5 min-w-0 flex-1"
            >
                {children}
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Scroll right"
                >
                    <ChevronRight size={16} />
                </button>
            )}
        </div>
    );
};

export default function DraggableOverlay({ overlayId, title, modules = [], overlayTransparent = false }) {
    const [positions, setPositions] = useState({});
    const [hiddenModules, setHiddenModules] = useState([]);

    const availableCategories = Array.from(new Set(modules.map(m => CATEGORY_MAP[m] || 'Other')));
    const [activeTab, setActiveTab] = useState(availableCategories[0] || 'Home');

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!availableCategories.includes(activeTab) && availableCategories.length > 0) {
            setActiveTab(availableCategories[0]);
        }
    }, [modules]);

    useEffect(() => {
        const posKey = `modulePositions_${overlayId}`;
        const hidKey = `hiddenModules_${overlayId}`;

        const savedPos = localStorage.getItem(posKey);
        if (savedPos) {
            try { setPositions(JSON.parse(savedPos)); } catch (e) { }
        }

        const savedHid = localStorage.getItem(hidKey);
        if (savedHid) {
            try { setHiddenModules(JSON.parse(savedHid)); } catch (e) { }
        }

        setLoaded(true);
    }, [overlayId]);

    const handleDragStop = (id, data) => {
        const storageKey = `modulePositions_${overlayId}`;
        const newPositions = {
            ...positions,
            [id]: { x: data.x, y: data.y }
        };
        setPositions(newPositions);
        localStorage.setItem(storageKey, JSON.stringify(newPositions));
    };

    const toggleModule = (modName) => {
        const hidKey = `hiddenModules_${overlayId}`;
        let newHidden;
        if (hiddenModules.includes(modName)) {
            newHidden = hiddenModules.filter(m => m !== modName);
        } else {
            newHidden = [...hiddenModules, modName];
        }
        setHiddenModules(newHidden);
        localStorage.setItem(hidKey, JSON.stringify(newHidden));
    };

    const cleanLayout = () => {
        const storageKey = `modulePositions_${overlayId}`;
        const newPositions = { ...positions };

        const activeModules = modules.filter(m => (CATEGORY_MAP[m] || 'Other') === activeTab);

        activeModules.forEach((modName) => {
            const globalIndex = modules.indexOf(modName);
            const id = `${modName}-${globalIndex}`;

            const localIdx = activeModules.indexOf(modName);
            const row = Math.floor(localIdx / 3);
            const col = localIdx % 3;

            newPositions[id] = { x: 50 + (col * 420), y: 80 + (row * 420) };
        });

        setPositions(newPositions);
        localStorage.setItem(storageKey, JSON.stringify(newPositions));
    };

    if (!loaded) return null;

    const activeCategoryModules = modules.filter(m => (CATEGORY_MAP[m] || 'Other') === activeTab);

    return (
        <div className="flex-1 w-full relative p-4 animate-in fade-in duration-300 pointer-events-none overflow-hidden">
            {!overlayTransparent && modules.length > 0 && (
                <>
                    {/* Left: Clean Layout */}
                    <div
                        className="absolute bottom-6 left-8 flex items-center backdrop-blur-2xl border rounded-md p-1.5 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto select-none"
                        style={{
                            backgroundColor: 'var(--color-widget)',
                            borderColor: 'var(--color-widget-hover)'
                        }}
                    >
                        <button
                            onClick={cleanLayout}
                            className="px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)',
                            }}
                            title="Auto-arrange layout for active category"
                        >
                            <LayoutGrid size={14} />
                            <span>Clean Layout</span>
                        </button>
                    </div>

                    {/* Center: Category Switcher */}
                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center backdrop-blur-2xl border rounded-md p-1.5 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto select-none"
                        style={{
                            backgroundColor: 'var(--color-widget)',
                            borderColor: 'var(--color-widget-hover)'
                        }}
                    >
                        <ScrollableContainer maxWidthClass="max-w-[400px]">
                            {availableCategories.map(cat => {
                                const isActive = activeTab === cat;
                                return (
                                    <button
                                        key={`tab-${cat}`}
                                        onClick={() => setActiveTab(cat)}
                                        className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                                            isActive
                                                ? 'shadow-sm scale-100'
                                                : 'hover:bg-white/10 text-white/60 hover:text-white'
                                        }`}
                                        style={{
                                            backgroundColor: isActive ? 'var(--color-widget-active)' : 'transparent',
                                            color: 'var(--color-widget-text)',
                                            border: isActive ? '1px solid var(--color-widget-active-hover)' : '1px solid transparent',
                                        }}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </ScrollableContainer>
                    </div>

                    {/* Right: Module Toggles */}
                    <div
                        className="absolute bottom-6 right-8 flex items-center backdrop-blur-2xl border rounded-md p-1.5 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto select-none"
                        style={{
                            backgroundColor: 'var(--color-widget)',
                            borderColor: 'var(--color-widget-hover)'
                        }}
                    >
                        <ScrollableContainer maxWidthClass="max-w-[460px]">
                            {activeCategoryModules.map((modName) => {
                                const isHidden = hiddenModules.includes(modName);
                                return (
                                    <button
                                        key={`toggle-${modName}`}
                                        onClick={() => toggleModule(modName)}
                                        className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-200 shrink-0 flex items-center gap-2 cursor-pointer ${
                                            isHidden
                                                ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/10'
                                                : 'hover:scale-105 active:scale-95 shadow-sm'
                                        }`}
                                        style={!isHidden ? {
                                            backgroundColor: 'var(--color-widget-active)',
                                            color: 'var(--color-widget-text)',
                                            border: '1px solid var(--color-widget-active-hover)',
                                        } : {}}
                                        title={isHidden ? `Show ${modName}` : `Hide ${modName}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isHidden ? 'bg-white/20' : 'bg-white shadow-[0_0_5px_white]'}`} />
                                        <span className="capitalize">{modName}</span>
                                    </button>
                                );
                            })}
                            {activeCategoryModules.length === 0 && (
                                <span className="text-xs text-white/40 italic px-2">No modules</span>
                            )}
                        </ScrollableContainer>
                    </div>
                </>
            )}

            {modules.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h1 className="text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
                        {title}
                    </h1>
                    <p className="text-white/60 mb-12 text-lg">No modules configured in config.yaml for {overlayId}.</p>
                </div>
            ) : (
                modules.map((modName, index) => {
                    const cat = CATEGORY_MAP[modName] || 'Other';
                    const isVisible = (cat === activeTab) && !hiddenModules.includes(modName);

                    const id = `${modName}-${index}`;
                    const pos = positions[id] || { x: index * 40, y: (index * 40) + 80 };
                    return (
                        <DraggableModule
                            key={id}
                            id={id}
                            overlayId={overlayId}
                            modName={modName}
                            position={pos}
                            onStop={handleDragStop}
                            isVisible={isVisible}
                        />
                    );
                })
            )}
        </div>
    );
}
