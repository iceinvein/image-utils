import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	type ImageDimensions,
	type OutputFormat,
	convertImageFormat,
	getImageDimensions,
	outputFormatToLabel,
} from "@/lib/utils";
import { Download, Trash } from "lucide-react";
import { useCallback, useState } from "react";
import DragAndDropFileZone from "./components/drag-and-drop-file-zone";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

type FileWithDimensions = {
	file: File;
	dimensions: ImageDimensions;
};

function App() {
	const [files, setFiles] = useState<FileWithDimensions[]>([]);
	const [convertedFiles, setConvertedFiles] = useState<
		{
			url: string;
			name: string;
		}[]
	>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [outputFormat, setOutputFormat] = useState<"webp" | "jpeg" | "png">(
		"webp",
	);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setError(null);
		setConvertedFiles([]);
		const droppedFiles = Array.from(e.dataTransfer.files);
		const promises = droppedFiles.map((file) =>
			getImageDimensions(file).then((dimensions) => ({
				file,
				dimensions,
			})),
		);

		Promise.all(promises)
			.then((filesWithDimensions) => {
				setFiles((prevFiles) => [
					...prevFiles,
					...filesWithDimensions.map((file) => ({
						file: file.file,
						dimensions: file.dimensions,
					})),
				]);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, []);

	const onFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				setError(null);
				setConvertedFiles([]);
				const selectedFiles = Array.from(e.target.files);
				const promises = selectedFiles.map((file) =>
					getImageDimensions(file).then((dimensions) => ({
						file,
						dimensions,
					})),
				);

				Promise.all(promises)
					.then((filesWithDimensions) => {
						setFiles((prevFiles) => [
							...prevFiles,
							...filesWithDimensions.map((file) => ({
								file: file.file,
								dimensions: file.dimensions,
							})),
						]);
					})
					.catch((error) => {
						setError(error.message);
					});
			}
		},
		[],
	);

	const removeFile = useCallback((fileToRemove: File) => {
		setFiles((prevFiles) =>
			prevFiles.filter((file) => file.file !== fileToRemove),
		);
	}, []);

	const convertFiles = useCallback(() => {
		const promises = files.map((file) =>
			convertImageFormat(
				file.file,
				{
					quality: 0.8,
					maxWidth: 1920,
					maxHeight: 1080,
				},
				outputFormat,
			),
		);

		Promise.all(promises)
			.then((blobs) => {
				setConvertedFiles((prevFiles) => [
					...prevFiles,
					...blobs.map((blob) => ({
						url: URL.createObjectURL(blob.blob),
						name: blob.name,
					})),
				]);
			})
			.catch((error) => {
				setError(error.message);
			})
			.finally(() => {
				setFiles([]);
			});
	}, [files, outputFormat]);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="image-utils-theme">
			<div className="flex flex-col gap-8 h-screen w-screen items-center justify-center">
				<DragAndDropFileZone
					{...{
						isDragging,
						onDragOver,
						onDragLeave,
						onDrop,
						onFileInputChange,
					}}
				/>
				{error && (
					<div className="flex flex-col gap-2 bg-red-100 p-4 rounded-lg">
						<p className="text-red-500">{error}</p>
					</div>
				)}
				{files.length > 0 && (
					<div className="flex flex-col gap-4">
						<h3 className="text-lg font-semibold">Selected Files:</h3>
						<ul>
							{files.map(({ file, dimensions }, index) => (
								<li
									key={`${file.name}-${index}`}
									className="flex gap-4 items-center justify-between bg-gray-100 p-2 rounded cursor-default"
								>
									<div className="flex flex-col">
										<p className="truncate text-primary-foreground">
											{file.name}
										</p>
										<p className="text-sm text-gray-500">
											{`${dimensions.width}x${dimensions.height} px`}
										</p>
									</div>
									<Button
										variant="destructive"
										size="icon"
										onClick={() => removeFile(file)}
									>
										<Trash />
										<span className="sr-only">Remove file</span>
									</Button>
								</li>
							))}
						</ul>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="lg">
									Output Format: {outputFormatToLabel[outputFormat]}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>Output Format</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => setOutputFormat("webp")}>
									{outputFormatToLabel["webp" as OutputFormat]}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setOutputFormat("jpeg")}>
									{outputFormatToLabel["jpeg" as OutputFormat]}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setOutputFormat("png")}>
									{outputFormatToLabel["png" as OutputFormat]}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button onClick={convertFiles} className="w-full mt-4" size="lg">
							Convert
						</Button>
					</div>
				)}
				{convertedFiles.length > 0 && (
					<div className="flex flex-col gap-2">
						<h3 className="text-lg font-semibold mb-2">Converted Files:</h3>
						<ul>
							{convertedFiles.map((blob) => (
								<li
									key={`${blob.name}`}
									className="flex gap-4 items-center justify-between bg-gray-100 py-2 px-4 rounded cursor-pointer hover:bg-gray-200"
								>
									<a href={blob.url} download={blob.name}>
										<p className="truncate text-primary-foreground">
											{blob.name}
										</p>
									</a>
									<Download className="text-primary-foreground" />
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</ThemeProvider>
	);
}

export default App;
