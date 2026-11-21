/**
 * Article links must be web links: a `javascript:` or `data:` link in an href would run in our
 * site when clicked. Returns the link (with https:// added if no scheme was typed), or null when
 * it isn't an http(s) link. Used to validate on submit and again when rendering.
 */
export const toWebLink = (raw: string | null | undefined): string | null => {
	const s = (raw ?? "").trim();
	if (!s) return null;
	const withScheme = /^[a-z][a-z\d+.-]*:/i.test(s) ? s : `https://${s}`;
	try {
		const url = new URL(withScheme);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		if (!url.hostname.includes(".")) return null;
		return withScheme;
	} catch {
		return null;
	}
};

export const WEB_LINK_MESSAGE = "Enter a web link, like https://example.com/article";
