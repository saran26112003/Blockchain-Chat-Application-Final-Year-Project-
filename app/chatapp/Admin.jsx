import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { links } from "./Url";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // For icons

const Admin = ({ navigation }) => {
  const isFocused = useIsFocused();
  const image = {
    uri: "https://img.freepik.com/free-photo/vertical-shot-raindrops-pouring-down-glass-window_181624-3625.jpg",
  };

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const getdata = () => {
    axios
      .post(links + "/chat/viewusers")
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch((error) => {
        Alert.alert("Error fetching users", error.message);
      });
  };

  useEffect(() => {
    getdata();
  }, [isFocused]);

  const handleDelete = (id) => {
    axios
      .post(links + "/chat/deleteusers", { id })
      .then(() => {
        getdata();
      })
      .catch((error) => {
        Alert.alert("Error deleting user", error.message);
      });
  };

  const handleApprove = (id) => {
    axios
      .post(links + "/chat/approveusers", { uid: id })
      .then(() => {
        Alert.alert("User Approved", `User with ID ${id} has been approved.`);
        getdata();
      })
      .catch((error) => {
        Alert.alert("Error approving user", error.message);
      });
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = users.filter((user) =>
      user[1].toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <ImageBackground source={image} style={styles.background}>
      <View style={styles.overlay}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate("home")}
          >
            <Ionicons name="log-out-outline" size={22} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search Users..."
          placeholderTextColor="gray"
          value={searchText}
          onChangeText={handleSearch}
        />

        {/* User List */}
        <ScrollView contentContainerStyle={styles.scrollView}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <View key={user[0]} style={styles.card}>
                <Text style={styles.userText}>ID: {user[0]}</Text>
                <Text style={styles.userText}>Name: {user[1]}</Text>
                <Text style={styles.userText}>Email: {user[2]}</Text>
                <Text style={styles.userText}>Mobile: {user[3]}</Text>
                <Text style={styles.userText}>Designation: {user[5]}</Text>
              
                <Text style={styles.userText}>Address: {user[7]}</Text>
                <Text style={styles.userText}>Approved: {user[8]}</Text>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  {user[8] === "no" && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApprove(user[0])}
                    >
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(user[0])}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noUsers}>No users found</Text>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default Admin;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.7)", // Dark overlay for readability
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    color: "black",
    marginBottom: 10,
  },
  scrollView: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  userText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noUsers: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
});
