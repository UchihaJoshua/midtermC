import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, Alert, TouchableHighlight } from 'react-native';
import React, {useState, useEffect } from "expo-local-authentication"

export default function App() {

    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    //for fingerprint scanning

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
        })();
    });

    const fallBackToDefaultAuth = () => {
        console.log('fall back to password authentication');
    };

    const alertComponent = (title, mess, btnTxt, btnFunc ) => {
        return Alert.alert(title, mess, [
            {
                text: btnTxt,
                onPress: btnFunc,
            }
        ]);
    };

    const TwoButtonAlert = () =>
        Alert.alert('Welcome To App', 'Subscribe Now', [
            {
                text: 'Back',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            {
                text: 'OK', onPress: () => console.log('OK Pressed')
            },
        ]);

    const handleBiometricAuth = async () => {
        //check if hardware supports biometric

        const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
        //fall back to default authentication method (password) if biometrics is not available

        if (!isBiometricAvailable)
            return alertComponent(
        'Please Enter Your Password',
        'Biometric Auth not Supported',
        'OK',
        () => fallBackToDefaultAuth()
    );
        //check biometrics types available 

        let supportedBiometrics;
        if (isBiometricAvailable)
            supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
        //check biometrics are saved locally in user's device

    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
    if (!savedBiometrics)
        return alertComponent(
        'Biometric record not found',
        'Please Login With Password',
        'OK',
        () => fallBackToDefaultAuth()
        );

        // Authenticate with biometric
    const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login With Biometrics',
        cancelLabel: 'cancel',
        disableDeviceFallback: true,
    });

    //Log the user in on success
    if (biometricAuth) {TwoButtonAlert()};
    console.log({isBiometricAvailable});
    console.log({supportedBiometrics});
    console.log({savedBiometrics});
    console.log({biometricAuth});
    };

  return (
    <SafeAreaView>
    <View style={styles.container}>
      <Text>
        {isBiometricSupported
        ? 'Your Device Is Compatible With Biometrics'
        : 'Fingerprint scanner is available on this device'}
      </Text>
      <TouchableHighlight
        style={{
            height:60,
            marginTop:200
        }}>
            <Button 
            title= 'Login With Biometrics'
            color='black'
            onPress={handleBiometricAuth}
            />
      </TouchableHighlight>
      <StatusBar style='auto'/>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight
  },
});
