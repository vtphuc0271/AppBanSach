import firestore from '@react-native-firebase/firestore';

// Lấy toàn bộ giỏ hàng của người dùng
export const getUserCart = async id_NguoiDung => {
  try {
    // Truy vấn đến collection 'items' trong document của người dùng
    const snapshot = await firestore()
      .collection('GioHang')
      .doc(id_NguoiDung)
      .collection('Items')
      .get();

    // Lấy thông tin các sản phẩm trong giỏ hàng
    const cartItems = snapshot.docs.map(doc => {
      const data = doc.data();
      return {// ID của sản phẩm trong subcollection 'items'
        id_Sach: doc.id, // ID của sách
        soLuong: data.soLuong || 1, // Số lượng sản phẩm (mặc định là 1 nếu không có)
      };
    });

    return cartItems;
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error); // Log lỗi nếu có
    return [];
  }
};



// Hàm cập nhật số lượng sản phẩm (tăng hoặc giảm)
export const updateCartQuantity = async (userId, itemId, action) => {
  const cartRef = firestore()
    .collection('GioHang')
    .doc(userId)
    .collection('Items')
    .doc(itemId);

  try {
    const cartDoc = await cartRef.get();
    if (cartDoc.exists) {
      let currentQuantity = parseInt(cartDoc.data().soLuong, 10);
      const newQuantity =
        action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;

      if (newQuantity > 0) {
        await cartRef.update({ soLuong: newQuantity.toString() });
      } else {
        await cartRef.delete(); // Xóa sản phẩm nếu số lượng <= 0
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
    .doc(userId)
    .collection('Items')
    .doc(itemId);

  try {
    await cartRef.delete();
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
  }
};