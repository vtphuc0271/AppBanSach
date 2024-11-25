import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';
import { TextInput } from 'react-native-gesture-handler';
import { UserContext } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';


const RatingDoScreen = ({ route }) => {
    const { bookId } = route.params;
    const [bookDetails, setBookDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [tacGia, setAuthors] = useState([]);
    const [rating, setRating] = useState(0);
    const [noiDung, setNoiDung] = useState('');
    const { user } = useContext(UserContext);
    const navigation = useNavigation();


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

        return () => unsubscribeAuthors(); // Cleanup function
    }, []);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const bookSnapshot = await firestore().collection('Sach').doc(bookId).get();
                setBookDetails(bookSnapshot.data());

                const reviewsSnapshot = await firestore()
                    .collection('DanhGia')
                    .doc(bookId)
                    .collection('idNguoiDung')
                    .get();

                const reviewsList = await Promise.all(
                    reviewsSnapshot.docs.map(async (doc) => {
                        const review = doc.data();
                        const userSnapshot = await firestore()
                            .collection('NguoiDung')
                            .doc(doc.id) // doc.id chính là idNguoiDung
                            .get();
                        const user = userSnapshot.data();
                        return { ...review, user };
                    })
                );
                setReviews(reviewsList);
            } catch (error) {
                console.error('Error fetching book details or reviews: ', error);
            }
        };
        fetchBookDetails();
    }, [bookId]);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const bookSnapshot = await firestore().collection('Sach').doc(bookId).get();
                setBookDetails(bookSnapshot.data());
    
                const reviewsSnapshot = await firestore()
                    .collection('DanhGia')
                    .doc(bookId)
                    .collection('idNguoiDung')
                    .get();
    
                const reviewsList = await Promise.all(
                    reviewsSnapshot.docs.map(async (doc) => {
                        const review = doc.data();
                        const userSnapshot = await firestore()
                            .collection('NguoiDung')
                            .doc(doc.id)
                            .get();
                        const user = userSnapshot.data();
                        return { ...review, user };
                    })
                );
                setReviews(reviewsList);
    
                // Kiểm tra nếu người dùng đã đánh giá
                const userReviewSnapshot = await firestore()
                    .collection('DanhGia')
                    .doc(bookId)
                    .collection('idNguoiDung')
                    .doc(user.uid)
                    .get();
    
                if (userReviewSnapshot.exists) {
                    const userReview = userReviewSnapshot.data();
                    setRating(userReview.soSao); // Hiển thị số sao đã đánh giá
                    setNoiDung(userReview.noiDung); // Hiển thị nội dung đã đánh giá
                }
            } catch (error) {
                console.error('Error fetching book details or reviews: ', error);
            }
        };
        fetchBookDetails();
    }, [bookId, user.uid]);
    

    const handleSubmitRating = async () => {
        if (!rating) {
            alert("Vui lòng chọn số sao!");
            return;
        }
    
        const reviewData = {
            noiDung: noiDung,
            ngayDanhGia: firestore.FieldValue.serverTimestamp(),
            soSao: rating,
        };
    
        try {
            // Thêm hoặc cập nhật đánh giá của người dùng
            await firestore()
                .collection('DanhGia')
                .doc(bookId)
                .collection('idNguoiDung')
                .doc(user.uid)
                .set(reviewData);
    
            // Truy xuất tất cả đánh giá của sách
            const reviewsSnapshot = await firestore()
                .collection('DanhGia')
                .doc(bookId)
                .collection('idNguoiDung')
                .get();
    
            const totalReviews = reviewsSnapshot.size;
            const totalStars = reviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data().soSao, 0);
    
            const averageRating = totalStars / totalReviews;
    
            // Cập nhật số sao trung bình vào collection 'Sach'
            await firestore()
                .collection('Sach')
                .doc(bookId)
                .update({
                    soSaoTrungBinh: averageRating,
                    soLuotDanhGia: totalReviews,
                });
    
            alert("Đánh giá thành công!");
            setRating(0);
            setNoiDung('');
            navigation.navigate('MainScreen');
        } catch (error) {
            console.error("Lỗi khi lưu đánh giá hoặc cập nhật số sao trung bình: ", error);
            alert("Không thể lưu đánh giá!");
        }
    };
    


    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.soSao, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating, size) => {
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
                    style={[styles.star, { width: size, height: size }]}
                />
            );
        }
        return stars;
    };
    
    const renderChoseStars = (rating, size) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={(e) => {
                        const touchX = e.nativeEvent.locationX; // Lấy vị trí bấm trong sao
                        const starWidth = size / 2; // Một nửa chiều rộng sao
                        setRating(i - (touchX < starWidth ? 0.5 : 0)); // Gán 0.5 nếu bấm vào nửa đầu
                    }}
                >
                    <Image
                        source={
                            i <= Math.floor(rating)
                                ? require('../../assets/fullStar.png') // Sao đầy
                                : i - 0.5 === rating
                                ? require('../../assets/halfStar.png') // Sao nửa
                                : require('../../assets/emptyStar.png') // Sao rỗng
                        }
                        style={{ width: size, height: size }}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };
    //

    const getAuthorNameById = (id) => {
        const author = tacGia.find(author => author.id === id);
        return author ? author.name : 'Unknown Author';
    };

    if (!bookDetails) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container2}>
            <NavbarCard ScreenName={'Đánh giá'} iconShop={true} />
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    <Image source={{ uri: bookDetails.anhSach }} style={styles.bookImage} />
                    <View style={styles.bookDetails}>
                        <Text style={styles.bookTitle}>{bookDetails.tenSach}</Text>
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <Text style={styles.bookAuthor}>{getAuthorNameById(bookDetails.tacGia)}</Text>
                            <View style={{ width: 30 }}></View>
                            <View style={styles.ratingContainer}>
                                <View style={styles.starContainer}>{renderStars(calculateAverageRating(reviews), 20)}</View>
                                <Text style={styles.reviewRating}>({calculateAverageRating(reviews)})</Text>
                            </View>

                        </View>
                        <Text style={styles.votes}>({244} lượt đánh giá)</Text>
                        <Text style={styles.bookPrice}>
                            {bookDetails.giaTien
                                ? new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(bookDetails.giaTien)
                                : '0 VNĐ'}
                        </Text>

                    </View>
                </View>
                <View style={{ height: 80, alignItems: 'center', borderBottomWidth: 2, justifyContent: 'center' }}>
                    <View style={[styles.starContainer]}>
                        {renderChoseStars(rating, 60)}
                    </View>
                </View>
                <Text style={{ textAlign: 'left', fontSize: 18, fontWeight: 'bold', paddingVertical: 10 }}>Bình luận:</Text>
                <TextInput
                    style={styles.ratingText}
                    multiline
                    numberOfLines={13}
                    placeholder="Nhập nội dung..."
                    value={noiDung}
                    onChangeText={setNoiDung}
                />
                <TouchableOpacity style={styles.btnRating} onPress={handleSubmitRating}>
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>Đánh giá</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#EFFFD6',
    },
    container2: {
        flex: 1,
        backgroundColor: '#EFFFD6',
    },
    contentContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(152, 238, 138, 0.48)',
        marginHorizontal: -10,
        marginTop: -10,
        borderTopWidth: 0.7,
        borderBottomWidth: 0.7,
        borderColor: '#000'
    },
    bookDetails: {
        alignItems: 'center',
        justifyContent: "center",
        marginBottom: 5,
    },
    bookImage: {
        borderRadius: 5,
        marginTop: 8,
        width: 120,
        height: 150,
        resizeMode: 'stretch',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    btnRating: {
        paddingHorizontal: 10,
        width: '33%',
        paddingVertical: 8,
        marginTop: 20,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 9,
        backgroundColor: '#5672FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bookTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    bookAuthor: {
        fontSize: 16,
        color: '#000',
    },
    bookPrice: {
        fontSize: 20,
        color: '#FF6B00',
        fontWeight: 'bold'
    },
    bookRating: {
        fontSize: 16,
        marginBottom: 5,
    },
    reviewItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    reviewText: {
        fontSize: 16,
    },
    reviewRating: {
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    reviewDate: {
        textAlign: 'right',
        fontSize: 12,
        color: '#aaa',
    },
    ratingText: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        width: '90%',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 7,
        padding: 10
    },
    ratingContainer: {
        flexDirection: 'row',

        alignItems: 'center'
    },
    starContainer: {
        flexDirection: 'row',
    },
    star: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        fontSize: 14,
        marginRight: 2,
    },
    votes: {
        marginLeft: 5,
        fontSize: 12,
        color: '#888',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
    },
    userName: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bubbleContainer: {
        maxWidth: '100%', // Chiều rộng tối đa 90% màn hình
        paddingVertical: 10,
        marginLeft: 40,
        resizeMode: 'contain',
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(245, 245, 245, 0.9)', // Màu nền nhạt hơn
        shadowColor: '#000', // Hiệu ứng đổ bóng
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3, // Đổ bóng trên Android
        alignSelf: 'flex-start', // Đặt hộp gần trái
        marginVertical: 8, // Khoảng cách giữa các bình luận
    },
    reviewText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333', // Màu chữ đậm hơn
        textAlign: 'justify', // Canh đều hai bên
    },

});

export default RatingDoScreen;
