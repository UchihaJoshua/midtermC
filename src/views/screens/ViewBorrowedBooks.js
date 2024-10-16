import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewBorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchBorrowedBooks = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const borrowKeys = keys.filter(key => key.startsWith('borrow_'));
      const borrowedData = await AsyncStorage.multiGet(borrowKeys);

      const borrowedBooksList = borrowedData.map(([key, value]) => {
        const parsedData = JSON.parse(value);
        return {
          id: key,
          ...parsedData,
        };
      });

      setBorrowedBooks(borrowedBooksList);

      // Only reset filteredBooks if there is no search text
      if (searchText === '') {
        setFilteredBooks(borrowedBooksList);
      }
    } catch (error) {
      console.error("Failed to load borrowed books:", error);
      Alert.alert("Error", "Could not load borrowed books.");
    }
  };

  useEffect(() => {
    fetchBorrowedBooks(); // Initial fetch

    const intervalId = setInterval(fetchBorrowedBooks, 1000); // Auto-fetch every second

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [searchText]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      // Reset filtered books if search text is cleared
      setFilteredBooks(borrowedBooks);
    } else {
      const filteredData = borrowedBooks.filter((book) =>
        book.studentNo.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filteredData);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Borrowed Books</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Student No."
        value={searchText}
        onChangeText={handleSearch}
      />

      {filteredBooks.length > 0 ? (
        <ScrollView horizontal>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader, styles.wideCell]}>Book ID</Text>
              <Text style={[styles.tableCell, styles.tableHeader, styles.wideCell]}>Student No</Text>
              <Text style={[styles.tableCell, styles.tableHeader, styles.wideCell]}>Borrow Date</Text>
              <Text style={[styles.tableCell, styles.tableHeader, styles.wideCell]}>Return Date</Text>
            </View>

            {/* Table Rows */}
            {filteredBooks.map((record) => (
              <View key={record.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.wideCell]}>{record.bookId}</Text>
                <Text style={[styles.tableCell, styles.wideCell]}>{record.studentNo}</Text>
                <Text style={[styles.tableCell, styles.wideCell]}>{new Date(record.dateBorrow).toDateString()}</Text>
                <Text style={[styles.tableCell, styles.wideCell]}>{new Date(record.dateReturn).toDateString()}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No borrowed books found.</Text>
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
  searchInput: {
    width: '100%',
    padding: 10,
    borderColor: '#d0d0d0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 600,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  tableHeader: {
    backgroundColor: '#e0e0e0',
    fontWeight: '700',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#4A4A4A',
  },
  wideCell: {
    minWidth: 150,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewBorrowedBooks;
