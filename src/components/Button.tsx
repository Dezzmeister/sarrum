import React from "react";
import {
	StyleSheet,
	TouchableOpacity,
	Text,
	GestureResponderEvent,
} from "react-native";
import {Colors} from "../styles";

export type ButtonProps = {
	title: string;
	onPress: ((event: GestureResponderEvent) => void) | undefined;
	containerStyle?: object;
	textStyle?: object;
};

const styles = StyleSheet.create({
	buttonContainer: {
		elevation: 8,
		backgroundColor: Colors.light,
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	buttonText: {
		fontSize: 18,
		color: Colors.dark,
		fontWeight: "bold",
		alignSelf: "center",
	},
});

export const Button: React.FC<ButtonProps> = props => {
	return (
		<TouchableOpacity
			onPress={props.onPress}
			style={[styles.buttonContainer, props.containerStyle]}>
			<Text style={[styles.buttonText, props.textStyle]}>
				{props.title}
			</Text>
		</TouchableOpacity>
	);
};
