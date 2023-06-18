import React from "react";
import {Image, SafeAreaView, StyleSheet, Text, View} from "react-native";
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
	spacer: {
		flex: 1,
	},
	smallButtonContainer: {
		marginBottom: 20,
	},
	smallButtonText: {
		fontSize: 12,
	},
});

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
	return (
		<SafeAreaView style={styles.page}>
			<Text style={styles.title}>šarrum</Text>
			<Image source={require("../../assets/images/king.jpg")} />
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
			<View style={styles.spacer} />
			<Button
				title="Settings"
				onPress={() => navigation.navigate(Paths.settingsMenu)}
				containerStyle={styles.smallButtonContainer}
				textStyle={styles.smallButtonText}
			/>
		</SafeAreaView>
	);
};
