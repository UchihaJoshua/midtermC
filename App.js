import * as React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./src/views/screens/HomeScreen";
import RegistrationScreen from "./src/views/screens/RegistrationScreen";
import LoginScreen from "./src/views/screens/LoginScreen";
import BorrowBooks from "./src/views/screens/BorrowBooks";
import ManageStudents from "./src/views/screens/ManageStudents";
import ManageBooks from "./src/views/screens/ManageBooks";
import ViewBorrowedBooks from "./src/views/screens/ViewBorrowedBooks"; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="home" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>HOME</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="BorrowBooks" 
        component={BorrowBooks} 
        options={{
          tabBarIcon: () => (
            <View style={styles.iconContainer}>
              <View style={styles.circleButton}>
                <Icon name="book" size={30} color="#ffffff" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="ManageStudents" 
        component={ManageStudents} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="users" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>STUDENTS</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props) {
  const [userName, setUserName] = React.useState("userData");
  const [userEmail, setUserEmail] = React.useState("");
  const [profilePic, setProfilePic] = React.useState(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.loggedIn) {
            setUserName(parsedData.fullname || "userData");
            setUserEmail(parsedData.email || "");
            setProfilePic(parsedData.profilePic || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <Image 
          source={profilePic ? { uri: profilePic } : require("../Midterm_Project/src/img/default-profile.jpg")}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={styles.drawerHeaderText}>{userName}</Text>
        <Text style={styles.drawerEmailText}>{userEmail}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => props.navigation.navigate("ProfileScreen")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <DrawerItemList {...props} />

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20 }}>
        <DrawerItem
          label="Log out"
          icon={({ color, size }) => (
            <Icon name="sign-out" color={color} size={size} />
          )}
          onPress={async () => {
            try {
              await AsyncStorage.clear();
              props.navigation.navigate('LoginScreen');
            } catch (error) {
              console.error("Failed to clear AsyncStorage data:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}



function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen 
        name="HomeTabs" 
        component={TabNavigator} 
        options={{ 
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="ManageBooks" 
        component={ManageBooks} 
        options={{ 
          title: 'Manage Books',
          drawerIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ManageStudents" 
        component={ManageStudents} 
        options={{ 
          title: 'Manage Students',
          drawerIcon: ({ color, size }) => (
            <Icon name="users" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="BorrowBooks" 
        component={BorrowBooks} 
        options={{ 
          title: 'Borrow Books',
          drawerIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="ViewBorrowedBooks" 
        component={ViewBorrowedBooks} 
        options={{ 
          title: 'View Borrowed Books',
          drawerIcon: ({ color, size }) => (
            <Icon name="list-alt" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegistrationScreen"
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageBooks"
          component={ManageBooks}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewBorrowedBooks"
          component={ViewBorrowedBooks}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    elevation: 0,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    height: 65,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#0000ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  iconText: {
    color: '#666',
  },
  iconTextFocused: {
    color: '#000',
  },
  circleIconText: {
    color: '#ffffff',
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  drawerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerEmailText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App; 
