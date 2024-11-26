import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import { launchImageLibrary } from 'react-native-image-picker';
import NavbarCard from '../../components/NavbarCard';
import NotificationCard from '../../components/NotificationCard';
import { UserContext } from '../../context/UserContext';
const ManagerUser = ({ navigation }) => {
    const [nguoiDung, setNguoiDung] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [image, setImage] = useState('');
    const [ten, setTen] = useState('');
    const [mk, setMK] = useState('');
    const [email, setEmail] = useState('');
    const [sdt, setSDT] = useState('');
    const [vaitro, setVaiTro] = useState();
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const { user, matkhau } = useContext(UserContext);
    //console.log("user",user)
    const [newSpaceUser, setNewSpaceUser] = useState({
        hinh: '',
        hoTen: '',
        maVaiTro: '2',
        soDienThoai: '',
    });

    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const toggleExpand = (itemId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedUserId(expandedUserId === itemId ? null : itemId);
    };

    const handleHideNotification = () => {
        setShowNotification(false);
    };

    const toggleAdd = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsModalVisible(!isModalVisible);
    };

    const toggleEdit = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsModalVisible(!isModalVisible);
    };

    //Lấy ảnh từ máy ảo
    const openImagePicker = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0].uri);
            }
        });
    };

    //Tải ảnh lên firebase
    const uploadImage = async (uri) => {
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const storageRef = storage().ref(`images/${filename}`);
        const uploadTask = storageRef.putFile(uri);
        try {
            await uploadTask;
            const imageUrl = await storageRef.getDownloadURL();
            return imageUrl;
        } catch (error) {
            console.error('Error uploading image: ', error);
            return null;
        }
    };



    // useEffect(() => {
    //     if (user?.maVaiTro && user.maVaiTro !== '1') {
    //         // Nếu vai trò khác "1", hiển thị thông báo và điều hướng về MainScreen
    //         Alert.alert(
    //             "Quyền hạn thay đổi",
    //             "Bạn không có quyền truy cập vào màn hình này.",
    //             [
    //                 {
    //                     text: "OK",
    //                     onPress: () => navigation.navigate('LoginScreen')
    //                 }
    //             ],
    //             { cancelable: false }
    //         );
    //     }
    // }, [user, navigation]);
    //Lay thong tin tren firebase xuong

    useEffect(() => {
        const unsubscribeNguoiDung = firestore().collection('NguoiDung').onSnapshot(
            snapshot => {
                const nguoiDungList = snapshot.docs.map(doc => {
                    if (doc.id !== user.uid) { // Kiểm tra nếu id khác với user.uid
                        return {
                            id: doc.id,
                            ...doc.data(), // Lấy dữ liệu từ document
                        };
                    }
                    return null; // Trả về null nếu id là của người dùng hiện tại
                }).filter(item => item !== null);;
                setNguoiDung(nguoiDungList);
                setImage(nguoiDung.hinh);
            },
            error => {
                console.error('Error fetching Firestore data: ', error);
            }
        );
    }, []);

    //Cap nhat anh 
    // inUser1((nguoi) => {
    //     if (nguoi.hinh) {
    //         setImage(nguoi.hinh); // Cập nhật trạng thái hình ảnh khi nguoi.hinh có giá trị
    //     }
    // }, [nguoi.hinh]); // Khi nguoi.hinh thay đổi thì gọi setImage

    // Hàm tạo người dùng với kiểm tra đầu vào
    const registerUser = async () => {
        if (user?.maVaiTro !== '1') { // Kiểm tra nếu không phải admin
            Alert.alert("Thông báo", "Chỉ admin mới có quyền tạo tài khoản.");
            return;
        }

        if (!ten || !email || !mk || !sdt) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (mk.length < 6) {
            Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        const currentUser = firebase.auth().currentUser; // Lưu thông tin tài khoản admin hiện tại
        console.log(currentUser);
        try {
            // Tạo tài khoản mới
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, mk);
            const newUser = userCredential.user;

            // Tải ảnh lên Firestore (nếu có)
            let imageUrl = image;
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            // Thêm thông tin người dùng vào Firestore
            await firestore().collection('NguoiDung').doc(newUser.uid).set({
                email,
                hinh: imageUrl || '',
                hoTen: ten,
                maVaiTro: "2", // Vai trò mặc định là người dùng
                soDienThoai: sdt,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            // Đăng xuất tài khoản vừa tạo
            await firebase.auth().signOut();

            // Đăng nhập lại tài khoản admin
            await firebase.auth().signInWithEmailAndPassword(currentUser.email, matkhau);

            Alert.alert('Thông báo', 'Tạo tài khoản thành công.');
            resetForm();
            setIsModalVisible(false);
        } catch (error) {
            console.error('Lỗi tạo tài khoản:', error);
            Alert.alert('Thông báo', 'Tạo tài khoản thất bại. Vui lòng thử lại.');
        }
    };




    //Sua nguoi dung
    const handleEditUser = (nguoi) => {
        toggleEdit();
        setIsEditing(true); // Đặt chế độ chỉnh sửa
        setImage(nguoi.hinh);
        // setVaiTro(nguoi.vaitro)
        setTen(nguoi.hoTen); // Truyền dữ liệu vào trường "Tên"
        setEmail(nguoi.email); // Truyền dữ liệu vào trường "Email"
        setSDT(nguoi.soDienThoai); // Truyền dữ liệu vào trường "Số điện thoại"
        setEditUserId(nguoi.id); // Lưu ID người dùng để thực hiện sửa
        console.log('ten: ', nguoi.hoTen);
        console.log('hinh: ', nguoi.hinh);
        console.log('sdt: ', nguoi.soDienThoai);
    };

    const handleDuyet = (nguoi) => {
        // Cập nhật trạng thái của người dùng thành "Đã duyệt"
        const updatedUser = { status: 'Đã duyệt' };

        // Cập nhật Firestore
        firebase.firestore().collection('NguoiDung').doc(nguoi.id)  // Dùng ID người dùng để xác định tài liệu
            .update(updatedUser)
            .then(() => {
                alert('Cập nhật trạng thái thành công: Đã duyệt');
                // Bạn có thể thêm logic hiển thị thông báo hoặc làm mới danh sách người dùng ở đây
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật trạng thái: ', error);
                Alert.alert('Thông báo', 'Cập nhật trạng thái thất bại. Vui lòng thử lại!');
            });
    };

    const handleTuChoi = (nguoi) => {
        // Cập nhật trạng thái của người dùng thành "Đã từ chối"
        const updatedUser = { status: 'Đã từ chối' };

        // Cập nhật Firestore
        firebase.firestore().collection('NguoiDung').doc(nguoi.id)  // Dùng ID người dùng để xác định tài liệu
            .update(updatedUser)
            .then(() => {
                alert('Cập nhật trạng thái thành công: Đã từ chối');
                // Bạn có thể thêm logic hiển thị thông báo hoặc làm mới danh sách người dùng ở đây
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật trạng thái: ', error);
                Alert.alert('Thông báo', 'Cập nhật trạng thái thất bại. Vui lòng thử lại!');
            });
    };


    //Chan nguoi dung
    const handleBlock = async (nguoi) => {
        const userId = nguoi.id;

        // Kiểm tra xem người dùng có tồn tại không
        if (!userId) {
            Alert.alert('Thông báo', 'Không tìm thấy ID người dùng.');
            return;
        }

        try {
            // Lấy thông tin người dùng từ Firestore để kiểm tra maVaiTro hiện tại
            const userDoc = await firestore().collection('NguoiDung').doc(userId).get();

            if (!userDoc.exists) {
                Alert.alert('Thông báo', 'Người dùng không tồn tại.');
                return;
            }

            const userData = userDoc.data();
            const currentRole = userData.maVaiTro;

            // Kiểm tra nếu maVaiTro là 6, thì khôi phục maVaiTro cũ
            let newRole;
            if (currentRole === "6") {
                // Nếu maVaiTro = 6, khôi phục giá trị maVaiTro cũ
                newRole = userData.previousRole || "1"; // Gán lại giá trị trước đó, nếu không có previousRole thì gán mặc định là 1
            } else {
                // Nếu maVaiTro không phải 6, gán thành 6
                newRole = "6";
            }

            // Cập nhật vai trò người dùng
            await firestore()
                .collection('NguoiDung')
                .doc(userId)
                .update({
                    maVaiTro: newRole,
                    previousRole: currentRole, // Lưu giá trị maVaiTro cũ vào previousRole
                });

            // Thông báo chặn thành công
            Alert.alert('Thông báo', currentRole === "6" ? 'Bỏ chặn thành công!' : 'Chặn thành công!');

            // Làm mới danh sách người dùng sau khi thay đổi (nếu cần)
            const unsubscribeNguoiDung = firestore().collection('NguoiDung').onSnapshot(
                snapshot => {
                    const nguoiDungList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setNguoiDung(nguoiDungList);
                },
                error => {
                    console.error('Error fetching Firestore data: ', error);
                }
            );

        } catch (error) {
            // Nếu có lỗi trong quá trình cập nhật
            Alert.alert('Thông báo', 'Chặn người dùng thất bại. Vui lòng thử lại.');
            console.error('Lỗi khi chặn người dùng:', error);
        }
    };




    // Refesh
    const resetNewUser = () => {
        setIsModalVisible(false);
        setIsEditing(false);
        setEditUserId(null);
        setNewSpaceUser({
            hinh: '',
            hoTen: ten,
            soDienThoai: sdt,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    };

    // Cập nhật sau chỉnh sửa
    const updateUser = async () => {
        if (!ten || !email || !sdt) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            let imageUrl = image; // URL ảnh hiện tại
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            } else {
                imageUrl = '';
            }

            // Kiểm tra từng biến trước khi cập nhật
            console.log('ten:', ten);
            console.log('email:', email);
            console.log('sdt:', sdt);
            console.log('vai tro:', vaitro);
            console.log('imageUrl:', imageUrl);

            await firestore()
                .collection('NguoiDung')
                .doc(editUserId)
                .update({
                    hoTen: ten,
                    email,
                    hinh: imageUrl,
                    soDienThoai: sdt,
                });

            Alert.alert('Thông báo', 'Cập nhật người dùng thành công!');
            resetForm();
            setIsModalVisible(false);
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Thông báo', 'Cập nhật người dùng thất bại. Vui lòng thử lại.');
            console.error('Error updating user:', error);
        }
    };



    //Ham check
    const hamlog = () => {
        console.log("ten", ten);
        console.log("email", email);
        console.log("mk", mk);
        console.log("sdt", sdt);
    }

    //Refesh
    const resetForm = () => {
        setTen('');
        setEmail('');
        setMK('');
        setSDT('');
    }


    //Lay thong tin tai ten
    const filteredUser = nguoiDung
        .filter(nguoi => nguoi.hoTen?.toLowerCase().includes(searchText?.toLowerCase() || ""));


    return (
        <View style={styles.container}>
            <NavbarCard ScreenName={'Quản Trị User'} iconShop={true} />

            <View style={styles.khungLon}>
                <View style={styles.khungSearch}>
                    <TextInput
                        style={styles.search}
                        onChangeText={setSearchText}
                        placeholder="Tìm kiếm...."
                    />
                    <TouchableOpacity>
                        <Image style={styles.searchIcon} source={require('../../assets/search.png')} />
                    </TouchableOpacity>
                </View>

                <ScrollView>
  {filteredUser.map((nguoi) => (
    <TouchableOpacity key={nguoi.id} style={styles.khungItem} onPress={() => { toggleExpand(nguoi.id) }}>
      <View style={{ flexDirection: "row" }}>
        {nguoi.hinh ? (
          <Image source={{ uri: nguoi.hinh }} style={styles.anh} />
        ) : (
          <Image source={require('../../assets/default.png')} style={styles.anh} />
        )}
        <View style={styles.thongTin}>
          <Text style={styles.thongtin1}>Tên: {nguoi.hoTen}</Text>
          <Text style={styles.thongtin1}>Email: {nguoi.email}</Text>
          <Text style={styles.thongtin1}>SDT: {nguoi.soDienThoai}</Text>

          {expandedUserId === nguoi.id && (
            <View style={styles.expandedDetails}>
              {/* Chức năng xem đơn hàng */}
              <TouchableOpacity style={styles.buttonGreen}>
                <Image style={styles.icon1} source={require('../../assets/XemDH.png')} />
                <Text style={styles.buttonText}>Xem đơn hàng</Text>
              </TouchableOpacity>

              {/* Chức năng sửa thông tin */}
              <TouchableOpacity style={styles.buttonGray} onPress={() => handleEditUser(nguoi)}>
                <Image style={styles.icon1} source={require('../../assets/SuaTT.png')} />
                <Text style={styles.buttonText}>Sửa thông tin</Text>
              </TouchableOpacity>

              {/* Kiểm tra mã vai trò của người dùng là 3 hoặc 4 */}
              {(nguoi.maVaiTro === '3' || nguoi.maVaiTro === '4') && (
                <>
                  {/* Kiểm tra nếu người dùng có CCCD */}
                  {nguoi.cccdMatTruoc && nguoi.cccdMatSau ? (
                    <>
                      {/* Kiểm tra người dùng có phải là admin hay không */}
                      {user && user.maVaiTro === "1" && (
                        <>
                          <TouchableOpacity style={styles.buttonOrange} onPress={() => handleDuyet(nguoi)}>
                            <Image style={styles.icon1} source={require('../../assets/accept.png')} />
                            <Text style={styles.buttonText}>Duyệt</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.buttonPurpure} onPress={() => handleTuChoi(nguoi)}>
                            <Image style={styles.icon1} source={require('../../assets/deny.png')} />
                            <Text style={styles.buttonText}>Từ chối</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Nếu không có CCCD, khi bấm sẽ thông báo */}
                      <TouchableOpacity
                        style={styles.buttonOrange}
                        onPress={() => {
                          Alert.alert('Thông báo', 'Người dùng chưa cập nhật CCCD.');
                        }}
                      >
                        <Image style={styles.icon1} source={require('../../assets/accept.png')} />
                        <Text style={styles.buttonText}>Duyệt</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buttonPurpure}
                        onPress={() => {
                          Alert.alert('Thông báo', 'Người dùng chưa cập nhật CCCD.');
                        }}
                      >
                        <Image style={styles.icon1} source={require('../../assets/deny.png')} />
                        <Text style={styles.buttonText}>Từ chối</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              {/* Chức năng chặn tài khoản */}
              <TouchableOpacity style={styles.buttonRed} onPress={() => handleBlock(nguoi)}>
                <Image style={styles.icon1} source={require('../../assets/ChanTK.png')} />
                <Text style={styles.buttonText}>
                  {(nguoi.maVaiTro !== "6" && "Chặn tài khoản") ||
                    (nguoi.maVaiTro === "6" && "Bỏ chặn")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ))}
</ScrollView>


                <TouchableOpacity onPress={toggleAdd}>
                    <Image style={styles.icon2} source={require('../../assets/ThemND.png')} />
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                animationType="slide"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => { setIsModalVisible(false); resetForm(); resetNewUser(); }}>
                            <Text style={{ alignSelf: 'flex-end', fontSize: 18, color: 'red' }}>Đóng</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</Text>

                        <TouchableOpacity onPress={openImagePicker}>
                            <Image
                                source={selectedImage ? { uri: selectedImage } : require('../../assets/ronadol.png')}
                                style={styles.imagePlaceholder}
                            />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên người dùng"
                            onChangeText={setTen}
                            value={ten} // Hiển thị tên người dùng cần sửa
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu"
                            onChangeText={setMK}
                            value={mk} // Hiển thị mật khẩu (nếu muốn sửa mật khẩu)
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Địa chỉ email"
                            onChangeText={setEmail}
                            value={email} // Hiển thị email người dùng cần sửa
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Số điện thoại"
                            onChangeText={setSDT}
                            value={sdt} // Hiển thị số điện thoại người dùng cần sửa
                        />

                        <TouchableOpacity style={styles.addButton} onPress={isEditing ? updateUser : registerUser}>
                            <Text style={styles.addButtonText} >{isEditing ? 'Cập nhật người dùng' : 'Thêm người dùng'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {showNotification && (
                <TouchableOpacity
                    onPress={handleHideNotification}
                    style={styles.DeThongBao}>
                    <NotificationCard
                        type={notificationType}
                        message={notificationMessage}
                        dateTime={new Date().toLocaleString()}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};





const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header1: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 50,
        color: '#000',
    },
    khungLon: {
        height: '90%',
        backgroundColor: '#C1FFC1',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 50,
        color: '#000',
    },

    //1
    khungSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10,
        margin: 15,
        backgroundColor: 'white',
    },

    //2
    search: {
        flex: 1,
        padding: 10,
    },
    searchIcon: {
        width: 25,
        height: 25,
    },
    //

    //3
    khungItem: {
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        margin: 10,
        backgroundColor: '#C1FFC1',
    },
    thongTin: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginLeft: -30,
    },
    thongtin1: {
        fontSize: 16,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 30,
        color: 'black',
    },
    anh: {
        width: 70,
        height: 70,
        borderRadius: 10,
        zIndex: 1,
        marginTop: 15,
    },
    expandedDetails: {
        marginLeft: 20,
        marginRight: 10,
    },
    buttonGreen: {
        backgroundColor: '#0AEE57',
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 5,
        flexDirection: 'row'
    },
    buttonOrange: {
        backgroundColor: '#fc9003',
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 5,
        flexDirection: 'row'
    },
    buttonPurpure: {
        backgroundColor: '#b16dc2',
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 5,
        flexDirection: 'row'
    },
    buttonGray: {
        backgroundColor: 'gray',
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 5,
        flexDirection: 'row',
    },
    buttonRed: {
        backgroundColor: 'red',
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 5,
        flexDirection: 'row'
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        marginLeft: 10,
    },
    icon1: {
        width: 27,
        height: 27,
        marginLeft: 15,
    },

    //4
    icon2: {
        width: 80,
        height: 80,
        marginLeft: 'auto',
        marginBottom: 10,
        marginRight: 10,
        zIndex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 2000, // Đảm bảo hộp thoại thêm người dùng hiển thị phía trên
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#0AEE57',
        padding: 10,
        borderRadius: 5,
    },
    addButtonText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },

    //De thong bao
    DeThongBao: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 1000, // Đặt giá trị thấp hơn để không đè lên modal thêm
        paddingHorizontal: 20,
    },
});


export default ManagerUser;