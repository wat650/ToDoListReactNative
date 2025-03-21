import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const navigation = useNavigation();

    // Charger les tâches depuis AsyncStorage au démarrage
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const savedTasks = await AsyncStorage.getItem('tasks');
                if (savedTasks) setTasks(JSON.parse(savedTasks));
            } catch (error) {
                console.error('Erreur lors du chargement des tâches', error);
            }
        };
        loadTasks();
    }, []);

    // Sauvegarder les tâches dans AsyncStorage à chaque modification
    useEffect(() => {
        const saveTasks = async () => {
            try {
                await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
            } catch (error) {
                console.error('Erreur lors de la sauvegarde des tâches', error);
            }
        };
        saveTasks();
    }, [tasks]);

    // Ajouter une tâche
    const addTask = (taskText) => {
        setTasks((prevTasks) => [
            ...prevTasks,
            { id: Date.now().toString(), value: taskText, completed: false },
        ]);
    };

    // Supprimer une tâche
    const deleteTask = (taskId) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    };

    // Marquer une tâche comme terminée ou non
    const toggleComplete = (taskId) => {
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            return [
                ...updatedTasks.filter((task) => !task.completed),
                ...updatedTasks.filter((task) => task.completed),
            ];
        });
    };

    // Effacer toutes les tâches
    const clearAllTasks = () => {
        setTasks([]);
    };

    return (
        <View style={styles.container}>
            {/* Navbar personnalisée */}
            {/*<Navbar title="Mes Tâches" onBack={() => navigation.goBack()} />*/}

            {/* Entrée pour ajouter une tâche */}
            <TaskInput onAddTask={addTask} />
            {/* Liste des tâches */}
            <TaskList tasks={tasks} onDeleteTask={deleteTask} onToggleComplete={toggleComplete} />
            {/* Bouton pour tout effacer */}
            {tasks.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearAllTasks}>
                    <Icon name="delete-sweep" size={24} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 20,
    },
    clearButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 50,
        alignSelf: 'center',
        marginTop: 20,
    },
});

export default TaskScreen;