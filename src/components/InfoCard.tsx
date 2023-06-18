import React from "react";
import {StyleSheet, View} from "react-native";
import {Colors} from "../colors";

export type InfoCardProps = {
	children: React.ReactNode;
	style: object;
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.dark,
		color: Colors.light,
		borderWidth: 2,
		borderRadius: 10,
		borderColor: Colors.light,
		padding: 8,
	},
});

export const InfoCard: React.FC<InfoCardProps> = ({children, style}) => {
	return <View style={[styles.card, style]}>{children}</View>;
};
