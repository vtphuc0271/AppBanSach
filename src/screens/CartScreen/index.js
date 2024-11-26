import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import {UserContext} from '../../context/UserContext';
import {useNavigation} from '@react-navigation/native';
import {
  getUserCart,
  updateCartQuantity,
  removeCartItem,
} from '../../services/cartService';
import {getBookById} from '../../services/bookService';
import {getAllAuthors} from '../../services/authorService';

const CartScreen = () => {
  const {user} = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  //console.log(user);
  // Hàm tính tổng tiền trong giỏ hàng
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.giaMua || 0) * parseInt(item.soLuong || '1', 10),
      0,
    );
  };

  // Tăng số lượng sản phẩm
  const handleIncreaseQuantity = async (userId, itemId) => {
    await updateCartQuantity(userId, itemId, 'increase');
    fetchCartItemsWithDetails();
  };

  // Giảm số lượng sản phẩm
  const handleDecreaseQuantity = async (userId, itemId) => {
    await updateCartQuantity(userId, itemId, 'decrease');
    fetchCartItemsWithDetails();
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (userId, itemId) => {
    setIsLoading(true);
    await removeCartItem(userId, itemId);
    fetchCartItemsWithDetails();
  };

  // Lấy danh sách sản phẩm trong giỏ hàng với chi tiết sách và tác giả
  const fetchCartItemsWithDetails = () => {
    const cartRef = firestore()
      .collection('GioHang')
      .doc(user.uid)
      .collection('Items');

    // Sử dụng listener onSnapshot để cập nhật giỏ hàng theo thời gian thực
    const unsubscribe = cartRef.onSnapshot(async snapshot => {
      try {
        const cartItems = snapshot.docs.map(doc => ({
          id_Sach: doc.id,
          soLuong: doc.data().soLuong || 1,
          giaMua: Number(doc.data().giaMua),
        }));

        const authorsList = await getAllAuthors(); // Lấy danh sách tác giả
        setAuthors(authorsList);

        // Lấy chi tiết sách và kết hợp thông tin giỏ hàng
        const itemsWithDetails = await Promise.all(
          cartItems.map(async cartItem => {
            const bookDetails = await getBookById(cartItem.id_Sach);
            if (bookDetails) {
              const author = authorsList.find(a => a.id === bookDetails.tacGia);
              const giaTien = Number(bookDetails.giaTien) || 0;
              return {
                ...cartItem,
                ...bookDetails,
                tacGia: author ? author.name : 'Tác giả không xác định',
                giaTien: giaTien,
              };
            }
            return null;
          }),
        );

        setCartItems(itemsWithDetails.filter(item => item !== null)); // Cập nhật giỏ hàng
      } catch (error) {
        console.error(
          'Lỗi khi cập nhật giỏ hàng với chi tiết sách và tác giả:',
          error,
        );
      } finally {
        setIsLoading(false); // Tắt trạng thái loading
      }
    });

    // Trả về hàm hủy listener để gọi trong useEffect khi cần
    return unsubscribe;
  };

  //console.log('cartItems', cartItems);
  useEffect(() => {
    if (user && user.uid) {
      setIsLoading(true);
      const unsubscribe = fetchCartItemsWithDetails();
      return () => unsubscribe();
    }
  }, [user]);

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.anhSach}} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.tenSach}</Text>
        <Text>{item.tacGia}</Text>
        <Text style={styles.price}>
          {Number(item.giaMua).toLocaleString()} VNĐ
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(user.uid, item.id_Sach)}
            disabled={isLoading}>
            <Text style={styles.removeText}>Xóa</Text>
          </TouchableOpacity>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityIncrementButton}
              onPress={() => handleDecreaseQuantity(user.uid, item.id_Sach)}
              disabled={isLoading}>
              <Text style={styles.quantityText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.inputQuantity}>{String(item.soLuong)}</Text>

            <TouchableOpacity
              style={styles.quantityDecrementButton}
              onPress={() => handleIncreaseQuantity(user.uid, item.id_Sach)}
              disabled={isLoading}>
              <Text style={styles.quantityText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Giỏ Hàng'} />
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MainScreen')}
            disabled={isLoading}>
            <Text style={styles.continueText}>Tiếp tục mua hàng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
          <View style={styles.footer}>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={[styles.totalText, {color: '#2C863A'}]}>
                Tổng tiền:
              </Text>
              <Text style={[styles.totalText, {paddingLeft: 5}]}>
                {getTotalPrice().toLocaleString()} VNĐ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              disabled={isLoading}
              onPress={() => navigation.navigate('PaymentScreen')}>
              <Text style={styles.checkoutText}>Thanh Toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFFD6',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  votes: {
    marginLeft: 5,
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#12A9EA',
    borderWidth: 2,
  },
  continueText: {
    color: '#12A9EA',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFFFD6',

    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderColor: '#B2B2B2',
    borderWidth: 1,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    color: 'orange',
    fontWeight: 'bold',
  },
  removeButton: {
    flexDirection: 'row',
    backgroundColor: '#EBFF00',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 6,
    borderColor: '#B2B2B2',
    borderWidth: 1,
  },
  removeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityIncrementButton: {
    backgroundColor: '#FF0101',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRightWidth: 2,
    borderColor: '#000',
  },
  quantityDecrementButton: {
    backgroundColor: '#06FF01',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderLeftWidth: 2,
    borderColor: '#000',
  },
  inputQuantity: {
    fontSize: 16,
    textAlign: 'center',
    width: 40,
    paddingVertical: 0,
  },

  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  footer: {
    padding: 15,
    backgroundColor: '#EFFFD6',
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#00C853',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CartScreen;
