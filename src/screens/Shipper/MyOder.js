import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import {
  getDonHangData, approveOrder, GiveOrder,
} from '../../../src/services/orderService';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';
const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [ship, setShip] = useState([]);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [shipperOrders, setShipperOrders] = useState([]);
  console.log("orders", orders)
   console.log("shipperOrders", shipperOrders)
  // console.log("user.uid", user.uid)

  useEffect(() => {
    // Lắng nghe DonHangShiper
    const unsubscribeShipperOrders = firestore()
      .collection('NguoiDung')
      .doc(user.uid)
      .collection('DonHangShiper')
      .onSnapshot(
        (snapshot) => {
          const shipperData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setShipperOrders(shipperData); // Cập nhật state shipperOrders
        },
        (error) => {
          console.error("Lỗi khi lắng nghe DonHangShiper:", error);
          setShipperOrders([]);
        }
      );

    return () => {
      if (unsubscribeShipperOrders) unsubscribeShipperOrders();
    };
  }, []);

  useEffect(() => {
    const unsubscribeDonHang = getDonHangData(
      2, // Trạng thái cần lắng nghe
      (donHangList) => {
        // Lọc những đơn hàng không có trong shipperOrders
        const filteredOrders = donHangList
          .filter(order => shipperOrders.some(shipper => shipper.id === order.id))
          .map(order => {
            // Tìm dữ liệu bổ sung từ shipperOrders nếu cần
            const shipperOrderData = shipperOrders.find(shipper => shipper.id === order.id);
            return {
              ...order,
              tinhTrangDonHangShiper: shipperOrderData ? shipperOrderData.tinhTrangDonHangShiper : null, // Thêm thuộc tính từ shipperOrders
            };
          });

        setOrders(filteredOrders); // Cập nhật danh sách kết hợp
      },
      (error) => {
        console.error("Lỗi khi lắng nghe DonHangData:", error);
        setOrders([]);
      }
    );

    return () => {
      if (unsubscribeDonHang) unsubscribeDonHang();
    };
  }, [shipperOrders]); // Lắng nghe thay đổi từ shipperOrders

  // Handle delete
  const handleDelete = async (id) => {
    try {
      // Tham chiếu đến subcollection DonHangShiper của user hiện tại
      await firestore()
        .collection('NguoiDung') // Thay 'NguoiDung' bằng tên collection chính xác
        .doc(user.uid)           // user.uid là ID của người dùng (cần đảm bảo có user context)
        .collection('DonHangShiper')
        .doc(id)                 // Xóa tài liệu có ID được truyền vào
        .delete();

      console.log(`Đã xóa đơn hàng shipper với id: ${id}`);
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng shipper: ", error);
    }
  };

  const handGiveOrder = async (id, index) => {
    try {
      // Tham chiếu đến subcollection DonHangShiper của người dùng hiện tại
      const donHangShiperRef = firestore()
        .collection('NguoiDung') // Collection chính: NguoiDung
        .doc(user.uid)           // Document của người dùng, user.uid lấy từ context
        .collection('DonHangShiper') // Subcollection: DonHangShiper
        .doc(id);                // Document ID cần cập nhật

      // Cập nhật trường tinhTrangDonHangShiper thành 2
      await donHangShiperRef.update({
        tinhTrangDonHangShiper: index,
      });

      console.log(`Đã cập nhật trạng thái đơn hàng shipper với id: ${id} thành 2`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng shipper: ', error);
    }
  };

  const handleUpdateDonHang = async (id) => {
    try {
      const donHangRef = firestore().collection('DonHang').doc(id);
      const donHangShiperRef = firestore()
        .collection('NguoiDung')
        .doc(user.uid) // Thay bằng user hiện tại
        .collection('DonHangShiper')
        .doc(id);
  
      // Lấy dữ liệu đơn hàng từ `DonHang`
      const donHangDoc = await donHangRef.get();
      if (!donHangDoc.exists) {
        throw new Error(`Đơn hàng với ID ${id} không tồn tại trong DonHang`);
      }
      const donHangData = donHangDoc.data();
  
      // Lấy dữ liệu đơn hàng từ `DonHangShiper`
      const donHangShiperDoc = await donHangShiperRef.get();
      if (!donHangShiperDoc.exists) {
        throw new Error(`Đơn hàng với ID ${id} không tồn tại trong DonHangShiper`);
      }
      const donHangShiperData = donHangShiperDoc.data();
  
      // Cập nhật `tinhTrangDonHang` và `tinhTrangThanhToan` trong `DonHang`
      await donHangRef.update({
        tinhTrangDonHang: 3,
        tinhTrangThanhToan: 1,
      });
  
      // Thêm đơn hàng đã cập nhật vào `DonHangThanhCong`
      const donHangThanhCongRef = firestore().collection('DonHangThanhCong').doc(id);
      await donHangThanhCongRef.set({
        ...donHangData,
        tinhTrangDonHang: 3,
        tinhTrangThanhToan: 1,
      });
  
      // Xóa đơn hàng khỏi `DonHang`
      await donHangRef.delete();
  
      // Thêm đơn hàng đã xóa từ `DonHangShiper` vào `DonHangShiperDaGiao`
      const donHangShiperDaGiaoRef = firestore()
        .collection('NguoiDung')
        .doc(user.uid) // Thay bằng user hiện tại
        .collection('DonHangShiperDaGiao')
        .doc(id);
      await donHangShiperDaGiaoRef.set(donHangShiperData);
  
      // Xóa đơn hàng khỏi `DonHangShiper`
      await donHangShiperRef.delete();
  
      console.log(`Hoàn tất xử lý đơn hàng với ID ${id}`);
    } catch (error) {
      console.error("Lỗi khi xử lý đơn hàng:", error);
    }
  };


  console.log("orders", orders)
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>Đơn hàng:</Text>

      <View style={[styles.tach, { width: '60%' }]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Mã ĐH: </Text>
        <Text style={styles.thongTin}>{item.id}</Text>
      </View>

      <View style={[styles.tach, { width: '41%' }]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Tên người nhận: </Text>
        <Text style={styles.thongTin}>{item.hoTen}</Text>
      </View>

      <View style={[styles.tach, { width: '60%' }]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Địa chỉ: </Text>
        <Text style={styles.thongTin}>{item.diaChi}</Text>
      </View>

      <View style={[styles.tach, { width: '47%' }]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Số điện thoại: </Text>
        <Text style={styles.thongTin}>{item.soDienThoai}</Text>
      </View>

      <View style={[styles.tach, { width: '90%' }]}>
        <Text style={styles.totalText}>Tổng tiền ................. </Text>
        <Text style={[styles.totalText, { color: 'red' }]}>{item.tongTien} VNĐ</Text>
      </View>

      <TouchableOpacity style={styles.buttonXN} disabled={item.tinhTrangDonHangShiper !== 2} onPress={() => handGiveOrder(item.id,4)}>
        <Text style={[{ fontSize: 16, color: 'white', fontWeight: 'bold' }]}>Xác nhận đã giao</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} disabled={item.tinhTrangDonHangShiper !== 1} onPress={() => handGiveOrder(item.id,2)}>
        <Text style={styles.buttonText}>{(item.tinhTrangDonHangShiper === 0 && "Chờ hàng") ||
          (item.tinhTrangDonHangShiper === 1 && "Lấy hàng") ||
          (item.tinhTrangDonHangShiper === 2 && "Đang giao") || 
          (item.tinhTrangDonHangShiper === 3  || item.tinhTrangDonHangShiper === -1 && "Chờ trả hàng") || 
          (item.tinhTrangDonHangShiper === 4 && "Chờ thanh toán")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonHN} onPress={() => handleDelete(item.id)} disabled={item.tinhTrangDonHangShiper !== 1 && item.tinhTrangDonHangShiper !== 0}>
        <Text style={styles.buttonText}>Hủy nhận</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonHG} disabled={item.tinhTrangDonHangShiper !== 2} onPress={() => handGiveOrder(item.id,3)}>
        <Text style={styles.buttonText}>Hủy giao</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonHD} onPress={() => handGiveOrder(item.id,-1)} disabled={item.tinhTrangDonHangShiper !== 2}>
        <Text style={styles.buttonText}>Hủy đơn</Text>
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Đơn hàng của tôi'} iconShop={true} />
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa nhận đơn hàng nào cả</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('OderDelivery')}>
            {/* disabled={isLoading} */}
            <Text style={styles.continueText}>Nhận đơn hàng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFFD6', // Màu nền
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },

  //1
  card: {
    backgroundColor: '#FFFFFF', // Màu nền trắng
    borderRadius: 8,
    padding: 15,
    margin: 10,
    shadowColor: '#EFFFD6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1, // Độ dày viền
    borderColor: '#000000', // Màu viền đen
  },
  thongTin: {
    fontSize: 15,
    color: 'black',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#24A3FF', // Màu xanh
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
    fontWeight: 'bold',
  },
  buttonHN: {
    backgroundColor: '#FF2A2A', // Màu xanh
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    right: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  buttonHD: {
    backgroundColor: '#FF2A2A', // Màu xanh
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 140,
    right: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  buttonHG: {
    backgroundColor: '#EAD300', // Màu xanh
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 100,
    right: 10,
    fontWeight: 'bold',
  },
  buttonXN: {
    backgroundColor: '#24A3FF', // Màu xanh
    padding: 7,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
  },
  tach: {
    flexDirection: 'row',
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },


  //2
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#12A9EA',
    borderWidth: 2,
  },
  continueText: {
    color: '#12A9EA',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
});

export default OrderListScreen;
