import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          // Truy xuất thông tin bổ sung từ Firestore
          const userDoc = await firebase.firestore().collection('NguoiDung').doc(currentUser.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data(); // Lấy dữ liệu từ Firestore

            // Kết hợp dữ liệu từ Auth và Firestore
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              hoTen: userData.hoTen || "",
              createdAt: userData.createdAt || "",
              hinh: userData.hinh || "",
              maVaiTro: userData.maVaiTro || "",
              soDienThoai: userData.soDienThoai || "",
            });
          } else {
            console.error("No document found for user with uid: ", currentUser.uid);
            setUser(null); // Nếu không tìm thấy tài liệu
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      } else {
        setUser(null); // Không có người dùng đăng nhập
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
