import { useState, useEffect } from 'react';

const isDifferentDay = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
};

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
};

const isDifferentWeek = (dateStr) => {
    if (!dateStr) return false;
    const todayMonday = getMonday(new Date());
    const completedMonday = getMonday(new Date(dateStr));
    return completedMonday < todayMonday;
};

const isDifferentMonth = (dateStr) => {
    if (!dateStr) return false;
    const todayStr = new Date().toISOString().slice(0, 7);
    const completedStr = new Date(dateStr).toISOString().slice(0, 7);
    return completedStr < todayStr;
};

export default function useTodo() {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('todo_list');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);

                let needsSave = false;
                parsed = parsed.map(task => {
                    if (!task.type) {
                        task.type = 'normal';
                        needsSave = true;
                    }

                    if (task.status === 'done' && task.completedAt) {
                        if (task.type === 'daily' && isDifferentDay(task.completedAt)) {
                            needsSave = true;
                            return { ...task, status: 'todo', completedAt: null };
                        }
                        if (task.type === 'weekly' && isDifferentWeek(task.completedAt)) {
                            needsSave = true;
                            return { ...task, status: 'todo', completedAt: null };
                        }
                        if (task.type === 'monthly' && isDifferentMonth(task.completedAt)) {
                            needsSave = true;
                            return { ...task, status: 'todo', completedAt: null };
                        }
                    }
                    return task;
                });

                setTodos(parsed);
                if (needsSave) {
                    localStorage.setItem('todo_list', JSON.stringify(parsed));
                }
            } catch (e) {
                console.error("Failed to parse todos", e);
            }
        }
    }, []);

    const saveTodos = (newTodos) => {
        setTodos(newTodos);
        localStorage.setItem('todo_list', JSON.stringify(newTodos));
    };

    const addTask = (text, date = new Date().toISOString().split('T')[0], type = 'normal') => {
        const newTask = {
            id: Date.now().toString(),
            text,
            status: 'todo',
            date,
            type,
            completedAt: null
        };
        saveTodos([...todos, newTask]);
    };

    const updateTaskStatus = (id, newStatus) => {
        saveTodos(todos.map(t => {
            if (t.id === id) {
                const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
                return { ...t, status: newStatus, completedAt };
            }
            return t;
        }));
    };

    const deleteTask = (id) => {
        saveTodos(todos.filter(t => t.id !== id));
    };

    const editTask = (id, newText, newDate) => {
        saveTodos(todos.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    text: newText,
                    ...(newDate !== undefined ? { date: newDate } : {})
                };
            }
            return t;
        }));
    };

    return {
        todos,
        addTask,
        updateTaskStatus,
        deleteTask,
        editTask
    };
}
