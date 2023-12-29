import React, {useContext, useState} from "react";
import {
	Linking,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import {Colors, GlobalStyles} from "../styles";
import {NavProps} from "../nav";
import {DictContext} from "../dict/context";
import {InfoCard} from "../components/InfoCard";
import Checkbox from "@react-native-community/checkbox";
import {Button} from "../components/Button";
import {setSections} from "../cache";
import type {Dictionary, Section} from "../dict/dict";
import {Consts} from "../consts";

type SettingsMenuProps = NavProps;

type SectionCardProps = {
    num: number;
    name: string;
    active: boolean;
    onChecked: (isChecked: boolean) => void;
};

const styles = StyleSheet.create({
	page: {
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		...GlobalStyles.header3,
		marginTop: 0,
		marginBottom: 10,
	},
	labelCard: {
		width: "80%",
		marginTop: "8%",
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
	bold: {
		fontWeight: "bold",
	},
	slider: {
		width: "80%",
		height: 40,
	},
	valueCard: {
		width: "40%",
        marginTop: 15,
        marginBottom: 15,
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
		marginTop: 30,
		marginBottom: 30,
        marginLeft: 7,
        marginRight: 7,
	},
	smallButtonText: {
		fontSize: 12,
	},
    sectionCard: {
        width: "70%",
        marginTop: 15,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    sectionCardText: {
        color: Colors.light,
        fontSize: 15,
        fontWeight: "bold",
        flex: 1,
        flexWrap: "wrap"
    },
    buttonBox: {
        display: "flex",
        flexDirection: "row",
    },
});

type SectionEntry = {
    section: Section;
    active: boolean;
};

function getSectionEntries(allSections: readonly Section[], dict: Dictionary): SectionEntry[] {
    const out: SectionEntry[] = [];
    const sectionNums = dict.sections.map(s => s.num);

    for (const section of allSections) {
        const entry: SectionEntry = {
            section,
            active: sectionNums.includes(section.num),
        };

        out.push(entry);
    }

    return out;
}

const SectionCard: React.FC<SectionCardProps> = ({ num, name, active, onChecked }) => {
    return (
        <InfoCard style={styles.sectionCard}>
            <Checkbox 
                value={active} 
                onValueChange={value => onChecked(value)} 
                // TODO: ios
                tintColors={{true: Colors.light, false: Colors.lightFaded}}
            />
            <Text style={styles.sectionCardText}>
                {name}
            </Text>
        </InfoCard>
    );
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({navigation}) => {
	const {allSections, dict, reloadDict} = useContext(DictContext);
	const {width, height} = useWindowDimensions();
	const maxDim = Math.max(width, height);
	const pageStyle = height > width ? {height} : {flex: 1};
    const [sectionsValue, setSectionsValue] = useState(getSectionEntries(allSections!, dict!));

	const onSubmit = async () => {
        const activeSections = sectionsValue.filter(s => s.active).map(s => s.section.num);

        await setSections(activeSections);
        await reloadDict();
		navigation.goBack();
	};

    const onResetToDefault = async () => {
        const activeSections = allSections!.map(s => s.num);

        await setSections(activeSections);
        await reloadDict();
        navigation.goBack();
    };

	const openContact = () => {
		Linking.openURL("mailto:dezzmeister16@gmail.com");
	};

    const renderSections = () => {
        return sectionsValue.map((section, i) => (
            <SectionCard
                key={i}
                num={section.section.num}
                name={section.section.name}
                active={section.active}
                onChecked={checked => {
                    setSectionsValue(oldSections => {
                        const newSections = [...oldSections];

                        newSections[i] = {...oldSections[i], active: checked};
                        return newSections;
                    });
                }}
            />
        ));
    };

    const lines = sectionsValue.reduce<number>((a, x) => a + (x.active ? x.section.size : 0), 0);

	return (
		<View style={pageStyle}>
			<ScrollView
				contentContainerStyle={[styles.page, {minHeight: maxDim}]}
				style={GlobalStyles.scrollView}>
				<SafeAreaView>
					<Text style={styles.title}>Settings</Text>
				</SafeAreaView>
                <InfoCard style={styles.descCard}>
                    <Text style={styles.cardText}>
                        The definitions in the dictionary follow the lessons
                        in John Huehnergard's book,{" "}
                        <Text style={[styles.cardText, styles.italic]}>
                            A Grammar of Akkadian
                        </Text>
                        . They're organized by the lesson in which they're
                        introduced, so you can select which lessons you want
                        to practice. Definitions from the book are added on a
                        regular basis. If you have questions or if you find
                        an error, please email{" "}
                        <Text style={styles.email} onPress={openContact}>
                            dezzmeister16@gmail.com
                        </Text>
                        .
                    </Text>
                </InfoCard>
                {renderSections()}
				<InfoCard style={styles.valueCard}>
					<Text style={styles.cardText}>{lines} words</Text>
				</InfoCard>
				<View style={styles.spacer}>
					<InfoCard style={styles.descCard}>
						<Text style={[styles.cardText, styles.bold]}>
							Privacy Statement
						</Text>
						<Text style={styles.cardText}>
							This app does not collect, store, or handle any user
							data.
						</Text>
					</InfoCard>
				</View>
                <View style={styles.buttonBox}>
                    <Button
                        title="Save"
                        onPress={onSubmit}
                        containerStyle={styles.smallButtonContainer}
                        textStyle={styles.smallButtonText}
                        disabled={lines === 0}
                    />
                    <Button
                        title="Reset to Default"
                        onPress={onResetToDefault}
                        containerStyle={styles.smallButtonContainer}
                        textStyle={styles.smallButtonText}
                    />
                </View>
			</ScrollView>
		</View>
	);
};
