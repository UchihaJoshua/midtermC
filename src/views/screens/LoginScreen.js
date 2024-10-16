import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";

import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import logoproj from "../components/logoproj.png";

const LoginScreen = ({ navigation }) => {
  const [inputs, setInputs] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const validate = async () => {
    let isValid = true;

    if (!inputs.email) {
      handleError("Please Enter an Email Address", "email");
      isValid = false;
    } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
      handleError("Please Enter a Valid Email Address", "email");
      isValid = false;
    }

    if (!inputs.password) {
      handleError("Please Enter a Password", "password");
      isValid = false;
    } else if (inputs.password.length < 8) {
      handleError("Minimum Password Length is 8", "password");
      isValid = false;
    }

    if (isValid) login();
  };

  const handleOnChange = (text, input) => {
    setInputs((prevState) => ({ ...prevState, [input]: text }));
  };

  const handleError = (text, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: text }));
  };

  const login = async () => {
    console.log("login!");
    console.log(inputs);

    setLoading(true);
    setTimeout(async () => {
      try {
        let userData = await AsyncStorage.getItem("userData");
        console.log("Retrieved User Data:", userData);

        if (userData) {
          userData = JSON.parse(userData);
          console.log("Parsed User Data:", userData);

          // Check if user is already logged in
          if (userData.loggedIn) {
            Dialog.show({
              type: ALERT_TYPE.INFO,
              title: "INFO",
              textBody: "You are already logged in!",
              button: "Close",
            });
            setLoading(false);
            return;
          }

          // Validate login credentials
          if (
            inputs.email === userData.email &&
            inputs.password === userData.password
          ) {
            // Successful login
            await AsyncStorage.setItem(
              "userData",
              JSON.stringify({ ...userData, loggedIn: true })
            );
            navigation.navigate("DrawerNavigator", {
              screen: "HomeTabs",
              params: { screen: "Home" },
            });
          } else {
            // Incorrect credentials
            Dialog.show({
              type: ALERT_TYPE.DANGER,
              title: "ERROR",
              textBody: "Incorrect Username/Password!",
              button: "Close",
            });
          }
        } else {
          // No user data found
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: "ERROR",
            textBody: "No Account Found!",
            button: "Close",
          });
        }
      } catch (error) {
        // Error handling
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "ERROR",
          textBody: error.message || error,
          button: "Close",
        });
      } finally {
        setLoading(false); // Ensure loading is stopped
      }
    }, 3000);
  };

  return (
    <AlertNotificationRoot style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Loader visible={loading} />
        <ScrollView style={styles.svContainer}>
          <View style={styles.spacer} />
          <Image style={styles.image} source={logoproj} />
          <Text style={styles.textTitle}>Welcome to Library Management System</Text>
          <View style={styles.viewContainer}>
            <Input
              label="Email Address"
              iconName="envelope"
              placeholder="Enter your Email Address"
              onChangeText={(text) => handleOnChange(text, "email")}
              onFocus={() => handleError(null, "email")}
              error={errors.email}
            />
            <Input
              label="Password"
              iconName="key"
              password
              placeholder="Enter your Password"
              onChangeText={(text) => handleOnChange(text, "password")}
              onFocus={() => handleError(null, "password")}
              error={errors.password}
            />
            <Button title="Login" onPress={validate} />
            <Text
              style={styles.textRegister}
              onPress={() => navigation.navigate("RegistrationScreen")}
            >
              Don't have an account? Sign Up
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Light background
  },
  svContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  spacer: {
    height: 50,
  },
  image: {
    width: 255,
    height: 200,
    alignSelf: "center",
    marginBottom: 40,
  },
  textTitle: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333333", // Dark text
  },
  viewContainer: {
    paddingVertical: 20,
  },
  textRegister: {
    textAlign: "center",
    fontSize: 16,
    color: "#0066CC", // Blue for emphasis
    fontWeight: "bold",
  },
});

export default LoginScreen;
