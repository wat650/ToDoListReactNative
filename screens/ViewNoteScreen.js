import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Audio } from 'expo-av';

const ViewNoteScreen = () => {
    const [sound, setSound] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const navigation = useNavigation();
    const route = useRoute();
    const { note } = route.params;

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
        }
    };

    const renderWaveform = () => {
        const waveform = Array(20).fill('·');
        return waveform.join(' ');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{note.title || 'Sans titre'}</Text>
            <Text style={styles.content}>{note.content || 'Pas de texte'}</Text>
            {note.images && note.images.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Images</Text>
                    <FlatList
                        data={note.images}
                        horizontal
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.image} />
                        )}
                        style={styles.imagesList}
                        showsHorizontalScrollIndicator={true}
                    />
                </>
            )}
            {note.audioPaths && note.audioPaths.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Notes vocales</Text>
                    {note.audioPaths.map((audio, index) => (
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
                        </View>
                    ))}
                </>
            )}
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('AddNote', { note, isEdit: true })}
            >
                <Icon name="edit" size={24} color="#fff" />
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
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    content: {
        color: '#ccc',
        fontSize: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    image: {
        width: 150,
        height: 150,
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
    editButton: {
        backgroundColor: '#ff9500',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 20,
    },
    imagesList: {
        maxHeight: 170,
    }

});

export default ViewNoteScreen;