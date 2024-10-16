import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState();
  const [totalBooks, setTotalBooks] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getUserData();
      fetchDashboardData();
    }, [])
  );

  const getUserData = async () => {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserDetails(parsedData);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);

      // Filter books and students by keys
      const books = items.filter(([key]) => key.startsWith("book_") || !isNaN(key));
      const students = items.filter(([key]) => key.startsWith("student_") || /^[A-Za-z]\d+$/.test(key));

      // Filter borrowed books by checking the `isBorrowed` flag in AsyncStorage data
      const borrowed = items.filter(([key, value]) => {
        if (key.startsWith("borrow_")) {
          try {
            const book = JSON.parse(value);
            return book.isBorrowed; // Check for borrowed flag
          } catch (error) {
            console.error("Error parsing borrowed book data:", error);
            return false;
          }
        }
        return false;
      });

      setTotalBooks(books.length);
      setBorrowedBooks(borrowed.length);
      setTotalStudents(students.length);
      console.log("Books:", books.length, "Borrowed:", borrowed.length, "Students:", students.length);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, </Text>
        <Text style={styles.nameText}>{userDetails?.fullname}</Text>
      </View>

      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Overview</Text>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ManageBooks")}>
          <Text style={styles.cardTitle}>Total Books</Text>
          <Text style={styles.cardCount}>{totalBooks}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ViewBorrowedBooks")}>
          <Text style={styles.cardTitle}>Borrowed Books</Text>
          <Text style={styles.cardCount}>{borrowedBooks}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ManageStudents")}>
          <Text style={styles.cardTitle}>Total Students</Text>
          <Text style={styles.cardCount}>{totalStudents}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ViewBorrowedBooks")}>
          <Text style={styles.cardTitle}>Search Borrowed Books by Date</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: "black",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  overviewSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4A4A4A",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    color: "#4A4A4A",
    fontWeight: "600",
  },
  cardCount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A90E2",
    marginTop: 5,
  },
});

export default HomeScreen;
