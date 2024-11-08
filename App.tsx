import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen/trangchu';
import LoginScreen from './src/screens/LoginScreen/login';
import RegisterScreen from './src/screens/RegisterScreen/register';
import { UserProvider } from './src/context/UserContext.js';
import PublisherManagementScreen from './src/screens/PublisherManagementScreen/publisher.js';
import AuthorManagementScreen from './src/screens/AuthorManagementScreen/author.js';
import CartScreen from './src/screens/CartScreen/index.js';
<<<<<<< HEAD
import PaymentScreen from './src/screens/PaymentScreen/index.js';
=======
import AdminCatagoryScreen from './src/screens/TheloaiScreen/theloai';
import BookManagementScreen from './src/screens/BookManagementScreen/BookManagement.js';
>>>>>>> 78e37cb0cd7bca4609b9521b86828780c3641c3f
const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MainScreen" screenOptions={{
          headerShown: false,
        }}>
          <Stack.Screen name="MainScreen" component={MainScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="PublisherManagementScreen" component={PublisherManagementScreen} />
<<<<<<< HEAD
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
=======
          <Stack.Screen name="AdminCatagoryScreen" component={AdminCatagoryScreen} />
          <Stack.Screen name="BookManagementScreen" component={BookManagementScreen} />
          <Stack.Screen name="AuthorManagementScreen" component={AuthorManagementScreen} />
>>>>>>> 78e37cb0cd7bca4609b9521b86828780c3641c3f
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}