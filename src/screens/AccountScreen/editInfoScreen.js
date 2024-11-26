import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../../context/UserContext'; // Lấy thông tin người dùng từ context

const EditInfoScreen = ({ navigation }) => {
    const { user } = useContext(UserContext); // Lấy user từ context
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [diaChi, setdiaChi] = useState('');
    const [avatar, setAvatar] = useState(''); // Trường avatar

    useEffect(() => {
        if (user) {
            const userId = user.uid;
            // Lấy thông tin người dùng từ Firestore
            const getUserInfo = async () => {
                const userDoc = await firestore().collection('NguoiDung').doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('data', userData.hinh);
                    setName(userData.hoTen || '');
                    setPhone(userData.soDienThoai || '');
                    setdiaChi(userData.diaChi || '');
                    setAvatar(userData.hinh || ''); // Nếu không có ảnh, sẽ là rỗng
                }
            };
            getUserInfo();
        } else {
            // Điều hướng về màn hình login nếu không có người dùng
            navigation.navigate('LoginScreen');
        }
    }, [user, navigation]);

    const handleSave = async () => {
        if (!name || !phone || !diaChi) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const userId = user.uid;
        try {
            await firestore()
                .collection('NguoiDung')
                .doc(userId)
                .update({
                    hoTen: name,
                    soDienThoai: phone,
                    diaChi: diaChi,
                    hinh: avatar || '', // Cập nhật avatar mới hoặc giữ nguyên nếu không thay đổi
                });
            Alert.alert('Thành công', 'Cập nhật thông tin thành công.');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating user info:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin.');
        }
    };

    const selectImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };
        launchImageLibrary(options, async response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const fileUri = response.assets[0].uri;
                const fileName = fileUri.substring(fileUri.lastIndexOf('/') + 1);
                const reference = storage().ref(fileName);
                try {
                    await reference.putFile(fileUri);
                    const url = await reference.getDownloadURL();
                    setAvatar(url); // Lưu URL của ảnh
                } catch (error) {
                    console.error('Error uploading image: ', error);
                }
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chỉnh sửa thông tin</Text>
            <View style={styles.infoContainer}>
                {/* Hiển thị ảnh đại diện */}
            <TouchableOpacity onPress={selectImage} style={styles.avatarContainer}>
                <Image
                    source={avatar ? { uri: avatar } : require('../../assets/default.png')}
                    style={styles.avatar}
                />
            </TouchableOpacity>

            {/* Label và TextInput cho Tên */}
            <Text style={styles.label}>Tên tài khoản</Text>
            <TextInput
                style={styles.input}
                placeholder="Tên"
                value={name}
                onChangeText={setName}
            />

            {/* Label và TextInput cho Số điện thoại */}
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            {/* Label và TextInput cho Địa chỉ */}
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={diaChi}
                onChangeText={setdiaChi}
            />
            </View>
            

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu thông tin</Text>
                <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/list_icon.png')}
                                style={styles.icon}
                            />
                        </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#EFFFD6'
    },
    infoContainer: {
        padding: 20,
        backgroundColor: '#EFFFD6',
        borderWidth:2,
        marginBottom:30,
        borderColor:'#7b8087',
        borderRadius:20,
        elevation:15,
    },
    title: {
        alignSelf:'center',
        color:'#000',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 120
    },
    input: {
        borderWidth: 2,
        borderColor: '#7b8087',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        elevation:6,
    },
    iconContainer: {
        borderRadius: 50,
        padding: 5,
    },
    icon: {
        marginLeft:15,
        width: 20,
        height: 20,
    },
    button: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 15,
        elevation:15,
        borderColor:'#7b8087',
        borderWidth:2,
        width:'60%',
        alignSelf:'center',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    buttonText: { 
        color: '#000', 
        fontWeight:'bold',
        textAlign: 'center', 
        fontSize: 14
     },
    avatarContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        marginBottom: 20,
        borderWidth: 2,
        marginTop:-95,
        borderColor: '#7b8087',
        elevation:15,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 30,
        resizeMode: 'cover',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
});

export default EditInfoScreen;
