import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskInput = ({ onAddTask }) => {
    const [enteredTask, setEnteredTask] = useState('');

    // Fonction pour ajouter une tâche
    const handleAddTask = () => {
        if (enteredTask.trim() === '') return;
        onAddTask(enteredTask);
        setEnteredTask('');
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                placeholder="Ajouter une tâche"
                value={enteredTask}
                onChangeText={(text) => setEnteredTask(text)}
            />
            <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        flex: 1,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#6200ee',
        padding: 10,
        borderRadius: 8,
    },
});

export default TaskInput;