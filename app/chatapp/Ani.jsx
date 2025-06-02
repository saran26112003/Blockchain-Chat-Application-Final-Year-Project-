import React from "react";
import { Button, Image, StyleSheet, View } from "react-native";

export default function Ani({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/chatapp.gif")} // Replace with actual path to your GIF file
        style={styles.gif}
        resizeMode="contain" // Ensures the GIF scales properly
      />
      <Button
        title="Get Started"
        onPress={() => {
          navigation.navigate("home");
        }}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20, // Adds some padding around the content
  },
  gif: {
    width: "80%", // Adjust width as needed
    height: 250, // Adjust height as needed
    marginBottom: 20, // Space between the GIF and the button
  },
  button: {
    marginTop: 20, // Add space between the button and the GIF
    width: "80%", // Optional, controls button width
  },
});
