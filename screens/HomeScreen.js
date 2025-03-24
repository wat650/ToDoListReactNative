import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    // Simule un chargement de 2 secondes avant de permettre la navigation
    useEffect(() => {
        const timer = setTimeout(() => {}, 2000); // Spinner pendant 2s
        return () => clearTimeout(timer);
    }, []);

    // Fonction pour naviguer vers l’écran des tâches
    const goToTasks = () => {
        navigation.navigate('Tasks');
    };

    // Fonction pour naviguer vers l’écran des notes
    const goToNotes = () => {
        navigation.navigate('Notes');
    };


    return (
        <View style={styles.container}>
            {/* Image de bienvenue */}
            <Image
                source={require('../images/strategy.jpg')}
                style={styles.image}
            />
            <Text style={styles.title}>Bienvenue dans Ma Todo List !</Text>
            {/* Spinner de chargement */}
            <ActivityIndicator size="large" color="#6200ee" style={styles.spinner} />
            {/* Bouton pour aller à l’écran des tâches */}
            <TouchableOpacity style={styles.button} onPress={goToTasks}>
                <Text style={styles.buttonText}>Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={goToNotes}>
                <Text style={styles.buttonText}>Notes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    image: {
        width: 300,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee',
        marginBottom: 20,
    },
    spinner: {
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#6200ee',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HomeScreen;