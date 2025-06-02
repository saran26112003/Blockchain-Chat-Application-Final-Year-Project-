import axios from "axios";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { links } from "./Url";

const Userregister = ({ navigation }) => {
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setmobile] = useState("");
  const [address, setaddress] = useState("");
  const [privatekey, setprivatekey] = useState("");
  const [designation, setdesignation] = useState("");

  const image = {
    uri: "https://img.freepik.com/free-photo/vertical-shot-raindrops-pouring-down-glass-window_181624-3625.jpg",
  };

  const register = () => {
    const value = {
      uname: name,
      email: email,
      password: password,
      mobile: mobile,
      designation: designation,
      address:address,
      privatekey:privatekey,
      isapproved: "no",
    };

    axios
      .post(links + "/chat/insertusers", value)
      .then(() => {
        Alert.alert("Registered Successfully", "Thank you, wait for approval.");
        navigation.navigate("home");
      })
      .catch(() => {
        Alert.alert("Registration Failed", "Please try again later.");
      });
  };

  return (
    <ImageBackground
      source={image}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.overlay}>
          <Text style={styles.title}>User Register</Text>

          <TextInput
  style={styles.input}
  placeholder="Full Name"
  placeholderTextColor="#ccc"
  value={name} // Bind the value to the `name` state
  onChangeText={setname} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Email"
  placeholderTextColor="#ccc"
  keyboardType="email-address"
  value={email} // Bind the value to the `email` state
  onChangeText={setEmail} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Mobile"
  placeholderTextColor="#ccc"
  keyboardType="phone-pad"
  value={mobile} // Bind the value to the `mobile` state
  onChangeText={setmobile} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Designation"
  placeholderTextColor="#ccc"
  value={designation} // Bind the value to the `designation` state
  onChangeText={setdesignation} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Address"
  placeholderTextColor="#ccc"
  value={address} // Bind the value to the `address` state
  onChangeText={setaddress} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Private Key"
  placeholderTextColor="#ccc"
  value={privatekey} // Bind the value to the `privatekey` state
  onChangeText={setprivatekey} // Update the state on text change
/>

<TextInput
  style={styles.input}
  placeholder="Password"
  placeholderTextColor="#ccc"
  secureTextEntry={true}
  value={password} // Bind the value to the `password` state
  onChangeText={setPassword} // Update the state on text change
/>


          <TouchableOpacity style={styles.registerBtn} onPress={register}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate("home")}
          >
            <Text style={styles.homeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Userregister;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker background for readability
    width: "90%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5, // Adds a shadow on Android
    shadowColor: "#fff", // Soft shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 26,
    color: "#ff7f50",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ff7f50",
  },
  registerBtn: {
    backgroundColor: "#ff7f50",
    borderRadius: 8,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 3, // Adds button shadow on Android
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  homeBtn: {
    marginTop: 15,
  },
  homeText: {
    color: "#ff7f50",
    fontSize: 16,
    fontWeight: "bold",
  },
});
