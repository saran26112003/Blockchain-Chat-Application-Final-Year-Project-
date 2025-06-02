import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./Login";

import Userregister from "./Userregister";

import Ani from "./Ani";
import Admin from "./Admin";
import chatscreen from "./Chatscreen";
const Stack = createNativeStackNavigator();
const Start = () => {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="First" component={Ani} />
        <Stack.Screen
          name="home"
          component={Login}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="admin"
          component={Admin}
          options={{ title: "Admin" }}
        />
        <Stack.Screen
          name="chat"
          component={chatscreen}
          options={{ title: "Chat" }}
        />

        <Stack.Screen name="user" component={Userregister} />
      </Stack.Navigator>
    </>
  );
};

export default Start;
