import {StyleSheet} from "react-native";

export const Colors = {
	light: "#FCE09B",
	lightFaded: "#867F72",
	dark: "#111321",
	linkBlue: "#0066CC",
};

export const GlobalStyles = StyleSheet.create({
	bigButtonText: {
		fontSize: 32,
	},
	mediumButtonText: {
		fontSize: 22,
	},
	buttonText: {
		fontSize: 16,
	},
	smallButtonText: {
		fontSize: 11,
	},
	header1: {
		fontSize: 80,
		fontWeight: "700",
		color: Colors.light,
	},
	header2: {
		fontSize: 50,
		fontWeight: "600",
		color: Colors.light,
	},
	header3: {
		fontSize: 40,
		fontWeight: "400",
		color: Colors.light,
	},
	desc1: {
		fontSize: 20,
		color: Colors.light,
	},
	scrollView: {
		backgroundColor: Colors.dark,
	},
});
