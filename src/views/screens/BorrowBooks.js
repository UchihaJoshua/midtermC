import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const BorrowBooks = () => {
  const [bookId, setBookId] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [bookDetails, setBookDetails] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [dateBorrow, setDateBorrow] = useState(new Date());
  const [dateReturn, setDateReturn] = useState(new Date());
  const [showBorrowPicker, setShowBorrowPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  const fetchBookDetails = async () => {
    try {
      const bookData = await AsyncStorage.getItem(bookId);
      if (bookData) {
        const parsedBookData = JSON.parse(bookData);
        if (parseInt(parsedBookData.quantity) === 0) {
          setBookDetails(null);
          Alert.alert('Unavailable', 'Book is not Available');
        } else {
          setBookDetails({ id: bookId, ...parsedBookData });
        }
      } else {
        setBookDetails(null);
        Alert.alert('Error', 'Book ID not found.');
      }
    } catch (error) {
      console.error("Failed to fetch book data:", error);
    }
  };

  const fetchStudentDetails = async () => {
    try {
      const studentData = await AsyncStorage.getItem(studentNo);
      if (studentData) {
        const parsedStudentData = JSON.parse(studentData);
        setStudentDetails({ id: studentNo, ...parsedStudentData });
      } else {
        setStudentDetails(null);
        Alert.alert('Error', 'Student ID not found.');
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    }
  };

  const onChangeBorrowDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateBorrow;
    setShowBorrowPicker(Platform.OS === 'ios');
    setDateBorrow(currentDate);
  };

  const onChangeReturnDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateReturn;
    setShowReturnPicker(Platform.OS === 'ios');
    setDateReturn(currentDate);
  };

  const handleBorrowBook = async () => {
    if (bookDetails && studentDetails && dateBorrow && dateReturn) {
      if (dateReturn <= dateBorrow) {
        Alert.alert('Error', 'Return date must be after the borrow date.');
        return;
      }

      if (parseInt(bookDetails.quantity) > 0) {
        const updatedQuantity = parseInt(bookDetails.quantity) - 1;
        const updatedBookDetails = { ...bookDetails, quantity: updatedQuantity.toString() };

        try {
          await AsyncStorage.setItem(bookId, JSON.stringify(updatedBookDetails));
          setBookDetails(updatedBookDetails);

          // Save the borrowing record
          const borrowRecord = {
            bookId,
            studentNo,
            dateBorrow: dateBorrow.toISOString(),
            dateReturn: dateReturn.toISOString(),
          };
          const borrowKey = `borrow_${bookId}_${studentNo}_${Date.now()}`;
          await AsyncStorage.setItem(borrowKey, JSON.stringify(borrowRecord));

          Alert.alert('Success', `Book borrowed by ${studentDetails.studentName} from ${dateBorrow.toDateString()} to ${dateReturn.toDateString()}`);

          // Reset fields after borrowing
          setBookId('');
          setStudentNo('');
          setDateBorrow(new Date());
          setDateReturn(new Date());
          setBookDetails(null);
          setStudentDetails(null);
        } catch (error) {
          Alert.alert('Error', 'Failed to update book quantity or save borrow record.');
          console.error("Failed to update book data:", error);
        }
      } else {
        Alert.alert('Unavailable', 'This book is currently out of stock.');
      }
    } else {
      Alert.alert('Error', 'Please enter valid details for Book ID, Student No, Borrow Date, and Return Date.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Borrow Books</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Book ID"
        value={bookId}
        onChangeText={setBookId}
      />
      <TouchableOpacity style={styles.fetchButton} onPress={fetchBookDetails}>
        <Text style={styles.fetchButtonText}>Fetch Book Details</Text>
      </TouchableOpacity>

      {bookDetails ? (
        <View style={styles.detailsRow}>
          {bookDetails.imageUri && (
            <Image source={{ uri: bookDetails.imageUri }} style={styles.bookImage} />
          )}
          <View style={styles.detailsBox}>
            <Text style={styles.detailText}>Book ID: {bookDetails.id}</Text>
            <Text style={styles.detailText}>Name: {bookDetails.bookName}</Text>
            <Text style={styles.detailText}>Author: {bookDetails.authorName}</Text>
            <Text style={styles.detailText}>Quantity: {bookDetails.quantity}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.notFoundText}>Book ID not found.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Student No."
        value={studentNo}
        onChangeText={setStudentNo}
      />
      <TouchableOpacity style={styles.fetchButton} onPress={fetchStudentDetails}>
        <Text style={styles.fetchButtonText}>Fetch Student Details</Text>
      </TouchableOpacity>

      {studentDetails ? (
        <View style={styles.detailsRow}>
          <View style={styles.studentIcon}>
            <Text style={styles.studentIconText}>👤</Text>
          </View>
          <View style={styles.detailsBox}>
            <Text style={styles.detailText}>Student No: {studentDetails.id}</Text>
            <Text style={styles.detailText}>Name: {studentDetails.studentName}</Text>
            <Text style={styles.detailText}>Year: {studentDetails.year}</Text>
            <Text style={styles.detailText}>Program: {studentDetails.program}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.notFoundText}>Student ID not found.</Text>
      )}

      <TouchableOpacity onPress={() => setShowBorrowPicker(true)} style={styles.datePicker}>
        <Text style={styles.datePickerText}>Date to Borrow: {dateBorrow.toDateString()}</Text>
      </TouchableOpacity>
      {showBorrowPicker && (
        <DateTimePicker
          value={dateBorrow}
          mode="date"
          display="default"
          onChange={onChangeBorrowDate}
        />
      )}

      <TouchableOpacity onPress={() => setShowReturnPicker(true)} style={styles.datePicker}>
        <Text style={styles.datePickerText}>Date to Return: {dateReturn.toDateString()}</Text>
      </TouchableOpacity>
      {showReturnPicker && (
        <DateTimePicker
          value={dateReturn}
          mode="date"
          display="default"
          onChange={onChangeReturnDate}
        />
      )}

      {bookDetails && studentDetails && (
        <TouchableOpacity style={styles.borrowButton} onPress={handleBorrowBook}>
          <Text style={styles.borrowButtonText}>Borrow Book</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: '#cfcfcf',
    backgroundColor: '#ffffff',
    fontSize: 16,
    width: '100%',
  },
  fetchButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  fetchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  detailsBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginLeft: 10,
  },
  bookImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  studentIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d9e3f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentIconText: {
    fontSize: 40,
  },
  detailText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 5,
  },
  notFoundText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  borrowButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  borrowButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: '#ffffff',
    borderColor: '#4A90E2',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  datePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
  },
});

export default BorrowBooks; 

