import { BANNER_HEIGHT_EXTEND } from "../constants/constants";

let hero: HTMLElement | null;
let topRow: HTMLElement | null;
let toc: HTMLElement | null;
let backToTop: HTMLElement | null;
let heroHeight = 0;
let frame = 0;
let transitioning = false;
let previousHeight = 0;
let previousScroll = 0;
let hooksBound = false;
let lastNavigation: boolean | undefined;
let lastScrolled: boolean | undefined;
let lastBackToTop: boolean | undefined;

function render() {
	frame = 0;
	if (transitioning) return;
	const scroll = window.scrollY;
	const navigationVisible = !heroHeight || scroll > heroHeight * 0.7;
	const scrolled = !heroHeight || scroll > heroHeight - 80;
	const showBackToTop = scroll > (heroHeight || window.innerHeight * 0.35);
	if (navigationVisible !== lastNavigation) {
		topRow?.classList.toggle("navbar-hidden", !navigationVisible);
		toc?.classList.toggle("toc-hide", !navigationVisible);
		lastNavigation = navigationVisible;
	}
	if (scrolled !== lastScrolled) {
		document.body.classList.toggle("scrolled", scrolled);
		lastScrolled = scrolled;
	}
	if (showBackToTop !== lastBackToTop) {
		backToTop?.classList.toggle("hide", !showBackToTop);
		lastBackToTop = showBackToTop;
	}
}

function schedule() {
	if (!frame) frame = requestAnimationFrame(render);
}

function measure() {
	heroHeight = hero && !hero.classList.contains("hidden") ? hero.offsetHeight : 0;
	let offset = Math.floor(window.innerHeight * BANNER_HEIGHT_EXTEND / 100);
	offset -= offset % 4;
	document.documentElement.style.setProperty("--banner-height-extend", `${offset}px`);
	schedule();
}

const resizeObserver = new ResizeObserver(measure);
function refresh() {
	resizeObserver.disconnect();
	hero = document.getElementById("hero-banner");
	topRow = document.getElementById("top-row");
	toc = document.getElementById("toc-wrapper");
	backToTop = document.getElementById("back-to-top-btn");
	lastNavigation = lastScrolled = lastBackToTop = undefined;
	if (hero) resizeObserver.observe(hero);
	document.getElementById("banner")?.classList.remove("opacity-0", "scale-105");
	measure();
}

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", measure, { passive: true });
window.addEventListener("pageshow", refresh);
refresh();

function setupSwup() {
	if (hooksBound || !window.swup?.hooks) return;
	hooksBound = true;
	const hooks = window.swup.hooks;
	hooks.on("link:click", () => {
		previousScroll = window.scrollY;
		previousHeight = heroHeight;
		document.documentElement.style.setProperty("--content-delay", "0ms");
	});
	hooks.on("visit:start", () => {
		transitioning = true;
		if (topRow) topRow.style.transition = "none";
		document.getElementById("page-height-extend")?.classList.remove("hidden");
		document.getElementById("toc-wrapper")?.classList.add("toc-not-ready");
	});
	hooks.on("content:replace", () => {
		refresh();
		requestAnimationFrame(() => {
			const contentTop = Math.max(0, heroHeight - 80);
			const wasInHero = previousHeight > 0 && previousScroll < previousHeight - 80;
			const position = wasInHero
				? Math.min(previousScroll / previousHeight * heroHeight, contentTop)
				: contentTop;
			window.scrollTo({ top: position, behavior: "instant" });
		});
	});
	hooks.on("visit:end", () => {
		document.getElementById("page-height-extend")?.classList.add("hidden");
		document.getElementById("toc-wrapper")?.classList.remove("toc-not-ready");
		transitioning = false;
		refresh();
		schedule();
		requestAnimationFrame(() => { if (topRow) topRow.style.transition = ""; });
	});
}
if (window.swup?.hooks) setupSwup();
else document.addEventListener("swup:enable", setupSwup, { once: true });

document.addEventListener("click", (event) => {
	const target = event.target;
	if (!(target instanceof Node)) return;
	for (const [panelId, buttonId] of [["display-setting", "display-settings-switch"], ["nav-menu-panel", "nav-menu-switch"]]) {
		const panel = document.getElementById(panelId);
		const button = document.getElementById(buttonId);
		if (!panel?.contains(target) && !button?.contains(target)) panel?.classList.add("float-panel-closed");
	}
});

let viewer: Promise<typeof import("./lightbox")> | undefined;
document.addEventListener("click", async (event) => {
	if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
	if (!(event.target instanceof Element)) return;
	const image = event.target.closest<HTMLImageElement>(".custom-md img, #post-cover img");
	if (!image) return;
	event.preventDefault();
	image.setAttribute("aria-busy", "true");
	try {
		viewer ??= import("./lightbox").catch((error) => { viewer = undefined; throw error; });
		const module = await viewer;
		if (image.isConnected) module.openImage(image);
	} catch (error) {
		console.warn("Image viewer unavailable", error);
	} finally {
		image.removeAttribute("aria-busy");
	}
});
