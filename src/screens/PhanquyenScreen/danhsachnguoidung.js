<<<<<<< HEAD
import React, { useEffect,useState,useContext } from 'react';
=======
import React, { useEffect, useState, useContext } from 'react';
>>>>>>> feature/PhanQuyen
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { UserContext } from '../../context/UserContext';

<<<<<<< HEAD
const UserListScreen = ({navigation}) => {
=======
const UserListScreen = ({ navigation }) => {
>>>>>>> feature/PhanQuyen
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
    const {user} = useContext(UserContext);
    useEffect(() => {
        if (user?.maVaiTro && user.maVaiTro !== '1') {
            // Nếu vai trò khác "1", điều hướng về MainScreen
=======
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user?.maVaiTro && user.maVaiTro !== '1') {
>>>>>>> feature/PhanQuyen
            navigation.navigate('MainScreen');
        }
    }, [user, navigation]);

<<<<<<< HEAD
    useEffect(() => {
        const unsubscribe = firestore()
            .collection('NguoiDung')
            .onSnapshot(snapshot => {
                const userList = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.maVaiTro !== '1'); 
                setUsers(userList);
                setFilteredUsers(userList);
            });

        return () => unsubscribe();
    }, []);

    // Lọc người dùng dựa trên truy vấn tìm kiếm
=======
    // Định nghĩa fetchData bên ngoài useEffect để có thể tái sử dụng
    const fetchData = () => {
        const unsubscribe = firestore()
            .collection('NguoiDung')
            .onSnapshot(querySnapshot => {
                const userList = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.maVaiTro !== '1');
                setUsers(userList);
                setFilteredUsers(userList);
            }, error => {
                console.log("Error fetching users: ", error);
            });

        // Trả về hàm cleanup để hủy đăng ký listener khi component bị hủy
        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchData();
        return () => unsubscribe(); // Cleanup khi component unmount
    }, []);


>>>>>>> feature/PhanQuyen
    useEffect(() => {
        const filtered = users.filter(user =>
            user.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.soDienThoai.includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const getRoleName = (roleCode) => {
        switch (roleCode) {
            case '2':
                return 'Khách hàng';
            case '3':
                return 'Nhân viên';
            case '4':
                return 'Shipper';
            default:
                return 'Vai trò không xác định';
        }
    };

    const openModal = (userId, currentRole) => {
        setSelectedUserId(userId);
        setSelectedRole(currentRole);
        setModalVisible(true);
    };

    const updateRole = async () => {
        if (selectedUserId && selectedRole) {
            try {
<<<<<<< HEAD
                // Cập nhật vai trò trong Firestore
=======
                // Cập nhật vai trò trên Firebase
>>>>>>> feature/PhanQuyen
                await firestore()
                    .collection('NguoiDung')
                    .doc(selectedUserId)
                    .update({ maVaiTro: selectedRole });

<<<<<<< HEAD
                // Cập nhật lại trạng thái trong ứng dụng sau khi thay đổi vai trò
                const updatedUsers = users.map(user =>
                    user.id === selectedUserId ? { ...user, maVaiTro: selectedRole } : user
                );
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);
=======
                // Làm mới danh sách người dùng từ Firebase
                await fetchData();
>>>>>>> feature/PhanQuyen

                // Đóng modal sau khi cập nhật
                setModalVisible(false);
            } catch (error) {
                console.log("Error updating user role: ", error);
            }
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <Image source={{ uri: item.hinh || 'https://via.placeholder.com/60' }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>Tên: {item.hoTen}</Text>
                <Text style={styles.userRole}>Vai trò: {getRoleName(item.maVaiTro)}</Text>
                <Text style={styles.userEmail}>Email: {item.email}</Text>
                <Text style={styles.userPhone}>SĐT: {item.soDienThoai}</Text>
                <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => openModal(item.id, item.maVaiTro)}>
                        <Image
                            source={require('../../assets/iconmenuquantri.png')}
                            style={styles.iconmenuquantri}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <NavbarCard ScreenName={'người dùng'} iconShop={true} />
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="tìm kiếm"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
                <TouchableOpacity>
                    <Image
                        source={require('../../assets/iconsearch.png')}
                        style={styles.searchIcon}
                    />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.userList}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn vai trò</Text>
<<<<<<< HEAD

=======
                        {/* Các nút chọn vai trò */}
>>>>>>> feature/PhanQuyen
                        <View style={styles.radioButtonContainer}>
                            <TouchableOpacity style={styles.radioButton} onPress={() => setSelectedRole('2')}>
                                <View style={styles.radioCircle}>
                                    {selectedRole === '2' && <View style={styles.selectedRb} />}
                                </View>
                                <Text style={styles.radioText}>Khách hàng</Text>
                            </TouchableOpacity>
<<<<<<< HEAD
=======

>>>>>>> feature/PhanQuyen
                            <TouchableOpacity style={styles.radioButton} onPress={() => setSelectedRole('3')}>
                                <View style={styles.radioCircle}>
                                    {selectedRole === '3' && <View style={styles.selectedRb} />}
                                </View>
                                <Text style={styles.radioText}>Nhân viên</Text>
                            </TouchableOpacity>
<<<<<<< HEAD
=======

>>>>>>> feature/PhanQuyen
                            <TouchableOpacity style={styles.radioButton} onPress={() => setSelectedRole('4')}>
                                <View style={styles.radioCircle}>
                                    {selectedRole === '4' && <View style={styles.selectedRb} />}
                                </View>
                                <Text style={styles.radioText}>Shipper</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <Button title="Lưu" onPress={updateRole} color="blue" />
                            <Button title="Thoát" onPress={() => setModalVisible(false)} color="red" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

<<<<<<< HEAD

=======
>>>>>>> feature/PhanQuyen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e6f2d9',
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#dff2d9',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#d9d9d9',
        alignItems: 'center',
        borderColor: '#7cb342',
        borderStyle: 'dashed',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 10,
        zIndex: 1,
        marginTop: 15,
    },
    userInfo: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10, padding: 10,
        marginLeft: -30,
    },
    userName: {
        fontSize: 14,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 30,
        color: 'black',
    },
    userRole: {
        fontSize: 14,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 30,
        color: 'black',
    },
    userEmail: {
        fontSize: 14,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 30,
        color: 'black',
    },
    userPhone: {
        fontSize: 14,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 30,
        color: 'black',
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        padding: 8,
    },
<<<<<<< HEAD
    searchIcon: {
        width: 20,
        height: 20,
    },
=======
>>>>>>> feature/PhanQuyen
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    picker: {
        width: '100%',
        marginVertical: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    }, radioButtonContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#7cb342',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedRb: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#7cb342',
    },
    radioText: {
        fontSize: 16,
        color: 'black',
    },
});

export default UserListScreen;
