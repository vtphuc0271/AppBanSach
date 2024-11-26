import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Hàm xác thực lại người dùng với mật khẩu hiện tại
    const reauthenticate = async currentPassword => {
        const user = auth().currentUser;
        const credential = auth.EmailAuthProvider.credential(
            user.email,
            currentPassword,
        );
        try {
            await user.reauthenticateWithCredential(credential);
        } catch (error) {
            throw new Error('Mật khẩu hiện tại không chính xác');
        }
    };

    // Hàm xử lý đổi mật khẩu
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không trùng khớp.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            // Xác thực lại mật khẩu cũ
            await reauthenticate(currentPassword);

            const user = auth().currentUser;
            // Cập nhật mật khẩu mới
            await user.updatePassword(newPassword);
            Alert.alert('Thành công', 'Đổi mật khẩu thành công.');

            // Làm sạch các trường thông tin mật khẩu
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Điều hướng về màn hình thông tin tài khoản (Giả sử màn hình là 'AccountInfoScreen')
            navigation.navigate('Account');
        } catch (error) {
            Alert.alert('Lỗi', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đổi mật khẩu</Text>

            {/* Mật khẩu hiện tại */}
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu hiện tại"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
            />

            {/* Mật khẩu mới */}
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />

            {/* Nhập lại mật khẩu mới */}
            <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            {/* Nút đổi mật khẩu */}
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#EFFFD6',
    },
    title: {
        alignSelf: 'center',
        color: '#000',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 60,
    },
    input: {
        borderWidth: 2,
        borderColor: '#7b8087',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        elevation: 6,
    },
    button: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 15,
        elevation: 15,
        borderColor: '#7b8087',
        borderWidth: 2,
        width: '60%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
});

export default ChangePasswordScreen;
