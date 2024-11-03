import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {UserContext} from '../context/UserContext';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import NotificationCard from './NotificationCard';

const NarbarCard = ({ScreenName}) => {
  const navigation = useNavigation();
  const {user} = useContext(UserContext);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const [quanTri, setQuanTri] = useState(false);

  const handleQuanTri = () => {
    setQuanTri(!quanTri);
  };

  const handleHideNotification = () => {
    setShowNotification(false);
  };

  const [slideAnim] = useState(
    new Animated.Value(-Dimensions.get('window').width * 0.75),
  ); // Khởi tạo giá trị trượt từ bên ngoài màn hình

  const toggleMenu = () => {
    if (isMenuVisible) {
      closeMenu();
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Trượt vào màn hình
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width * 0.75, // Trượt ra ngoài màn hình
      duration: 300,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false)); // Đóng menu khi hoàn tất animation
  };

  const handleAuthPress = () => {
    if (user) {
      firebase.auth().signOut();
      setNotificationType('success');
      setNotificationMessage('Bạn đã đăng xuất thành công!');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        closeMenu();
        navigation.navigate('MainScreen');
      }, 1000);
    } else {
      navigation.navigate('LoginScreen');
      closeMenu();
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu}>
        <Image
          source={require('../assets/menuicon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.screenName}>{ScreenName}</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Image
            source={require('../assets/notificationicon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../assets/shopicon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Modal Menu */}
      <Modal visible={isMenuVisible} transparent={true}>
        {/* Click bên ngoài để tắt */}
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Menu Content */}
        <Animated.View
          style={[
            styles.menuContainer,
            {transform: [{translateX: slideAnim}]},
          ]}>
          {/*menu người dùng*/}
          {quanTri === false ? (
            <>
              <TouchableOpacity
                style={styles.buttonMenuContent}
                onPress={() => {
                  navigation.navigate('MainScreen');
                  closeMenu();
                }}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenutrangchu.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Trang chủ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonMenuContent}
                onPress={() => {
                  navigation.navigate('CartScreen');
                  closeMenu();
                }}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/Iconmenugiohang.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Giỏ hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/Iconmenudanhsachdonhang.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Danh sách đơn hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenuthongtincanhan.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Thông tin cá nhân</Text>
              </TouchableOpacity>

              {/* menu shipper/nhân viên */}
              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenudonhang.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Đơn hàng của tôi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenudonhang.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Quản lý kho hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenudanhsachdonhangcangiao.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Đơn hàng cần giao</Text>
              </TouchableOpacity>

              {user && user.maVaiTro === '1' ? (
                <TouchableOpacity
                  style={styles.buttonMenuContent}
                  onPress={() => handleQuanTri()}>
                  <View style={{paddingLeft: 20}}></View>
                  <Image
                    source={require('../assets/iconmenuquantri.png')}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuItem}>Menu Quản trị</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.buttonMenuContent}
                onPress={() => handleQuanTri()}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenutrangchu.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Menu trang chủ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent} onPress={()=>navigation.navigate('bookscreen')}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenusach.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Sách</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent} onPress={()=>navigation.navigate('PublisherManagementScreen')}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenunhaxuatban.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Nhà xuất bản</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenutheloai.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Thể loại</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenutacgia.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Tác giả</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenuquantringuoidung.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Quản trị người dùng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenuquantri.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Phân quyền</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenulichsugiaodich.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Lịch sử giao dịch</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenuquantri.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Thống kê doanh thu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMenuContent}>
                <View style={{paddingLeft: 20}}></View>
                <Image
                  source={require('../assets/iconmenuquantri.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.menuItem}>Quản lý đơn hàng</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.buttonMenuContent}
            onPress={handleAuthPress}>
            <View style={{paddingLeft: 20}} />
            <Image
              source={require('../assets/iconmenuquantri.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.menuItem}>
              {user ? 'Đăng xuất' : 'Đăng ký, đăng nhập'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        {showNotification && (
          <TouchableOpacity
            onPress={handleHideNotification}
            style={[
              {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
            ]}>
            <NotificationCard
              type={notificationType}
              message={notificationMessage}
              dateTime={new Date().toLocaleString()}
            />
          </TouchableOpacity>
        )}
      </Modal>
    </View>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFFFD6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  buttonMenuContent: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000',
    marginBottom: -1,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  screenName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginLeft: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#FFF',
    paddingTop: 10,
    elevation: 5,
    backgroundColor: '#EFFFD6',
    borderRadius: 10,
  },
  menuItem: {
    fontSize: 18,
    color: '#000',
    paddingLeft: 20,
  },
});

export default NarbarCard;