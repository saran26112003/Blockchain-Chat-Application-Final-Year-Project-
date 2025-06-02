import React, { useState, useEffect } from "react";
import { useIsFocused, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { links } from "./Url";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { Video } from "expo-av"; // For video playback
import Gal from "./components/Gal";
import Vid from "./components/Vid";
import Cam from "./components/Cam"; // Assuming Cam component is created

const Chatscreen = ({ navigation }) => {
  const route = useRoute();
  const isFocused = useIsFocused();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imagename, setImagename] = useState("");
  const [x, setX] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ipfs, setipfs] = useState(null);
  const [keys, setkeys] = useState(null);

  const image = {
    uri: "https://img.freepik.com/free-photo/vertical-shot-raindrops-pouring-down-glass-window_181624-3625.jpg",
  };
  useEffect(() => {
    getUsers();
  }, [isFocused]);

  const getUsers = () => {
    axios
      .post(links + "/chat/viewusersbyid", { id: route.params.id })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => {
        Alert.alert("Error fetching users", error.message);
      });
  };

  const sendMessage = () => {
    if (!messageText.trim() && !imagename) {
      return;
    }

    const messageData = {
      senderid: route.params.id,
      receiverid: selectedUser,
      message: messageText.trim() ? messageText : "",
      currentdata: "",
      filename: imagename ? imagename : "",
      keys: keys,
      ifps: ipfs,
    };

    axios
      .post(links + "/chat/insertchat", messageData)
      .then(() => {
        setMessageText("");
        setImagename("");

        axios
          .post(links + "/chat/getchat", {
            rid: route.params.id,
            senderid: selectedUser,
          })
          .then((res) => {
            setMessages(res.data);
          })
          .catch((error) => {
            Alert.alert("Error fetching chat", error.message);
          });
      })
      .catch((error) => {
        Alert.alert("Error sending message", error.message);
      });
  };
  const [type, settype] = useState("");
  const showImageInFullScreen = (filename, t) => {
    setSelectedImage(filename);
    setModalVisible(true);
    settype(t);
  };
  console.log(messages);
  const checking = () => {
    if (x === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Chat Screen</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate("home")}
            >
              <Ionicons name="log-out-outline" size={22} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                axios
                  .post(links + "/chat/getchat", {
                    rid: route.params.id,
                    senderid: selectedUser,
                  })
                  .then((res) => {
                    setMessages(res.data);
                  })
                  .catch((error) => {
                    Alert.alert("Error fetching chat", error.message);
                  });
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="white" />
              <Text style={styles.logoutText}>Reload</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(itemValue) => {
              setSelectedUser(itemValue);
              axios
                .post(links + "/chat/getchat", {
                  rid: route.params.id,
                  senderid: itemValue,
                })
                .then((res) => {
                  setMessages(res.data);
                })
                .catch((error) => {
                  Alert.alert("Error fetching chat", error.message);
                });
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select User" value={null} />
            {users.map((user) => (
              <Picker.Item key={user[0]} label={user[1]} value={user[0]} />
            ))}
          </Picker>

          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const isSender = item[1] === route.params.id;
              const filename = `${links}/static/${item[5]}`;
              const isImage = item[5]?.match(/\.(jpg|jpeg|png)$/i);
              const isVideo = item[5]?.endsWith(".mp4");
              const ipfsHash = item[7];
              const decryptionKey = item[6];

              const handleDownload = async () => {
                const api = `${links}/chat/download`;
                try {
                  const response = await fetch(api, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      hash: ipfsHash,
                      key: decryptionKey,
                      filename: item[5],
                    }),
                  });

                  const res = await response.json();
                  Linking.openURL(links + res.path);
                  if (res.success) {
                    Alert.alert("Downloaded", "File saved: " + res.path);
                  } else {
                    Alert.alert("Error", "Failed to download or decrypt");
                  }
                } catch (err) {
                  Alert.alert("Error", "Server error: " + err.message);
                }
              };

              return (
                <View
                  style={[
                    styles.messageBubble,
                    isSender ? styles.senderMessage : styles.receiverMessage,
                  ]}
                >
                  {isImage ? (
                    <>
                      <TouchableOpacity
                        onPress={() => showImageInFullScreen(filename, "image")}
                      >
                        <Image
                          source={{ uri: filename }}
                          style={styles.imageMessage}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={handleDownload}
                      >
                        <Text style={styles.downloadText}>Download</Text>
                      </TouchableOpacity>
                    </>
                  ) : isVideo ? (
                    <>
                      <TouchableOpacity
                        onPress={() => showImageInFullScreen(filename, "video")}
                      >
                        <Video
                          source={{ uri: filename }}
                          style={styles.videoMessage}
                          useNativeControls
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={handleDownload}
                      >
                        <Text style={styles.downloadText}>Download</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.messageText}>{item[3]}</Text>
                  )}
                  <Text style={styles.timestampText}>{item[4]}</Text>
                </View>
              );
            }}
            style={styles.chatBox}
            contentContainerStyle={styles.chatContent}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => {
                setX(2);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="image" size={50} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setX(1);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="camera" size={50} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setX(3);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="videocam" size={50} color="white" />
            </TouchableOpacity>
            <FullScreenImageModal
              visible={isModalVisible}
              imageUri={selectedImage}
              onClose={setModalVisible}
              type={type}
            />
          </View>
        </View>
      );
    } else if (x === 1) {
      return (
        <Cam
          pid={route.params.id}
          store={setImagename}
          setxx={setX}
          setipfs={setipfs}
          setkeys={setkeys}
        />
      );
    } else if (x === 2) {
      return (
        <Gal
          pid={route.params.id}
          store={setImagename}
          setxx={setX}
          setipfs={setipfs}
          setkeys={setkeys}
        />
      );
    } else {
      return (
        <Vid
          pid={route.params.id}
          store={setImagename}
          setxx={setX}
          setipfs={setipfs}
          setkeys={setkeys}
        />
      );
    }
  };

  return (
    <ImageBackground source={image} style={styles.background}>
      {checking()}
    </ImageBackground>
  );
};

const FullScreenImageModal = ({ visible, imageUri, onClose, type }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={() => {
        onClose(false);
      }}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onClose(false)} // Close modal when button is pressed
          >
            <Ionicons name="close-circle" size={40} color="black" />
          </TouchableOpacity>

          {/* Image or Video */}
          {type === "image" ? (
            <Image source={{ uri: imageUri }} style={styles.fullScreenImage} />
          ) : (
            <Video
              source={{ uri: imageUri }}
              style={styles.fullScreenImage}
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  container: { flex: 1, padding: 15, backgroundColor: "rgba(0,0,0,0.7)" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: { color: "white", marginLeft: 10 },
  picker: { backgroundColor: "white", borderRadius: 10, marginBottom: 10 },
  chatBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chatContent: { paddingBottom: 20 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  senderMessage: { backgroundColor: "green", alignSelf: "flex-end" },
  receiverMessage: { backgroundColor: "blue", alignSelf: "flex-start" },
  messageText: { color: "white", fontSize: 16 },
  timestampText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    color: "black",
  },
  sendButton: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  iconButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  imageMessage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  videoMessage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    height: "90%",
  },
  fullScreenImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  downloadBtn: {
    backgroundColor: "#5A45FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Chatscreen;
