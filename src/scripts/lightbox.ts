import PhotoSwipe from "photoswipe";
import coreStyles from "photoswipe/style.css?inline";
import themeStyles from "../styles/photoswipe.css?inline";

export function openImage(image: HTMLImageElement) {
	if (!document.querySelector("style[data-image-viewer]")) {
		const style = document.createElement("style");
		style.dataset.imageViewer = "true";
		style.textContent = coreStyles + themeStyles;
		document.head.append(style);
	}
	const images = Array.from(document.querySelectorAll<HTMLImageElement>(".custom-md img, #post-cover img"));
	const gallery = new PhotoSwipe({
		dataSource: images.map((item) => ({
			src: item.currentSrc || item.src,
			width: item.naturalWidth || Number(item.width) || window.innerWidth,
			height: item.naturalHeight || Number(item.height) || window.innerHeight,
			msrc: item.currentSrc || item.src,
			element: item,
		})),
		index: Math.max(0, images.indexOf(image)),
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		wheelToZoom: true,
		arrowPrev: false,
		arrowNext: false,
		imageClickAction: "close",
		tapAction: "close",
		doubleTapAction: "zoom",
	});
	gallery.init();
}
