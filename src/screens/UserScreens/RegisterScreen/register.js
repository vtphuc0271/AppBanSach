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
import NotificationCard from '../../../components/NotificationCard';
import {useNavigation} from '@react-navigation/native';

export default function App() {
  const navigation = useNavigation();
  const [hoTen, setHoTen] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHideNotification = () => {
    setShowNotification(false);
  };

  const registerUser = () => {
    if (password !== repassword) {
      setNotificationType('error');
      setNotificationMessage('Mật khẩu nhập lại không khớp.');
      setShowNotification(true);
      return;
    }

    setLoading(true);

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async userCredential => {
        const user = userCredential.user;

        // Lưu thông tin người dùng vào Firestore
        await firebase.firestore().collection('NguoiDung').doc(user.uid).set({
          email,
          hinh: 'https://firebasestorage.googleapis.com/v0/b/bansachnhom2.appspot.com/o/images%2Frn_image_picker_lib_temp_51914ec3-f61a-4530-ac71-323e773c26f0.jpg?alt=media&token=9616e23f-daa7-48e8-950a-4a010f77f7ab',
          hoTen,
          maVaiTro: '2',
          soDienThoai,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
s
        setNotificationType('success');
        setNotificationMessage(
          'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
        );
        setShowNotification(true);
        setTimeout(() => {
          navigation.navigate('LoginScreen');
        }, 1000);
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          setNotificationType('error');
          setNotificationMessage(
            'Email đã được sử dụng. Vui lòng chọn email khác.',
          );
        } else if (error.code === 'auth/invalid-email') {
          setNotificationType('error');
          setNotificationMessage('Email không hợp lệ.');
        } else if (error.code === 'auth/weak-password') {
          setNotificationType('error');
          setNotificationMessage(
            'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
          );
        } else {
          setNotificationType('error');
          setNotificationMessage('Đăng ký thất bại. Vui lòng thử lại.');
        }
        setShowNotification(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng Ký</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và Tên"
        value={hoTen}
        onChangeText={setHoTen}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={repassword}
        secureTextEntry
        onChangeText={setRePassword}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={soDienThoai}
        onChangeText={setSoDienThoai}
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={registerUser}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <View style={styles.register}>
        <Text style={styles.registerText}>Bạn đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.registerLink}>Đăng nhập vào đây</Text>
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
