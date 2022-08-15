function hide(e) {
	document.querySelector("section").classList.add("hide");

	const menuEls = document.getElementById("navbar").querySelectorAll("div");

	Array.from(menuEls).map((el) => el.classList.add("reveal"));

	e.target.innerText = "HIDE";
}

function reveal(e) {
	document.querySelector("section").classList.remove("hide");

	const menuEls = document.getElementById("navbar").querySelectorAll("div");

	Array.from(menuEls).map((el) => el.classList.remove("reveal"));

	e.target.innerText = "MENU";
}

document.addEventListener("DOMContentLoaded", (e) => {
	const buttonEl = document.getElementById("navtoggle");

	buttonEl.addEventListener("click", (e) =>
		e.target.innerText === "MENU" ? hide(e) : reveal(e)
	);
});
