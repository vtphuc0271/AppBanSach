import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import NavbarCard from '../../components/NavbarCard';
import { UserContext } from '../../context/UserContext';

const AccountScreen = () => {
    const [userInfo, setUserInfo] = useState({});
    const [canCaptureCCCD, setCanCaptureCCCD] = useState(false); // Dùng để xác định có được phép chụp CCCD hay không
    const navigation = useNavigation();
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user) {
            // Nếu không có người dùng đăng nhập, điều hướng đến màn hình Login
            navigation.navigate('LoginScreen');
        } else {
            const userId = user.uid; // Lấy ID người dùng đang đăng nhập
            const unsubscribe = firestore()
                .collection('NguoiDung')
                .doc(userId)
                .onSnapshot(
                    doc => {
                        if (doc.exists) {
                            const data = doc.data();
                            setUserInfo(data);

                            // Kiểm tra vai trò của người dùng
                            const maVaiTro = data.maVaiTro;
                            if (maVaiTro === '3' || maVaiTro === '4' || maVaiTro === '1') {
                                setCanCaptureCCCD(true);  // Hiển thị nút nếu maVaiTro là 1, 3 hoặc 4
                            } else {
                                setCanCaptureCCCD(false); // Ẩn nút nếu không phải 1, 3 hoặc 4
                            }
                        }
                    },
                    error => {
                        console.error('Error fetching user info: ', error);
                    }
                );

            return () => unsubscribe();
        }
    }, [user, navigation]);

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>Vui lòng đăng nhập để xem thông tin tài khoản.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container2}>
            <NavbarCard ScreenName={'Thông tin người dùng'} iconShop={true} />
            <View style={styles.container}>
                {/* Hiển thị hình đại diện */}
                <View style={styles.infoContainner}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                userInfo.hinh
                                    ? { uri: userInfo.hinh }
                                    : require('../../assets/default.png')
                            }
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>{userInfo.hoTen || 'Chưa cập nhật'}</Text>
                        <Text style={styles.labelID}>ID: {user.uid || 'Chưa cập nhật'}</Text>
                    </View>
                </View>

                <View style={styles.buttonContainner}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditInfo')}>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/list_icon.png')}
                                style={styles.icon}
                            />
                        </View>
                        <Text style={styles.text}>Chỉnh sửa</Text>
                        <Image
                            source={require('../../assets/right_arrow.png')}
                            style={styles.arrowIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/lock.png')}
                                style={styles.icon}
                            />
                        </View>
                        <Text style={styles.text}>Đổi mật khẩu</Text>
                        <Image
                            source={require('../../assets/right_arrow.png')}
                            style={styles.arrowIcon}
                        />
                    </TouchableOpacity>

                    {/* Chỉ hiển thị nút "Xác nhận CCCD" nếu maVaiTro là 3 hoặc 4 */}
                    {canCaptureCCCD && (
                        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CaptureCCCDScreen')}>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={require('../../assets/card_verify.png')}
                                    style={styles.icon}
                                />
                            </View>
                            <Text style={styles.text}>Xác nhận CCCD</Text>
                            <Image
                                source={require('../../assets/right_arrow.png')}
                                style={styles.arrowIcon}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container2: {
        flex: 1,
        backgroundColor: '#EFFFD6',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#EFFFD6',
    },
    infoContainner: {
        marginTop: 65,
        backgroundColor: '#f7ffe8',
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#7b8087',
        marginBottom: 40,
        elevation: 15,
    },
    buttonContainner: {
        padding: 20,
        backgroundColor: '#f7ffe8',
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#7b8087',
        marginBottom: 40,
        elevation: 15,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 10,
        marginTop: -65,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#7b8087',
        resizeMode: 'cover',
    },
    infoContainer: {
        marginBottom: 10,
    },
    label: {
        alignSelf: 'center',
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    labelID: {
        alignSelf: 'center',
        color: '#484a4d',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 20,
        marginVertical: 10,
        borderWidth: 1,
    },
    iconContainer: {
        borderRadius: 50,
        padding: 5,
        marginRight: 10,
    },
    icon: {
        width: 30,
        height: 30,
    },
    text: {
        flex: 1,
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrowIcon: {
        width: 30,
        height: 30,
        marginLeft: 10,
    },
});

export default AccountScreen;
