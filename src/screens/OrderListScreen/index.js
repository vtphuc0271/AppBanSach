import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import NavbarCard from '../../components/NavbarCard';
import {
  getDonHangData,
  confirmPayment,
  approveOrder,
  orderNotEnough,
} from '../../services/orderService';
import firestore from '@react-native-firebase/firestore';
import {getBookById} from '../../services/bookService';

// Các mục chính
const TABS = [
  {id: 0, title: 'Đang duyệt'},
  {id: 1, title: 'Đóng gói'},
  {id: 2, title: 'Đang giao'},
  {id: 3, title: 'Hoàn thành'},
  {id: 4, title: 'Đã hủy'},
];

const OrderListScreen = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [chitietOrders, setChitietOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [donHangShiperWithUsers, setDonHangShiperWithUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortItem, setsortItem] = useState(null);
  const [sortOption, setSortOption] = useState(null);

  console.log('orders', orders);
  //console.log('selectedOrder', selectedOrder);
  //console.log('chitietOrders', chitietOrders);
  //console.log('donHangShiperWithUsers', donHangShiperWithUsers);
  useEffect(() => {
    let unsubscribe;
    setDonHangShiperWithUsers([]);
    if (selectedTab == 2) {
      unsubscribe = listenToDonHangShiperWithUsers();
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [selectedTab]);

  useEffect(() => {
    let unsubscribe;

    const fetchOrders = () => {
      setIsLoading(true);
      if (selectedTab == 0 || selectedTab == 1) {
        unsubscribe = getDonHangData(
          selectedTab,
          donHangList => {
            setOrders(donHangList);
            setIsLoading(false);
          },
          error => {
            setOrders([]);
            setIsLoading(false);
          },
        );
      } else if (selectedTab == 2) {
        unsubscribe = getDonHangData(
          selectedTab,
          donHangList => {
            // Kết hợp dữ liệu từ donHangShiperWithUsers
            const combinedData = donHangList.map(order => {
              const shipperData = donHangShiperWithUsers.find(
                shipper => shipper.id === order.id,
              );
              return {
                ...order,
                shipperid: shipperData?.parentId || '',
                shipperName: shipperData?.userName || 'Chưa có Shiper nhận',
                shipperPhone:
                  shipperData?.userPhone || 'Không có số điện thoại',
                tinhTrangDonHangShiper: shipperData?.tinhTrangDonHangShiper,
              };
            });

            setOrders(combinedData);
            setIsLoading(false);
          },
          error => {
            setOrders([]);
            setIsLoading(false);
          },
        );
      }

      // Gọi hàm getDonHangData từ orderlistservice
    };
    setOrders([]);
    fetchOrders();
    // Cleanup unsubscribe khi component unmount hoặc tab thay đổi
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [selectedTab, donHangShiperWithUsers]);

  const listenToDonHangShiperWithUsers = () => {
    try {
      const unsubscribe = firestore()
        .collectionGroup('DonHangShiper')
        .onSnapshot(async snapshot => {
          const donHangShiperData = snapshot.docs.map(doc => ({
            id: doc.id,
            parentId: doc.ref.parent.parent.id,
            ...doc.data(),
          }));

          //console.log('donHangShiperData', donHangShiperData);

          const userIds = [
            ...new Set(donHangShiperData.map(item => item.parentId)),
          ];

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

          const combinedData = donHangShiperData.map(order => {
            const user =
              userData.find(u => u.idShiper === order.parentId) || {};
            return {
              ...order,
              userName: user.hoTenShiper,
              userPhone: user.sdtShiper,
            };
          });
          //console.log('combinedData', combinedData);
          setDonHangShiperWithUsers(combinedData); // Cập nhật state
        });

      return unsubscribe;
    } catch (error) {
      console.error('Lỗi khi lắng nghe dữ liệu:', error);
    }
  };

  const approveOrderShipper = async (shipperId, orderId, orderStatus) => {
    try {
      await firestore()
        .collection('NguoiDung') // Thay thế bằng tên collection của bạn
        .doc(shipperId)
        .collection('DonHangShiper') // Thay thế bằng tên collection của bạn
        .doc(orderId)
        .update({
          tinhTrangDonHangShiper: orderStatus, // Cập nhật trạng thái đơn hàng
        });
      console.log('update tinhTrangDonHangShiper thành công!');
    } catch (error) {
      console.error('Lỗi khi update tinhTrangDonHangShiper:', error);
    }
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

  const formatDate = timestamp => {
    if (timestamp instanceof firestore.Timestamp) {
      return timestamp.toDate().toLocaleString();
    }
    return '';
  };

  const toggleSort = () => {
    setsortItem(!sortItem);
  };

  const renderSortOption = (option, label) => {
    return (
      <TouchableOpacity
        style={[
          styles.sortOption,
          sortOption === option
            ? {backgroundColor: '#4CAF50'}
            : {backgroundColor: '#fff'}, // Bôi đen tùy chọn đã chọn
        ]}
        onPress={() => handleSortOption(option)}
        disabled={sortOption === option} // Disable lựa chọn đã chọn
      >
        <Text style={{color: sortOption === option ? '#fff' : '#000'}}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSortOption = option => {
    if (sortOption === option) return;
    setSortOption(option);
    sortedOrders();
  };

  const sortedOrders = () => {
    const sortedData = [...orders];

    if (!sortOption) return;

    switch (sortOption) {
      case 'dateAsc': // Sắp xếp theo ngày tạo đơn từ cũ nhất
        sortedData.sort((a, b) => a.ngayTao - b.ngayTao);
        break;

      case 'qrNotConfirmed': // Sắp xếp theo đơn hàng chưa xác nhận QR
        sortedData.sort((a, b) => {
          const aIsQRNotConfirmed =
            a.phuongThucThanhToan === 'QR' && a.tinhTrangThanhToan === 0;
          const bIsQRNotConfirmed =
            b.phuongThucThanhToan === 'QR' && b.tinhTrangThanhToan === 0;

          // Đưa đơn chưa xác nhận QR lên đầu
          return bIsQRNotConfirmed - aIsQRNotConfirmed;
        });
        break;

      case 'qrConfirmed': // Sắp xếp theo đơn hàng đã xác nhận QR
        sortedData.sort((a, b) => {
          const aIsQRNotConfirmed =
            a.phuongThucThanhToan === 'QR' && a.tinhTrangThanhToan === 1;
          const bIsQRNotConfirmed =
            b.phuongThucThanhToan === 'QR' && b.tinhTrangThanhToan === 1;

          // Đưa đơn chưa xác nhận QR lên đầu
          return bIsQRNotConfirmed - aIsQRNotConfirmed;
        });
        break;

      case 'cod': // Sắp xếp theo phương thức thanh toán COD
        sortedData.sort((a, b) => (a.phuongThucThanhToan === 'cod' ? -1 : 1));
        break;

      case 'waitingForStock': // Sắp xếp theo tình trạng người dùng chờ đủ hàng (notEnough)
        sortedData.sort((a, b) => {
          const aIsQRNotConfirmed = a.notEnough === 1;
          const bIsQRNotConfirmed = b.phuongThucThanhToan === 1;

          // Đưa đơn chưa xác nhận QR lên đầu
          return bIsQRNotConfirmed - aIsQRNotConfirmed;
        });
        break;

      case 'shipperNotPicked': // Sắp xếp theo Shipper chưa nhận
        sortedData.sort((a, b) => {
          const aShipperNotPicked = a.tinhTrangDonHangShiper === undefined;
          const bShipperNotPicked = b.tinhTrangDonHangShiper === undefined;
          return bShipperNotPicked - aShipperNotPicked;
        });
        break;

      case 'shipperNotBring':
        sortedData.sort((a, b) => {
          const aShipperNotPicked = a.tinhTrangDonHangShiper === 0;
          const bShipperNotPicked = b.tinhTrangDonHangShiper === 0;
          return bShipperNotPicked - aShipperNotPicked;
        });
        break;

      case 'shipperOnTheWay': // Sắp xếp theo Shipper đang giao
        sortedData.sort((a, b) => {
          const aShipperNotPicked = a.tinhTrangDonHangShiper === 2;
          const bShipperNotPicked = b.tinhTrangDonHangShiper === 2;
          return bShipperNotPicked - aShipperNotPicked;
        });
        break;
      default:
        break;
    }
    setOrders(sortedData);
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchText.toLowerCase()) // Tìm kiếm không phân biệt chữ hoa chữ thường
  );

  useEffect(() => {
    sortedOrders();
  }, [sortOption]);

  const renderOrder = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedOrder(item); // Lưu thông tin đơn hàng được chọn
        setIsModalVisible(true);
        fetchChiTietDonHang(item.id); // Hiển thị modal
      }}>
      <View style={styles.row}>
        <Text style={styles.title}>Mã đơn hàng: </Text>
        <View style={styles.lineContainer}>
          <Text style={styles.line}></Text>
          <Text style={styles.content}>{item.id}</Text>
        </View>
      </View>
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
        <Text style={styles.title}>Ngày tạo đơn: </Text>
        <View style={styles.lineContainer}>
          <Text style={styles.line}></Text>
          <Text style={styles.content}>{formatDate(item.ngayTao)}</Text>
        </View>
      </View>
      {item.tinhTrangThanhToan === 1 || item.phuongThucThanhToan === 'QR' ? (
        <View style={styles.row}>
          <Text style={styles.title}>Ngày thanh toán: </Text>
          <View style={styles.lineContainer}>
            <Text style={styles.line}></Text>
            <Text style={styles.content}>{formatDate(item.ngayThanhToan)}</Text>
          </View>
        </View>
      ) : null}
      {item.shipperName && (
        <>
          <View style={styles.row}>
            <Text style={styles.title}>Tên Shiper: </Text>
            <View style={styles.lineContainer}>
              <Text style={styles.line}></Text>
              <Text style={styles.content}>{item.shipperName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>SĐT Shiper: </Text>
            <View style={styles.lineContainer}>
              <Text style={styles.line}></Text>
              <Text style={styles.content}>{item.shipperPhone}</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.actions}>
        {selectedTab === 0 && (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                styles.notEnough,
                item.notEnough !== 0 && styles.disabledButton,
              ]}
              disabled={
                item.notEnough !== 0 ||
                (item.phuongThucThanhToan === 'QR' &&
                  item.tinhTrangThanhToan === 0)
              }
              onPress={() => orderNotEnough(item.id, 1)}>
              <Text style={styles.buttonText}>
                {(item.notEnough === 0 && 'Không đủ hàng') ||
                  (item.notEnough === 1 && 'Chờ xác nhận') ||
                  (item.notEnough === 2 && 'Chờ đủ hàng')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.approve,
                item.notEnough === 1 && styles.disabledButton,
              ]}
              onPress={() => {
                if (
                  item.phuongThucThanhToan === 'QR' &&
                  item.tinhTrangThanhToan === 0
                ) {
                  confirmPayment(item.id);
                } else {
                  approveOrder(item.id, 1);
                }
              }}
              disabled={item.notEnough === 1}>
              <Text style={styles.buttonText}>
                {item.phuongThucThanhToan === 'QR' &&
                item.tinhTrangThanhToan === 0
                  ? 'Duyệt thanh toán'
                  : 'Duyệt đơn'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={() => {
                approveOrder(item.id, 4);
              }}>
              <Text style={styles.buttonText}>Hủy đơn</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedTab === 1 && (
          <TouchableOpacity
            style={[styles.button, styles.approve]}
            onPress={() => approveOrder(item.id, 2)}>
            <Text style={styles.buttonText}>Giao</Text>
          </TouchableOpacity>
        )}
        {selectedTab === 2 && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.complete,
              item.tinhTrangDonHangShiper !== 0 && styles.disabledButton,
            ]}
            disabled={item.tinhTrangDonHangShiper !== 0}
            onPress={() => approveOrderShipper(item.shipperid, item.id, 1)}>
            <Text style={styles.buttonText}>
              {item.tinhTrangDonHangShiper === undefined
                ? 'Chưa có shipper nhận'
                : item.tinhTrangDonHangShiper === 0
                ? 'Giao cho shipper'
                : 'Shipper đang giao'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Quản lý đơn hàng'} iconShop={true} />
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => {
              if (!isLoading) {
                setSelectedTab(tab.id);
              }
            }}
            disabled={isLoading}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={toggleSort}>
          <Image
            source={require('../../assets/SapXep.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {sortItem && (
        <View style={styles.sortOptionsContainer}>
          {selectedTab === 0 && (
            <>
              {renderSortOption('dateAsc', 'Ngày tạo đơn')}
              {renderSortOption('qrNotConfirmed', 'Chưa xác nhận QR')}
              {renderSortOption('qrConfirmed', 'QR')}
              {renderSortOption('cod', 'COD')}
              {renderSortOption('waitingForStock', 'Người dùng chờ đủ hàng')}
            </>
          )}

          {selectedTab === 1 && (
            <>{renderSortOption('dateAsc', 'Ngày tạo đơn')}</>
          )}

          {selectedTab === 2 && (
            <>
              {renderSortOption('shipperNotPicked', 'Shipper chưa nhận')}
              {renderSortOption('shipperNotBring', 'Shipper chưa lấy hàng')}
              {renderSortOption('shipperOnTheWay', 'Shipper đang giao')}
            </>
          )}
        </View>
      )}

      <FlatList
        data={filteredOrders}
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
                  {selectedOrder.shipperName && (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.title}>Tên Shiper: </Text>
                        <View style={styles.lineContainer}>
                          <Text style={styles.line}></Text>
                          <Text style={styles.content}>
                            {selectedOrder.shipperName}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.title}>SĐT Shiper: </Text>
                        <View style={styles.lineContainer}>
                          <Text style={styles.line}></Text>
                          <Text style={styles.content}>
                            {selectedOrder.shipperPhone}
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
                        resizeMode="contain"
                        style={styles.itemImage}
                      />
                      <Text style={styles.itemQuantity}>{item.soLuong}</Text>
                      <Text style={styles.itemPrice}>
                        {Number(item.giaMua * item.soLuong).toLocaleString()}{' '}
                      </Text>
                    </View>
                  )}
                />
              </>
            )}
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}>
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
    backgroundColor: '#f5f5f5',
  },
  sortOption: {
    paddingVertical: 3,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionsContainer: {
    width: 230,
    backgroundColor: '#BACA77',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    left: 120,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  searchButton: {
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 5,
  },
  searchIcon: {
    width: 30,
    height: 30,
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
    width: 60,
    height: 60,
    borderRadius: 8,
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
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    width: '94%',
    height: '80%',
    elevation: 5,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginVertical: 15},
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
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
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
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  notEnough: {
    backgroundColor: '#8B8B8B',
  },
  approve: {
    backgroundColor: '#4CAF50',
  },
  cancel: {
    backgroundColor: '#F44336',
  },
  complete: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default OrderListScreen;
