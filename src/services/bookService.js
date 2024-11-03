// bookService.js
import firestore from '@react-native-firebase/firestore';

// Hàm lấy chi tiết của một sách theo id
export const getBookById = async (id_Sach) => {
  try {
    const bookDoc = await firestore().collection('Sach').doc(id_Sach).get();
    if (bookDoc.exists) {
      return { id: id_Sach, ...bookDoc.data() };
    }
    return null; // Trả về null nếu không tìm thấy sách
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sách:', error);
    throw error;
  }
};

// Hàm lấy tất cả sách trong collection 'Sach'
export const getAllBooks = async () => {
  try {
    const snapshot = await firestore().collection('Sach').get();
    const books = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return books;
  } catch (error) {
    console.error('Lỗi khi lấy tất cả sách:', error);
    throw error;
  }
};
