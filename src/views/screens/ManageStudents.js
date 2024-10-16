import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const ManageStudents = () => {
  const [studentNo, setStudentNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [year, setYear] = useState('');
  const [program, setProgram] = useState('');
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  // Load students from AsyncStorage
  const loadStudents = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storedStudents = await AsyncStorage.multiGet(keys);
      const studentList = storedStudents
        .map(([key, value]) => {
          try {
            return { id: key, ...JSON.parse(value) };
          } catch (e) {
            return null;
          }
        })
        .filter((student) => student && student.studentName && student.year && student.program);
      setStudents(studentList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load students.');
    }
  };

  // Validate form fields
  const validateFields = () => {
    let isValid = true;
    const newErrors = {};

    if (!studentNo.trim()) {
      newErrors.studentNo = 'Student Number is required';
      isValid = false;
    }
    if (!studentName.trim()) {
      newErrors.studentName = 'Student Name is required';
      isValid = false;
    }
    if (!year.trim()) {
      newErrors.year = 'Year is required';
      isValid = false;
    }
    if (!program.trim()) {
      newErrors.program = 'Program is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add Student
  const handleAddStudent = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please correct the errors before proceeding.');
      return;
    }

    try {
      const studentData = { studentName, year, program };
      await AsyncStorage.setItem(studentNo, JSON.stringify(studentData));
      Alert.alert('Success', 'Student added successfully!');
      clearInputs();
      loadStudents();
    } catch (error) {
      Alert.alert('Error', 'Failed to add the student.');
    }
  };

  // Update Student
  const handleUpdateStudent = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please correct the errors before proceeding.');
      return;
    }

    try {
      const studentData = { studentName, year, program };
      await AsyncStorage.mergeItem(studentNo, JSON.stringify(studentData));
      Alert.alert('Success', 'Student updated successfully!');
      clearInputs();
      loadStudents();
    } catch (error) {
      Alert.alert('Error', 'Failed to update the student.');
    }
  };

  // Delete Student
  const handleDeleteStudent = async () => {
    try {
      await AsyncStorage.removeItem(studentNo);
      Alert.alert('Success', 'Student deleted successfully!');
      clearInputs();
      loadStudents();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the student.');
    }
  };

  // Clear Input Fields
  const clearInputs = () => {
    setStudentNo('');
    setStudentName('');
    setYear('');
    setProgram('');
    setErrors({});
  };

  // Set selected student's data into the input fields
  const handleSelectStudent = (student) => {
    setStudentNo(student.id);
    setStudentName(student.studentName);
    setYear(student.year);
    setProgram(student.program);
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
        <Text style={styles.header}>Manage Students</Text>
        <TextInput
          style={[styles.input, errors.studentNo && styles.errorInput]}
          placeholder="Enter Student No."
          value={studentNo}
          onChangeText={setStudentNo}
        />
        {errors.studentNo && <Text style={styles.errorText}>{errors.studentNo}</Text>}
        
        <TextInput
          style={[styles.input, errors.studentName && styles.errorInput]}
          placeholder="Enter Student Name"
          value={studentName}
          onChangeText={setStudentName}
        />
        {errors.studentName && <Text style={styles.errorText}>{errors.studentName}</Text>}

        {/* Year Picker */}
        <Picker
          selectedValue={year}
          onValueChange={(itemValue) => setYear(itemValue)}
          style={[styles.picker, errors.year && styles.errorInput]}
        >
          <Picker.Item label="Select Year" value="" />
          <Picker.Item label="1st Year" value="1st Year" />
          <Picker.Item label="2nd Year" value="2nd Year" />
          <Picker.Item label="3rd Year" value="3rd Year" />
          <Picker.Item label="4th Year" value="4th Year" />
        </Picker>
        {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}

        {/* Program Picker */}
        <Picker
          selectedValue={program}
          onValueChange={(itemValue) => setProgram(itemValue)}
          style={[styles.picker, errors.program && styles.errorInput]}
        >
          <Picker.Item label="Select Program" value="" />
          <Picker.Item label="BSN" value="BSN" />
          <Picker.Item label="BSOA" value="BSOA" />
          <Picker.Item label="BSHM" value="BSHM" />
          <Picker.Item label="BSCE" value="BSCE" />
          <Picker.Item label="BSECE" value="BSECE" />
          <Picker.Item label="BSTM" value="BSTM" />
          <Picker.Item label="BSM" value="BSM" />
          <Picker.Item label="BSIT" value="BSIT" />
          <Picker.Item label="BSCS" value="BSCS" />
          <Picker.Item label="BSIS" value="BSIS" />
          <Picker.Item label="BLIS" value="BLIS" />
        </Picker>
        {errors.program && <Text style={styles.errorText}>{errors.program}</Text>}

        <View style={styles.buttonContainer}>
          <CustomButton title="Add" onPress={handleAddStudent} />
          <CustomButton title="Update" onPress={handleUpdateStudent} />
          <CustomButton title="Delete" onPress={handleDeleteStudent} />
        </View>

        {students.length > 0 && (
          <>
            <Text style={styles.tableHeader}>Student List</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeaderCell}>Student No.</Text>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>Year</Text>
                <Text style={styles.tableHeaderCell}>Program</Text>
              </View>
              <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectStudent(item)}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.id}</Text>
                      <Text style={styles.tableCell}>{item.studentName}</Text>
                      <Text style={styles.tableCell}>{item.year}</Text>
                      <Text style={styles.tableCell}>{item.program}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
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
  picker: {
    borderWidth: 1,
    borderColor: '#cfcfcf',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginVertical: 8,
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
  table: {
    borderWidth: 1,
    borderColor: '#cfcfcf',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeaderCell: {
    fontWeight: '700',
    color: '#4A4A4A',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  tableCell: {
    color: '#4A4A4A',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
});

export default ManageStudents;
