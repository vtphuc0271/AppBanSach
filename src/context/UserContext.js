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
        const userDocRef = firebase.firestore().collection('NguoiDung').doc(currentUser.uid);
        
        // Sử dụng onSnapshot để cập nhật khi document thay đổi
        const unsubscribeDoc = userDocRef.onSnapshot(docSnapshot => {
          if (docSnapshot.exists) {
            const userData = docSnapshot.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              hoTen: userData.hoTen || "",
              createdAt: userData.createdAt || "",
              hinh: userData.hinh || "",
              maVaiTro: userData.maVaiTro || "",
              diaChi: userData.diaChi || "",
              soDienThoai: userData.soDienThoai || "",
            });
          } else {
            setUser(null); // Không có document thì đặt user là null
          }
        }, error => {
          console.error("Error fetching user data: ", error);
        });
  
        // Cleanup khi unmount
        return () => unsubscribeDoc();
      } else {
        setUser(null);
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
