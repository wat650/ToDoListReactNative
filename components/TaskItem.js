import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskItem = ({ task, onDelete, onToggleComplete }) => {
    const handleToggleComplete = () => {
        if (typeof onToggleComplete !== 'function') {
            console.error('onToggleComplete n’est pas une fonction :', onToggleComplete);
            return;
        }
        onToggleComplete(task.id); // Sans animation
    };

    return (
        <View
            style={[
                styles.taskContainer,
                task.completed && styles.completedContainer,
            ]}
        >
            <TouchableOpacity
                onPress={handleToggleComplete}
                disabled={task.completed}
            >
                <Icon
                    name={task.completed ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={task.completed ? '#6200ee' : '#888'}
                />
            </TouchableOpacity>
            <Text style={[styles.taskText, task.completed && styles.completedText]}>
                {task.value}
            </Text>
            <TouchableOpacity onPress={() => onDelete(task.id)}>
                <Icon name="delete" size={24} color="#ff4444" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    taskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    completedContainer: {
        backgroundColor: '#c8e6c9',
        opacity: 0.8,
    },
    taskText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginHorizontal: 10,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
});

export default TaskItem;
