import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen/trangchu';
import LoginScreen from './src/screens/LoginScreen/login';
import RegisterScreen from './src/screens/RegisterScreen/register';
import { UserProvider } from './src/context/UserContext.js';
import PublisherManagementScreen from './src/screens/PublisherManagementScreen/publisher.js';
import CartScreen from './src/screens/CartScreen/index.js';
import AdminCatagoryScreen from './src/screens/TheloaiScreen/theloai';
import Adminpower from './src/screens/PhanquyenScreen/danhsachnguoidung.js';
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
          <Stack.Screen name="AdminCatagoryScreen" component={AdminCatagoryScreen} />
          <Stack.Screen name="Adminpower" component={Adminpower} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}