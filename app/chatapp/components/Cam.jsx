import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Camera } from "expo-camera/legacy";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { links } from "../Url";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

export default function Cam({ pid, store, setxx, setipfs, setkeys }) {
  const [x, setx] = useState(0);
  const cameraRef = useRef();
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isPreview, setIsPreview] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    onHandlePermission();
  }, []);

  const onHandlePermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const switchCamera = () => {
    if (isPreview) {
      return;
    }
    setCameraType((prevCameraType) =>
      prevCameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const onSnap = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
        });
        if (!photo.uri) return;

        await cameraRef.current.pausePreview();
        setIsPreview(true);
        setx(1);

        const uriParts = photo.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append("file", {
          uri: photo.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        formData.append("u", pid); // `u` is the user/mobile ID

        const apiUrl = links + "/chat/upload";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        const json = await response.json();
        if (response.ok && json.filename && json.key && json.ipfs) {
          store(json.filename); // Store response data if necessary
          setipfs(json.ipfs);
          setkeys(json.key);
          setxx(0);
        } else {
          throw new Error("Upload failed");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload failed, try again.");
      store("");
      setxx(0);
    }
  };

  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }
  const checking = () => {
    if (x === 0) {
      return (
        <View style={styles.container}>
          <Camera
            ref={cameraRef}
            style={styles.container}
            type={cameraType}
            onCameraReady={onCameraReady}
            useCamera2Api={true}
          />
          <View style={styles.container}>
            {isPreview && (
              <TouchableOpacity
                onPress={cancelPreview}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <AntDesign name="close" size={32} color="#fff" />
              </TouchableOpacity>
            )}
            {!isPreview && (
              <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity
                  disabled={!isCameraReady}
                  onPress={switchCamera}
                >
                  <MaterialIcons
                    name="flip-camera-ios"
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={!isCameraReady}
                  onPress={onSnap}
                  style={styles.capture}
                />
              </View>
            )}
          </View>
        </View>
      );
    } else if (x === 1) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Image
            source={require("../../assets/one.gif")}
            style={{ flex: 1, resizeMode: "contain" }}
          />
        </View>
      );
    }
  };
  return <>{checking()}</>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    color: "#fff",
  },
  bottomButtonsContainer: {
    position: "absolute",
    flexDirection: "row",
    bottom: 28,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 35,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5A45FF",
    opacity: 0.7,
  },
  capture: {
    backgroundColor: "#5A45FF",
    borderRadius: 5,
    height: CAPTURE_SIZE,
    width: CAPTURE_SIZE,
    borderRadius: Math.floor(CAPTURE_SIZE / 2),
    marginBottom: 28,
    marginHorizontal: 30,
  },
});
