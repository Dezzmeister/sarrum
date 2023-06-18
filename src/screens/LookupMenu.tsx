import React from "react";
import {SafeAreaView, StyleSheet, Text} from "react-native";
import {Colors} from "../colors";
import {Button} from "../components/Button";
import {NavProps, Paths} from "../nav";

type LookupMenuProps = NavProps;

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

export const LookupMenu: React.FC<LookupMenuProps> = ({navigation}) => {
	return (
		<SafeAreaView style={styles.page}>
			<Text style={styles.title}>Lookup</Text>
			<Text style={styles.desc}>
				Look up a word or phrase's definition in Akkadian or English.
			</Text>
			<Button
				title="Lookup Akkadian"
				onPress={() => navigation.navigate(Paths.lookupAkk)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
			<Button
				title="Lookup English"
				onPress={() => navigation.navigate(Paths.lookupEngl)}
				containerStyle={styles.buttonContainer}
				textStyle={styles.buttonText}
			/>
		</SafeAreaView>
	);
};
