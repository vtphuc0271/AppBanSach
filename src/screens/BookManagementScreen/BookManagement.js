import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import NavbarCard from '../../components/NavbarCard';

const BookManagement = () => {
  const [Sach, setBooks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [authorModalVisible, setAuthorModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorImage, setNewAuthorImage] = useState('');
  const [newAuthorBirthYear, setNewAuthorBirthYear] = useState('');
  const [newBook, setNewBook] = useState({
    tenSach: '',
    tacGia: '',
    nhaXuatBan: '',
    theLoai: '',
    moTa: '',
    namXuatBan: '',
    giaTien: '',
    anhSach: '',
  });

  const [tacGia, setAuthors] = useState([]);
  const [theLoai, setGenres] = useState([]);
  const [nhaXuatBan, setPublishers] = useState([]);
  useEffect(() => {
    // Lấy dữ liệu sách
    const unsubscribeBooks = firestore().collection('Sach').onSnapshot(
      snapshot => {
        const bookList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(bookList);
        console.log("Sach ne")
        //console.log(bookList)
      },
      error => {
        console.error('Error fetching Firestore data: ', error);
      }
    );

    // Lấy dữ liệu tác giả
    const unsubscribeAuthors = firestore().collection('TacGia').onSnapshot(
      snapshot => {
        const authorList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setAuthors(authorList);
      },
      error => {
        console.error('Error fetching authors: ', error);
      }
    );

    // Lấy dữ liệu thể loại
    const unsubscribeGenres = firestore().collection('TheLoai').onSnapshot(
      snapshot => {
        const genreList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().tenTheLoai,
        }));
        setGenres(genreList);
      },
      error => {
        console.error('Error fetching genres: ', error);
      }
    );

    // Lấy dữ liệu nhà xuất bản
    const unsubscribePublishers = firestore().collection('NhaXuatBan').onSnapshot(
      snapshot => {
        const publisherList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setPublishers(publisherList);
      },
      error => {
        console.error('Error fetching publishers: ', error);
      }
    );

    // Hủy đăng ký khi component unmount
    return () => {
      unsubscribeBooks();
      unsubscribeAuthors();
      unsubscribeGenres();
      unsubscribePublishers();
    };
  }, []);

  const handleAddNew = async () => {
    if (newBook.tenSach && newBook.tacGia) {
      await firestore()
        .collection('Sach')
        .add({
          ...newBook,
          isTop: true,
          displayed: true,
        })
        .then(() => {
          console.log('Book added!');
        })
        .catch(error => {
          console.error('Error adding book: ', error);
        });
      resetNewBook();
    } else {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
    }
  };

  const handleAddNewAuthor = async () => {
    if (newAuthorName.trim() === '') {
      Alert.alert('Lỗi', 'Tên tác giả không được để trống.');
      return;
    }

    const publisherData = {
      name: newAuthorName,
      image: newAuthorImage || 'default.png',
      birthYear: newAuthorBirthYear,
    };


    await firestore()
      .collection('TacGia')
      .add(publisherData)
      .then(() => {
        console.log('Publisher added!');
      })
      .catch(error => {
        console.error('Error adding publisher: ', error);
      });

    setAuthorModalVisible(false);
    setNewAuthorName('');
    setNewAuthorImage('');
    setNewAuthorBirthYear('');
  };

  const handleEditBook = async () => {
    if (newBook.tenSach && newBook.tacGia) {
      await firestore()
        .collection('Sach')
        .doc(editBookId)
        .update({
          ...newBook,
        })
        .then(() => {
          console.log('Book edited!');
        })
        .catch(error => {
          console.error('Error editing book: ', error);
        });
      resetNewBook();
    } else {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
    }
  };

  const resetNewBook = () => {
    setModalVisible(false);
    setIsEditing(false);
    setEditBookId(null);
    setNewBook({
      tenSach: '',
      tacGia: '',
      nhaXuatBan: '',
      theLoai: '',
      moTa: '',
      namXuatBan: '',
      giaTien: '',
      anhSach: '',
    });
  };

  const toggleProperty = async (id, property) => {
    const book = Sach.find(book => book.id === id);
    if (book) {
      try {
        await firestore()
          .collection('Sach')
          .doc(id)
          .update({ [property]: !book[property] });
        console.log('Property toggled:', book);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    } else {
      console.warn('Book not found:', id);
    }
  };


  const handleDelete = async id => {
    await firestore()
      .collection('Sach')
      .doc(id)
      .delete();
    setBooks(Sach.filter(book => book.id !== id));
  };

  const filteredBooks = Sach.filter(book =>
    book.tenSach?.toLowerCase().includes(searchText?.toLowerCase() || "")
  );

  const renderPicker = (label, selectedValue, setValue, items) => (
    <View style={{ flexDirection: 'column', flex: 1 }}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={setValue}
          mode="dropdown"
          dropdownIconColor="black"
        >
          <Picker.Item label={`${label}`} value="" />
          {items.map(item => (
            <Picker.Item
              key={item.id}
              label={item.name}
              value={item.id}
              color="#000"
            />
          ))}
        </Picker>
      </View>
    </View>
  );


  const selectImage = () => {
    const options = { mediaType: 'photo', quality: 1 };

    launchImageLibrary(options, async (response) => {
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
          setNewBook({ ...newBook, anhSach: url });
        } catch (error) {
          console.error('Error uploading image: ', error);
        }
      }
    });
  };

  const selectAuthorImage = () => {
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
          setNewAuthorImage(url); // Lưu URL của ảnh
        } catch (error) {
          console.error('Error uploading image: ', error);
        }
      }
    });
  };



  return (
    <View style={styles.container}>
      <NavbarCard ScreenName={'Quản lý sách'}
        iconShop={true}>
      </NavbarCard>
      <View style={styles.container2}>
        <View style={styles.header}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>+ Thêm mới</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAllButton} onPress={() => setBooks([])}>
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
        <View style={styles.descriptionRow}>
          <Text style={[styles.categoryId, { flex: 0.9 }]}>STT</Text>
          <Text style={[styles.categoryName, { flex: 1.1 }]}>Ảnh</Text>
          <Text style={[styles.categoryName, { flex: 2 }]}>Tên sách</Text>
          <Text style={styles.categoryCheckbox}>Top</Text>
          <Text style={styles.categoryCheckbox}>Hiển thị</Text>
          <Text style={[styles.actionIcons, { flex: 1.5 }]}>Hành động</Text>
        </View>
        <ScrollView>
          {filteredBooks.map((book, index) => (

            <View key={book.id} style={styles.categoryRow}>
              <View style={{ backgroundColor: '#D9D9D9', marginRight: 5, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[styles.categoryId, { flex: 0.7 }]}>{index + 1}</Text>
              </View>
              <View style={[styles.imageContainer, { flex: 1 }]}>
                {book.anhSach ? (
                  <Image source={{ uri: book.anhSach }} style={styles.categoryImage} />
                ) : (
                  <Image source={require('../../assets/default.png')} style={styles.categoryImage} />
                )}
              </View>
              <Text style={[styles.categoryName, { flex: 1.8 }]}>{book.tenSach}</Text>
              <CheckBox value={book.isTop} onValueChange={() => toggleProperty(book.id, 'isTop')} tintColors={{ true: '#0096FF', false: '#D9D9D9' }} />
              <CheckBox value={book.displayed} onValueChange={() => toggleProperty(book.id, 'displayed')} tintColors={{ true: '#0096FF', false: '#D9D9D9' }} />
              <View style={[styles.actionIcons, { flex: 1.5 }]}>
                <TouchableOpacity
                  onPress={() => {
                    setNewBook(book);
                    setEditBookId(book.id);
                    setIsEditing(true);
                    setModalVisible(true);
                  }}
                >
                  <Image source={require('../../assets/edit.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(book.id)}>
                  <Image source={require('../../assets/delete.png')} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{isEditing ? 'Chỉnh sửa Sách' : 'Thêm Sách'} </Text>
              <ScrollView>
                <TextInput
                  placeholder="Tên sách"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={newBook.tenSach}
                  onChangeText={text => setNewBook({ ...newBook, tenSach: text })}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {renderPicker('Tác giả', newBook.tacGia, itemValue => setNewBook({ ...newBook, tacGia: itemValue }), tacGia)}
                  <View style={{ width: 10 }}></View>
                  <TouchableOpacity onPress={() => setAuthorModalVisible(true)}>
                    <Text style={styles.buttonTG}>{'Thêm mới'}</Text>
                  </TouchableOpacity>
                </View>
                <Modal animationType="slide" transparent={true} visible={authorModalVisible} onRequestClose={() => setAuthorModalVisible(!authorModalVisible)}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                      <Text style={styles.modalText}>{'Thêm Tác Giả'}</Text>
                      <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <TouchableOpacity style={{ borderWidth: 3, width: 120, height: 120, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderColor: '#969292' }} onPress={selectAuthorImage}>
                          {newAuthorImage ? (
                            <Image source={{ uri: newAuthorImage }} style={styles.imagePreview} />
                          ) : (
                            <Image source={require('../../assets/default.png')} style={styles.imagePreview} />
                          )}
                        </TouchableOpacity>
                      </View>

                      <TextInput placeholder="Tên tác giả" placeholderTextColor="#000" style={styles.input} value={newAuthorName} onChangeText={setNewAuthorName} />
                      <TextInput placeholder="Năm sinh" placeholderTextColor="#000" style={styles.input} keyboardType="numeric" value={newAuthorBirthYear} onChangeText={setNewAuthorBirthYear} />
                      <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleAddNewAuthor}>
                        <Text style={styles.buttonText}>{'Thêm'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => setAuthorModalVisible(false)}>
                        <Text style={styles.buttonText}>Đóng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {renderPicker('Nhà xuất bản', newBook.nhaXuatBan, itemValue => setNewBook({ ...newBook, nhaXuatBan: itemValue }), nhaXuatBan)}
                <TextInput
                  placeholder="Mô tả"
                  placeholderTextColor="#aaa"
                  style={[styles.input, { height: 80 }]}
                  value={newBook.moTa}
                  multiline
                  numberOfLines={4}
                  onChangeText={text => setNewBook({ ...newBook, moTa: text })}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                  {renderPicker('Thể loại', newBook.theLoai, itemValue => setNewBook({ ...newBook, theLoai: itemValue }), theLoai)}
                  <View style={{ width: 10 }}></View>
                  <TextInput
                    placeholder="Năm xuất bản"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={newBook.namXuatBan}
                    onChangeText={text => setNewBook({ ...newBook, namXuatBan: text })}
                    keyboardType="numeric"
                  />
                </View>
                <TextInput
                  placeholder="Giá tiền"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={newBook.giaTien}
                  onChangeText={text => setNewBook({ ...newBook, giaTien: text })}
                  keyboardType="numeric"
                />
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={selectImage} style={{ borderWidth: 3, width: 120, height: 120, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderColor: '#969292' }}>
                    {newBook.anhSach ? (
                      <Image source={{ uri: newBook.anhSach }} style={{ width: 100, height: 100, margin: 10 }} />
                    ) : (
                      <Image source={require('../../assets/default.png')} style={{ width: 100, height: 100, margin: 10 }} />
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={isEditing ? handleEditBook : handleAddNew}>
                  <Text style={styles.buttonText}>{isEditing ? 'Sửa' : 'Thêm'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={resetNewBook}>
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#12A9EA',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteAllButton: {
    backgroundColor: '#FF0101',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  descriptionRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#EDEDED',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 5,
    height: 43,
    marginLeft: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  categoryId: {
    fontWeight: 'bold',
    width: 40,
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 10
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  categoryCheckbox: {
    width: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    fontWeight: 'bold',
    width: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0096FF',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTG: {
    backgroundColor: '#0096FF',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingVertical: 15,
  },
  pickerContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    flex: 1,
  },
  picker: {
    height: 50,
    color: '#000',
  },
});



export default BookManagement;
