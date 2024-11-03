// authorService.js
import firestore from '@react-native-firebase/firestore';

// Hàm lấy tất cả tác giả từ collection 'TacGia'
export const getAllAuthors = async () => {
  try {
    const snapshot = await firestore().collection('TacGia').get();
    const authors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return authors;
  } catch (error) {
    console.error('Lỗi khi lấy tất cả tác giả:', error);
    throw error;
  }
};
