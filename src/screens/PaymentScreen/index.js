import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  AppState,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import NavbarCard from '../../components/NavbarCard';
import {UserContext} from '../../context/UserContext';
import {getUserCart} from '../../services/cartService';
import {getBookById} from '../../services/bookService';
import firestore from '@react-native-firebase/firestore';
import NotificationCard from '../../components/NotificationCard';
import {useNavigation} from '@react-navigation/native';

const PaymentScreen = ({route}) => {
  const {user} = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [open, setOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);
  //console.log('cartItems', cartItems);
  //console.log('user', user);
  const navigation = useNavigation();
  const {id_Sach} = route.params || {};

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const bankCode = 'vietcombank';
  const accountNumber = '1024753410';
  const template = 'compact2';
  const [totalPrice, setTotalPrice] = useState(0);
  const accountName = 'HO%20QUANG%20TRUONG';
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg?amount=${totalPrice}&addInfo=${orderId}&accountName=${accountName}`;

  const fetchBookDetails = id_Sach => {
    const bookRef = firestore().collection('Sach').doc(id_Sach);

    // Sử dụng `onSnapshot` để theo dõi thời gian thực
    const unsubscribe = bookRef.onSnapshot(docSnapshot => {
      try {
        if (docSnapshot.exists) {
          const bookDetails = docSnapshot.data();
          setCartItems([
            {
              id_Sach: id_Sach,
              tenSach: bookDetails.tenSach,
              soLuong: '1',
              giaMua: Number(bookDetails.giaTien) || 0,
            },
          ]);
          setTotalPrice(Number(bookDetails.giaTien) || 0);
        } else {
          console.error(`Không tìm thấy sách với ID: ${id_Sach}`);
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sách:', error);
      }
    });

    // Trả về hàm hủy listener để sử dụng khi cần
    return unsubscribe;
  };

  const fetchCartItemsWithDetails = () => {
    const cartRef = firestore()
      .collection('GioHang')
      .doc(user.uid)
      .collection('Items');

    // Sử dụng `onSnapshot` để theo dõi thời gian thực
    const unsubscribe = cartRef.onSnapshot(async snapshot => {
      try {
        const cartItems = snapshot.docs.map(doc => ({
          id_Sach: doc.id,
          soLuong: doc.data().soLuong || 1,
          giaMua: Number(doc.data().giaMua) || 0,
        }));

        if (cartItems.length > 0) {
          const itemsWithDetails = await Promise.all(
            cartItems.map(async cartItem => {
              const bookDetails = await getBookById(cartItem.id_Sach);
              if (bookDetails) {
                return {
                  ...cartItem,
                  tenSach: bookDetails.tenSach,
                  soLuong: cartItem.soLuong,
                  giaTien: Number(bookDetails.giaTien) || 0,
                };
              }
              return null;
            }),
          );
          setCartItems(itemsWithDetails.filter(item => item !== null));
        } else {
          setCartItems([]); // Xóa danh sách nếu không còn sản phẩm
        }
      } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng với chi tiết sách:', error);
      }
    });

    // Trả về hàm hủy listener để sử dụng khi cần
    return unsubscribe;
  };

  useEffect(() => {
    if (user && user.uid) {
      if (id_Sach) {
        fetchBookDetails(id_Sach);
      } else {
        fetchCartItemsWithDetails();
      }
    }
  }, [user, id_Sach]);

  useEffect(() => {
    if (!id_Sach) {
      setTotalPrice(getTotalPrice());
    }
  }, [cartItems]);

  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'background' && isModalVisible && orderId) {
        await cancelOrder();
        setModalVisible(false);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isModalVisible, orderId]);

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.giaMua || 0) * parseInt(item.soLuong || '1', 10),
      0,
    );
  };

  const createEmptyOrder = async () => {
    try {
      const donHangRef = await firestore().collection('DonHang').add({
        id_NguoiDung: user.uid,
        hoTen: hoTen,
        diaChi: diaChi,
        soDienThoai: soDienThoai,
        ngayTao: new Date(),
        tongTien: 0,
        tinhTrangDonHang: 0,
        notEnough: 0,
        ngayThanhToan: '',
        phuongThucThanhToan: '',
        tinhTrangThanhToan: 0,
      });
      setOrderId(donHangRef.id);
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng rỗng:', error);
    }
  };

  const finalizeOrder = async () => {
    try {
      if (!orderId) {
        throw new Error('Không tìm thấy orderId để cập nhật đơn hàng.');
      }

      const tongTien = getTotalPrice();

      // Cập nhật thông tin đơn hàng
      await firestore().collection('DonHang').doc(orderId).update({
        tongTien: tongTien,
      });

      // Lưu chi tiết đơn hàng vào `ChiTietDonHang`
      const chiTietDonHangRef = firestore()
        .collection('ChiTietDonHang')
        .doc(orderId);
      const batch = firestore().batch();

      cartItems.forEach(item => {
        const itemRef = chiTietDonHangRef.collection('Items').doc(item.id_Sach);
        batch.set(itemRef, {
          soLuong: parseInt(item.soLuong || '1', 10),
          giaMua: item.giaMua,
        });
      });

      await batch.commit();
      console.log('Cập nhật đơn hàng thành công.');
    } catch (error) {
      console.error('Lỗi khi hoàn thiện đơn hàng:', error);
    }
  };

  const cancelOrder = async () => {
    try {
      await firestore().collection('DonHang').doc(orderId).delete();
      setOrderId(null); // Xóa orderId khỏi state
      console.log('Đã hủy đơn hàng.');
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
    }
  };
  const [hoTen, setHoTen] = useState(user.hoTen || '');
  const [diaChi, setDiaChi] = useState(user.diaChi || '');
  const [soDienThoai, setSoDienThoai] = useState(user.soDienThoai || '');
  const toggleModal = async () => {
    if (!hoTen.trim() || !diaChi.trim() || !soDienThoai.trim()) {
      setNotificationType('error');
      setNotificationMessage('Vui lòng nhập đầy đủ thông tin');
      setShowNotification(true);
      return;
    }
    if (paymentMethod === 'QR') {
      if (!isModalVisible && !orderId) {
        await createEmptyOrder();
      }
      setModalVisible(!isModalVisible);
    } else if (paymentMethod === 'cod') {
      await confirmPayment();
    } else {
      alert('Bạn đã chọn phương thức thanh toán không hợp lệ');
    }
  };

  const confirmPayment = async () => {
    try {
      const tongTien = getTotalPrice();

      if (!tongTien || tongTien <= 0) {
        throw new Error('Giá trị đơn hàng không hợp lệ.');
      }

      if (paymentMethod === 'QR') {
        // Xác nhận và cập nhật đơn hàng
        await finalizeOrder();

        // Cập nhật thông tin thanh toán trực tiếp vào đơn hàng
        await firestore()
          .collection('DonHang')
          .doc(orderId) // orderId là ID của đơn hàng
          .update({
            ngayThanhToan: new Date(),
            phuongThucThanhToan: 'QR',
            tinhTrangThanhToan: 0, // Đã thanh toán
          });

        // Xóa giỏ hàng nếu thanh toán toàn bộ
        if (!id_Sach) {
          const gioHangRef = firestore().collection('GioHang').doc(user.uid);

          // Kiểm tra và lấy các tài liệu con nếu có
          const itemsRef = gioHangRef.collection('Items');
          const snapshot = await itemsRef.get();

          if (!snapshot.empty) {
            // Xóa từng tài liệu trong subcollection 'Items'
            const batch = firestore().batch();
            snapshot.forEach(doc => {
              batch.delete(doc.ref);
            });

            // Thực hiện xóa batch
            await batch.commit();
            console.log('Đã xóa tất cả items trong giỏ hàng.');
          } else {
            console.log('snapshot.empty');
          }

          // Sau khi xóa các items, xóa tài liệu chính
          await gioHangRef.delete();
          console.log('Giỏ hàng đã được xóa.');
        }

        // Hiển thị thông báo thành công
        setModalVisible(false);
        setNotificationType('success');
        setNotificationMessage('Bạn đã thanh toán thành công qua QR!');
        setShowNotification(true);

        setTimeout(() => {
          navigation.navigate('MainScreen');
        }, 3000);
      } else if (paymentMethod === 'cod') {
        // Tạo đơn hàng và chi tiết nếu chọn COD
        const donHangRef = await firestore().collection('DonHang').add({
          id_NguoiDung: user.uid,
          hoTen: hoTen,
          diaChi: diaChi,
          soDienThoai: soDienThoai,
          ngayTao: new Date(),
          tongTien: tongTien,
          notEnough: 0,
          tinhTrangDonHang: 0, // Đơn hàng đang chờ xử lý
          tinhTrangThanhToan: 0, // Chưa thanh toán
          phuongThucThanhToan: 'cod',
          ngayThanhToan: null, // Chưa có ngày thanh toán
        });
        const codOrderId = donHangRef.id;

        const batch = firestore().batch();
        cartItems.forEach(item => {
          const itemRef = firestore()
            .collection('ChiTietDonHang')
            .doc(codOrderId)
            .collection('Items')
            .doc(item.id_Sach);
          batch.set(itemRef, {
            soLuong: parseInt(item.soLuong || '1', 10),
            giaMua: item.giaMua,
          });
        });
        await batch.commit();

        // Xóa giỏ hàng nếu có
        if (!id_Sach) {
          const gioHangRef = firestore().collection('GioHang').doc(user.uid);

          const itemsRef = gioHangRef.collection('Items');
          const snapshot = await itemsRef.get();

          if (!snapshot.empty) {
            const batch = firestore().batch();
            snapshot.forEach(doc => {
              batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('Đã xóa tất cả items trong giỏ hàng.');
          }

          await gioHangRef.delete();
          console.log('Giỏ hàng đã được xóa.');
        }

        setNotificationType('success');
        setNotificationMessage(
          'Bạn đã đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.',
        );
        setShowNotification(true);

        setTimeout(() => {
          navigation.navigate('MainScreen');
        }, 3000);
      } else {
        throw new Error('Phương thức thanh toán không hợp lệ.');
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận thanh toán:', error);
      setNotificationType('error');
      setNotificationMessage('Xác nhận thanh toán thất bại. Vui lòng thử lại.');
      setShowNotification(true);
    }
  };

  const closeModal = async () => {
    if (orderId) {
      await cancelOrder();
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container2}>
      <NavbarCard ScreenName={'Thanh toán'} Shop />
      <View style={styles.container}>
        {/* Thông tin người dùng */}
        <View style={styles.infoSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Họ tên:</Text>
            <TextInput
              style={styles.input}
              value={hoTen}
              onChangeText={text => setHoTen(text)}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <TextInput
              style={styles.input}
              value={diaChi}
              onChangeText={text => setDiaChi(text)}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SĐT:</Text>
            <TextInput
              style={styles.input}
              value={soDienThoai}
              onChangeText={text => setSoDienThoai(text)}
            />
          </View>
        </View>

        {/* Giỏ hàng */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Tên SP</Text>
            <Text style={styles.cartTitle}>Số lượng</Text>
            <Text style={styles.cartTitle}>Đơn giá</Text>
          </View>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id_Sach}
            renderItem={({item}) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemName}>{item.tenSach}</Text>
                <Text style={styles.itemQuantity}>{item.soLuong}</Text>
                <Text style={styles.itemPrice}>
                  {Number(item.giaMua * item.soLuong).toLocaleString()} VNĐ
                </Text>
              </View>
            )}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng tiền:</Text>
            <Text style={styles.totalPrice}>
              {getTotalPrice().toLocaleString()} VNĐ
            </Text>
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <Text style={styles.paymentLabel}>Chọn phương thức thanh toán:</Text>
        <DropDownPicker
          open={open}
          value={paymentMethod}
          items={[
            {label: 'Thanh toán khi nhận hàng', value: 'cod'},
            {label: 'Quét mã QR', value: 'QR'},
          ]}
          setOpen={setOpen}
          setValue={setPaymentMethod}
          placeholder="Chọn phương thức thanh toán"
          style={styles.paymentDropdown}
        />

        <TouchableOpacity style={styles.payButton} onPress={toggleModal}>
          <Text style={styles.payButtonText}>
            {paymentMethod === 'cod'
              ? 'Thanh Toán Khi Nhận Hàng'
              : 'Thanh Toán QR'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal mã QR */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Image
                source={require('../../assets/closeqr.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quét mã để thanh toán</Text>
            <View style={styles.qrContainer}>
              <Image source={{uri: qrUrl}} style={styles.qrImage} />
            </View>
            <Text style={styles.warningText}>
              *Lưu ý: không thay đổi nội dung chuyển khoản, đơn hàng của bạn sẽ
              được duyệt trong vòng 4 giờ, hãy theo dõi tình trạng đơn hàng của
              bạn.
            </Text>
            <TouchableOpacity
              style={styles.payButton2}
              onPress={confirmPayment}>
              <Text style={styles.payButtonText}>Tôi đã thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showNotification && (
        <TouchableOpacity
          onPress={() => {
            setShowNotification(false);
          }}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFFD6',
    padding: 20,
  },
  container2: {
    flex: 1,
    backgroundColor: '#EFFFD6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  input: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cartSection: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartTitle: {
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    width: '33%',
    fontWeight: 'bold',
    flexShrink: 1,
    fontSize: 14,
    color: '#000',
  },
  itemQuantity: {
    width: '33%',
    justifyContent: 'center',
    textAlign: 'center',
  },
  itemPrice: {
    width: '33%',
    color: 'orange',
    textAlign: 'right',
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
  },
  totalPrice: {
    color: 'orange',
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  paymentDropdown: {
    marginBottom: 20,
    borderRadius: 5,
  },
  contentPadding: {
    height: 60,
  },
  payButton: {
    backgroundColor: '#00C853',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  payButton2: {
    backgroundColor: '#00C853',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalPhone: {
    fontSize: 14,
    marginBottom: 10,
  },
  qrContainer: {
    borderColor: '#00C853',
    borderWidth: 2,
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    borderStyle: 'dashed',
  },
  qrImage: {
    width: 300,
    height: 510,
  },
  warningText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
