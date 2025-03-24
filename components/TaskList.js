import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onDeleteTask, onToggleComplete }) => {
    const activeTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    // Fonction pour générer un titre dynamique
    const getSectionTitle = (title, count) => {
        if (count === 0) return `${title} (Rien pour le moment)`;
        return `${title} (${count})`;
    };

    const loadMoreTasks = () => {
        console.log("Fin de la liste atteinte !");
        // Logique pour charger plus de tâches
    };

    return (
        <View style={styles.container}>
            {/* Section des tâches en cours */}
            {/*<Text*/}
            {/*    style={[*/}
            {/*        styles.sectionTitle,*/}
            {/*        activeTasks.length === 0 && styles.emptySectionTitle,*/}
            {/*    ]}*/}
            {/*>*/}
            {/*    {getSectionTitle('Tâches en cours', activeTasks.length)}*/}
            {/*</Text>*/}
                <FlatList
                    data={activeTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TaskItem
                            task={item}
                            onDelete={onDeleteTask}
                            onToggleComplete={onToggleComplete}
                        />
                    )}
                    ListHeaderComponent={
                        <Text
                            style={[
                                styles.sectionTitle,
                                activeTasks.length === 0 && styles.emptySectionTitle,
                            ]}
                        >
                            {getSectionTitle('Tâches en cours', activeTasks.length)}
                        </Text>
                    }
                    initialNumToRender={5}
                    onEndReached={loadMoreTasks}
                    onEndReachedThreshold={0.5} // Déclenche à 50% de la fin
                    ListEmptyComponent={<Text> style={styles.emptyText}>Aucune tâche en cours !</Text>}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
                    style={styles.list}
                />

            {/* Section des tâches terminées */}
            {completedTasks.length > 0 && (
                <>
                    <Text
                        style={[
                            styles.sectionTitle,
                            completedTasks.length === 0 && styles.emptySectionTitle,
                        ]}
                    >
                        {getSectionTitle('Tâches terminées', completedTasks.length)}
                    </Text>
                    <FlatList
                        data={completedTasks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TaskItem
                                task={item}
                                onDelete={onDeleteTask}
                                onToggleComplete={onToggleComplete}
                            />
                        )}
                        style={styles.list}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6200ee',
        marginVertical: 10,
    },
    emptySectionTitle: {
        color: '#888',
        fontStyle: 'italic',
    },
    list: {
        flexGrow: 0, //empêche la liste de s’étendre trop (elle prend juste l’espace nécessaire)
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginVertical: 10,
    },
});

export default TaskList;