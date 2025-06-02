import React from "react";
import { Button, View, Text, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { links } from "../Url";

const Gal = ({ pid, store, setxx, setipfs, setkeys }) => {
  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    console.log(result["assets"][0]["uri"]);
    let { name, size, uri } = result.assets[0];
    console.log([name, size, uri]);
    let nameParts = name.split(".");
    let fileType = nameParts[nameParts.length - 1];
    var fileToUpload = {
      name: name,
      size: size,
      uri: uri,
      type: "application/" + fileType,
    };
    console.log(fileToUpload, "...............file");
    const ux = links + "/chat/upload";
    console.log(ux);
    const fileUri = fileToUpload.uri;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("u", pid);
    const options = {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    };

    fetch(ux, options)
      .then(function (a) {
        // call the json method on the response to get JSON
        Alert.alert("Success", "uploaded successfully");
        return a.json();
      })
      .then(function (json) {
        store(json.filename); // Store response data if necessary
        setipfs(json.ipfs);
        setkeys(json.key);
        setxx(0);
      })
      .catch(function () {
        console.log("error");
      });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", marginTop: "25%" }}>
      <Button
        onPress={() => {
          setxx(0);
        }}
        title="Back"
      />
      <Text style={{ fontSize: 20 }}>Upload From Gallery</Text>
      <MaterialIcons
        name="file-upload"
        size={75}
        color="red"
        onPress={_pickDocument}
      />
    </View>
  );
};

export default Gal;
