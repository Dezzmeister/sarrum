import React from "react";
import {SafeAreaView, StyleSheet, Text} from "react-native";
import {Colors} from "../colors";
import {Button} from "../components/Button";
import {NavProps, Paths} from "../nav";

type PracticeMenuProps = NavProps;

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		fontSize: 50,
		fontWeight: "600",
		color: Colors.light,
		marginTop: "8%",
	},
	desc: {
		fontSize: 20,
		color: Colors.light,
		marginTop: "15%",
		width: "50%",
	},
	buttonContainer: {
		marginTop: "15%",
		width: "50%",
	},
	buttonText: {
		fontSize: 25,
		fontWeight: "normal",
	},
});

export const PracticeMenu: React.FC<PracticeMenuProps> = ({navigation}) => {
	return (
		<SafeAreaView style={styles.page}>
			<Text style={styles.title}>Practice</Text>
			<Text style={styles.desc}>
				Practice translating Akkadian words into English and English
				words into Akkadian.
			</Text>
			<Button
				title="Akkadian to English"
				onPress={() => navigation.navigate(Paths.practiceAkk)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
			<Button
				title="English to Akkadian"
				onPress={() => navigation.navigate(Paths.practiceEngl)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
		</SafeAreaView>
	);
};
