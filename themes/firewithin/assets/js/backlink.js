document.addEventListener("DOMContentLoaded", (e) => {
	class PageParser {
		elementTypes = [
			"h1",
			"h2",
			"h3",
			"h4", // headers
			"p", // paragraphs
			"ol",
			"ul",
			"li", // lists
		];

		constructor(parser) {
			this.parser = parser;
		}

		parsePageToPreview(text) {
			const pageDOM = this.parser.parseFromString(text, "text/html");
			const contentElement = pageDOM.querySelector(".e-content");

			if (contentElement) {
				const filtered = this._filterElements(
					contentElement.children,
					this.elementTypes
				);
				const appended = this._appendEllipsis(
					filtered,
					contentElement.childElementCount
				);
				return appended;
			} else {
				const missing = document.createElement("p");
				missing.text = "no content found";
				return [missing];
			}
		}

		parsePageToSummary(text, name) {
			const pageDOM = this.parser.parseFromString(text, "text/html");
			var elements = pageDOM.getElementsByName(name);
			const contentElement = elements
				? this._firstParentWithSibling(elements[0].parentElement)
				: null;
			const context = [
				contentElement.previousElementSibling,
				contentElement,
				contentElement.nextElementSibling,
			];

			if (context) {
				const filtered = this._filterElements(context, this.elementTypes);
				const alt = this._addAlternativeContainers(filtered);
				return alt;
			} else {
				const missing = document.createElement("p");
				missing.text = "no content found";
				return [missing];
			}
		}

		_firstParentWithSibling(element) {
			return element.previousElementSibling || element.nextElementSibling
				? element
				: this._firstParentWithSibling(element.parentElement);
		}

		_filterElements(elements, elementTypes) {
			const validElements = Array.from(elements).filter((el) =>
				el ? elementTypes.includes(el.localName) : false
			);
			const startIndex =
				this.paragraphIndex && this.paragraphIndex < validElements.length
					? this.paragraphIndex
					: 0;
			const endIndex =
				validElements.length - startIndex > 3
					? startIndex + 3
					: validElements.length;
			return Array.from(validElements).slice(startIndex, endIndex);
		}

		_addAlternativeContainers(elements) {
			// adds a ul for a bare set of li
			if (elements.every((el) => el.localName === "li")) {
				const ul = document.createElement("ul");
				elements.forEach((el) => ul.appendChild(el));
				return [ul];
			}
			return elements;
		}

		_appendEllipsis(elements, total) {
			if (elements.length < total) {
				const ellipsisElement = document.createElement("p");
				ellipsisElement.innerText = "...";
				elements.push(ellipsisElement);
			}
			return elements;
		}
	}

	class BackRef {
		static linkClass = "backref";

		get paragraphIndex() {
			return this.el.dataset.paragraph
				? int(this.el.dataset.paragraphNumber) - 1
				: null;
		}

		get url() {
			return this.el.href;
		}

		constructor(el, parser) {
			if (!el || !parser) throw "wtf!";
			this.el = el;
			this.parser = parser;
		}

		insertPreviewAsync() {
			return fetch(this.url)
				.then((resp) => (resp.status === 200 ? resp.text() : null))
				.then((text) => {
					if (text === null) return null;
					const elements = this.parser.parsePageToPreview(text);
					const popup = this._createPreview(elements);
					this._insertPreviewAfterLink(popup);
				});
		}

		_createPreview(elements) {
			const popup = document.createElement("div");
			popup.classList.add("backref__popup");
			elements.forEach((el) => popup.appendChild(el));
			return popup;
		}

		_insertPreviewAfterLink(popup) {
			this.el.insertAdjacentElement("afterend", popup);
		}
	}

	class Backlink {
		static linkClass = "backref-card__link";

		get url() {
			return this.el.href;
		}

		get name() {
			const urlParts = document.URL.split("/");
			return urlParts[urlParts.length - 2];
		}

		constructor(el, parser) {
			this.el = el;
			this.parser = parser;
		}

		insertSummaryAsync() {
			return fetch(this.url)
				.then((resp) => (resp.status === 200 ? resp.text() : null))
				.then((text) => {
					if (text === null) return null;
					const elements = this.parser.parsePageToSummary(text, this.name);
					const summary = this._createSummary(elements);
					return this._insertSummaryAfterAttributes(summary);
				});
		}

		_createSummary(elements) {
			const summary = document.createElement("div");
			summary.classList.add("backref-card__content");
			elements.forEach((el) => summary.appendChild(el));
			return summary;
		}

		_insertSummaryAfterAttributes(popup) {
			console.log(this.el);
			return this.el.parentElement.insertAdjacentElement("afterend", popup);
		}
	}

	// adds backlink popup as a hidden child element to all links marked internal
	// if the viewport is wider than a cell phone
	const widerThanPhone = window.matchMedia(
		"screen and (min-width:40.063em)"
	).matches;

	var parser = new PageParser(new DOMParser());

	if (widerThanPhone) {
		const backrefElements = document.querySelectorAll(`a.${BackRef.linkClass}`);

		// inserts previews for all backref hyperlinks
		backrefs = Array.from(backrefElements).map((el) => new BackRef(el, parser));
		const refResp$ = backrefs.map((l) => l.insertPreviewAsync());
		Promise.allSettled(refResp$).then((resp) => {
			const fulfilled = resp.filter((p) => p.status === "fulfilled").length;
			console.log(
				`backref previews inserted: ${fulfilled}\nbacklink previews errored: ${
					resp.length - fulfilled
				}`
			);
		});
	}

	const backlinkElements = document.querySelectorAll(`a.${Backlink.linkClass}`);

	// inserts summaries for all backlink cards at the bottom of the page
	backlinks = Array.from(backlinkElements).map(
		(el) => new Backlink(el, parser)
	);
	const linkResp$ = backlinks.map((l) => l.insertSummaryAsync());
	Promise.allSettled(linkResp$).then((resp) => {
		const fulfilled = resp.filter((p) => p.status === "fulfilled").length;
		console.log(
			`backlink summaries inserted: ${fulfilled}\nbacklink summaries errored: ${
				resp.length - fulfilled
			}`
		);
	});
});
