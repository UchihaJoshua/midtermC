import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ManageBooks = () => {
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [books, setBooks] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBooks();
    const intervalId = setInterval(loadBooks, 1000); // Refresh every 1 second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Load books from AsyncStorage
  const loadBooks = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storedBooks = await AsyncStorage.multiGet(keys);
      const bookList = storedBooks
        .map(([key, value]) => {
          try {
            return { id: key, ...JSON.parse(value) };
          } catch (e) {
            return null;
          }
        })
        .filter((book) => book && book.bookName && book.authorName && book.quantity);
      setBooks(bookList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load books.');
    }
  };

  // Validate form fields
  const validateFields = () => {
    let isValid = true;
    const newErrors = {};

    if (!bookId.trim()) {
      newErrors.bookId = 'Book ID is required';
      isValid = false;
    }
    if (!bookName.trim()) {
      newErrors.bookName = 'Book Name is required';
      isValid = false;
    }
    if (!authorName.trim()) {
      newErrors.authorName = 'Author Name is required';
      isValid = false;
    }
    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
      isValid = false;
    } else if (isNaN(quantity) || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add Book
  const handleAddBook = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please correct the errors before proceeding.');
      return;
    }

    try {
      const bookData = { bookName, authorName, quantity, imageUri };
      await AsyncStorage.setItem(bookId, JSON.stringify(bookData));
      Alert.alert('Success', 'Book added successfully!');
      clearInputs();
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add the book.');
    }
  };

  // Update Book
  const handleUpdateBook = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please correct the errors before proceeding.');
      return;
    }

    try {
      const bookData = { bookName, authorName, quantity, imageUri };
      await AsyncStorage.mergeItem(bookId, JSON.stringify(bookData));
      Alert.alert('Success', 'Book updated successfully!');
      clearInputs();
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update the book.');
    }
  };

  // Delete Book
  const handleDeleteBook = async () => {
    try {
      await AsyncStorage.removeItem(bookId);
      Alert.alert('Success', 'Book deleted successfully!');
      clearInputs();
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the book.');
    }
  };

  // Clear Input Fields
  const clearInputs = () => {
    setBookId('');
    setBookName('');
    setAuthorName('');
    setQuantity('');
    setImageUri('');
    setErrors({});
  };

  // Pick Image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert('Cancelled', 'No image was selected');
    }
  };

  // Set selected book's data into the input fields
  const handleSelectBook = (book) => {
    setBookId(book.id);
    setBookName(book.bookName);
    setAuthorName(book.authorName);
    setQuantity(book.quantity);
    setImageUri(book.imageUri || '');
    setErrors({});
  };

  // Custom Button Component
  const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Manage Books</Text>
        <TextInput
          style={[styles.input, errors.bookId && styles.errorInput]}
          placeholder="Enter Book ID"
          value={bookId}
          onChangeText={setBookId}
        />
        {errors.bookId && <Text style={styles.errorText}>{errors.bookId}</Text>}
        
        <TextInput
          style={[styles.input, errors.bookName && styles.errorInput]}
          placeholder="Enter Book Name"
          value={bookName}
          onChangeText={setBookName}
        />
        {errors.bookName && <Text style={styles.errorText}>{errors.bookName}</Text>}
        
        <TextInput
          style={[styles.input, errors.authorName && styles.errorInput]}
          placeholder="Enter Author Name"
          value={authorName}
          onChangeText={setAuthorName}
        />
        {errors.authorName && <Text style={styles.errorText}>{errors.authorName}</Text>}
        
        <TextInput
          style={[styles.input, errors.quantity && styles.errorInput]}
          placeholder="Enter Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
        
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imagePickerText}>Upload Image</Text>
        </TouchableOpacity>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}

        <View style={styles.buttonContainer}>
          <CustomButton title="Add" onPress={handleAddBook} />
          <CustomButton title="Update" onPress={handleUpdateBook} />
          <CustomButton title="Delete" onPress={handleDeleteBook} />
        </View>

        {books.length > 0 && (
          <>
            <Text style={styles.tableHeader}>Book List</Text>
            <FlatList
              data={books}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectBook(item)}>
                  <View style={styles.card}>
                    {item.imageUri && (
                      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
                    )}
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardText}>ID: {item.id}</Text>
                      <Text style={styles.cardText}>Name: {item.bookName}</Text>
                      <Text style={styles.cardText}>Author: {item.authorName}</Text>
                      <Text style={styles.cardText}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  input: {
    borderWidth: 1,
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    borderColor: '#cfcfcf',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  imagePicker: {
    backgroundColor: '#38a1f3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePickerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 15,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeader: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 15,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    paddingHorizontal: 15,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 4,
  },
});

export default ManageBooks;
