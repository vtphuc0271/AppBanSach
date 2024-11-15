import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    Animated,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [slideAnim] = useState(new Animated.Value(500));

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('DonHang')
            .onSnapshot(
                snapshot => {
                    const publisherList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setCategories(publisherList);
                },
                error => {
                    console.error('Error fetching Firestore data: ', error);
                },
            );
        return () => unsubscribe();
    }, []);

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);

        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 500,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedOrder(null);
        });
    };

    return (
        <View style={styles.container}>
            <NavbarCard ScreenName={'DS Oder'} />
            <View style={styles.container2}>
                {categories.length === 0 ? (
                    <View style={styles.noOrderContainer}>
                        <Text style={styles.noOrderText}>Không có đơn hàng nào</Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={() => console.log('Refresh Data')}>
                            <Text style={styles.refreshButtonText}>Làm mới</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView>
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => openModal(category)}
                                style={styles.categoryRow}
                            >
                                <Text style={[styles.categoryId, { flex: 0 }]}>{index + 1}</Text>
                                <View style={[styles.imageContainer, { flex: 1 }]}>
                                    <Image
                                        source={{ uri: category.image }}
                                        style={styles.categoryImage}
                                    />
                                </View>
                                <View style={{ flex: 3 }}>
                                    <Text style={styles.categoryid_NguoiDung}>ID: {category.id_NguoiDung}</Text>
                                    <Text style={styles.categoryDiaChi}>Địa chỉ: {category.diaChi}</Text>
                                    {/* <Text style={styles.categoryngayTao}>Ngày: {new Date(category.ngayTao.seconds * 1000).toLocaleDateString()}</Text> */}
                                    <Text style={styles.categorysoDienThoai}>SĐT: {category.soDienThoai}</Text>
                                    <Text style={styles.categorytongTien}>Tổng: {category.tongTien} VNĐ</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <Animated.View style={[styles.modalView, { transform: [{ translateY: slideAnim }] }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.buttonText}>Đóng</Text>
                        </TouchableOpacity>



                        {selectedOrder && (
                            <View style={styles.orderDetails}>
                                <Text style={styles.modalText}>Tình trạng đơn hàng</Text>

                                <Text>ID:  {selectedOrder.id_NguoiDung}</Text>
                                <Text>Địa chỉ:  {selectedOrder.diaChi} </Text>
                                <Text>Ngày: </Text>
                                <Text>Số điện thoại:  {selectedOrder.soDienThoai}</Text>
                                <Text>Tổng tiền:  {selectedOrder.tongTien}</Text>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container2: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9ffef',
        borderRadius: 10,
        marginVertical: 5,
    },
    categoryId: {
        width: 30,
        marginLeft: 15,
        color: '#000',
    },
    imageContainer: {
        width: 50,
        height: 50,
    },
    categoryImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        height: '100%', // Full màn hình
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    closeButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    orderDetails: {
        paddingVertical: 5,
    },
});

export default CategoryList;
