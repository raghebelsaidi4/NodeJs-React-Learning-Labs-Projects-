import { useState } from 'react';
import shortId from 'shortid';
import Layout from '../components/layout/layout.jsx';
import CreateTask from '../components/tasks/CreateTask.jsx';
import ShowTasks from '../components/tasks/ShowTasks.jsx';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [visibility, setVisibility] = useState("all");

    const addNewTask = (text) => {
        const task = {
            text,
            isCompleted: false,
            createdAt: new Date(),
            id: shortId.generate(),
        };
        setTasks([task, ...tasks]);
    };

    const handleVisibility = (text) => {
        setVisibility(text);
    }

    const toggleComplete = (id) => {
        const newTask = tasks.map((item) => {
            if (item.id === id) {
                item.isCompleted = !item.isCompleted;
            }
            return item;
        });
        setTasks(newTask);
    }

    function getFilteredTask(){
        if(visibility === 'completed') return tasks.filter(task => task.isCompleted)
        if(visibility === 'pending') return tasks.filter(task => !task.isCompleted)
        return tasks
    }

    return (
        <Layout>
            <CreateTask addNewTask={addNewTask} />
            <button onClick={()=> handleVisibility("all")}>All</button>
            <button onClick={()=> handleVisibility("completed")}>Completed</button>
            <button onClick={()=> handleVisibility("pending")}>Pending</button>
            <div>Current Visibility : {visibility} </div>
            <ShowTasks tasks={getFilteredTask()} toggleComplete={toggleComplete} />
        </Layout>
    );
};

export default Tasks;