import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Text,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import NavbarCard from '../../components/NavbarCard';
import {
  getDonHangDataWithUser,
  getDonHangThanhCongWithUser,
  orderNotEnough,
  approveOrder
} from '../../services/orderService';
import firestore from '@react-native-firebase/firestore';
import {getBookById} from '../../services/bookService';
import {UserContext} from '../../context/UserContext';

const TABS = [
  {id: 0, icon: require('../../assets/clipboard.png')},
  {id: 1, icon: require('../../assets/inactive1.png')},
  {id: 2, icon: require('../../assets/inactive2.png')},
  {id: 3, icon: require('../../assets/inactive3.png')},
];

const OrderScreen = () => {
  const {user} = useContext(UserContext);
  const [selectedTab, setSelectedTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [orders1, setOrders2] = useState([]);
  const [chitietOrders, setChitietOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [donHangShiperWithUsers, setDonHangShiperWithUsers] = useState([]);

  //console.log('orders', orders);

  useEffect(() => {
    let unsubscribe;
    setDonHangShiperWithUsers([]);

    if (selectedTab == 2 || selectedTab == 3) {
      unsubscribe = listenToDonHangShiperWithUsers();
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [selectedTab]);

  useEffect(() => {
    const fetchOrdersData = async () => {
      setIsLoading(true);
      try {
        if (selectedTab === 0) {
          unsubscribe = getDonHangDataWithUser(
            selectedTab,
            user.uid,
            donHangList => {
              setOrders(donHangList);
              setIsLoading(false);
            },
            error => {
              setOrders([]);
              setIsLoading(false);
            },
          );
        } else if (selectedTab === 1) {
          unsubscribe = getDonHangDataWithUser(
            selectedTab,
            user.uid,
            donHangList => {
              setOrders(donHangList);
              setIsLoading(false);
            },
            error => {
              setOrders([]);
              setIsLoading(false);
            },
          );
        } else if (selectedTab === 2) {
          unsubscribe = getDonHangDataWithUser(
            selectedTab,
            user.uid,
            donHangList => {
              setOrders(donHangList);
              setIsLoading(false);
            },
            error => {
              setOrders([]);
              setIsLoading(false);
            },
          );
        } else {
          unsubscribe = getDonHangThanhCongWithUser(
            user.uid,
            donHangList => {
              setOrders(donHangList);
              setIsLoading(false);
            },
            error => {
              setOrders([]);
              setIsLoading(false);
            },
          );
        }
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersData();
  }, [selectedTab, user.uid]);

  const listenToDonHangShiperWithUsers = () => {
    if (selectedTab == 2) {
      try {
        const unsubscribe = firestore()
          .collectionGroup('DonHangShiper')
          .onSnapshot(async snapshot => {
            const donHangShiperData = snapshot.docs.map(doc => ({
              id: doc.id,
              parentId: doc.ref.parent.parent.id,
              ...doc.data(),
            }));

            // Lấy danh sách userId của shipper
            const userIds = [
              ...new Set(donHangShiperData.map(item => item.parentId)),
            ];

            // Lấy thông tin user cho từng shipper
            const userDataPromises = userIds.map(async userId => {
              const userDoc = await firestore()
                .collection('NguoiDung')
                .doc(userId)
                .get();

              return {
                idShiper: userId,
                hoTenShiper: userDoc.data()?.hoTen || 'Không có tên',
                sdtShiper:
                  userDoc.data()?.soDienThoai || 'Không có số điện thoại',
              };
            });

            const userData = await Promise.all(userDataPromises);

            // Cập nhật danh sách shipper với thông tin user
            const combinedData = donHangShiperData.map(order => {
              const user =
                userData.find(u => u.idShiper === order.parentId) || {};
              return {
                ...order,
                userName: user.hoTenShiper,
                userPhone: user.sdtShiper,
              };
            });
            setDonHangShiperWithUsers(combinedData); // Cập nhật state với shipper
          });

        return unsubscribe;
      } catch (error) {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
      }
    } else if (selectedTab == 3) {
      try {
        const unsubscribe = firestore()
          .collectionGroup('DonHangShiperDaGiao')
          .onSnapshot(async snapshot => {
            const donHangShiperData = snapshot.docs.map(doc => ({
              id: doc.id,
              parentId: doc.ref.parent.parent.id,
              ...doc.data(),
            }));

            // Lấy danh sách userId của shipper
            const userIds = [
              ...new Set(donHangShiperData.map(item => item.parentId)),
            ];

            // Lấy thông tin user cho từng shipper
            const userDataPromises = userIds.map(async userId => {
              const userDoc = await firestore()
                .collection('NguoiDung')
                .doc(userId)
                .get();

              return {
                idShiper: userId,
                hoTenShiper: userDoc.data()?.hoTen || 'Không có tên',
                sdtShiper:
                  userDoc.data()?.soDienThoai || 'Không có số điện thoại',
              };
            });

            const userData = await Promise.all(userDataPromises);

            // Cập nhật danh sách shipper với thông tin user
            const combinedData = donHangShiperData.map(order => {
              const user =
                userData.find(u => u.idShiper === order.parentId) || {};
              return {
                ...order,
                userName: user.hoTenShiper,
                userPhone: user.sdtShiper,
              };
            });
            setDonHangShiperWithUsers(combinedData); // Cập nhật state với shipper
          });

        return unsubscribe;
      } catch (error) {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
      }
    }
  };

  const formatDate = timestamp => {
    if (timestamp instanceof firestore.Timestamp) {
      return timestamp.toDate().toLocaleString();
    }
    return '';
  };

  const fetchChiTietDonHang = async orderId => {
    try {
      const chiTietDonHangRef = firestore()
        .collection('ChiTietDonHang')
        .doc(orderId)
        .collection('Items');

      const snapshot = await chiTietDonHangRef.get();

      if (!snapshot.empty) {
        const chiTietDonHangList = await Promise.all(
          snapshot.docs.map(async doc => {
            const itemData = doc.data();
            const bookDetails = await getBookById(doc.id);

            if (bookDetails) {
              return {
                id: doc.id,
                ...itemData,
                bookDetails,
              };
            } else {
              return {
                id: doc.id,
                ...itemData,
                bookDetails: null,
              };
            }
          }),
        );

        setChitietOrders(chiTietDonHangList);
        setIsModalVisible(true);
      } else {
        console.log('Không có chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    }
  };

  const fetchChiTietDonHangThanhCong = async orderId => {
    try {
      const chiTietDonHangRef = firestore()
        .collection('ChiTietDonHangThanhCong')
        .doc(orderId)
        .collection('Items');

      const snapshot = await chiTietDonHangRef.get();

      if (!snapshot.empty) {
        const chiTietDonHangList = await Promise.all(
          snapshot.docs.map(async doc => {
            const itemData = doc.data();
            const bookDetails = await getBookById(doc.id);

            if (bookDetails) {
              return {
                id: doc.id,
                ...itemData,
                bookDetails,
              };
            } else {
              return {
                id: doc.id,
                ...itemData,
                bookDetails: null,
              };
            }
          }),
        );

        setChitietOrders(chiTietDonHangList);
        setIsModalVisible(true);
      } else {
        console.log('Không có chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    }
  };

  const deleteDonHang = async donHangId => {
    try {
      // Lấy dữ liệu DonHang trước khi xóa
      const donHangDoc = await firestore()
        .collection('DonHang')
        .doc(donHangId)
        .get();

      if (!donHangDoc.exists) {
        console.error('Không tìm thấy DonHang với ID:', donHangId);
        return;
      }

      const donHangData = donHangDoc.data();

      // Thêm DonHang vào DonHangBiXoa
      await firestore()
        .collection('DonHangBiXoa')
        .doc(donHangId) // Dùng ID giống để theo dõi
        .set({
          ...donHangData,
          deletedAt: firestore.FieldValue.serverTimestamp(), // Dấu thời gian xóa
        });

      // Lấy các ChiTietDonHang liên quan đến DonHang này
      const chiTietSnapshot = await firestore()
        .collection('ChiTietDonHang')
        .doc(donHangId)
        .collection('Items') // Subcollection Items
        .get();

      if (!chiTietSnapshot.empty) {
        const batch = firestore().batch(); // Batch xử lý các thao tác Firestore

        chiTietSnapshot.forEach(doc => {
          const chiTietData = doc.data();

          // Thêm từng tài liệu ChiTietDonHang vào ChiTietDonHangBiHuy
          const chiTietBiHuyRef = firestore()
            .collection('ChiTietDonHangBiXoa')
            .doc(donHangId)
            .collection('Items')
            .doc(doc.id);

          batch.set(chiTietBiHuyRef, {
            ...chiTietData,
            deletedAt: firestore.FieldValue.serverTimestamp(),
          });

          // Xóa tài liệu ChiTietDonHang trong subcollection Items
          batch.delete(doc.ref);
        });

        // Commit batch
        await batch.commit();
      }

      // Xóa DonHang
      await firestore().collection('DonHang').doc(donHangId).delete();

      console.log(
        'Đơn hàng và các chi tiết liên quan đã được xóa và lưu vào các collection tương ứng.',
      );
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
    }
  };
  
  const showAlert = id => {
    Alert.alert(
      'Bạn có chắc không?',
      'Bạn muốn thực hiện hành động này?',
      [
        {
          text: 'Chờ hàng',
          onPress: () => orderNotEnough(id, 2),
          style: 'default',
        },
        {
          text: 'Hủy đơn',
          onPress: () => {
            approveOrder(id, 4);
            deleteDonHang(id);
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const renderOrder = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedOrder(item);
        setIsModalVisible(true);

        if (selectedTab === 0 || selectedTab === 1 || selectedTab === 2) {
          fetchChiTietDonHang(item.id);
        } else if (selectedTab === 3) {
          fetchChiTietDonHangThanhCong(item.id);
        }
      }}>
      <Text style={styles.modalTitle2}>Đơn hàng:</Text>
      <Text style={[styles.modalTitle2, {marginBottom: 5}]}>{item.id}</Text>
      <View style={styles.row}>
        <Text style={styles.title}>Trạng thái thanh toán: </Text>
        <View style={styles.lineContainer}>
          <Text style={styles.line}></Text>
          <Text style={styles.content}>
            {item.tinhTrangThanhToan === 1
              ? item.phuongThucThanhToan === 'QR'
                ? 'Đã thanh toán (QR)'
                : 'Đã thanh toán'
              : item.phuongThucThanhToan === 'QR' &&
                item.tinhTrangThanhToan === 0
              ? 'Chưa xác nhận (QR)'
              : item.phuongThucThanhToan === 'cod' &&
                item.tinhTrangThanhToan === 0
              ? 'Chưa thanh toán (COD)'
              : 'Chưa thanh toán'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Tình trạng đơn hàng: </Text>
        <View style={styles.lineContainer}>
          <Text style={styles.line}></Text>
          <Text style={styles.content}>
            {item.tinhTrangDonHang === 0 && item.notEnough === 0
              ? 'Chưa xử lý'
              : item.tinhTrangDonHang === 1 && item.notEnough === 0
              ? 'Đang đóng hàng'
              : item.tinhTrangDonHang === 2
              ? 'Đang giao'
              : item.notEnough === 1
              ? 'Không đủ hàng'
              : item.notEnough === 2
              ? 'Đang chờ hàng'
              : 'Giao thành công'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Ngày tạo đơn: </Text>
        <View style={styles.lineContainer}>
          <Text style={styles.line}></Text>
          <Text style={styles.content}>{formatDate(item.ngayTao)}</Text>
        </View>
      </View>
      {donHangShiperWithUsers?.find(shipper => shipper.id === item.id) && (
        <>
          <View style={styles.row}>
            <Text style={styles.title}>Tên Shiper: </Text>
            <View style={styles.lineContainer}>
              <Text style={styles.line}></Text>
              <Text style={styles.content}>
                {donHangShiperWithUsers?.find(shipper => shipper.id === item.id)
                  ?.userName || 'Chưa có thông tin shipper'}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>SĐT Shiper: </Text>
            <View style={styles.lineContainer}>
              <Text style={styles.line}></Text>
              <Text style={styles.content}>
                {donHangShiperWithUsers?.find(shipper => shipper.id === item.id)
                  ?.userPhone || 'Chưa có thông tin shipper'}
              </Text>
            </View>
          </View>
        </>
      )}
      {(item.notEnough === 1 || item.notEnough === 2) && selectedTab === 0 ? (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => showAlert(item.id)}>
          <Image
            source={require('../../assets/erroicon.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container2}>
      <NavbarCard ScreenName={'Danh sách đơn hàng'}></NavbarCard>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.activeTab, // Đổi màu nền khi active
              ]}
              onPress={() => {
                if (!isLoading) {
                  setSelectedTab(tab.id);
                }
              }}
              disabled={isLoading}>
              <View
                style={[
                  styles.iconContainer,
                  selectedTab === tab.id && styles.iconContaineractive,
                ]}>
                <Image
                  source={tab.icon}
                  style={[
                    styles.tabIcon,
                    selectedTab === tab.id && styles.activeIcon,
                  ]} // Thêm hiệu ứng khi active
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          ListEmptyComponent={
            isLoading ? (
              <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
            ) : (
              <Text style={styles.emptyText}>Không có đơn hàng</Text>
            )
          }
        />
      </View>
      {/* Modal hiển thị chi tiết đơn hàng */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>
                  Đơn hàng: {selectedOrder.id}
                </Text>
                <ScrollView style={{maxHeight: '40%'}}>
                  {/* hoTen */}
                  <View style={styles.row}>
                    <Text style={styles.title}>Họ tên: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>{selectedOrder.hoTen}</Text>
                    </View>
                  </View>
                  {/* diaChi */}
                  <View style={styles.row}>
                    <Text style={styles.title}>Địa chỉ: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>{selectedOrder.diaChi}</Text>
                    </View>
                  </View>
                  {/* soDienThoai */}
                  <View style={styles.row}>
                    <Text style={styles.title}>SĐT: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>
                        {selectedOrder.soDienThoai}
                      </Text>
                    </View>
                  </View>
                  {/* tinhTrangThanhToan */}
                  <View style={styles.row}>
                    <Text style={styles.title}>Trạng thái thanh toán: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>
                        {selectedOrder.tinhTrangThanhToan === 1
                          ? selectedOrder.phuongThucThanhToan === 'QR'
                            ? 'Đã thanh toán (QR)'
                            : 'Đã thanh toán'
                          : selectedOrder.phuongThucThanhToan === 'QR' &&
                            selectedOrder.tinhTrangThanhToan === 0
                          ? 'Chưa xác nhận (QR)'
                          : selectedOrder.phuongThucThanhToan === 'cod' &&
                            selectedOrder.tinhTrangThanhToan === 0
                          ? 'Chưa thanh toán (COD)'
                          : 'Chưa thanh toán'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.title}>Tình trạng đơn hàng: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>
                        {selectedOrder.tinhTrangDonHang === 0 &&
                        selectedOrder.notEnough === 0
                          ? 'Chưa xử lý'
                          : selectedOrder.tinhTrangDonHang === 1 &&
                            selectedOrder.notEnough === 0
                          ? 'Đang đóng hàng'
                          : selectedOrder.tinhTrangDonHang === 2
                          ? 'Đang giao'
                          : selectedOrder.notEnough === 1
                          ? 'Không đủ hàng'
                          : selectedOrder.notEnough === 2
                          ? 'Đang chờ hàng'
                          : 'Giao thành công'}
                      </Text>
                    </View>
                  </View>
                  {/* ngayTao */}
                  <View style={styles.row}>
                    <Text style={styles.title}>Ngày tạo đơn: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>
                        {formatDate(selectedOrder.ngayTao)}
                      </Text>
                    </View>
                  </View>
                  {/* ngayThanhToan */}
                  {selectedOrder.tinhTrangThanhToan === 1 ||
                  selectedOrder.phuongThucThanhToan === 'QR' ? (
                    <View style={styles.row}>
                      <Text style={styles.title}>Ngày thanh toán: </Text>
                      <View style={styles.lineContainer}>
                        <Text style={styles.line}></Text>
                        <Text style={styles.content}>
                          {formatDate(selectedOrder.ngayThanhToan)}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  {/* tongTien */}
                  <View style={styles.row}>
                    <Text style={styles.title}>Tổng tiền: </Text>
                    <View style={styles.lineContainer}>
                      <Text style={styles.line}></Text>
                      <Text style={styles.content}>
                        {selectedOrder.tongTien.toLocaleString()} VNĐ
                      </Text>
                    </View>
                  </View>
                  {donHangShiperWithUsers?.find(
                    shipper => shipper.id === selectedOrder.id,
                  ) && (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.title}>Tên Shiper: </Text>
                        <View style={styles.lineContainer}>
                          <Text style={styles.line}></Text>
                          <Text style={styles.content}>
                            {donHangShiperWithUsers?.find(
                              shipper => shipper.id === selectedOrder.id,
                            )?.userName || 'Chưa có thông tin shipper'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.title}>SĐT Shiper: </Text>
                        <View style={styles.lineContainer}>
                          <Text style={styles.line}></Text>
                          <Text style={styles.content}>
                            {donHangShiperWithUsers?.find(
                              shipper => shipper.id === selectedOrder.id,
                            )?.userPhone || 'Chưa có thông tin shipper'}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </ScrollView>

                <Text style={[styles.modalTitle, {marginTop: 10}]}>
                  Chi tiết đơn hàng:
                </Text>
                <FlatList
                  data={chitietOrders}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => (
                    <View style={styles.cartItem}>
                      <Text style={styles.itemName}>
                        {item.bookDetails.tenSach}
                      </Text>
                      <Image
                        source={{uri: item.bookDetails.anhSach}}
                        resizeMode="stretch"
                        style={styles.itemImage}
                      />
                      <Text style={[styles.itemQuantity, {marginLeft: -30}]}>
                        {item.soLuong}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {Number(item.giaMua * item.soLuong).toLocaleString()}{' '}
                        VNĐ
                      </Text>
                    </View>
                  )}
                />
              </>
            )}
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
              disabled={isLoading}>
              <Image
                source={require('../../assets/closeqr.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EFFFD6',
  },
  container2: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  cartItem: {
    flexDirection: 'row', // Hiển thị các thành phần trong dòng
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: 3,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff5722',
    textAlign: 'right',
    flex: 1,
  },
  itemImage: {
    width: 50,
    height: 60,
    borderRadius: 3,
    marginRight: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flex: 1,
  },
  content: {
    textAlign: 'left',
    paddingBottom: 3,
    marginLeft: 5,
    fontSize: 10,
  },
  modalTitle2: {
    fontSize: 10,
    fontWeight: 'bold',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
    marginRight: 10,
    width: '30%',
    fontSize: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EFFFD6',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1, // Đảm bảo mỗi tab chiếm một không gian bằng nhau
    alignItems: 'center', // Căn giữa nội dung của mỗi tab
    justifyContent: 'center', // Căn giữa theo chiều dọc
    padding: 10,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35, // Tạo nền hình tròn
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Màu nền mặc định khi chưa active
    borderWidth: 2,
    borderColor: '#ddd', // Viền mờ cho nền tròn
  },
  iconContaineractive: {
    width: 70,
    height: 70,
    borderRadius: 35, // Tạo nền hình tròn
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3BD131', // Màu nền mặc định khi chưa active
    borderWidth: 2,
    borderColor: '#ddd', // Viền mờ cho nền tròn
  },
  tabIcon: {
    width: 40,
    height: 40,
  },
  activeIcon: {
    tintColor: 'white', // Màu icon thay đổi khi active
  },
  orderList: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    elevation: 2,
  },
  orderText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    width: '90%',
    height: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OrderScreen;
