// 主题相关类型已删除

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang: "en" | "zh_CN" | "ja";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	heroBanner?: HeroBannerConfig;
	background: BackgroundConfig;
	loadingScreen?: LoadingScreenConfig;
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Friends = 3,
	Rice = 4,
	Moments = 5,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type Friend = {
	name: string;
	url: string;
	avatar?: string;
	bio?: string;
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

// LIGHT_DARK_MODE 类型已删除

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export interface BackgroundConfig {
	enable: boolean;
	src: string;
	position: "top" | "center" | "bottom";
	size: "cover" | "contain" | "auto";
	repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
	attachment: "fixed" | "scroll" | "local";
	opacity: number;
}

export interface HeroBannerConfig {
	enable: boolean;
	showScrollIndicator?: boolean; // 是否显示向下滚动指示器
}

export interface LoadingScreenConfig {
	enable: boolean;
	src: string; // 加载动画资源地址（支持图片或视频）
	type?: "image" | "video" | "auto"; // 资源类型，auto 会根据扩展名自动判断
	text?: string; // 加载提示文字
	minDuration?: number; // 最小显示时间（毫秒），防止闪烁
}
