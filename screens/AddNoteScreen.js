import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Text, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const AddNoteScreen = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [audioPaths, setAudioPaths] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const navigation = useNavigation();
    const route = useRoute();
    const { note, isEdit } = route.params || {};

    useEffect(() => {
        if (isEdit && note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setImages(note.images || []);
            setAudioPaths(note.audioPaths || []);
        }
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [isEdit, note, sound]);

    const addImage = async () => {
        console.log('Début de la fonction addImage');
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Statut de la permission:', status);
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à la galerie !');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
            });

            console.log('Résultat de ImagePicker:', result);
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageData = result.assets[0];
                const fileName = `${FileSystem.documentDirectory}image_${Date.now()}.jpg`;
                await FileSystem.moveAsync({
                    from: imageData.uri,
                    to: fileName,
                });
                setImages([...images, fileName]);
            }
        } catch (error) {
            console.error('Erreur lors de l’ajout de l’image:', error);
            Alert.alert('Erreur', 'Impossible d’ajouter une image. Veuillez réessayer.');
        }
    };

    const removeImage = async (index) => {
        try {
            const imageUri = images[index];
            await FileSystem.deleteAsync(imageUri, { idempotent: true });
            setImages(images.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Erreur lors de la suppression de l’image:', error);
        }
    };

    const startRecording = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder au microphone !');
            return;
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
    };

    const stopRecording = async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const status = await recording.getStatusAsync();
        const duration = Math.round(status.durationMillis / 1000);
        setAudioPaths([...audioPaths, { uri, duration }]);
        setRecording(null);
        setIsRecording(false);
    };

    const toggleAudio = async (uri, index) => {
        try {
            if (playingIndex === index && isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setPlayingIndex(index);
                setIsPlaying(true);
                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setCurrentPosition(Math.round(status.positionMillis / 1000));
                    }
                    if (status.didJustFinish) {
                        newSound.unloadAsync();
                        setSound(null);
                        setPlayingIndex(null);
                        setIsPlaying(false);
                        setCurrentPosition(0);
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de la lecture de l’audio', error);
            Alert.alert('Erreur', 'Impossible de lire la note vocale.');
        }
    };

    const removeAudio = async (index) => {
        try {
            const audioUri = audioPaths[index].uri;
            await FileSystem.deleteAsync(audioUri, { idempotent: true });
            setAudioPaths(audioPaths.filter((_, i) => i !== index));
            if (playingIndex === index) {
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
                setPlayingIndex(null);
                setIsPlaying(false);
                setCurrentPosition(0);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l’audio:', error);
        }
    };

    const saveNote = async () => {
        if (!title.trim() && !content.trim()) return;
        const newNote = {
            id: isEdit ? note.id : Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            date: new Date().toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            }),
            images: images,
            audioPaths: audioPaths,
        };
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            let notes = savedNotes ? JSON.parse(savedNotes) : [];
            if (isEdit) {
                const oldNote = notes.find((n) => n.id === note.id);
                if (oldNote) {
                    const oldImages = oldNote.images || [];
                    const oldAudioPaths = (oldNote.audioPaths || []).map((a) => a.uri);
                    const newImages = newNote.images || [];
                    const newAudioPaths = (newNote.audioPaths || []).map((a) => a.uri);

                    const imagesToDelete = oldImages.filter((uri) => !newImages.includes(uri));
                    for (const uri of imagesToDelete) {
                        await FileSystem.deleteAsync(uri, { idempotent: true });
                    }

                    const audiosToDelete = oldAudioPaths.filter((uri) => !newAudioPaths.includes(uri));
                    for (const uri of audiosToDelete) {
                        await FileSystem.deleteAsync(uri, { idempotent: true });
                    }
                }
                notes = notes.map((n) => (n.id === note.id ? newNote : n));
            } else {
                notes = [...notes, newNote];
            }
            const dataToSave = JSON.stringify(notes);
            console.log('Taille des données à sauvegarder (en octets):', new TextEncoder().encode(dataToSave).length);
            await AsyncStorage.setItem('notes', dataToSave);
            // Rediriger directement vers NotesScreen
            navigation.navigate('Notes');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la note', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder la note. Essayez de vider les données et réessayez.');
        }
    };

    const renderWaveform = () => {
        const waveform = Array(20).fill('·');
        return waveform.join(' ');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TextInput
                    style={styles.titleInput}
                    placeholder="Titre de la note (facultatif)"
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.contentInput}
                    placeholder="Contenu de la note"
                    placeholderTextColor="#888"
                    value={content}
                    onChangeText={setContent}
                    multiline
                />
                <View style={styles.mediaButtons}>
                    <TouchableOpacity style={styles.iconButton} onPress={addImage}>
                        <Icon name="image" size={24} color="#ff9500" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <Icon name={isRecording ? 'stop' : 'mic'} size={24} color="#ff9500" />
                    </TouchableOpacity>
                </View>
                {images.map((imageUri, index) => (
                    <View key={index} style={styles.previewContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.previewImage}
                        />
                        <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                            <Icon name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
                {audioPaths.map((audio, index) => (
                    <View key={index} style={styles.audioContainer}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => toggleAudio(audio.uri, index)}
                        >
                            <Icon
                                name={playingIndex === index && isPlaying ? 'pause' : 'play-arrow'}
                                size={20}
                                color="#ff9500"
                            />
                        </TouchableOpacity>
                        <Text style={styles.audioDuration}>
                            {playingIndex === index
                                ? `${currentPosition < 10 ? '0' : ''}${currentPosition} / `
                                : '00:00 / '}
                            {`00:${audio.duration < 10 ? '0' : ''}${audio.duration}`}
                        </Text>
                        <Text style={styles.waveform}>{renderWaveform()}</Text>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeAudio(index)}
                        >
                            <Icon name="delete" size={20} color="#ff9500" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                <Icon name="save" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c2526',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    titleInput: {
        backgroundColor: '#2e3b3e',
        color: '#fff',
        fontSize: 18,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    contentInput: {
        backgroundColor: '#2e3b3e',
        color: '#fff',
        fontSize: 16,
        padding: 10,
        borderRadius: 8,
        flex: 1,
        textAlignVertical: 'top',
        marginBottom: 10,
        minHeight: 250,
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    },
    iconButton: {
        backgroundColor: '#2e3b3e',
        padding: 10,
        borderRadius: 8,
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2e3b3e',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    playButton: {
        marginRight: 10,
    },
    audioDuration: {
        color: '#fff',
        fontSize: 14,
        marginRight: 10,
    },
    waveform: {
        color: '#ff9500',
        fontSize: 14,
        flex: 1,
    },
    removeButton: {
        padding: 5,
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#ff9500',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
});

export default AddNoteScreen;