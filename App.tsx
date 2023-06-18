import React, {useContext} from "react";
import {Paths} from "./src/nav";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {HomeScreen} from "./src/screens/HomeScreen";
import {PracticeMenu} from "./src/screens/PracticeMenu";
import {DictContext, DictProvider} from "./src/dict/context";
import {ActivityIndicator, Alert, StyleSheet} from "react-native";
import {Colors} from "./src/colors";
import {SafeAreaView} from "react-native-safe-area-context";
import {LookupMenu} from "./src/screens/LookupMenu";
import {SearchScreen} from "./src/screens/SearchScreen";

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.dark,
	},
});

const Stack = createNativeStackNavigator();

const App = () => {
	return (
		<DictProvider>
			<Main />
		</DictProvider>
	);
};

const Main = () => {
	const {loading, error} = useContext(DictContext);

	if (loading) {
		return (
			<SafeAreaView style={styles.page}>
				<ActivityIndicator size="large" color={Colors.light} />
			</SafeAreaView>
		);
	} else if (error) {
		Alert.alert(
			"Fatal Error",
			"Something went wrong! Please reload the app to try again.",
		);
		return <SafeAreaView style={styles.page} />;
	}

	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen
					name={Paths.home}
					component={HomeScreen}
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name={Paths.practiceMenu}
					component={PracticeMenu}
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name={Paths.lookupMenu}
					component={LookupMenu}
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name={Paths.lookupAkk}
					component={SearchScreen as React.FC<{}>}
					initialParams={{engl: false}}
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name={Paths.lookupEngl}
					component={SearchScreen as React.FC<{}>}
					initialParams={{engl: true}}
					options={{headerShown: false}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;
