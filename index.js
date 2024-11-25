/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
//import MainScreen from './src/screens/main';
import TrangChuscreen from './src/screens/MainScreen/trangchu';
import LoginScreen from './src/screens/LoginScreen/login';
import RegisterScreen from './src/screens/RegisterScreen/register';

AppRegistry.registerComponent(appName, () => App);
