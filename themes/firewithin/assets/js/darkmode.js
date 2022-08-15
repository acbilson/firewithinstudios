document.addEventListener("DOMContentLoaded", (e) => {
	class ThemeSwitch {
		themeAttr = "color-mode";

		get stored() {
			return localStorage.getItem(this.themeAttr);
		}

		constructor(el) {
			this.el = el;
		}

		onSelect(event) {
			const selectedTheme = event.target.querySelector("option:checked").value;
			this.setTheme(selectedTheme);
			this.setCommentTheme(selectedTheme);
		}

		setOptionFromStore() {
			if (this.stored) {
				this.el.querySelector(`option[value='${this.stored}']`).selected = true;
			}
		}

		setTheme(selectedTheme) {
			document.documentElement.setAttribute(this.themeAttr, selectedTheme);
			localStorage.setItem(this.themeAttr, selectedTheme);
		}

		setCommentTheme(selectedTheme) {
			if (window.REMARK42) {
				switch (selectedTheme) {
					case "void":
						window.REMARK42.changeTheme("dark");
						break;
					case "jungle":
					case "minimal":
					case "fall":
					default:
						window.REMARK42.changeTheme("light");
						break;
				}
			}
		}
	}

	const el = document.getElementById("nav-switch");
	const themeSelector = new ThemeSwitch(el);
	themeSelector.setOptionFromStore();

	el.addEventListener("change", (e) => themeSelector.onSelect(e));
});

