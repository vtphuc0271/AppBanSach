import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import {UserContext} from '../../context/UserContext';

const TrangChuScreen = () => {
  const [data, setData] = useState([
    {
      id: '1',
      title: 'Clean code',
      author: 'Robert C. Martin',
      price: 324000,
      rating: 4,
      votes: 211,
      details: {
        part: 1,
        edition: 1,
        printFormat: 'Bìa mềm',
        category: 'Computers - Programming',
        pages: 462,
        dimensions: '16x24 cm',
        published: 2009,
        language: 'English',
        publisher: 'Tri Thức Trẻ Books & NXB Dân Trí',
      },
      image: require('../../assets/cleancode.png'),
    },
    {
      id: '2',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      price: 295000,
      rating: 4.5,
      votes: 178,
      details: {
        part: 1,
        edition: 2,
        printFormat: 'Bìa mềm',
        category: 'Computers - Programming',
        pages: 352,
        dimensions: '15x23 cm',
        published: 2019,
        language: 'English',
        publisher: 'Tri Thức Trẻ Books & NXB Lao Động',
      },
      image: require('../../assets/cleancode.png'),
    },
    {
      id: '3',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      price: 410000,
      rating: 4.3,
      votes: 312,
      details: {
        part: 1,
        edition: 1,
        printFormat: 'Bìa cứng',
        category: 'Computers - Programming',
        pages: 416,
        dimensions: '18x26 cm',
        published: 1994,
        language: 'English',
        publisher: 'Tri Thức Trẻ Books & NXB Khoa Học Kỹ Thuật',
      },
      image: require('../../assets/cleancode.png'),
    },
    {
      id: '4',
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      price: 389000,
      rating: 4.6,
      votes: 256,
      details: {
        part: 1,
        edition: 2,
        printFormat: 'Bìa mềm',
        category: 'Computers - Programming',
        pages: 448,
        dimensions: '17x25 cm',
        published: 2018,
        language: 'English',
        publisher: 'Tri Thức Trẻ Books & NXB Công Nghệ',
      },
      image: require('../../assets/cleancode.png'),
    },
    {
      id: '5',
      title: 'Hạt giống tâm hồn',
      author: 'Nhiều tác giả',
      price: 230000,
      rating: 5,
      votes: 211,
      image: require('../../assets/hatgiongtanhon.png'),
    },
  ]);
  const [searchText, setSearchText] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [sortItem, setsortItem] = useState(null);
  const [filterItem, setFilterItem] = useState(null);
  const [authorsList, setAuthorsList] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showAllPublishers, setShowAllPublishers] = useState(false);
  const [sortOption, setSortOption] = useState(null);

  const {user} = useContext(UserContext);
  console.log('day la user: ', user);

  const toggleFilter = () => {
    setFilterItem(!filterItem);
    if (sortItem == true) {
      setsortItem(!sortItem);
    }
  };

  const toggleSort = () => {
    setsortItem(!sortItem);
    if (filterItem == true) {
      setFilterItem(!filterItem);
    }
  };

  const sortData = () => {
    const sortedData = [...data];
    switch (sortOption) {
      case 'priceAsc':
        sortedData.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sortedData.sort((a, b) => b.price - a.price);
        break;
      case 'titleAsc':
        sortedData.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'ratingHigh':
        sortedData.sort((a, b) => b.rating - a.rating);
        break;
      case 'ratingLow':
        sortedData.sort((a, b) => a.rating - b.rating);
        break;
      case 'popular': // Thêm tiêu chí Thịnh hành
        sortedData.sort((a, b) => b.votes - a.votes);
        break;
      default:
        break;
    }
    setData(sortedData);
  };
  useEffect(() => {
    sortData();
  }, [sortOption]);

  const handleSortOption = option => {
    setSortOption(option);
  };

  const categories = [
    'Trinh thám',
    'Tình yêu',
    'Hoạt hình',
    'Kinh dị',
    'Kĩ năng',
    'Kiến thức',
    'Lịch sử',
    'Giáo khoa',
    'Nấu ăn',
  ];

  const publishers = [
    'Kim Đồng',
    'Giáo dục Việt Nam',
    'Trẻ',
    'Tư pháp',
    'Lao động',
    ,
    'Chính trị quốc gia sự thật',
    'Hội Nhà văn',
    'Tổng hợp thành phố Hồ Chí Minh',
  ];

  //Lấy dữ liệu từ firebase(firestore)
  useEffect(() => {
    const authors = firestore().collection('TacGia');
    const unsubscribe = authors.onSnapshot(
      querySnapshot => {
        if (querySnapshot && !querySnapshot.empty) {
          const list = [];
          querySnapshot.forEach(doc => {
            list.push({
              id_tacGia: doc.id,
              tenTacGia: doc.data().tenTacGia,
            });
          });
          setAuthorsList(list);
        } else {
          console.log('No documents found in the collection');
        }
      },
      error => {
        console.error('Error fetching data: ', error);
      },
    );
    return () => unsubscribe();
  }, []);

  // Hàm hiển thị giới hạn dữ liệu
  const displayLimitedData = (data, limit) => {
    return data.slice(0, limit);
  };

  const toggleExpand = itemId => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  // Hàm render ngôi sao cho rating
  const renderStars = rating => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= rating
              ? require('../../assets/fullStar.png')
              : require('../../assets/emptyStar.png')
          }
          style={styles.star}
        />,
      );
    }
    return stars;
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.itemContainer,
        {backgroundColor: expandedItem === item.id ? '#98EE8A' : '#EFFFD6'},
      ]}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.row}>
          <Image source={item.image} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={[styles.title, {maxWidth: 250, flexWrap: 'wrap'}]}>
              {item.title}
            </Text>
            <Text style={[styles.text, {maxWidth: 250, flexWrap: 'wrap'}]}>
              {item.author}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>
                {renderStars(item.rating)}
              </View>
              <Text style={styles.votes}>({item.votes} lượt đánh giá)</Text>
            </View>
            <Text style={styles.price}>{item.price.toLocaleString()} VNĐ</Text>
            {expandedItem === null && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonAddToCart}>
                  <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                  <Image
                    source={require('../../assets/themvaogio.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonBuyNow}>
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
          <TouchableOpacity
            style={styles.detailsContainer}
            onPress={() => toggleExpand(item.id)}>
            {item.details ? (
              <>
                <Text>Thể loại: {item.details.category}</Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text>Phần: {item.details.part}</Text>
                    <Text>Năm xuất bản: {item.details.published}</Text>
                    <Text>In lần thứ: {item.details.edition}</Text>
                    <Text>Tổng số trang: {item.details.pages}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>Khổ sách: {item.details.dimensions}</Text>
                    <Text>Hình thức in: {item.details.printFormat}</Text>
                    <Text>Ngôn ngữ: {item.details.language}</Text>
                  </View>
                </View>
                <Text>Đơn vị liên kết: {item.details.publisher}</Text>
              </>
            ) : (
              <Text>Không có thông tin chi tiết</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
        </>
      )}
      {expandedItem === item.id && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonReview}>
            <Text style={styles.buttonText}>Đánh giá</Text>
            <Image
              source={require('../../assets/Message.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonAddToCart}>
            <Text style={styles.buttonText}>Thêm vào giỏ</Text>
            <Image
              source={require('../../assets/themvaogio.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonBuyNow}>
            <Text style={styles.buttonText}>Mua ngay</Text>
            <Image
              source={require('../../assets/muangay.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
        <TouchableOpacity style={styles.searchButton} onPress={toggleFilter}>
          <Image
            source={require('../../assets/BoLoc.png')}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      {sortItem && (
        <View style={styles.sortOptionsContainer}>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('priceAsc')}>
            <Text>Theo giá tăng dần</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('priceDesc')}>
            <Text>Theo giá giảm dần</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('titleAsc')}>
            <Text>Sắp xếp A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('ratingHigh')}>
            <Text>Đánh giá cao</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('ratingLow')}>
            <Text>Đánh giá thấp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortOption('popular')}>
            <Text>Thịnh hành</Text>
          </TouchableOpacity>
        </View>
      )}
      {filterItem && (
        <ScrollView
          style={styles.filterContainer}
          contentContainerStyle={{paddingBottom: 50}}>
          {/* Thể loại */}
          <Text style={styles.sectionTitle}>Thể loại</Text>
          <View style={styles.tagContainer}>
            {displayLimitedData(
              categories,
              showAllCategories ? categories.length : 6,
            ).map((category, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text>{category}</Text>
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
            {displayLimitedData(
              authorsList,
              showAllAuthors ? authorsList.length : 6,
            ).map((author, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text>{author.tenTacGia}</Text>
              </TouchableOpacity>
            ))}
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
              publishers,
              showAllPublishers ? publishers.length : 6,
            ).map((publisher, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text>{publisher}</Text>
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
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 5,
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
