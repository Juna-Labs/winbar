import { Wifi, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function WifiMenu({ wifiNetworks, isWifiOpen, setIsWifiOpen, connectingWifi, onConnectWifi }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsWifiOpen(!isWifiOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Wifi
                        size={20}
                        className="text-widget-active"
                        style={{ color: 'var(--color-widget-active)' }}
                    />
                    <span className="font-semibold text-sm">Wi-Fi Networks</span>
                </div>
                {isWifiOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isWifiOpen && (
                <div className="flex flex-col max-h-48 overflow-y-auto bg-black/20 border-t border-white/10 p-2 gap-1 custom-scrollbar">
                    {wifiNetworks.length === 0 ? (
                        <div className="p-3 text-center text-xs text-white/50 flex flex-col items-center gap-2">
                            <Loader2
                                size={16}
                                className="animate-spin text-widget-active"
                                style={{ color: 'var(--color-widget-active)' }}
                            />
                            Scanning networks...
                        </div>
                    ) : (
                        wifiNetworks.map((net, i) => (
                            <button
                                key={i}
                                onClick={() => onConnectWifi(net.ssid)}
                                disabled={connectingWifi === net.ssid}
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{net.ssid}</span>
                                    <span className="text-[10px] text-white/40">{net.security}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/60 font-medium">{net.signal}%</span>
                                    {connectingWifi === net.ssid ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin text-widget-active"
                                            style={{ color: 'var(--color-widget-active)' }}
                                        />
                                    ) : (
                                        <Wifi
                                            size={14}
                                            className={net.signal > 70 ? 'text-widget-active' : 'text-white/40'}
                                            style={net.signal > 70 ? { color: 'var(--color-widget-active)' } : {}}
                                        />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
