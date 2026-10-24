import { useServerStats } from './hooks/useServerStats';
import ServerHeader from './components/ServerHeader';
import StatCard from './components/StatCard';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';

const ServerInfo = () => {
    const { stats, error, refreshRate, setRefreshRate, formatBytes } = useServerStats();

    return (
        <div className="p-6 w-90 text-white font-sans flex flex-col gap-4">
            <ServerHeader refreshRate={refreshRate} setRefreshRate={setRefreshRate} />

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

            <div className="flex flex-wrap gap-4">
                <StatCard
                    label="CPU"
                    value={stats.cpu_usage}
                    icon={<Cpu size={24} strokeWidth={1.5} />}
                />
                <StatCard
                    label="RAM"
                    value={stats.ram_usage}
                    subtext={`${formatBytes(stats.ram_used)} / ${formatBytes(stats.ram_total)}`}
                    icon={<MemoryStick size={24} strokeWidth={1.5} />}
                />
                <StatCard
                    label="Storage"
                    value={stats.disk_usage}
                    subtext={`${formatBytes(stats.disk_used)} / ${formatBytes(stats.disk_total)}`}
                    icon={<HardDrive size={24} strokeWidth={1.5} />}
                />
            </div>
        </div>
    );
};

export default ServerInfo;
