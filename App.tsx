import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen/trangchu';
import LoginScreen from './src/screens/LoginScreen/login';
import RegisterScreen from './src/screens/RegisterScreen/register';
import {UserProvider} from './src/context/UserContext.js';
import PublisherManagementScreen from './src/screens/PublisherManagementScreen/publisher.js';
const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer >
        <Stack.Navigator initialRouteName="MainScreen" screenOptions={{
                    headerShown:false,
                }}>
          <Stack.Screen name="MainScreen" component={MainScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="PublisherManagementScreen" component={PublisherManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}