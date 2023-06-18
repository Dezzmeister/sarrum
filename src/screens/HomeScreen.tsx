import React from "react";
import {
	Image,
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

type HomeScreenProps = NavProps;

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		backgroundColor: Colors.dark,
		padding: 0,
		margin: 0,
	},
	title: {
		...GlobalStyles.header1,
		marginTop: "8%",
	},
	buttonContainer: {
		marginTop: "10%",
		width: "50%",
	},
	buttonText: {
		...GlobalStyles.bigButtonText,
	},
	spacer: {
		flex: 1,
	},
	smallButtonContainer: {
		marginBottom: 20,
	},
	smallButtonText: {
		...GlobalStyles.smallButtonText,
	},
});

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
	const {width, height} = useWindowDimensions();
	const maxDim = Math.max(width, height);
	const pageStyle = height > width ? {height} : {flex: 1};

	return (
		<View style={pageStyle}>
			<ScrollView
				contentContainerStyle={[styles.page, {height: maxDim}]}
				style={GlobalStyles.scrollView}>
				<SafeAreaView>
					<Text style={styles.title}>šarrum</Text>
				</SafeAreaView>
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
			</ScrollView>
		</View>
	);
};
