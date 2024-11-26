import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [matkhau, setMK] = useState(null);

  // Hàm để lắng nghe dữ liệu người dùng
  const listenToUserDoc = (uid) => {
    const userDocRef = firebase.firestore().collection('NguoiDung').doc(uid);

    // Sử dụng onSnapshot để lắng nghe document người dùng
    const unsubscribeDoc = userDocRef.onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const userData = docSnapshot.data();
          const updatedUser = {
            uid: uid,
            email: firebase.auth().currentUser.email,
            hoTen: userData.hoTen || "",
            createdAt: userData.createdAt || "",
            hinh: userData.hinh || "",
            maVaiTro: userData.maVaiTro || "",
            diaChi: userData.diaChi || "",
            soDienThoai: userData.soDienThoai || "",
            mk: "" // Thêm thuộc tính mk vào user
          };

          setUser(updatedUser);

          // Lưu vào AsyncStorage để duy trì trạng thái
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          setUser(null);
          AsyncStorage.removeItem('user'); // Xóa thông tin nếu không tìm thấy document
        }
      },
      (error) => {
        console.error("Error fetching user data: ", error);
        setUser(null);
      }
    );

    return unsubscribeDoc;
  };

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Nếu có lưu trữ người dùng, set user vào state
      }
    };

    checkUser();

    // Lắng nghe thay đổi trạng thái đăng nhập
    const unsubscribeAuth = firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const unsubscribeDoc = listenToUserDoc(currentUser.uid);

        // Trả về unsubscribe khi người dùng thay đổi hoặc component bị unmount
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        AsyncStorage.removeItem('user'); // Xóa thông tin người dùng khỏi AsyncStorage khi đăng xuất
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, matkhau, setMK }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
