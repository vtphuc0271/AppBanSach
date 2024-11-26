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

export const getShipperData = (selectedTab, userId, callback, onError) => {
  const unsubscribe = firestore()
    .collection('NguoiDung')
    .where('tinhTrangDonHang', '==', selectedTab)
    .onSnapshot(
      async snapshot => {
        if (snapshot.empty) {
          console.log('Không có đơn hàng nào.');
          callback([]);
          return;
        }

        try {
          // Lấy danh sách dữ liệu từ NguoiDung
          const donHangList = [];

          for (const doc of snapshot.docs) {
            const docData = { id: doc.id, ...doc.data() };

            // Kiểm tra nếu có userId khớp
            if (doc.id === userId) {
              const subcollectionRef = firestore()
                .collection('NguoiDung')
                .doc(doc.id)
                .collection('DonHangShiper');

              // Lấy dữ liệu từ subcollection
              const subSnapshot = await subcollectionRef.get();
              const subData = subSnapshot.docs.map(subDoc => ({
                subId: subDoc.id,
                ...subDoc.data(),
              }));

              // Gắn dữ liệu subcollection vào tài liệu chính
              docData.subcollection = subData;
            }

            donHangList.push(docData);
          }

          callback(donHangList);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu từ subcollection:', error);
          onError(error);
        }
      },
      error => {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
        onError(error);
      }
    );

  return unsubscribe;
};

export const GiveOrder = async (orderId, orderStatus) => {
  try {
    await firestore()
      .collection('DonHang') // Thay thế bằng tên collection của bạn
      .doc(orderId)
      .update({
        tinhTrangDonHang: orderStatus, // Cập nhật trạng thái đơn hàng
      });
    console.log('Nhận đơn thành công!');
  } catch (error) {
    console.error('Lỗi khi nhận đơn:', error);
  }
};


export const getDonHangDataWithUser = (selectedTab, idNguoiDung, callback, onError) => {
  const unsubscribe = firestore()
    .collection('DonHang')
    .where('tinhTrangDonHang', '==', selectedTab)  // Lọc theo trạng thái đơn hàng
    .where('id_NguoiDung', '==', idNguoiDung)  // Lọc theo ID người dùng
    .onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          console.log('Không có đơn hàng nào.');
          callback([]); // Nếu không có đơn hàng thì trả về mảng rỗng
          return;
        }

        const donHangList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(donHangList); // Gửi danh sách đơn hàng về callback
      },
      error => {
        console.error('Lỗi khi lắng nghe dữ liệu:', error);
        onError(error); // Gửi lỗi về callback xử lý lỗi
      }
    );

  return unsubscribe; // Trả về unsubscribe để có thể dọn dẹp sau khi không cần lắng nghe
};

export const getDonHangThanhCongWithUser = (idNguoiDung,callback, onError) => {
  const unsubscribe = firestore()
    .collection('DonHangThanhCong')
    .where('id_NguoiDung', '==', idNguoiDung)
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