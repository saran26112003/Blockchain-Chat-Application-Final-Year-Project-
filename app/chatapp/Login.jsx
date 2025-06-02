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
} from "react-native";
import { links } from "./Url";

const Login = ({ navigation }) => {
  const image = {
    uri: "https://img.freepik.com/free-photo/vertical-shot-raindrops-pouring-down-glass-window_181624-3625.jpg",
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    const value = {
      email: email,
      password: password,
    };
    if (email === "admin@gmail.com" && password === "1212") {
      setEmail("");
      setPassword("");
      navigation.navigate("admin");
    } else {
      axios.post(links + "/chat/login", value).then((res) => {
        var a = res.data;
        console.log(a);
        if (a !== null) {
          try {
            if (a[2] === "no") {
              Alert.alert("You are not an approved user");
            } else if (a[2] === "yes") {
              setEmail("");
              setPassword("");
              navigation.navigate("chat", { id: a[0] });
            }
          } catch (err) {
            Alert.alert("Invalid user details");
          }
        } else {
          Alert.alert("Invalid user details");
        }
      });
    }
  };

  return (
    <ImageBackground
      source={image}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login to Your Buddy Account</Text>

        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Email"
            placeholderTextColor="#003f5c"
            value={email}
            onChangeText={(email) => setEmail(email)}
          />
        </View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Password"
            placeholderTextColor="#003f5c"
            secureTextEntry={true}
            value={password}
            onChangeText={(password) => setPassword(password)}
          />
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            login();
          }}
        >
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.regBtn}
          onPress={() => {
            navigation.navigate("user");
          }}
        >
          <Text style={styles.regText}>New User? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3a3a3a",
    marginBottom: 30,
    textAlign: "center",
  },
  inputView: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "80%",
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    paddingLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  TextInput: {
    height: 50,
    fontSize: 16,
    color: "#003f5c",
    paddingLeft: 10,
  },
  loginBtn: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    backgroundColor: "#FF1493",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  regBtn: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    backgroundColor: "#3e8ed0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  regText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
