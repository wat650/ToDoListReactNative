import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import TaskScreen from './screens/TaskScreen';

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
        </Stack.Navigator>
      </NavigationContainer>
  );
}