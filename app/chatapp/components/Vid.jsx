import React, { useState, useRef, useEffect } from "react";
import { Text, View, TouchableOpacity, Button, Alert } from "react-native";
import { Camera } from "expo-camera/legacy";
import { Video } from "expo-av";
import axios from "axios";
import { links } from "../Url"; // Your backend API base URL

const Vid = ({ setxx, store, pid, setipfs, setkeys }) => {
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);

  // Request permissions for camera and microphone
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } =
        await Camera.requestMicrophonePermissionsAsync();

      if (cameraStatus === "granted" && audioStatus === "granted") {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          "Permission Denied",
          "Camera and microphone permissions are required to record video."
        );
      }
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const { uri } = await cameraRef.current.recordAsync();
      console.log("Recording started, video URI:", uri); // Log video URI
      setVideoUri(uri);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      setRecording(false);
      cameraRef.current.stopRecording();

      // Check if videoUri is valid before proceeding
      if (!videoUri) {
        Alert.alert("Error", "No video recorded");
        return;
      }

      // Generate a unique filename for each upload
      const uniqueFilename = `video_${new Date().getTime()}.mp4`;

      const formData = new FormData();
      formData.append("file", {
        uri: videoUri,
        name: uniqueFilename, // Use the unique filename
        type: "video/mp4", // Video file type (adjust if necessary)
      });
      formData.append("u", pid); // Pass user id or any relevant data

      console.log("Uploading video with URI:", videoUri); // Log the URI before upload

      try {
        const response = await axios.post(`${links}/chat/upload`, formData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });

        // Handle successful upload
        Alert.alert("Success", "Video uploaded successfully");
        console.log(response.data);
        store(response.data.filename); // Store response data if necessary
        setipfs(response.data.ipfs);
        setkeys(response.data.key);
        setxx(0); // Go back to the previous screen

        // Reset videoUri after a successful upload
        setVideoUri(null);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "There was an error uploading the video");
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting permissions...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Permission to access camera and microphone denied</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Button onPress={() => setxx(0)} title="Back" />
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={Camera.Constants.Type.back}
      >
        {videoUri ? (
          <Video
            source={{ uri: videoUri }}
            style={{ flex: 1 }}
            resizeMode="cover"
            shouldPlay
          />
        ) : null}
      </Camera>
      <View
        style={{ flex: 0.1, flexDirection: "row", justifyContent: "center" }}
      >
        {recording ? (
          <TouchableOpacity onPress={stopRecording}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: "red" }}>
              Stop Recording
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startRecording}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: "blue" }}>
              Start Recording
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Vid;
