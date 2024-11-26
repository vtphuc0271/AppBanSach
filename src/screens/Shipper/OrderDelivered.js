import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import {
  getDonHangData, approveOrder, GiveOrder,
} from '../../../src/services/orderService';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { UserContext } from '../../context/UserContext';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const {user} = useContext(UserContext);

  console.log('uid', user);

  const addOrderToDonHangShiper = async (maDonHang) => {
    if (!user || !user.uid) {
      console.error('UID chưa có');
      return;
    }
    
    try {
      // Tạo reference đến subcollection DonHangShiper
      const donHangShiperRef = firestore()
        .collection('NguoiDung')
        .doc(user.uid).collection('DonHangShiper').doc(maDonHang) // Document ID là maDonHang
  
      // Dữ liệu đơn hàng cần thêm
      const newOrderData = {
        tinhTrangDonHangShiper:0, // Trạng thái của đơn hàng
      };
  
      // Thêm dữ liệu vào Firestore
      await donHangShiperRef.set(newOrderData);
  
      console.log('Thêm đơn hàng thành công:', maDonHang, newOrderData);
    } catch (error) {
      console.error('Lỗi khi thêm đơn hàng vào DonHangShiper:', error);
    }
  };

  useEffect(() => {
    let unsubscribeDonHang, unsubscribeShipperOrders;
  
    const fetchOrders = () => {
      // Hàm lấy dữ liệu từ DonHangShiper bằng onSnapshot
      const fetchShipperOrders = (callback) => {
        try {
          unsubscribeShipperOrders = firestore()
           // user.uid được lấy từ context hoặc user đăng nhập
            .collectionGroup('DonHangShiper')
            .onSnapshot(
              snapshot => {
                const shipperOrderIds = snapshot.docs.map(doc => doc.id);
                callback(shipperOrderIds);
              },
              error => {
                console.error('Lỗi khi lắng nghe DonHangShiper:', error);
                callback([]);
              }
            );
        } catch (error) {
          console.error('Lỗi khi thiết lập onSnapshot DonHangShiper:', error);
        }
      };
  
      // Lấy danh sách mã đơn hàng từ subcollection
      fetchShipperOrders((shipperOrderIds) => {
        unsubscribeDonHang = getDonHangData(
          2, // Trạng thái cần lắng nghe
          (donHangList) => {
            // Loại bỏ đơn hàng có ID trùng với danh sách shipperOrderIds
            const filteredOrders = donHangList.filter(order =>
              !shipperOrderIds.includes(order.id) // Lọc ngược
            );
            setOrders(filteredOrders);
          },
          (error) => {
            console.error('Lỗi khi lắng nghe DonHangData:', error);
            setOrders([]);
          }
        );
      });
    };
  
    setOrders([]); // Reset danh sách đơn hàng
    fetchOrders();
  
    // Cleanup các onSnapshot khi component unmount
    return () => {
      if (typeof unsubscribeDonHang === 'function') {
        unsubscribeDonHang();
      }
      if (typeof unsubscribeShipperOrders === 'function') {
        unsubscribeShipperOrders();
      }
    };
  }, []);
  
  
  

  console.log("orders", orders)

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>Đơn hàng:</Text>

      <View style={styles.tach}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Mã ĐH: </Text>
        <Text style={styles.thongTin}>{item.id}</Text>
      </View>

      <View style={styles.tach}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Tên người nhận: </Text>
        <Text style={styles.thongTin}>{item.hoTen}</Text>
      </View>

      <View style={styles.tach}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Địa chỉ: </Text>
        <Text style={styles.thongTin}>{item.diaChi}</Text>
      </View>

      <View style={styles.tach}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Số điện thoại: </Text>
        <Text style={styles.thongTin}>{item.soDienThoai}</Text>
      </View>

      <View style={styles.tach}>
        <Text style={styles.totalText}>Tổng tiền ................. </Text>
        <Text style={[styles.totalText, { color: 'red' }]}>{item.tongTien} VNĐ</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => { addOrderToDonHangShiper(item.id);}}>
        <Text style={styles.buttonText}>Nhận</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Đơn hàng cần giao'} iconShop={true} />
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: '#12A9EA', // Màu xanh
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    right: 20,
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
});

export default OrderListScreen;
