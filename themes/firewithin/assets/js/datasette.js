window.addEventListener("load", (event) => {
	getCovidDeaths();
});

function getCovidDeaths() {
	const url =
		"https://data.alexbilson.dev/medical_examiner_case_archive__covid19_related_deaths.json?sql=select%0D%0A++death_date%2C%0D%0A++age%2C%0D%0A++latino%2C%0D%0A++gender%2C%0D%0A++race%2C%0D%0A++primarycause%2C%0D%0A++incident_street%2C%0D%0A++incident_city%0D%0Afrom%0D%0A++medical_examiner_case_archive__covid19_related_deaths%0D%0Awhere%0D%0A++death_date+%3E%3D+date%28%27now%27%2C+%27-1+days%27%29%0D%0Aorder+by%0D%0A++death_date+desc";

	const rowIndex = {
		death_date: 0,
		age: 1,
		latino: 2,
		gender: 3,
		race: 4,
		primarycause: 5,
		incident_street: 6,
		incident_city: 7,
	};

	var hasData = false;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			hasData = data.rows.length > 0;
			var el = document.getElementById("deaths");

			// create list
			data.rows.map((r) => {
				var item = document.createElement("li");

				var date = getDate(r[rowIndex.death_date]);
				console.log(`This data is accurate as of ${date}`);

				var age = r[rowIndex.age];
				var gender = getGender(r[rowIndex.gender]);
				var race = getRace(r[rowIndex.race], r[rowIndex.latino]);
				var cause = getCause(r[rowIndex.primarycause]);
				var address = getAddress(
					r[rowIndex.incident_street],
					r[rowIndex.incident_city]
				);

				item.innerText = `
a ${age}-year-old ${race} ${gender} ${cause}${address}.
        `.trim();

				el.appendChild(item);
			});

			if (hasData) {
				document.getElementById("covid").style = "display: inherit;";
			}
		});
}

function getDate(val) {
	var months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	var d = new Date(val);
	return `${months[d.getMonth()]} ${d.getDay() + 1}`;
}

function getGender(val) {
	switch (val.toLowerCase().trim()) {
		case "female":
			return "woman";
		case "male":
			return "man";
		default:
			return "person";
	}
}

function getRace(val, latino) {
	var race = val.toLowerCase().trim();
	if (["other", "unknown"].includes(race)) {
		return "";
	}
	if (latino) {
		return "latino";
	}
	return race;
}

function getCause(val) {
	var cause = val.toLowerCase().trim();
	if (cause) {
		return `died of ${cause}`;
	}
	return "died";
}

function getAddress(addr, city) {
	if (!addr && !city) {
		return "";
	}

	var first = "";
	var second = "";

	if (addr) {
		first = titleCase(addr);
	}
	if (city) {
		second = titleCase(city);
	}

	return ` at ${first}, ${second}`;
}

function titleCase(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map(function (word) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}
