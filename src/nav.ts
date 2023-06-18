export type NavProps = {
	navigation: {
		navigate: (screen: string, props?: object) => void;
		goBack: () => void;
	};
};

export type ScreenProps<T extends object> = {
	route: {
		params: T;
	};
};

export const Paths = {
	home: "home",
	practiceMenu: "practice_menu",
	lookupMenu: "lookup_menu",
	settingsMenu: "settings_menu",
	lookupAkk: "lookup_akk",
	lookupEngl: "lookup_engl",
	practiceAkk: "practice_akk",
	practiceEngl: "practice_engl",
};
