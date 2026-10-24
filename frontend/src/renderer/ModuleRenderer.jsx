import { lazy, Suspense } from 'react';

const Yamw = lazy(() => import('../modules/yamw/Yamw'));
const Notepad = lazy(() => import('../modules/notepad/Notepad'));
const Todo = lazy(() => import('../modules/todo/Todo'));
const Drawing = lazy(() => import('../modules/drawing/Drawing'));
const Companion = lazy(() => import('../modules/companion/Companion'))
const SysInfo = lazy(() => import('../modules/sysinfo/SysInfo'));
const Control = lazy(() => import('../modules/control/Control'));
const ServerInfo = lazy(() => import('../modules/serverinfo/ServerInfo'));
const Container = lazy(() => import('../modules/container/Container'));
const Terminal = lazy(() => import('../modules/terminal/Terminal'));
const Launcher = lazy(() => import('../modules/launcher/Launcher'));
const TimeHub = lazy(() => import('../modules/timehub/TimeHub'));
const Calculator = lazy(() => import('../modules/calculator/Calculator'));

const FallbackLoader = () => (
    <div className="flex items-center justify-center p-4">
        <span className="font-serif italic text-black/50">Loading module...</span>
    </div>
);

const ModuleRenderer = ({ name }) => {
    const renderModule = () => {
        switch (name) {
            case 'yamw':
                return <Yamw />;
            case 'notepad':
                return <Notepad />;
            case 'todo':
                return <Todo />;
            case 'drawing':
                return <Drawing />;
            case 'companion':
                return <Companion />;
            case 'sysinfo':
                return <SysInfo />;
            case 'control':
                return <Control />;
            case 'serverinfo':
                return <ServerInfo />;
            case 'container':
                return <Container />;
            case 'terminal':
                return <Terminal />;
            case 'launcher':
                return <Launcher />;
            case 'timehub':
                return <TimeHub />;
            case 'calculator':
                return <Calculator />;
            default:
                return <div className="p-4 bg-red-500/20 text-red-500 rounded-lg">Unknown Module: {name}</div>;
        }
    };

    return (
        <Suspense fallback={<FallbackLoader />}>
            {renderModule()}
        </Suspense>
    );
};

export default ModuleRenderer;
