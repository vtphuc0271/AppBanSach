import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ImageBackground } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../components/NavbarCard';

const RatingScreen = ({ route }) => {
    const { bookId } = route.params;
    const [bookDetails, setBookDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [tacGia, setAuthors] = useState([]);

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
    //
    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <Text>{console.log("user danh gia ne", item.user)}</Text>
            <View style={styles.userInfo}>
                <Image source={{ uri: item.user.hinh }} style={styles.userAvatar} />
                <View>
                    <Text style={styles.userName}>{item.user.hoTen}</Text>
                    <View style={styles.ratingContainer}>
                        <View style={styles.starContainer}>{renderStars(item.soSao)}</View>
                    </View>
                </View>

            </View>
            <View
                style={styles.bubbleContainer}
            >
                <Text style={styles.reviewText}>{item.noiDung}</Text>
            </View>
            <Text style={styles.reviewDate}>
                Ngày đánh giá: {item.ngayDanhGia.toDate().toLocaleDateString()}
            </Text>
        </View>
    );

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
                                <View style={styles.starContainer}>{renderStars(calculateAverageRating(reviews))}</View>
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

                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
        
    );
};

const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.soSao, 0);
    return (total / reviews.length).toFixed(1);
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

export default RatingScreen;
