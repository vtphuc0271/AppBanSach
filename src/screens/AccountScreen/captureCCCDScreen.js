import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';

const CaptureCCCDScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(UserContext); // Lấy thông tin người dùng hiện tại từ UserContext
    const [cccdMatTruoc, setCccdMatTruoc] = useState(null);
    const [cccdMatSau, setCccdMatSau] = useState(null);

    // Lấy dữ liệu từ Firestore khi render component
    useEffect(() => {
        const fetchCCCDData = async () => {
            try {
                const userDoc = await firestore()
                    .collection('NguoiDung')
                    .doc(user.uid)
                    .get();

                if (userDoc.exists) {
                    const data = userDoc.data();
                    setCccdMatTruoc(data.cccdMatTruoc || null);
                    setCccdMatSau(data.cccdMatSau || null);
                }
            } catch (error) {
                console.error('Error fetching CCCD data: ', error);
                Alert.alert('Lỗi', 'Không thể tải dữ liệu CCCD.');
            }
        };

        fetchCCCDData();
    }, [user.uid]);

    // Hàm chụp ảnh và upload lên Firebase Storage
    const takeAndUploadPhoto = async (setImageUrl) => {
        try {
            const options = { mediaType: 'photo', cameraType: 'back', saveToPhotos: false };
            const response = await launchCamera(options);

            if (response.didCancel) {
                Alert.alert('Thông báo', 'Bạn đã hủy chụp ảnh.');
                return;
            }
            if (response.errorMessage) {
                Alert.alert('Lỗi', response.errorMessage);
                return;
            }

            if (response.assets && response.assets.length > 0) {
                const photoUri = response.assets[0].uri;
                const fileName = `cccd_${Date.now()}.jpg`;
                const reference = storage().ref(fileName);

                // Upload file lên Firebase Storage
                await reference.putFile(photoUri);

                // Lấy URL tải xuống và lưu vào biến
                const url = await reference.getDownloadURL();
                setImageUrl(url);
                Alert.alert('Thành công', 'Ảnh đã được tải lên thành công.');
            }
        } catch (error) {
            console.error('Error uploading image: ', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên.');
        }
    };

    // Hàm lưu URL ảnh vào Firestore
    const saveToFirestore = async () => {
        if (!cccdMatTruoc || !cccdMatSau) {
            Alert.alert('Lỗi', 'Vui lòng chụp đầy đủ cả mặt trước và mặt sau của CCCD.');
            return;
        }

        try {
            // Cập nhật thông tin của người dùng hiện tại vào Firestore
            await firestore()
                .collection('NguoiDung')
                .doc(user.uid)
                .update({
                    cccdMatTruoc: cccdMatTruoc,
                    cccdMatSau: cccdMatSau,
                    cccdUpdatedAt: firestore.FieldValue.serverTimestamp(),
                });

            Alert.alert('Thành công', 'Dữ liệu CCCD đã được cập nhật.');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving to Firestore: ', error);
            Alert.alert('Lỗi', 'Không thể lưu dữ liệu.');
        }
    };

    return (
        <View style={styles.container2}>
        <Text style={styles.title}>Chụp Căn Cước Công Dân</Text>
        <View style={styles.container}>

            {/* Chụp mặt trước */}
            <TouchableOpacity
                style={styles.captureButton}
                onPress={() => takeAndUploadPhoto(setCccdMatTruoc)}
            >
                <Text style={styles.buttonText}>
                    {cccdMatTruoc ? 'Chụp lại mặt trước' : 'Chụp mặt trước'}
                </Text>
            </TouchableOpacity>
            {cccdMatTruoc && (
                <Image source={{ uri: cccdMatTruoc }} style={styles.capturedImage} />
            )}

            {/* Chụp mặt sau */}
            <TouchableOpacity
                style={styles.captureButton}
                onPress={() => takeAndUploadPhoto(setCccdMatSau)}
            >
                <Text style={styles.buttonText}>
                    {cccdMatSau ? 'Chụp lại mặt sau' : 'Chụp mặt sau'}
                </Text>
            </TouchableOpacity>
            {cccdMatSau && (
                <Image source={{ uri: cccdMatSau }} style={styles.capturedImage} />
            )}

            {/* Lưu dữ liệu */}
            {cccdMatTruoc && cccdMatSau && (
                <TouchableOpacity style={styles.saveButton} onPress={saveToFirestore}>
                    <Text style={styles.buttonText}>Lưu và Quay lại</Text>
                </TouchableOpacity>
            )}
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFFFD6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container2: {
        flex: 1,
        backgroundColor: '#EFFFD6',
        alignItems: 'center',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 30,
        textAlign:'center',
        color: '#000',
    },
    captureButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 16,
        color: '#FFF',
    },
    capturedImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#7b8087',
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: '#28A745',
        padding: 10,
        borderRadius: 15,
        marginTop: 20,
    },
});

export default CaptureCCCDScreen;
