import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import TaskScreen from './screens/TaskScreen';
import NotesScreen from './screens/NotesScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import ViewNoteScreen from "./screens/ViewNoteScreen";


const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        {/* Gestion de la navigation entre écrans */}
        <Stack.Navigator initialRouteName="Home">

          <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }} // Pas de header sur l’accueil
          />
          <Stack.Screen
              name="Tasks"
              component={TaskScreen}
              options={{ headerShown: true }}
          />
         <Stack.Screen name="Notes" component={NotesScreen} options={{ title: "Mes Notes" }} />
         <Stack.Screen name="AddNote" component={AddNoteScreen} options={{ title: "Nouvelle Note" }} />
         <Stack.Screen name="ViewNote" component={ViewNoteScreen} options={{ title: 'Voir la note' }} />
        </Stack.Navigator>

      </NavigationContainer>
  );
}