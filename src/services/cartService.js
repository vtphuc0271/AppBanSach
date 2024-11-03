import firestore from '@react-native-firebase/firestore';

export const getUserCart = async id_NguoiDung => {
  try {
    const snapshot = await firestore()
      .collection('GioHang')
      .where('id_NguoiDung', '==', id_NguoiDung)
      .get();

    const cartItems = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id_GioHang: doc.id,
        id_NguoiDung: data.id_NguoiDung,
        id_Sach: data.id_Sach,
        soLuong: data.soLuong,
      };
    });
    return cartItems;
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return [];
  }
};

// Hàm cập nhật số lượng sản phẩm (tăng hoặc giảm)
export const updateCartQuantity = async (userId, itemId, action) => {
  const cartRef = firestore().collection('GioHang').doc(itemId);
  try {
    const cartDoc = await cartRef.get();
    if (cartDoc.exists) {
      let currentQuantity = parseInt(cartDoc.data().soLuong, 10);
      const newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;

      if (newQuantity > 0) {
        await cartRef.update({ soLuong: newQuantity.toString() });
      } else {
        await cartRef.delete();
      }
    } else {
      console.error('Không tìm thấy sản phẩm trong giỏ hàng.');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
  }
};


// Hàm xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = async (userId, itemId) => {
    const cartRef = firestore()
      .collection('GioHang')
      .doc(itemId);
  
    try {
      await cartRef.delete();
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    }
  };
  

