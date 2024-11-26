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
  getDonHangBiHuyData,
  getDonHangThanhCong,
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

  //console.log('orders', orders);
  //console.log('selectedOrder', selectedOrder);
  //console.log('chitietOrders', chitietOrders);
  //console.log('donHangShiperWithUsers', donHangShiperWithUsers);
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
            // Không cần kết hợp với donHangShiperWithUsers nữa
            setOrders(donHangList);
            setIsLoading(false);
          },
          error => {
            setOrders([]);
            setIsLoading(false);
          },
        );
      } else if (selectedTab == 4) {
        unsubscribe = getDonHangBiHuyData(
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
        unsubscribe = getDonHangThanhCong(
          donHangList => {
            // Không cần kết hợp với donHangShiperWithUsers nữa
            setOrders(donHangList);
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
    setOrders([]); // Reset orders
    fetchOrders();
    // Cleanup unsubscribe khi component unmount hoặc tab thay đổi
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [selectedTab]);

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

  const fetchChiTietDonHangBiHuy = async orderId => {
    try {
      const chiTietDonHangRef = firestore()
        .collection('ChiTietDonHangBiXoa')
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

      case 'shipperNotPicked': // Shipper chưa nhận
      case 'shipperNotBring': // Shipper chưa mang
      case 'shipperOnTheWay': // Shipper đang trên đường
      case 'returnToWarehouse': // Trả lại kho
      case 'failedDelivery': // Thất bại
      case 'successfulDelivery': // Thành công
        sortedData.sort((a, b) => {
          // Lấy tinhTrangDonHangShiper từ donHangShiperWithUsers dựa vào id đơn hàng
          const aShipperStatus = donHangShiperWithUsers.find(
            item => item.id === a.id,
          )?.tinhTrangDonHangShiper;
          const bShipperStatus = donHangShiperWithUsers.find(
            item => item.id === b.id,
          )?.tinhTrangDonHangShiper;

          // Sắp xếp theo tình trạng shipper
          switch (sortOption) {
            case 'shipperNotPicked':
              return (
                (bShipperStatus === undefined) - (aShipperStatus === undefined)
              );
            case 'shipperNotBring':
              return (bShipperStatus === 0) - (aShipperStatus === 0);
            case 'shipperOnTheWay':
              return (bShipperStatus === 2) - (aShipperStatus === 2);
            case 'returnToWarehouse':
              return (bShipperStatus === 3) - (aShipperStatus === 3);
            case 'failedDelivery':
              return (bShipperStatus === -1) - (aShipperStatus === -1);
            case 'successfulDelivery':
              return (bShipperStatus === 4) - (aShipperStatus === 4);
            default:
              return 0;
          }
        });
        break;
      default:
        break;
    }
    setOrders(sortedData);
  };

  const filteredOrders = orders.filter(
    order => order.id.toLowerCase().includes(searchText.toLowerCase()), // Tìm kiếm không phân biệt chữ hoa chữ thường
  );

  useEffect(() => {
    sortedOrders();
  }, [sortOption]);

  const deleteDonHangShiperDocument = async (shipperId, donHangId) => {
    try {
      const documentRef = firestore()
        .collection('NguoiDung')
        .doc(shipperId)
        .collection('DonHangShiper')
        .doc(donHangId);

      // Xóa document
      await documentRef.delete();
      console.log(`Đã xóa document DonHangShiper: ${donHangId}`);
    } catch (error) {
      console.error('Lỗi khi xóa document:', error);
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

  const handleUpdateDonHang = async (shipperId, id) => {
    try {
      const donHangRef = firestore().collection('DonHang').doc(id);
      const donHangShiperRef = firestore()
        .collection('NguoiDung')
        .doc(shipperId)
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
  
      // Kiểm tra xem đã có `ngayThanhToan` trong DonHang chưa
      if (!donHangData.ngayThanhToan) {
        // Nếu chưa có `ngayThanhToan`, thêm giá trị mới
        await donHangRef.update({
          tinhTrangDonHang: 3,
          tinhTrangThanhToan: 1,
          ngayThanhToan: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        console.log('Đã có ngày thanh toán, không cần cập nhật.');
      }
  
      // Thêm đơn hàng đã cập nhật vào `DonHangThanhCong`
      const donHangThanhCongRef = firestore().collection('DonHangThanhCong').doc(id);
      await donHangThanhCongRef.set({
        ...donHangData,
        tinhTrangDonHang: 3,
        tinhTrangThanhToan: 1,
        ngayThanhToan: donHangData.ngayThanhToan || firestore.FieldValue.serverTimestamp(),
      });
  
      // Xử lý subcollection `ChiTietDonHang`
      const chiTietSnapshot = await firestore()
        .collection('ChiTietDonHang')
        .doc(id)
        .collection('Items')
        .get();
  
      if (!chiTietSnapshot.empty) {
        const batch = firestore().batch();
  
        const daMuaRef = firestore().collection('DaMua').doc(donHangData.id_NguoiDung);
  
        chiTietSnapshot.forEach((doc) => {
          const chiTietData = doc.data();
  
          // Thêm vào `ChiTietDonHangThanhCong`
          const chiTietThanhCongRef = firestore()
            .collection('ChiTietDonHangThanhCong')
            .doc(id)
            .collection('Items')
            .doc(doc.id);
  
          batch.set(chiTietThanhCongRef, chiTietData);
  
          // Thêm vào `SachDaMua` trong `DaMua` với `ngayMua` là `ngayTao` của `DonHang`
          const sachDaMuaRef = daMuaRef.collection('SachDaMua').doc(doc.id);
          batch.set(sachDaMuaRef, {
            ngayMua: donHangData.ngayTao || null, // Sử dụng ngayTao từ DonHang
          });
  
          // Xóa tài liệu khỏi `ChiTietDonHang`
          batch.delete(doc.ref);
        });
  
        // Commit batch
        await batch.commit();
      }
  
      // Xóa đơn hàng khỏi `DonHang`
      await donHangRef.delete();
  
      // Thêm đơn hàng đã xóa từ `DonHangShiper` vào `DonHangShiperDaGiao`
      const donHangShiperDaGiaoRef = firestore()
        .collection('NguoiDung')
        .doc(shipperId)
        .collection('DonHangShiperDaGiao')
        .doc(id);
      await donHangShiperDaGiaoRef.set(donHangShiperData);
  
      // Xóa đơn hàng khỏi `DonHangShiper`
      await donHangShiperRef.delete();
  
      console.log(`Hoàn tất xử lý đơn hàng và chi tiết đơn hàng với ID ${id}`);
    } catch (error) {
      console.error('Lỗi khi xử lý đơn hàng:', error);
    }
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
        } else if (selectedTab === 4) {
          fetchChiTietDonHangBiHuy(item.id);
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

      {item.deletedAt ? (
        <View style={styles.row}>
          <Text style={styles.title}>Ngày bị hủy: </Text>
          <View style={styles.lineContainer}>
            <Text style={styles.line}></Text>
            <Text style={styles.content}>{formatDate(item.deletedAt)}</Text>
          </View>
        </View>
      ) : null}

      {donHangShiperWithUsers?.find(shipper => shipper.id === item.id)
        ?.tinhTrangDonHangShiper === -1 ? (
        <View style={styles.row}>
          <Text style={styles.title}>Lý do: </Text>
          <View style={styles.lineContainer}>
            <Text style={styles.line}></Text>
            <Text style={styles.content}>Đơn hàng giao không thành công</Text>
          </View>
        </View>
      ) : null}

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
                deleteDonHang(item.id);
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
              // Kiểm tra trạng thái của `tinhTrangDonHangShiper` từ donHangShiperWithUsers
              ![0, -1, 3, 4].includes(
                donHangShiperWithUsers?.find(shipper => shipper.id === item.id)
                  ?.tinhTrangDonHangShiper,
              ) && styles.disabledButton,
              // Thêm style tùy thuộc vào trạng thái tinhTrangDonHangShiper
              (() => {
                const shipperData = donHangShiperWithUsers?.find(
                  shipper => shipper.id === item.id,
                );
                if (!shipperData) return null;

                switch (shipperData.tinhTrangDonHangShiper) {
                  case 0:
                    return styles.giaoChoShiper;
                  case -1:
                    return styles.huyDon;
                  case 1:
                    return styles.dangLayHang;
                  case 2:
                    return styles.dangGiao;
                  case 4:
                    return styles.xacNhanHoanThanh;
                  default:
                    return null;
                }
              })(),
            ]}
            disabled={
              ![0, -1, 3, 4].includes(
                donHangShiperWithUsers?.find(shipper => shipper.id === item.id)
                  ?.tinhTrangDonHangShiper,
              )
            }
            onPress={() => {
              const shipperData = donHangShiperWithUsers?.find(
                shipper => shipper.id === item.id,
              );
              const tinhTrangShiper = shipperData
                ? shipperData.tinhTrangDonHangShiper
                : item.tinhTrangDonHangShiper;

              switch (tinhTrangShiper) {
                case 0:
                  approveOrderShipper(shipperData.parentId, item.id, 1); // Sử dụng shipperid từ shipperData
                  break;
                case -1:
                  deleteDonHangShiperDocument(shipperData.parentId, item.id); // Sử dụng shipperid từ shipperData
                  deleteDonHang(item.id);
                  break;
                case 3:
                  deleteDonHangShiperDocument(shipperData.parentId, item.id); // Sử dụng shipperid từ shipperData
                  break;
                case 4:
                  handleUpdateDonHang(shipperData.parentId, item.id); // Sử dụng shipperid từ shipperData
                  break;
                default:
                  break;
              }
            }}>
            <Text style={styles.buttonText}>
              {/* Kiểm tra nếu không có shipper, hiển thị 'Chưa có shipper nhận' */}
              {donHangShiperWithUsers?.find(
                shipper => shipper.id === item.id,
              ) === undefined
                ? 'Chưa có shipper nhận'
                : (() => {
                    const shipperData = donHangShiperWithUsers?.find(
                      shipper => shipper.id === item.id,
                    );
                    if (!shipperData) return 'Chưa có shipper nhận';
                    switch (shipperData.tinhTrangDonHangShiper) {
                      case 0:
                        return 'Giao cho shipper';
                      case 1:
                        return 'Chờ shipper lấy hàng';
                      case 2:
                        return 'Shipper đang giao';
                      case 4:
                        return 'Xác nhận hoàn thành';
                      default:
                        return 'Xác nhận nhận hàng';
                    }
                  })()}
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
              {renderSortOption('returnToWarehouse', 'Đơn hoàn kho')}
              {renderSortOption('failedDelivery', 'Đơn giao không thành công')}
              {renderSortOption('successfulDelivery', 'Đơn giao thành công')}
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
                  {selectedOrder.deletedAt ? (
                    <View style={styles.row}>
                      <Text style={styles.title}>Ngày bị hủy: </Text>
                      <View style={styles.lineContainer}>
                        <Text style={styles.line}></Text>
                        <Text style={styles.content}>
                          {formatDate(selectedOrder.deletedAt)}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  {donHangShiperWithUsers?.find(
                    shipper => shipper.id === selectedOrder.id,
                  )?.tinhTrangDonHangShiper === -1 ? (
                    <View style={styles.row}>
                      <Text style={styles.title}>Tên Shiper: </Text>
                      <View style={styles.lineContainer}>
                        <Text style={styles.line}></Text>
                        <Text style={styles.content}>
                          Đơn hàng giao không thành công
                        </Text>
                      </View>
                    </View>
                  ) : null}
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
    backgroundColor: '#f5f5f5',
  },
  giaoChoShiper: {
    backgroundColor: 'green',
  },
  huyDon: {
    backgroundColor: 'red',
  },
  dangLayHang: {
    backgroundColor: 'orange',
  },
  dangGiao: {
    backgroundColor: 'blue',
  },
  xacNhanHoanThanh: {
    backgroundColor: 'purple',
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
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    width: '94%',
    height: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  modalTitle2: {
    fontSize: 14,
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
    position: 'absolute',
    top: -190,
    right: 1,
    padding: 5,
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
