import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NavbarCard from '../../../components/NavbarCard';
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState({ id: '', name: '' });
  const [searchText, setSearchText] = useState('');
  const [confirmDeleteAllVisible, setConfirmDeleteAllVisible] = useState(false);

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const categoriesCollection = firestore().collection('TheLoai');
    const unsubscribe = categoriesCollection.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot && !querySnapshot.empty) {
          const categoryList = [];
          querySnapshot.forEach((doc) => {
            categoryList.push({
              id: doc.id,
              name: doc.data().tenTheLoai,
              displayed: true,
            });
          });
          setCategories(categoryList);
          setFilteredCategories(categoryList);
        } else {
          console.log('No documents found in the collection');
        }
      },
      (error) => {
        console.error('Error fetching data: ', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Hàm chuyển đổi chuỗi thành không dấu
  const removeDiacritics = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Xử lý tìm kiếm khi bấm nút
  // Xử lý tìm kiếm khi bấm nút
  const handleSearchClick = () => {
    const filtered = categories.filter((category) =>
      removeDiacritics(category.name) === removeDiacritics(searchText)
    );
    setFilteredCategories(filtered);

    // Kiểm tra nếu không có kết quả tìm kiếm
    if (filtered.length === 0) {
      alert('Không có thể loại này');
    }
  };



  // Add new category
  const handleAddCategory = async () => {
    if (newCategory.trim() !== '') {
      try {
        await firestore().collection('TheLoai').add({
          tenTheLoai: newCategory,
          displayed: true,
        });
        setNewCategory('');
        setModalVisible(false);
      } catch (error) {
        console.error("Lỗi khi thêm thể loại: ", error);
      }
    }
  };

  // Handle edit button press (open edit modal)
  const handleEdit = (id) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setEditingCategory(category);
      setEditModalVisible(true);
    }
  };

  // Handle updating category
  const handleUpdateCategory = async () => {
    try {
      await firestore().collection('TheLoai').doc(editingCategory.id).update({
        tenTheLoai: editingCategory.name,
      });
      setCategories(categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
      ));
      setFilteredCategories(filteredCategories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
      ));
      setEditModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thể loại: ", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await firestore().collection('TheLoai').doc(id).delete();
      setCategories(categories.filter((cat) => cat.id !== id));
      setFilteredCategories(filteredCategories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa thể loại: ", error);
    }
  };

  // Xử lý khi bấm nút "Xóa tất cả"
  const handleDeleteAll = async () => {
    try {
      const categoriesSnapshot = await firestore().collection('TheLoai').get();

      const batch = firestore().batch();
      categoriesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setCategories([]);
      setFilteredCategories([]);
    } catch (error) {
      console.error('Lỗi khi xóa tất cả thể loại: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavbarCard
        ScreenName={'Thể loại'}
        iconShop={true}>
      </NavbarCard>
      <View style={styles.container2}>
        <View style={styles.header}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>+ Thêm mới</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAllButton} onPress={() => setConfirmDeleteAllVisible(true)}>
              <Text style={styles.buttonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Tìm kiếm"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (text.trim() === '') {
                  setFilteredCategories(categories); // Trở lại danh sách ban đầu khi ô tìm kiếm trống
                }
              }}
              style={styles.searchInput}
            />
            <TouchableOpacity onPress={handleSearchClick}>
              <Image
                source={require('../../../assets/iconsearch.png')}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.headerItem}>STT</Text>
          <Text style={styles.headerItem}>Tên thể loại</Text>
          <Text style={styles.headerItem1}>Thao tác</Text>
        </View>

        {/* Category List */}
        <ScrollView>
          {filteredCategories.map((category, index) => (
            <View key={category.id} style={styles.categoryRow}>
              <Text style={styles.categoryId}>{index + 1}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => handleEdit(category.id)}>
                  <Image
                    source={require('../../../assets/iconsua.png')}
                    style={styles.iconxoasua}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(category.id)}>
                  <Image
                    source={require('../../../assets/iconxoa.png')}
                    style={styles.iconxoasua}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>


        {/* Modal for Adding Category */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Thêm thể loại</Text>
              <TextInput
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Nhập thể loại"
                style={styles.modalInput}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalAddButton} onPress={handleAddCategory}>
                  <Text style={styles.modalButtonText}>+ Thêm mới</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Thoát</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for Editing Category */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Sửa thể loại</Text>
              <TextInput
                value={editingCategory.name}
                onChangeText={(text) => setEditingCategory({ ...editingCategory, name: text })}
                placeholder="Sửa thể loại"
                style={styles.modalInput}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalAddButton} onPress={handleUpdateCategory}>
                  <Text style={styles.modalButtonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Thoát</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for Confirming Delete All */}
        <Modal
          visible={confirmDeleteAllVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setConfirmDeleteAllVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Bạn có chắc muốn xóa tất cả không?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalAddButton}
                  onPress={() => {
                    handleDeleteAll(); // Thực hiện xóa tất cả
                    setConfirmDeleteAllVisible(false); // Đóng modal
                  }}
                >
                  <Text style={styles.modalButtonText}>Có</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setConfirmDeleteAllVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Thoát</Text>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginLeft: 40,
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  searchInput: {
    width: 110,
    height: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerItem: {
    fontWeight: 'bold',
  },
  headerItem1: {
    marginRight: 30,
    fontWeight: 'bold',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  categoryId: {
    flex: 0.5,
  },
  categoryName: {
    flex: 2,
    textAlign: 'center',
  },
  actionIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconxoasua: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  pageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  pageNumber: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalAddButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  modalCloseButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
  },
});

export default CategoryList;
