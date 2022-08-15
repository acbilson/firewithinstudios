document.addEventListener("DOMContentLoaded", (e) => {
	class NoteCard {
		get epistemic() {
			return this.el.dataset.epistemic;
		}

		get folder() {
			return this.el.dataset.folder;
		}

		constructor(el) {
			this.el = el;
		}

		toggleVisibility(selectedEpistemic, selectedFolder) {
			const applyEpistemicFilter = selectedEpistemic !== "all";
			const applyFolderFilter = selectedFolder !== "all";

			if (applyEpistemicFilter && applyFolderFilter) {
				if (
					this.epistemic === selectedEpistemic &&
					this.folder === selectedFolder
				) {
					this.el.style.display = "block";
				} else {
					this.el.style.display = "none";
				}
			} else if (applyEpistemicFilter) {
				this.el.style.display =
					this.epistemic === selectedEpistemic ? "block" : "none";
			} else if (applyFolderFilter) {
				this.el.style.display =
					this.folder === selectedFolder ? "block" : "none";
			} else {
				this.el.style.display = "block";
			}
		}
	}

	// fires on every page load, reading the form values
	// from the query string, updating the dropdowns and
	// applying the filter to the list
	const params = new URLSearchParams(window.location.search);
	const epistemic = params.get("epistemic");
	const category = params.get("category");

	if (epistemic && category) {
		const getOptions = (name) => {
			return Array.from(
				document
					.getElementById("note-form")
					.querySelector(`select[name="${name}"]`)
					.querySelectorAll("option")
			);
		};
		// select the options from query string
		getOptions("epistemic").find((o) => o.value === epistemic).selected = true;
		getOptions("category").find((o) => o.value === category).selected = true;

		const notes = Array.from(
			document.getElementById("notes-list").querySelectorAll("li")
		).map((el) => new NoteCard(el));

		if (!notes || notes.length === 0) {
			console.warn("failed to retrieve note-form data from page");
			console.warn({ epistemic, category, notes });
			return;
		}
		notes.forEach((note) => note.toggleVisibility(epistemic, category));
	}
});
