import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    Alert,
    Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import NavbarCard from '../../components/NavbarCard';
const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newPublisherName, setNewPublisherName] = useState('');
    const [newPublisherImage, setNewPublisherImage] = useState('');
    const [editPublisherId, setEditPublisherId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newPublisherBirthYear, setNewPublisherBirthYear] = useState('');


    useEffect(() => {
        const unsubscribe = firestore()
            .collection('TacGia')
            .onSnapshot(
                snapshot => {
                    const publisherList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setCategories(publisherList);
                },
                error => {
                    console.error('Error fetching Firestore data: ', error);
                },
            );
        return () => unsubscribe();
    }, []);



    const handleEdit = id => {
        const publisher = categories.find(cat => cat.id === id);
        if (publisher) {
            setEditPublisherId(id);
            setNewPublisherName(publisher.name); 
            setNewPublisherImage(publisher.image);
            setNewPublisherBirthYear(publisher.birthYear);       
            setIsEditing(true);
            setModalVisible(true);
        }
    };

    const handleDelete = async id => {
        await firestore().collection('TacGia').doc(id).delete();
    };

    const handleAddNew = async () => {
        if (newPublisherName.trim() === '') {
            Alert.alert('Lỗi', 'Tên tác giả không được để trống.');
            return;
        }

        const publisherData = {
            name: newPublisherName,
            image: newPublisherImage || 'default.png',
            birthYear: newPublisherBirthYear,
        };

        if (isEditing) {
            await firestore()
                .collection('TacGia')
                .doc(editPublisherId)
                .update(publisherData)
                .then(() => {
                    console.log('Publisher updated!');
                })
                .catch(error => {
                    console.error('Error updating publisher: ', error);
                });
        } else {
            await firestore()
                .collection('TacGia')
                .add(publisherData)
                .then(() => {
                    console.log('Publisher added!');
                })
                .catch(error => {
                    console.error('Error adding publisher: ', error);
                });
        }

        setModalVisible(false);
        setNewPublisherName('');
        setNewPublisherImage('');
        setNewPublisherBirthYear('');
        setIsEditing(false);
        setEditPublisherId(null);
    };


    const handleDeleteAll = async () => {
        const batch = firestore().batch();
        categories.forEach(category => {
            const ref = firestore().collection('TacGia').doc(category.id);
            batch.delete(ref);
        });
        await batch.commit();
    };

    const selectImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };
        launchImageLibrary(options, async response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const fileUri = response.assets[0].uri;
                const fileName = fileUri.substring(fileUri.lastIndexOf('/') + 1);
                const reference = storage().ref(fileName);
                try {
                    await reference.putFile(fileUri);
                    const url = await reference.getDownloadURL();
                    setNewPublisherImage(url); // Lưu URL của ảnh
                } catch (error) {
                    console.error('Error uploading image: ', error);
                }
            }
        });
    };

    const filteredCategories = categories.filter(
        cat =>
            cat.name &&
            typeof cat.name === 'string' &&
            cat.name.toLowerCase().includes(searchText?.toLowerCase() || ''),
    );

    return (
        <View style={styles.container}>
            <NavbarCard ScreenName={'Tác giả'} iconShop={true}></NavbarCard>
            <View style={styles.container2}>
                <View style={styles.header}>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}>
                            <Text style={styles.buttonText}>+ Thêm mới</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteAllButton}
                            onPress={handleDeleteAll}>
                            <Text style={styles.buttonText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Tìm kiếm"
                            placeholderTextColor="#000"
                            style={styles.searchInput}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>
                <View style={styles.listHeader}>
                    <Text style={[styles.headerItem, { flex: 1.3 }]}>STT</Text>
                    <Text style={[styles.headerItem, { flex: 1.1 }]}>Ảnh</Text>
                    <Text style={[styles.headerItem, { flex: 3 }]}>Tên tác giả</Text>
                    <Text style={[styles.headerItem, { flex: 2 }]}>Thao tác</Text>
                </View>
                <ScrollView>
                    {filteredCategories.map((category, index) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.categoryRow}
                        >
                            <Text style={[styles.categoryId, { flex: 0 }]}>{index + 1}</Text>
                            <View style={[styles.imageContainer, { flex: 1 }]}>
                                <Image
                                    source={{ uri: category.image }}
                                    style={styles.categoryImage}
                                />
                            </View>
                            <View style={{ flex: 3 }}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryBirthYear}>{category.birthYear}</Text>
                            </View>
                            <View style={[styles.actionIcons, { flex: 2 }]}>
                                <TouchableOpacity onPress={() => handleEdit(category.id)}>
                                    <Image source={require('../../assets/edit.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(category.id)}>
                                    <Image source={require('../../assets/delete.png')} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                {/* Modal để thêm tác giả */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>
                                {isEditing ? 'Sửa Tác Giả' : 'Thêm Tác Giả'}
                            </Text>

                            {/* Phần chọn ảnh */}
                            <TouchableOpacity
                                style={{
                                    borderWidth: 3,
                                    width: 120,
                                    height: 120,
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    borderRadius: 5,
                                    borderColor: '#969292',
                                }}
                                onPress={selectImage}>
                                {newPublisherImage ? (
                                    <Image
                                        source={{ uri: newPublisherImage }}
                                        style={{ width: 100, height: 100, margin: 10 }}
                                    />
                                ) : (
                                    <Image
                                        source={require('../../assets/default.png')}
                                        style={{ width: 100, height: 100, margin: 10 }}
                                    />
                                )}
                            </TouchableOpacity>

                            {/* Trường nhập tên tác giả */}
                            <TextInput
                                placeholder="Tên tác giả"
                                placeholderTextColor="#000"
                                style={styles.input}
                                value={newPublisherName}
                                onChangeText={setNewPublisherName}
                            />

                            {/* Trường nhập năm sinh */}
                            <TextInput
                                placeholder="Năm sinh"
                                placeholderTextColor="#000"
                                style={styles.input}
                                keyboardType="numeric"
                                value={newPublisherBirthYear}
                                onChangeText={setNewPublisherBirthYear}
                            />

                            {/* Nút thêm hoặc chỉnh sửa */}
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'green' }]}
                                onPress={handleAddNew}>
                                <Text style={styles.buttonText}>
                                    {isEditing ? 'Chỉnh sửa' : 'Thêm'}
                                </Text>
                            </TouchableOpacity>

                            {/* Nút đóng modal */}
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'red' }]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container2: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    header1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 50,
        marginLeft: 20,
        color: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 50,
        color: '#000',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    deleteAllButton: {
        backgroundColor: '#ff0000',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 10,
        width:"40%",
        borderRadius: 5,
    },
    searchInput: {
        width: '100%',
        height: 40,
        color: '#000',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        marginBottom: 10,
    },
    headerItem: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
        color: '#000',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    categoryId: {
        width: 30,
        marginLeft: 20,
        color: '#000',
    },
    categoryName: {
        flex: 1,
        textAlign: 'center',
        marginLeft: 5,
        color: '#000',
    },
    expandedInfo: {
        marginLeft: 7,
        marginTop: 10,
        padding: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 3,
        color: '#000',
    },
    categoryBirthYear: {
        flex: 1,
        textAlign: 'center',
        marginLeft: 3,
        color: '#000',
    },

    imageContainer: {
        width: 50,
        height: 50,
    },
    categoryImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    actionIcons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 10,
        width: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        color: '#000',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default CategoryList;