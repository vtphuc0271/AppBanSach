import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import NotificationCard from '../../components/NotificationCard';
import {useNavigation} from '@react-navigation/native';


export default function App() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loginUser = (email, password) => {
    setLoading(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('User logged in: ', userCredential.user);
        setNotificationType('success');
        setNotificationMessage('Bạn đã đăng nhập thành công!');
        setShowNotification(true);
        navigation.navigate('MainScreen');
      })
      .catch(error => {
        console.log('Error code: ', error.code);

        if (error.code === 'auth/invalid-credential') {
          setNotificationMessage(
            'Thông tin xác thực không hợp lệ hoặc đã hết hạn.',
          );
        } else if (error.code === 'auth/user-not-found') {
          setNotificationMessage(
            'Người dùng không tồn tại. Vui lòng kiểm tra lại email.',
          );
        } else if (error.code === 'auth/wrong-password') {
          setNotificationMessage('Mật khẩu không đúng. Vui lòng kiểm tra lại.');
        } else {
          setNotificationMessage(
            'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!',
          );
        }

        setNotificationType('error');
        setShowNotification(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleHideNotification = () => {
    setShowNotification(false);
  };

  const handleLogin = () => {
    if (!email || !password) {
      setNotificationType('error');
      setNotificationMessage('Vui lòng điền đầy đủ email và mật khẩu!');
      setShowNotification(true);
      return;
    }
    loginUser(email, password);
  };

  const resetPassword = email => {
    if (!email) {
      setNotificationType('error');
      setNotificationMessage('Vui lòng nhập email để đặt lại mật khẩu.');
      setShowNotification(true);
      return;
    }

    setLoading(true);
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        setNotificationType('success');
        setNotificationMessage(
          'Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
        );
        setShowNotification(true);
      })
      .catch(error => {
        console.log('Error sending password reset email: ', error);

        if (error.code === 'auth/invalid-email') {
          setNotificationMessage('Email không hợp lệ. Vui lòng kiểm tra lại.');
        } else if (error.code === 'auth/user-not-found') {
          setNotificationMessage('Không tìm thấy người dùng với email này.');
        } else {
          setNotificationMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }

        setNotificationType('error');
        setShowNotification(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng Nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity disabled={loading} onPress={() => resetPassword(email)}>
        <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.register}>
        <Text style={styles.registerText}>Chưa có tài khoản?</Text>
        <TouchableOpacity disabled={loading}>
          <Text style={styles.registerLink}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      {showNotification && (
        <TouchableOpacity
          onPress={handleHideNotification}
          style={[
            {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
          ]}>
          <NotificationCard
            type={notificationType}
            message={notificationMessage}
            dateTime={new Date().toLocaleString()}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F8D8',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  register: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#4CAF50',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#4CAF50',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#000',
  },
  registerLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    paddingLeft: 5,
  },
});
