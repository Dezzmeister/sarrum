import React, {useEffect, useState} from "react";
import {
	NativeSyntheticEvent,
	StyleSheet,
	TextInput,
	View,
	TextInputSelectionChangeEventData,
} from "react-native";
import {Colors} from "../colors";
import {Button} from "../components/Button";

export type AkkadianInputProps = TextInput["props"] & {
	style?: object;
	inputStyle?: object;
	toolbarStyle?: object;
	buttonContainerStyle?: object;
	buttonTextStyle?: object;
};

type Selection = {
	start: number;
	end: number;
};

const styles = StyleSheet.create({
	textInput: {
		backgroundColor: Colors.dark,
		color: Colors.light,
		borderWidth: 1,
		borderColor: Colors.light,
		height: 40,
		borderRadius: 10,
		marginBottom: 10,
	},
	toolbar: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	buttonContainer: {
		marginLeft: 3,
		marginRight: 3,
		marginBottom: 3,
	},
	buttonText: {
		fontSize: 16,
	},
});

function substChar(
	text: string,
	start: number,
	end: number,
	ch: string,
): string {
	const part1 = start === 0 ? "" : text.substring(0, start);
	const part2 = text.substring(end);

	return part1 + ch + part2;
}

/**
 * TextInput with a toolbar below the text input containing some Akkadian IPA letters.
 *
 * TODO: A toolbar positioned above the keyboard (that disappears when the keyboard is dismissed)
 * would be nice. Unfortunately with GBoard there is already a toolbar, whose height is not
 * accounted for when RN calculates the keyboard height, so the Akkadian toolbar ends
 * up behind the GBoard toolbar. Not every Android has GBoard so it's not feasible to just
 * add a constant to the toolbar's position.
 */
export const AkkadianInput = React.forwardRef<TextInput, AkkadianInputProps>(
	(props, ref) => {
		const {
			inputStyle,
			toolbarStyle,
			buttonContainerStyle,
			buttonTextStyle,
			style: containerStyle,
			onSelectionChange,
			onChangeText,
			value,
			selection,
			...rest
		} = props;
		const [sel, setSel] = useState<Selection>({start: 0, end: 0});
		const [nextSel, setNextSel] = useState<Selection | undefined>(
			undefined,
		);
		const [text, setText] = useState("");

		// If one of the Akkadian keys is pressed, we need to update the text selection,
		// but only for one render cycle. Feeding the selection back into the TextInput
		// on every render cycle causes the selection to jump between the old selection and the
		// new selection
		useEffect(() => {
			if (!nextSel) {
				return;
			}

			setNextSel(undefined);
		}, [nextSel]);

		useEffect(() => {
			if (value !== undefined) {
				setText(value);
			}
		}, [value]);

		const newOnSelectionChange = (
			event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
		) => {
			if (onSelectionChange) {
				onSelectionChange(event);
			}

			setSel(event.nativeEvent.selection);
		};

		const newOnChangeText = (txt: string) => {
			if (onChangeText) {
				onChangeText(txt);
			}

			setText(txt);
		};

		const simulateKeypress = (key: string) => {
			const subst = substChar(text, sel.start, sel.end, key);
			newOnChangeText(subst);
			setNextSel({start: sel.start + 1, end: sel.start + 1});
		};

		return (
			<View style={containerStyle}>
				<TextInput
					{...rest}
					style={[styles.textInput, inputStyle]}
					onSelectionChange={newOnSelectionChange}
					onChangeText={newOnChangeText}
					value={value !== undefined ? value : text}
					selection={selection || nextSel}
					ref={ref}
				/>
				<View style={[styles.toolbar, toolbarStyle]}>
					<Button
						title="š"
						onPress={() => simulateKeypress("š")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ṣ"
						onPress={() => simulateKeypress("ṣ")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ṭ"
						onPress={() => simulateKeypress("ṭ")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ẖ"
						onPress={() => simulateKeypress("ẖ")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ā"
						onPress={() => simulateKeypress("ā")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="â"
						onPress={() => simulateKeypress("â")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ē"
						onPress={() => simulateKeypress("ē")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ê"
						onPress={() => simulateKeypress("ê")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ī"
						onPress={() => simulateKeypress("ī")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="î"
						onPress={() => simulateKeypress("î")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="ū"
						onPress={() => simulateKeypress("ū")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
					<Button
						title="û"
						onPress={() => simulateKeypress("û")}
						containerStyle={[
							styles.buttonContainer,
							buttonContainerStyle,
						]}
						textStyle={[styles.buttonText, buttonTextStyle]}
					/>
				</View>
			</View>
		);
	},
);
