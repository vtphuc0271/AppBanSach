import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import {
  getDonHangData, approveOrder,GiveOrder,
} from '../../../src/services/orderService';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';
const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();
  


  useEffect(() => {
    let unsubscribe;

    const fetchOrders = () => {

      // Gọi hàm getDonHangData từ orderlistservice
      unsubscribe = getDonHangData(2,
        donHangList => {
          setOrders(donHangList);
        },
        error => {
          setOrders([]);
        },
      );
    };
    setOrders([]);
    fetchOrders();

    // Cleanup unsubscribe khi component unmount hoặc tab thay đổi
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  console.log("orders", orders)
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>Đơn hàng:</Text>

      <View style={[styles.tach, {width: '60%'}]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Mã ĐH: </Text>
        <Text style={styles.thongTin}>{item.id}</Text>
      </View>

      <View style={[styles.tach, {width: '41%'}]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Tên người nhận: </Text>
        <Text style={styles.thongTin}>{item.hoTen}</Text>
      </View>

      <View style={[styles.tach, {width: '60%'}]}>
        <Text style={[styles.thongTin, { fontWeight: "bold" }]}>Địa chỉ: </Text>
        <Text style={styles.thongTin}>{item.diaChi}</Text>
      </View>

      <View style={[styles.tach, {width: '47%'}]}>
        <Text style={[styles.thongTin, { fontWeight: "bold"}]}>Số điện thoại: </Text>
        <Text style={styles.thongTin}>{item.soDienThoai}</Text>
      </View>

      <View style={[styles.tach, {width: '90%'}]}>
        <Text style={styles.totalText}>Tổng tiền ................. </Text>
        <Text style={[styles.totalText, { color: 'red' }]}>{item.tongTien} VNĐ</Text>
      </View>

      <TouchableOpacity style={styles.buttonXN} onPress={() => approveOrder(item.id, 1)}>
        <Text style={[{ fontSize: 16, color: 'white', fontWeight: 'bold' }]}>Xác nhận đã giao</Text>
      </TouchableOpacity>

      <View style={styles.button}>
        <Text style={styles.buttonText}>Đã lấy đơn</Text>
      </View>
      <TouchableOpacity style={styles.buttonHD} onPress={() => approveOrder(item.id, 1)}>
        <Text style={styles.buttonText}>Hủy đơn</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonHG}>
        <Text style={styles.buttonText}>Hủy giao</Text>
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Đơn hàng cua toi'} iconShop={true} />
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa nhận đơn hàng nào cả</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('ShipperDelivered')}>
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
  buttonHD: {
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
