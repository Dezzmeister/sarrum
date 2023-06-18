import React from "react";
import {Image, SafeAreaView, StyleSheet, Text} from "react-native";
import {Colors} from "../colors";
import {Button} from "../components/Button";
import {NavProps, Paths} from "../nav";

type HomeScreenProps = NavProps;

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		fontSize: 80,
		fontWeight: "700",
		color: Colors.light,
		marginTop: "8%",
	},
	buttonContainer: {
		marginTop: "15%",
		width: "50%",
	},
	buttonText: {
		fontSize: 40,
	},
});

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
	return (
		<SafeAreaView style={styles.page}>
			<Text style={styles.title}>šarrum</Text>
			<Image source={require("../../assets/king.jpg")} />
			<Button
				title="Practice"
				onPress={() => navigation.navigate(Paths.practiceMenu)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
			<Button
				title="Lookup"
				onPress={() => navigation.navigate(Paths.lookupMenu)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
		</SafeAreaView>
	);
};
