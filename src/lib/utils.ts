import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type ConversionOptions = {
	quality: number;
	maxWidth: number;
	maxHeight: number;
};

export type ImageDimensions = {
	width: number;
	height: number;
};

export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
	return new Promise((resolve, reject) => {
		const img = new Image();

		const objectUrl = URL.createObjectURL(file);

		const handleLoad = () => {
			URL.revokeObjectURL(objectUrl);

			const dimensions = {
				width: img.width,
				height: img.height,
			};

			resolve(dimensions);
		};

		img.onload = handleLoad;
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image"));
		};

		img.src = objectUrl;
	});
};

const calculateDimensions = (
	originalWidth: number,
	originalHeight: number,
	maxWidth: number,
	maxHeight: number,
): ImageDimensions => {
	const aspectRatio = originalWidth / originalHeight;

	if (aspectRatio > 1) {
		const newWidth = maxHeight * aspectRatio;
		return {
			width: Math.min(newWidth, maxWidth),
			height: maxHeight,
		};
	}

	const newHeight = maxWidth / aspectRatio;

	return {
		width: maxWidth,
		height: Math.min(newHeight, maxHeight),
	};
};

export const outputFormats = ["webp", "jpeg", "png"] as const;

export type OutputFormat = (typeof outputFormats)[number];

export const outputFormatToLabel: Record<OutputFormat, string> = {
	webp: "WebP",
	jpeg: "JPEG",
	png: "PNG",
};

export const convertImageFormat = (
	file: File,
	options: ConversionOptions,
	outputFormat: "webp" | "jpeg" | "png" = "webp",
): Promise<{ blob: Blob; name: string }> => {
	const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;

	return new Promise((resolve, reject) => {
		const img = new Image();

		const objectUrl = URL.createObjectURL(file);

		const handleLoad = () => {
			URL.revokeObjectURL(objectUrl);

			const dimensions = calculateDimensions(
				img.width,
				img.height,
				maxWidth,
				maxHeight,
			);

			const canvas = document.createElement("canvas");
			canvas.width = dimensions.width;
			canvas.height = dimensions.height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve({
							blob,
							name: file.name.replace(/\.[^/.]+$/, `.${outputFormat}`),
						});
					} else {
						reject(new Error("WebP conversion failed"));
					}
				},
				"image/webp",
				quality,
			);
		};

		img.onload = handleLoad;
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image"));
		};

		img.src = objectUrl;
	});
};
