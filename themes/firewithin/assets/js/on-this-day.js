document.addEventListener("DOMContentLoaded", (e) => {
	class FeedItem {
		constructor(itemElement) {
			this.item = itemElement;
		}

		get description() {
			return this.item.querySelector("description").firstChild.data;
		}

		get link() {
			return this.item.querySelector("link").firstChild.data;
		}

		get date() {
			return new Date(this.item.querySelector("pubDate").firstChild.data)
				.toISOString()
				.substr(0, 10);
		}
	}

	class Article {
		constructor(templateElement) {
			this.template = templateElement;
		}

		getCopy(feedItem) {
			console.log({ feedItem, template: this.template });
			const article = this.template.cloneNode(true);

			// sets contnet, link and date
			article.querySelector("div.e-content").innerHTML = feedItem.description;
			article.querySelector("a.log-card__link:not(.p-author)").href =
				feedItem.link;
			article.querySelector("time").innerHTML = feedItem.date;

			return article;
		}
	}
	const showOnThisDayEl = document
		.getElementById("show-on-this-day")
		.addEventListener("click", (e) => {
			const onThisDayEl = document.getElementById("on-this-day");

			if (!onThisDayEl.hidden) {
				return;
			}

			const parser = new DOMParser();
			const today = new Date();
			const logsUri = this.location.href + "index.xml";

			const templateEl = document.querySelector("article.log-card");
			const article = new Article(templateEl);

			fetch(logsUri)
				.then((x) => x.text())
				.then((logsTxt) => {
					const logsXml = parser.parseFromString(logsTxt, "text/xml");
					if (logsXml.getElementsByTagName("parsererror")?.length !== 0) {
						console.log(`Failed to load XML from ${logsUri}`);
						return;
					}
					const dateElements = logsXml.getElementsByTagName("pubDate");
					const articles = Array.from(dateElements)
						.filter((el) => {
							const elDate = new Date(el.innerHTML);
							return (
								elDate.getFullYear() !== today.getFullYear() &&
								elDate.getMonth() === today.getMonth() &&
								elDate.getDate() === today.getDate()
							);
						})
						.map((el) => new FeedItem(el.parentNode))
						.map((item) => article.getCopy(item));

					if (articles.length > 0) {
						articles.forEach((article) => {
							onThisDayEl.appendChild(article);
						});
					} else {
						const msgEl = document.createElement("p");
						msgEl.innerText = `No previous logs on this date (${
							today.getMonth() + 1
						}/${today.getDate()})`;
						onThisDayEl.appendChild(msgEl);
					}
					onThisDayEl.hidden = false;
				});
		});
});
