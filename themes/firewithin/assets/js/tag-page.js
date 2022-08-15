document.addEventListener("DOMContentLoaded", (e) => {
	// fires on every page load, reading the form values
	// from the query string, updating the dropdowns and
	// applying the filter to the list
	const params = new URLSearchParams(window.location.search);
	const minimum = params.get("minimum");

	if (minimum) {
		const getOptions = (name) => {
			return Array.from(
				document
					.getElementById("term-form")
					.querySelector(`select[name="${name}"]`)
					.querySelectorAll("option")
			);
		};
		// select the options from query string
		getOptions("minimum").find((o) => o.value === minimum).selected = true;

		const terms = Array.from(
			document.getElementById("terms-list").querySelectorAll("div")
		);

		if (!minimum || !terms || terms.length === 0) {
			console.warn("failed to retrieve terms data from page");
			console.warn({ minimum, terms });
			return;
		}
		terms.forEach((el) => {
			var txt = el.childNodes[0].childNodes[1].innerText;
			var txtSum = txt
				.slice(1, -1)
				.split("/")
				.reduce((p, c) => Number(p) + Number(c));
			if (txtSum <= minimum) {
				el.hidden = true;
			}
		});
	}
});
