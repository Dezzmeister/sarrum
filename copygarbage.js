const fs = require("fs");

const txt = `<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android"
    android:insetLeft="@dimen/abc_edit_text_inset_horizontal_material"
    android:insetRight="@dimen/abc_edit_text_inset_horizontal_material"
    android:insetTop="@dimen/abc_edit_text_inset_top_material"
    android:insetBottom="@dimen/abc_edit_text_inset_bottom_material">
    <selector> </selector>
</inset>`;

// I hate gradle, groovy, and everything that gradle stands for
function build() {
	fs.mkdirSync("android/app/src/main/res/drawable");
	fs.writeFileSync("android/app/src/main/res/drawable/rn_edit_text_material.xml", txt);

	const storePasswd = fs.readFileSync("store_passwd.txt").toString().trim();
	const keyPasswd = fs.readFileSync("key_passwd.txt").toString().trim();

	const gradleCrapPath = "android/app/build.gradle";
	const gradleCrapContents = fs.readFileSync(gradleCrapPath).toString();

	const replaced = gradleCrapContents.replace("<store_passwd>", storePasswd).replace("<key_passwd>", keyPasswd);

	fs.writeFileSync(gradleCrapPath, replaced);
}

build();
