import React from "react";
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import {Colors, GlobalStyles} from "../styles";
import {Button} from "../components/Button";
import {NavProps, Paths} from "../nav";
import {InfoCard} from "../components/InfoCard";

type PracticeMenuProps = NavProps;

const styles = StyleSheet.create({
	page: {
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		...GlobalStyles.header2,
		marginTop: "8%",
	},
	descContainer: {
		marginTop: "15%",
		width: "60%",
	},
	desc: {
		...GlobalStyles.desc1,
	},
	buttonContainer: {
		marginTop: "15%",
		width: "60%",
	},
	buttonText: {
		...GlobalStyles.mediumButtonText,
	},
});

export const PracticeMenu: React.FC<PracticeMenuProps> = ({navigation}) => {
	const {width, height} = useWindowDimensions();
	const maxDim = Math.max(width, height);
	const pageStyle = height > width ? {height} : {flex: 1};

	return (
		<View style={pageStyle}>
			<ScrollView
				contentContainerStyle={[styles.page, {height: maxDim}]}
				style={GlobalStyles.scrollView}>
				<SafeAreaView>
					<Text style={styles.title}>Practice</Text>
				</SafeAreaView>
				<InfoCard style={styles.descContainer}>
					<Text style={styles.desc}>
						Practice translating Akkadian words into English and
						English words into Akkadian.
					</Text>
				</InfoCard>
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
			</ScrollView>
		</View>
	);
};
