import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Nếu có lưu trữ người dùng, set user vào state
      }
    };

    checkUser(); // Kiểm tra khi component được mount

    const unsubscribe = firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDocRef = firebase.firestore().collection('NguoiDung').doc(currentUser.uid);
        
        // Sử dụng onSnapshot để cập nhật khi document thay đổi
        const unsubscribeDoc = userDocRef.onSnapshot(docSnapshot => {
          if (docSnapshot.exists) {
            const userData = docSnapshot.data();
            const updatedUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              hoTen: userData.hoTen || "",
              createdAt: userData.createdAt || "",
              hinh: userData.hinh || "",
              maVaiTro: userData.maVaiTro || "",
              diaChi: userData.diaChi || "",
              soDienThoai: userData.soDienThoai || "",
            };

            setUser(updatedUser);
            // Lưu trữ lại thông tin người dùng vào AsyncStorage để sử dụng khi app reload
            AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            setUser(null); // Không có document thì đặt user là null
            AsyncStorage.removeItem('user'); // Xóa thông tin người dùng khỏi AsyncStorage nếu không tìm thấy
          }
        }, error => {
          console.error("Error fetching user data: ", error);
        });
  
        // Cleanup khi unmount
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        AsyncStorage.removeItem('user'); // Xóa thông tin người dùng khỏi AsyncStorage khi đăng xuất
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
