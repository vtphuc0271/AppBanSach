import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen/trangchu.js';
import LoginScreen from './src/screens/LoginScreen/login.js';
import RegisterScreen from './src/screens/RegisterScreen/register.js';
import { UserProvider } from './src/context/UserContext.js';
import PublisherManagementScreen from './src/screens/PublisherManagementScreen/publisher.js';
import AuthorManagementScreen from './src/screens/AuthorManagementScreen/author.js';
import CartScreen from './src/screens/CartScreen/index.js';
import PaymentScreen from './src/screens/PaymentScreen/index.js';
import AdminCatagoryScreen from './src/screens/TheloaiScreen/theloai.js';
import AdminDecentScreen from './src/screens/PhanquyenScreen/danhsachnguoidung.js';
import BookManagementScreen from './src/screens/BookManagementScreen/BookManagement.js';
import TransactionhistoryScreen from './src/screens/TransactionhistoryScreen/transactionhistory.js';
import UserManagerScreen from './src/screens/UserManagerScreen/UserManager.js';
import StatisticalScreen from './src/screens/StatisticalScreen/statistical.js';

import OrderListScreen from './src/screens/OrderListScreen/index.js';
import RatingScreen from './src/screens/RatingScreen/ratingScreen.js';
import RatingDoScreen from './src/screens/RatingDoScreen/ratingDoScreen.js';
import LoadingScreen from './src/screens/LoadingScreen/LoadingScreen.js';
import PushLanguagesToFirestore from './src/pushLanguagesToFirestore.js';
import MyOder from './src/screens/Shipper/MyOder.js';
import OderDelivery from './src/screens/Shipper/OrderDelivered.js';
import UserOrdersScreen from './src/screens/UserOrdersScreen/index.js';
const Stack = createStackNavigator();
UserOrdersScreen
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
          <Stack.Screen name="TransactionhistoryScreen" component={TransactionhistoryScreen} />
          <Stack.Screen name="StatisticalScreen" component={StatisticalScreen}/>
          <Stack.Screen name="RatingScreen" component={RatingScreen} />
          <Stack.Screen name="RatingDoScreen" component={RatingDoScreen} />
          <Stack.Screen name="OrderListScreen" component={OrderListScreen} />
          <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
          <Stack.Screen name="MyOder" component={MyOder} />
          <Stack.Screen name="OderDelivery" component={OderDelivery} />
          <Stack.Screen name="UserOrdersScreen" component={UserOrdersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}