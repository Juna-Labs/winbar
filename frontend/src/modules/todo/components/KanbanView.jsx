import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Check, Calendar } from 'lucide-react';

const Column = ({ title, status, todos, updateTaskStatus, deleteTask, editTask }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-white/5');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('bg-white/5');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-white/5');
        const id = e.dataTransfer.getData("taskId");
        if (id) {
            updateTaskStatus(id, status);
        }
    };

    const handleDragStart = (e, id) => {
        e.dataTransfer.setData("taskId", id);
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
    };

    return (
        <div
            className="flex-1 flex flex-col min-w-62.5 shrink-0 border-r border-white/10 last:border-r-0 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="text-center font-serif font-bold p-2 border-b border-white/10 text-white uppercase tracking-widest text-sm">
                {title}
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollable">
                {todos.filter(t => t.status === status).map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        deleteTask={deleteTask}
                        editTask={editTask}
                    />
                ))}
            </div>
        </div>
    );
};

const TaskCard = ({ task, handleDragStart, handleDragEnd, deleteTask, editTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(task.text);
    const [date, setDate] = useState(task.date || '');

    useEffect(() => {
        if (!isEditing) {
            setText(task.text);
            setDate(task.date || '');
        }
    }, [task.text, task.date, isEditing]);

    const handleStartEdit = () => {
        setText(task.text);
        setDate(task.date || '');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setText(task.text);
        setDate(task.date || '');
        setIsEditing(false);
    };

    const handleSave = () => {
        if (text.trim()) {
            const isNormal = task.type === 'normal' || !task.type;
            editTask(task.id, text.trim(), isNormal ? (date || null) : task.date);
        } else {
            setText(task.text);
            setDate(task.date || '');
        }
        setIsEditing(false);
    };

    return (
        <div
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragEnd={handleDragEnd}
            className="group bg-white/5 border border-white/10 rounded p-2 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative"
        >
            {isEditing ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            className="w-full bg-transparent border-b border-widget outline-none text-white font-['Caveat'] text-xl"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSave}
                            className="text-green-400 hover:text-green-300 p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                            title="Save"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-white/40 hover:text-red-400 p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                            title="Cancel"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {(task.type === 'normal' || !task.type) && (
                        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/10">
                            <div className="flex items-center gap-1 text-[10px] text-white/50 font-sans uppercase tracking-wider">
                                <Calendar size={11} />
                                <span>Date</span>
                            </div>
                            <input
                                type="date"
                                value={date || ''}
                                onChange={(e) => setDate(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                                className="bg-black/25 hover:bg-black/40 border border-white/15 focus:border-widget rounded px-1.5 py-0.5 text-xs text-white/80 font-sans outline-none scheme-dark transition-colors cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start gap-2">
                        <span
                            onDoubleClick={handleStartEdit}
                            className="font-['Caveat'] text-xl leading-5 text-white wrap-break-word cursor-text"
                            title="Double-click to edit"
                        >
                            {task.text}
                        </span>
                        <div className="flex flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                                onClick={handleStartEdit}
                                className="text-white/50 hover:text-white p-0.5"
                                title="Edit task"
                            >
                                <Pencil size={12} />
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400/50 hover:text-red-400 p-0.5"
                                title="Delete task"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                    {(task.type === 'normal' || !task.type) && task.date && (
                        <div
                            onDoubleClick={handleStartEdit}
                            className="text-[10px] text-white/40 text-right mt-1 font-sans cursor-pointer hover:text-white/70 transition-colors"
                            title="Double-click to edit"
                        >
                            {task.date}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const RecurringListView = ({ todos, updateTaskStatus, deleteTask }) => {
    return (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 scrollable">
            {todos.map(task => {
                const isDone = task.status === 'done';

                return (
                    <div
                        key={task.id}
                        className={`flex items-center justify-between min-h-16 py-3 px-3.5 rounded-lg border transition-all relative group shadow-sm ${
                            isDone
                                ? 'bg-widget/15 border-widget/40'
                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                        {/* Task text on the left */}
                        <div className="flex-1 min-w-0 pr-3 flex flex-col justify-center border-l-4 border-l-transparent group-hover:border-l-widget pl-2.5 transition-colors">
                            <span className={`font-sans text-base font-medium wrap-break-word ${isDone ? 'text-white/50 line-through' : 'text-white drop-shadow-sm'}`}>
                                {task.text}
                            </span>
                        </div>

                        {/* Actions on the right */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => updateTaskStatus(task.id, isDone ? 'todo' : 'done')}
                                className={`px-4 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                                    isDone
                                        ? 'bg-widget-active text-widget-text hover:opacity-85'
                                        : 'bg-widget/25 hover:bg-widget hover:text-widget-text border border-widget/50 hover:border-widget text-white'
                                }`}
                                style={isDone ? {
                                    backgroundColor: 'var(--color-widget-active)',
                                    color: 'var(--color-widget-text)'
                                } : {}}
                                title={isDone ? "Mark as to-do" : "Mark as done"}
                            >
                                <Check size={15} strokeWidth={3} />
                                <span>Done</span>
                            </button>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 p-1.5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                                title="Delete task"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                );
            })}
            {todos.length === 0 && (
                <div className="text-center font-serif text-white/40 mt-10">No tasks in this category.</div>
            )}
        </div>
    );
};

export default function KanbanView({ todos, addTask, updateTaskStatus, deleteTask, editTask }) {
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskDate, setNewTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('daily');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            addTask(newTaskText.trim(), activeTab === 'normal' ? newTaskDate : null, activeTab);
            setNewTaskText("");
        }
    };

    const filteredTodos = todos.filter(t => (t.type || 'normal') === activeTab);

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex px-3 pt-2 gap-2 border-b border-white/10 bg-white/5">
                {['daily', 'weekly', 'monthly', 'normal'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 font-serif text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-widget text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 p-3 border-b border-white/10 bg-black/10 items-center">
                <input
                    type="text"
                    placeholder={`Add a new ${activeTab} task...`}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/20 focus:border-widget outline-none px-2 font-['Caveat'] text-2xl text-white transition-colors"
                />
                {activeTab === 'normal' && (
                    <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="bg-transparent border-b border-white/20 focus:border-widget outline-none px-2 py-1.5 text-white/60 font-sans text-sm transition-colors scheme-dark"
                    />
                )}
                <button
                    type="submit"
                    className="p-2 rounded bg-widget text-widget-text hover:bg-widget-hover transition-colors shadow-sm shrink-0"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="flex-1 flex overflow-x-auto overflow-y-hidden scrollable">
                {activeTab === 'normal' ? (
                    <>
                        <Column title="To Do" status="todo" todos={filteredTodos} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} editTask={editTask} />
                        <Column title="In Progress" status="in_progress" todos={filteredTodos} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} editTask={editTask} />
                        <Column title="Done" status="done" todos={filteredTodos} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} editTask={editTask} />
                    </>
                ) : (
                    <RecurringListView todos={filteredTodos} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} />
                )}
            </div>
        </div>
    );
}
