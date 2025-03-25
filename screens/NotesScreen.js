import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';

const NotesScreen = () => {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    const loadNotes = useCallback(async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            let loadedNotes = savedNotes ? JSON.parse(savedNotes) : [];
            loadedNotes = loadedNotes.map((note) => ({
                ...note,
                date: note.date || new Date().toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));
            // Loguer les dates avant le tri
            console.log('Dates avant le tri:', loadedNotes.map(note => ({ id: note.id, date: note.date })));
            // Tri des notes par date (du plus récent au plus ancien)
            loadedNotes.sort((a, b) => {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                return dateB - dateA; // Plus récent en haut
            });
            // Loguer les dates après le tri
            console.log('Dates après le tri:', loadedNotes.map(note => ({ id: note.id, date: note.date })));
            setNotes(loadedNotes);
        } catch (error) {
            console.error('Erreur lors du chargement des notes', error);
        }
    }, []);

    const parseDate = (dateString) => {
        if (!dateString) return new Date(0); // Si pas de date, on met une date très ancienne
        try {
            // Remplacer "à" par un espace pour uniformiser le format
            const cleanedDateString = dateString.replace(' à ', ' ');
            const [day, month, time] = cleanedDateString.split(' ');
            const [hour, minute] = time.split(':');
            const monthIndex = [
                'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
                'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
            ].indexOf(month.toLowerCase());
            if (monthIndex === -1) {
                console.warn('Mois invalide dans la date:', dateString);
                return new Date(0); // Si le mois est invalide, on met une date ancienne
            }
            // Utiliser l’année actuelle pour les nouvelles notes
            const currentYear = new Date().getFullYear();
            const parsedDate = new Date(currentYear, monthIndex, parseInt(day), parseInt(hour), parseInt(minute));
            console.log(`Date parsée pour "${dateString}":`, parsedDate);
            return parsedDate;
        } catch (error) {
            console.error('Erreur lors du parsing de la date:', dateString, error);
            return new Date(0); // En cas d’erreur, on met une date ancienne
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [loadNotes])
    );

    const filteredNotes = notes.filter((note) =>
        (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteNote = (noteId) => {
        Alert.alert(
            'Confirmer la suppression',
            'Êtes-vous sûr de vouloir supprimer cette note ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const noteToDelete = notes.find((note) => note.id === noteId);
                            if (noteToDelete) {
                                const images = noteToDelete.images || [];
                                for (const uri of images) {
                                    await FileSystem.deleteAsync(uri, { idempotent: true });
                                }

                                const audioPaths = (noteToDelete.audioPaths || []).map((a) => a.uri);
                                for (const uri of audioPaths) {
                                    await FileSystem.deleteAsync(uri, { idempotent: true });
                                }
                            }

                            const updatedNotes = notes.filter((note) => note.id !== noteId);
                            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
                            setNotes(updatedNotes);
                        } catch (error) {
                            console.error('Erreur lors de la suppression de la note', error);
                        }
                    },
                },
            ]
        );
    };

    const clearStorage = async () => {
        Alert.alert(
            'Vider les données',
            'Cela supprimera toutes les notes et les fichiers associés. Voulez-vous continuer ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Vider',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            for (const note of notes) {
                                const images = note.images || [];
                                for (const uri of images) {
                                    await FileSystem.deleteAsync(uri, { idempotent: true });
                                }
                                const audioPaths = (note.audioPaths || []).map((a) => a.uri);
                                for (const uri of audioPaths) {
                                    await FileSystem.deleteAsync(uri, { idempotent: true });
                                }
                            }
                            await AsyncStorage.clear();
                            setNotes([]);
                        } catch (error) {
                            console.error('Erreur lors du vidage des données', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une note..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.clearButton} onPress={clearStorage}>
                    <Icon name="delete-sweep" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredNotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.noteContainer}
                        onPress={() => navigation.navigate('ViewNote', { note: item })}
                    >
                        <View style={styles.noteContentWrapper}>
                            <Text style={styles.noteTitle}>
                                {item.title || (item.content ? item.content.slice(0, 20) + '...' : 'Sans titre')}
                            </Text>
                            {item.content ? (
                                <Text style={styles.noteContent}>{item.content.slice(0, 50)}...</Text>
                            ) : (
                                <Text style={styles.noContent}>Pas de texte</Text>
                            )}
                            <View style={styles.footerRow}>
                                <Text style={styles.noteDate}>{item.date}</Text>
                                <View style={styles.icons}>
                                    {item.images && item.images.length > 0 && (
                                        <Icon name="image" size={16} color="#ff9500" />
                                    )}
                                    {item.audioPaths && item.audioPaths.length > 0 && (
                                        <Icon name="mic" size={16} color="#ff9500" />
                                    )}
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteButton}>
                            <Icon name="delete" size={24} color="#ff4444" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucune note pour le moment</Text>}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddNote', { isEdit: false })}
            >
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c2526',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#2e3b3e',
        color: '#fff',
        fontSize: 16,
        padding: 10,
        borderRadius: 8,
    },
    clearButton: {
        marginLeft: 10,
        padding: 5,
    },
    noteContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2e3b3e',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    noteContentWrapper: {
        flex: 1,
    },
    noteTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteContent: {
        color: '#ccc',
        fontSize: 14,
        marginVertical: 5,
    },
    noContent: {
        color: '#888',
        fontSize: 14,
        marginVertical: 5,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
    },
    noteDate: {
        color: '#888',
        fontSize: 12,
        marginEnd: 5,
    },
    icons: {
        flexDirection: 'row',
        gap: 5,
    },
    deleteButton: {
        padding: 5,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ff9500',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NotesScreen;