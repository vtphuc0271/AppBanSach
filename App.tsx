import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/UserScreens/MainScreen/trangchu.js';
import LoginScreen from './src/screens/UserScreens/LoginScreen/login.js';
import RegisterScreen from './src/screens/UserScreens/RegisterScreen/register.js';
import { UserProvider } from './src/context/UserContext.js';
import PublisherManagementScreen from './src/screens/AdminScreens/PublisherManagementScreen/publisher.js';
import AuthorManagementScreen from './src/screens/AdminScreens/AuthorManagementScreen/author.js';
import CartScreen from './src/screens/UserScreens/CartScreen/index.js';
import PaymentScreen from './src/screens/UserScreens/PaymentScreen/index.js';
import AdminCatagoryScreen from './src/screens/AdminScreens/TheloaiScreen/theloai.js';
import AdminDecentScreen from './src/screens/AdminScreens/PhanquyenScreen/danhsachnguoidung.js';
import BookManagementScreen from './src/screens/AdminScreens/BookManagementScreen/BookManagement.js';
import UserManagerScreen from './src/screens/AdminScreens/UserManagerScreen/UserManager.js';
import OrderListScreen from './src/screens/AdminScreens/OrderListScreen/index.js';

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
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="AdminCatagoryScreen" component={AdminCatagoryScreen} />
          <Stack.Screen name="AdminDecentScreen" component={AdminDecentScreen} />
          <Stack.Screen name="BookManagementScreen" component={BookManagementScreen} />
          <Stack.Screen name="AuthorManagementScreen" component={AuthorManagementScreen} />
          <Stack.Screen name="UserManagerScreen" component={UserManagerScreen} />
          <Stack.Screen name="OrderListScreen" component={OrderListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}