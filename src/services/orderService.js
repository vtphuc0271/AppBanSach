import firestore from '@react-native-firebase/firestore';

export const getDonHangData = (selectedTab, callback, onError) => {
  const unsubscribe = firestore()
    .collection('DonHang')
    .where('tinhTrangDonHang', '==', selectedTab)
    .onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          console.log('Không có đơn hàng nào.');
          callback([]);
          return;
        }

        const donHangList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(donHangList);
      },
      error => {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
        onError(error);
      },
    );

  return unsubscribe;
};

export const getDonHangThanhCong = (callback, onError) => {
  const unsubscribe = firestore()
    .collection('DonHangThanhCong')
    .onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          console.log('Không có đơn hàng nào.');
          callback([]);
          return;
        }

        const donHangList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(donHangList);
      },
      error => {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
        onError(error);
      },
    );

  return unsubscribe;
};

export const getDonHangBiHuyData = (callback, onError) => {
  const unsubscribe = firestore()
    .collection('DonHangBiXoa')
    .onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          console.log('Không có đơn hàng nào.');
          callback([]);
          return;
        }

        const donHangList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(donHangList);
      },
      error => {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
        onError(error);
      },
    );

  return unsubscribe;
};

export const confirmPayment = async orderId => {
  try {
    await firestore()
      .collection('DonHang') // Thay bằng collection 'ThanhToan'
      .doc(orderId) // `orderId` là ID của đơn hàng trong collection ThanhToan
      .update({
        tinhTrangThanhToan: 1, // Cập nhật trạng thái thanh toán
      });
    console.log('Cập nhật trạng thái thanh toán thành công!');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
  }
};

export const approveOrder = async (orderId, orderStatus) => {
  try {
    await firestore()
      .collection('DonHang') // Thay thế bằng tên collection của bạn
      .doc(orderId)
      .update({
        tinhTrangDonHang: orderStatus, // Cập nhật trạng thái đơn hàng
      });
    console.log('Duyệt đơn thành công!');
  } catch (error) {
    console.error('Lỗi khi duyệt đơn:', error);
  }
};

export const orderNotEnough = async (orderId, notEnough) => {
  try {
    await firestore()
      .collection('DonHang') // Thay thế bằng tên collection của bạn
      .doc(orderId)
      .update({
        notEnough: notEnough, // Cập nhật trạng thái đơn hàng
      });
    console.log('Duyệt đơn thành công!');
  } catch (error) {
    console.error('Lỗi khi duyệt đơn:', error);
  }
};
