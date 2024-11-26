import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { Picker } from '@react-native-picker/picker';

const RevenueStatisticsScreen = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Mặc định là năm hiện tại
  const [revenueData, setRevenueData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    datasets: [{ data: Array(12).fill(0) }],
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Hàm xử lý lắng nghe Firestore
    const unsubscribe = firestore()
      .collection('DonHangThanhCong')
      .where('ngayThanhToan', '>=', new Date(`${selectedYear}-01-01`))
      .where('ngayThanhToan', '<=', new Date(`${selectedYear}-12-31`))
      .onSnapshot(async (ordersSnapshot) => {
        try {
          const orders = ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const monthlyRevenue = Array(12).fill(0); // Mảng chứa doanh thu từng tháng
          const bookSummary = {}; // Tổng hợp sách
          let totalRevenueSum = 0; // Tổng doanh thu toàn bộ

          for (const order of orders) {
            const orderDate = order.ngayThanhToan.toDate
              ? order.ngayThanhToan.toDate()
              : new Date(order.ngayThanhToan);
            const monthIndex = orderDate.getMonth(); // Lấy tháng từ 0-11

            monthlyRevenue[monthIndex] += order.tongTien || 0;

            const itemsSnapshot = await firestore()
              .collection('ChiTietDonHangThanhCong')
              .doc(order.id)
              .collection('Items')
              .get();

            for (const itemDoc of itemsSnapshot.docs) {
              const { giaMua, soLuong } = itemDoc.data();
              const totalItemRevenue = giaMua * soLuong;
              totalRevenueSum += totalItemRevenue;

              const sachDoc = await firestore().collection('Sach').doc(itemDoc.id).get();
              let bookName = 'Không xác định';
              if (sachDoc.exists) {
                const sachData = sachDoc.data();
                bookName = sachData.tenSach || 'Không xác định';
              }

              if (!bookSummary[itemDoc.id]) {
                bookSummary[itemDoc.id] = {
                  name: bookName,
                  quantity: 0,
                  total: 0,
                };
              }
              bookSummary[itemDoc.id].quantity += soLuong;
              bookSummary[itemDoc.id].total += totalItemRevenue;
            }
          }

          // Cập nhật dữ liệu
          setRevenueData(Object.values(bookSummary));
          setChartData({
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            datasets: [{ data: monthlyRevenue }],
          });
          setTotalRevenue(totalRevenueSum);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
        }
      });

    // Cleanup listener khi component bị unmount
    return () => unsubscribe();
  }, [selectedYear]); // Gọi lại khi năm thay đổi

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Thống kê'} iconShop={true} />

      {/* Bộ lọc năm */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Chọn năm:</Text>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {/* Chỉ hiển thị các năm */}
          <Picker.Item label="2024" value={2024} />
          <Picker.Item label="2023" value={2023} />
          <Picker.Item label="2022" value={2022} />
          <Picker.Item label="2021" value={2021} />
        </Picker>
      </View>

      {/* Bảng thống kê */}
      <FlatList
        data={revenueData}
        keyExtractor={(item, index) => String(index)}
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1 }]}>STT</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>Tên sách</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>SL</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Tổng tiền</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{index + 1}</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.name}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.total.toLocaleString()} VND</Text>
          </View>
        )}
      />

      {/* Biểu đồ đường */}
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 16}
        height={260}
        fromZero
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: '#121212', // Màu nền đen
          backgroundGradientFrom: '#1e1e1e', // Gradient tối hơn
          backgroundGradientTo: '#2a2a2a',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(30, 215, 96, ${opacity})`, // Xanh neon
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Chữ trắng
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#1db954', // Viền xanh neon
          },
        }}
        bezier
        style={{
          marginVertical: 16,
          borderRadius: 16,
        }}
      />

      <Text style={styles.totalRevenue}>Tổng doanh thu: {totalRevenue.toLocaleString()} VND</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0fff0',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#d3f8d3',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    fontSize: 14,
    textAlign: 'center',
  },
  totalRevenue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: 16,
    color: '#ff4500',
  },
});

export default RevenueStatisticsScreen;
