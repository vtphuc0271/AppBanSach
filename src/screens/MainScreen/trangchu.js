import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import {UserContext} from '../../context/UserContext';
import {useNavigation} from '@react-navigation/native';
import NotificationCard from '../../components/NotificationCard';
const TrangChuScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [sortItem, setsortItem] = useState(null);
  const [filterItem, setFilterItem] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showAllPublishers, setShowAllPublishers] = useState(false);
  const [sortOption, setSortOption] = useState(null);
  const [tacGia, setAuthors] = useState([]);
  const [theLoai, setGenres] = useState([]);
  const [nhaXuatBan, setPublishers] = useState([]);
  const {user} = useContext(UserContext);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  //console.log('day la user: ', user);
  const [data, setData] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);

  console.log('day la user: ', user);

  const toggleFilter = () => {
    setFilterItem(!filterItem);
    if (sortItem == true) {
      setsortItem(!sortItem);
    }
  };

  //ham danh gia
  const canReviewBook = async (userId, bookId) => {
    try {
      const snapshot = await firestore()
        .collection('DaMua')
        .doc(userId)
        .collection('SachDaMua')
        .doc(bookId)
        .get();
      return snapshot.exists;
    } catch (error) {
      console.error('Error checking if book is purchased: ', error);
      return false;
    }
  };

  const renderReviewButton = (item) => {
    const isPurchased = purchasedBooks.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.buttonReviewNow}
        onPress={() => isPurchased ? navigation.navigate('RatingDoScreen', { bookId: item.id }) : alert('Bạn cần mua sách để đánh giá')}>
        <Text style={styles.buttonText}>Đánh giá ngay</Text>
        <Image source={require('../../assets/Message.png')} style={styles.icon} />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const checkPurchasedBooks = async () => {
      const purchased = [];
      for (const book of data) {
        const isPurchased = await canReviewBook(user?.uid, book.id);
        if (isPurchased) {
          purchased.push(book.id);
        }
      }
      setPurchasedBooks(purchased);
    };
    checkPurchasedBooks();
  }, [data]);

  //ham danh gia

  const toggleSort = () => {
    setsortItem(!sortItem);
    if (filterItem) {
      setFilterItem(!filterItem);
    }
  };

  const filteredBooks = data.filter(book =>
    book.tenSach?.toLowerCase().includes(searchText?.toLowerCase() || ''),
  );

  const sortData = () => {
    const sortedData = [...data];

    if (!sortOption) return;

    switch (sortOption) {
      case 'priceAsc':
        sortedData.sort((a, b) => a.giaTien - b.giaTien);
        break;
      case 'priceDesc':
        sortedData.sort((a, b) => b.giaTien - a.giaTien);
        break;
      case 'titleAsc':
        sortedData.sort((a, b) => a.tenSach.localeCompare(b.tenSach));
        break;
      case 'ratingHigh':
        sortedData.sort((a, b) => b.rating - a.rating);
        break;
      case 'ratingLow':
        sortedData.sort((a, b) => a.rating - b.rating);
        break;
      case 'popular':
        sortedData.sort((a, b) => b.votes - a.votes);
        break;
      default:
        break;
    }
    setData(sortedData);
  };

  const handleSortOption = option => {
    if (sortOption === option) return;
    setSortOption(option);
    sortData();
  };

  useEffect(() => {
    sortData();
  }, [sortOption]);




  const getAuthorNameById = authorId => {
    const author = tacGia.find(a => a.id === authorId);
    return author ? author.name : 'Unknown Author';
  };

  const getTheLoaiNameById = theLoaiId => {
    const tl = theLoai.find(t => t.id === theLoaiId);
    return tl ? tl.name : 'Unknown theLoai';
  };

  const getNXBNameById = nxbId => {
    const nxb = nhaXuatBan.find(n => n.id === nxbId);
    return nxb ? nxb.name : 'Unknown Author';
  };

  useEffect(() => {
    const unsubscribeAuthors = firestore()
      .collection('TacGia')
      .onSnapshot(
        snapshot => {
          const authorList = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setAuthors(authorList);
        },
        error => {
          console.error('Error fetching authors: ', error);
        },
      );

    const unsubscribeGenres = firestore()
      .collection('TheLoai')
      .onSnapshot(
        snapshot => {
          const genreList = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().tenTheLoai,
          }));
          setGenres(genreList);
        },
        error => {
          console.error('Error fetching genres: ', error);
        },
      );

    const unsubscribePublishers = firestore()
      .collection('NhaXuatBan')
      .onSnapshot(
        snapshot => {
          const publisherList = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setPublishers(publisherList);
        },
        error => {
          console.error('Error fetching publishers: ', error);
        },
      );

    const unsubscribeBooks = firestore()
      .collection('Sach')
      .onSnapshot(
        snapshot => {
          const bookList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(bookList);
        },
        error => {
          console.error('Error fetching books: ', error);
        },
      );

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribeAuthors();
      unsubscribeGenres();
      unsubscribePublishers();
      unsubscribeBooks();
    };
  }, []);

  const addToCart = async (idSach,giaMua, soLuong = 1) => {
    try {
      if (!user?.uid) {
        setNotificationType('error');
        setNotificationMessage('Bạn cần đăng nhập để đặt hàng');
        setShowNotification(true);
        return;
      }
  
      // Lấy reference tới collection 'Items' của người dùng trong giỏ hàng
      const gioHangRef = firestore()
        .collection('GioHang')
        .doc(user.uid)
        .collection('Items')
        .doc(idSach); // Document cho từng sản phẩm
  
      // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
      const docSnapshot = await gioHangRef.get();
  
      if (!docSnapshot.exists) {
        // Nếu sản phẩm chưa có trong giỏ, thêm mới với số lượng ban đầu
        const initialData = {
          soLuong: parseInt(soLuong),
          giaMua: giaMua,
        };
        await gioHangRef.set(initialData);
        console.log('Sản phẩm đã được thêm vào giỏ hàng.');
      } else {
        // Nếu sản phẩm đã tồn tại trong giỏ, cập nhật số lượng
        const currentData = docSnapshot.data();
        const newQuantity = currentData.soLuong + parseInt(soLuong);
  
        // Cập nhật lại số lượng sản phẩm trong giỏ
        await gioHangRef.update({
          soLuong: newQuantity,
        });
        console.log('Số lượng sản phẩm đã được cập nhật.');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error.message);
    }
  };
  

  // Hàm điều hướng khi người dùng nhấn "Mua ngay"
  const handleBuyNow = id_Sach => {
    if (!user?.uid) {
      setNotificationType('error');
      setNotificationMessage('Bạn cần đăng nhập để đặt hàng');
      setShowNotification(true);
      return;
    } else {
      navigation.navigate('PaymentScreen', {id_Sach: id_Sach});
    }
  };

  const displayLimitedData = (data, limit) => {
    return data.slice(0, limit);
  };

  const toggleExpand = itemId => {
    setExpandedItem(prevState => (prevState === itemId ? null : itemId));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= Math.floor(rating)
              ? require('../../assets/fullStar.png') // Sao đầy
              : i - 1 < rating
                ? require('../../assets/halfStar.png') // Sao nửa
                : require('../../assets/emptyStar.png') // Sao rỗng
          }
          style={styles.star}
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: expandedItem === item.id ? '#98EE8A' : '#EFFFD6' }]}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.row}>
          <View style={styles.imageContainer}>
            {item.anhSach ? (
              <Image source={{ uri: item.anhSach }} style={styles.categoryImage} />
            ) : (
              <Image
                source={require('../../assets/default.png')}
                style={styles.categoryImage}
              />
            )}
          </View>
          <View style={styles.infoContainer}>
            <View style={{ marginLeft: 15, padding: 0 }}>
              <Text style={[styles.title, { maxWidth: 250, flexWrap: 'wrap' }]}>{item.tenSach}</Text>
              <Text style={[styles.text, { maxWidth: 250, flexWrap: 'wrap' }]}>{getAuthorNameById(item.tacGia)}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starContainer}>{renderStars(item.soSaoTrungBinh)}</View>
                <Text style={styles.votes}>
                  ({item.soLuotDanhGia ? item.soLuotDanhGia : 0} lượt đánh giá)
                </Text>
              </View>
              <Text style={styles.giaTien}>
                {item.giaTien
                  ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.giaTien)
                  : '0 VNĐ'}
              </Text>
            </View>
            {expandedItem !== item.id && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonAddToCart}
                  onPress={() => addToCart(item.id,item.giaTien)}>
                  <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                  <Image
                    source={require('../../assets/themvaogio.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonBuyNow}
                  onPress={() => handleBuyNow(item.id)}>
                  <Text style={styles.buttonText}>Mua ngay</Text>
                  <Image
                    source={require('../../assets/muangay.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {expandedItem === item.id && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.detailsContainer} onPress={() => toggleExpand(item.id)}>
            <Text>Thể loại: {getTheLoaiNameById(item.theLoai)}</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text>Phần: {'item.part'}</Text>
                <Text>In lần thứ: {'item.edition'}</Text>
              </View>
              <View style={styles.column}>
                <Text>Năm xuất bản: {item.namXuatBan}</Text>
                <Text>Ngôn ngữ: {'item.language'}</Text>
              </View>
            </View>
            <Text>Đơn vị liên kết: {getNXBNameById(item.nhaXuatBan)}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
        </>
      )}
      {expandedItem === item.id && (
        <View>
          <View style={{ alignItems: 'center', paddingBottom: 10 }}>
            {renderReviewButton(item)}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonReview}
              onPress={() => navigation.navigate('RatingScreen', { bookId: item.id })}>
              <Text style={styles.buttonText}>Xem Đánh giá</Text>
              <Image source={require('../../assets/Message.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonAddToCart}>
              <Text style={styles.buttonText}>Thêm giỏ</Text>
              <Image source={require('../../assets/themvaogio.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonBuyNow}>
              <Text style={styles.buttonText}>Mua ngay</Text>
              <Image source={require('../../assets/muangay.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );


  const renderSortOption = (option, label) => {
    return (
      <TouchableOpacity
        style={[
          styles.sortOption,
          sortOption === option
            ? { backgroundColor: '#4CAF50' }
            : { backgroundColor: '#fff' }, // Bôi đen tùy chọn đã chọn
        ]}
        onPress={() => handleSortOption(option)}
        disabled={sortOption === option} // Disable lựa chọn đã chọn
      >
        <Text style={{ color: sortOption === option ? '#fff' : '#000' }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Trang chủ'} />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={toggleSort}>
          <Image
            source={require('../../assets/SapXep.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Image
            source={require('../../assets/BoLoc.png')}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      {sortItem && (
        <View style={styles.sortOptionsContainer}>
          {renderSortOption('priceAsc', 'Theo giá tăng dần')}
          {renderSortOption('priceDesc', 'Theo giá giảm dần')}
          {renderSortOption('titleAsc', 'Sắp xếp A-Z')}
          {renderSortOption('ratingHigh', 'Đánh giá cao')}
          {renderSortOption('ratingLow', 'Đánh giá thấp')}
          {renderSortOption('popular', 'Thịnh hành')}
        </View>
      )}
      {filterItem && (
        <ScrollView
          style={styles.filterContainer}
          contentContainerStyle={{ paddingBottom: 50 }}>
          {/* Thể loại */}
          <Text style={styles.sectionTitle}>Thể loại</Text>
          <View style={styles.tagContainer}>
            {displayLimitedData(
              theLoai,
              showAllCategories ? theLoai.length : 6,
            ).map((theLoai, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text>{theLoai}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowAllCategories(!showAllCategories)}>
            <Text style={styles.showMoreText}>
              {showAllCategories ? 'ẩn...' : 'Tất cả...'}
            </Text>
          </TouchableOpacity>

          {/* Tác Giả */}
          <Text style={styles.sectionTitle}>Tác Giả</Text>
          <View style={styles.tagContainer}>
            {displayLimitedData(tacGia, showAllAuthors ? tacGia.length : 6).map(
              (tacGia, index) => (
                <TouchableOpacity key={index} style={styles.tag}>
                  <Text>{tacGia.name}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <TouchableOpacity onPress={() => setShowAllAuthors(!showAllAuthors)}>
            <Text style={styles.showMoreText}>
              {showAllAuthors ? 'Ẩn...' : 'Tất cả...'}
            </Text>
          </TouchableOpacity>

          {/* Nhà Xuất Bản */}
          <Text style={styles.sectionTitle}>Nhà Xuất Bản</Text>
          <View style={styles.tagContainer}>
            {displayLimitedData(
              nhaXuatBan,
              showAllPublishers ? nhaXuatBan.length : 6,
            ).map((nhaXuatBan, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text>{nhaXuatBan}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowAllPublishers(!showAllPublishers)}>
            <Text style={styles.showMoreText}>
              {showAllPublishers ? 'ẩn...' : 'Tất cả...'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      <FlatList
        data={filteredBooks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      {showNotification && (
        <TouchableOpacity
          onPress={() => {
            setShowNotification(false);
          }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFFD6',
  },
  filterButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#BACA77',
    padding: 20,
    borderRadius: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 4,
  },
  showMoreText: {
    color: 'blue',
    marginTop: 5,
    textAlign: 'right',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: '#fff',
  },
  sortOptionsContainer: {
    width: 230,
    backgroundColor: '#BACA77',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    left: 120,
  },
  sortOption: {
    paddingVertical: 3,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderColor: '#B2B2B2',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  imageContainer: {
    height: 128,
    width: 105,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  categoryImage: {
    borderRadius: 5,
    marginTop: 8,
    marginRight: 3,
    width: 100,
    height: 120,
    resizeMode: 'stretch',
  },
  infoContainer: {
    marginLeft: 10,
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    color: 'orange',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 10,
    borderRadius: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    width: 20,
    height: 20,
    fontSize: 14,
    marginRight: 2,
  },
  votes: {
    marginLeft: 5,
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonAddToCart: {
    flexDirection: 'row',
    backgroundColor: '#F98C3D',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 6,
    borderColor: '#B2B2B2',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonBuyNow: {
    flexDirection: 'row',
    backgroundColor: '#B652CF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    borderColor: '#B2B2B2',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonReview: {
    flexDirection: 'row',
    backgroundColor: '#0063AB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    borderColor: '#B2B2B2',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonReviewNow: {
    width: '40%',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#09750d',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    borderColor: '#B2B2B2',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  searchButton: {
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 5,
  },
  searchIcon: {
    width: 30,
    height: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  icon: {
    marginLeft: 8,
    width: 20,
    height: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#A07B7B',
    width: '75%',
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default TrangChuScreen;
