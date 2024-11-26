import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';

const TransactionHistoryScreen = () => {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const ordersRef = collection(db, "DonHangThanhCong");
        const q = query(ordersRef, where("tinhTrangThanhToan", "==", 1));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedOrders = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    ngayThanhToan: data.ngayThanhToan ? data.ngayThanhToan.toDate() : null,
                };
            });

            const sortedOrders = fetchedOrders.sort((a, b) => {
                if (a.ngayThanhToan && b.ngayThanhToan) {
                    return b.ngayThanhToan - a.ngayThanhToan;
                }
                return 0;
            });

            setOrders(sortedOrders);
            setAllOrders(sortedOrders);
        });

        return () => unsubscribe();
    }, []);

    const handleFilter = () => {
        if (!startDate || !endDate) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            Alert.alert('Lỗi', 'Ngày không hợp lệ. Vui lòng nhập đúng định dạng (yyyy-mm-dd).');
            return;
        }

        if (start > end) {
            Alert.alert('Lỗi', 'Ngày bắt đầu không thể lớn hơn ngày kết thúc');
            return;
        }

        const filteredOrders = allOrders.filter((order) => {
            const ngayThanhToan = order.ngayThanhToan;
            return ngayThanhToan && ngayThanhToan >= start && ngayThanhToan <= end;
        });

        setOrders(filteredOrders);
    };

    const resetFilter = () => {
        setOrders(allOrders);
        setStartDate('');
        setEndDate('');
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemHeader}>Mã đơn hàng: {item.id}</Text>
            <Text style={styles.itemText}>Họ tên: {item.hoTen || "N/A"}</Text>
            <Text style={styles.itemText}>Địa chỉ: {item.diaChi || "N/A"}</Text>
            <Text style={styles.itemText}>
                Ngày thanh toán: {item.ngayThanhToan ? item.ngayThanhToan.toLocaleString() : "N/A"}
            </Text>
            <Text style={styles.itemText}>Phương thức thanh toán: {item.phuongThucThanhToan || "N/A"}</Text>
            <Text style={styles.itemText}>Tình trạng: Hoàn thành</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <NavbarCard
                ScreenName={'Lịch sử giao dịch'}
                iconShop={true}>
            </NavbarCard>
            <View style={styles.filterContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập ngày bắt đầu (yyyy-mm-dd)"
                    value={startDate}
                    onChangeText={(text) => setStartDate(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nhập ngày kết thúc (yyyy-mm-dd)"
                    value={endDate}
                    onChangeText={(text) => setEndDate(text)}
                />
                <View style={styles.buttonRow}>
                    <Button title="Lọc giao dịch" onPress={handleFilter} />
                    <View style={{ width: 10 }} />
                    <Button title="Tắt lọc" onPress={resetFilter} color="#FF6347" />
                </View>
            </View>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text>Không có đơn hàng nào.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'column',
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    input: {
        height: 40,
        borderColor: '#dcdcdc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    item: {
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#dcdcdc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    itemText: {
        color: '#333',
        fontSize: 16,
    },
    itemHeader: {
        color: '#007BFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
});

export default TransactionHistoryScreen;
