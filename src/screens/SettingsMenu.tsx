import React, {useContext, useState} from "react";
import {Linking, StyleSheet, Text, View} from "react-native";
import {Colors} from "../colors";
import {NavProps} from "../nav";
import {DictContext} from "../dict/context";
import {InfoCard} from "../components/InfoCard";
import Slider from "@react-native-community/slider";
import {Button} from "../components/Button";
import {setLines} from "../cache";

type SettingsMenuProps = NavProps;

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		fontSize: 40,
		fontWeight: "400",
		color: Colors.light,
		marginTop: "8%",
		marginBottom: 10,
	},
	labelCard: {
		width: "80%",
		marginTop: "15%",
	},
	cardText: {
		fontSize: 15,
		color: Colors.light,
	},
	email: {
		fontSize: 15,
		color: Colors.linkBlue,
	},
	italic: {
		fontStyle: "italic",
	},
	slider: {
		width: "80%",
		height: 40,
	},
	valueCard: {
		width: "40%",
	},
	spacer: {
		flex: 1,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	descCard: {
		width: "80%",
	},
	smallButtonContainer: {
		marginBottom: 20,
	},
	smallButtonText: {
		fontSize: 12,
	},
});

export const SettingsMenu: React.FC<SettingsMenuProps> = ({navigation}) => {
	const {dict, reloadDict} = useContext(DictContext);
	const [linesValue, setLinesValue] = useState(dict!.totalLines);

	const onLinesValueChange = (value: number) => {
		setLinesValue(Math.floor(value));
	};

	const onSubmit = async () => {
		await setLines(linesValue);
		if (reloadDict) {
			reloadDict();
		}
		navigation.goBack();
	};

	const openContact = () => {
		Linking.openURL("mailto:dezzmeister16@gmail.com");
	};

	return (
		<View style={styles.page}>
			<Text style={styles.title}>Settings</Text>
			<InfoCard style={styles.labelCard}>
				<Text style={styles.cardText}>
					Set the number of Akkadian words to load from the
					dictionary. Lower this to train on a smaller subset of words
					until you're ready for more.
				</Text>
			</InfoCard>
			<Slider
				style={styles.slider}
				minimumValue={20}
				maximumValue={dict!.maxLines}
				thumbTintColor={Colors.light}
				minimumTrackTintColor={Colors.light}
				maximumTrackTintColor={Colors.light}
				value={linesValue}
				onValueChange={onLinesValueChange}
			/>
			<InfoCard style={styles.valueCard}>
				<Text style={styles.cardText}>{linesValue} words</Text>
			</InfoCard>
			<View style={styles.spacer}>
				<InfoCard style={styles.descCard}>
					<Text style={styles.cardText}>
						The definitions in the dictionary follow the lessons in
						John Huehnergard's book,{" "}
						<Text style={[styles.cardText, styles.italic]}>
							A Grammar of Akkadian
						</Text>
						. They're given in order of appearance, so that setting
						the slider to 20 words will give only the first 20 fully
						declined words from the vocab in the book. Definitions
						from the book are added on a regular basis. If you have
						questions or if you find an error, please email{" "}
						<Text style={styles.email} onPress={openContact}>
							dezzmeister16@gmail.com
						</Text>
						.
					</Text>
				</InfoCard>
			</View>
			<Button
				title="Save"
				onPress={onSubmit}
				containerStyle={styles.smallButtonContainer}
				textStyle={styles.smallButtonText}
			/>
		</View>
	);
};
