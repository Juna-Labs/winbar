import { Cpu, MemoryStick, HardDrive, Monitor, ArrowDown, ArrowUp } from 'lucide-react';
import { useSysInfo } from './hooks/useSysInfo';
import SysInfoHeader from './components/SysInfoHeader';
import SysInfoMetric from './components/SysInfoMetric';
import NetworkMetric from './components/NetworkMetric';

export default function SysInfoModule() {
    const { sysInfo, refreshRate, setRefreshRate } = useSysInfo();

    return (
        <div className="w-80 relative flex flex-col p-4 text-white">
            <SysInfoHeader refreshRate={refreshRate} setRefreshRate={setRefreshRate} />

            <div className="grid grid-cols-2 gap-3">
                <SysInfoMetric
                    icon={Cpu} label="CPU"
                    percent={sysInfo.cpuUsage}
                    mainText={<>{sysInfo.cpuUsage?.toFixed(1) || 0}<span className="text-sm text-white/60 ml-0.5">%</span></>}
                />
                <SysInfoMetric
                    icon={Monitor} label="GPU"
                    percent={sysInfo.gpuUsage}
                    mainText={<>{sysInfo.gpuUsage?.toFixed(1) || 0}<span className="text-sm text-white/60 ml-0.5">%</span></>}
                    subText={sysInfo.gpuTotalGb ? `${sysInfo.gpuUsedGb?.toFixed(1)} / ${sysInfo.gpuTotalGb?.toFixed(1)} GB` : null}
                />
                <SysInfoMetric
                    icon={MemoryStick} label="RAM"
                    percent={sysInfo.ramUsage}
                    mainText={<>{sysInfo.ramUsage?.toFixed(1) || 0}<span className="text-sm text-white/60 ml-0.5">%</span></>}
                    subText={`${sysInfo.ramUsedGb?.toFixed(1) || 0} / ${sysInfo.ramTotalGb?.toFixed(1) || 0} GB`}
                />
                <SysInfoMetric
                    icon={HardDrive} label="Storage"
                    percent={sysInfo.storageUsage}
                    mainText={<>{sysInfo.storageUsage?.toFixed(1) || 0}<span className="text-sm text-white/60 ml-0.5">%</span></>}
                    subText={`${sysInfo.storageUsedGb?.toFixed(0) || 0} / ${sysInfo.storageTotalGb?.toFixed(0) || 0} GB`}
                />
            </div>

            <div className="mt-3 flex gap-3">
                <NetworkMetric
                    icon={ArrowDown}
                    label="Download"
                    value={sysInfo.netDownload}
                />
                <NetworkMetric
                    icon={ArrowUp}
                    label="Upload"
                    value={sysInfo.netUpload}
                />
            </div>
        </div>
    );
}
