import { useState } from 'react';
import { LaunchTerminal } from '../../../wailsjs/go/terminal/Terminal';
import { EventsEmit } from '../../../wailsjs/runtime/runtime';
import { SquareTerminal } from 'lucide-react';

const TerminalModule = () => {
    const [sshTarget, setSshTarget] = useState("");

    return (
        <div className="p-6 text-white flex flex-col justify-center items-center text-center gap-4 min-w-80">
            <div>
                <h2 className="text-xl font-bold mb-1">Windows Terminal</h2>
                <p className="text-xs text-white/50">Launch a native shell instance</p>
            </div>

            <div className="w-full mt-2 flex flex-col gap-2">
                <button
                    onClick={() => {
                        LaunchTerminal("");
                        EventsEmit("toggle_dashboard");
                    }}
                    className="w-full py-2 hover:bg-[#3b82f6]/40 border border-[#3b82f6]/50 transition-all rounded-lg font-medium text-sm flex items-center justify-center gap-2 text-[#60a5fa]"
                >
                    Launch Terminal
                </button>

                <div className="flex gap-2 mt-2 w-full">
                    <input
                        type="text"
                        placeholder="user@server"
                        value={sshTarget}
                        onChange={(e) => setSshTarget(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#10b981]/50 transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && sshTarget.trim()) {
                                LaunchTerminal(sshTarget.trim());
                                EventsEmit("toggle_dashboard");
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (sshTarget.trim()) {
                                LaunchTerminal(sshTarget.trim());
                                EventsEmit("toggle_dashboard");
                            }
                        }}
                        className="px-4 py-2 bg-[#10b981]/20 hover:bg-[#10b981]/40 border border-[#10b981]/50 transition-all rounded-lg font-medium text-sm flex items-center justify-center text-[#34d399]"
                    >
                        SSH
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminalModule;
