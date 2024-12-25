type DragAndDropFileZoneProps = {
	isDragging: boolean;
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DragAndDropFileZone({
	isDragging,
	onDragOver,
	onDragLeave,
	onDrop,
	onFileInputChange,
}: DragAndDropFileZoneProps) {
	return (
		<div
			className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors ${
				isDragging ? "border-primary bg-primary/10" : "border-gray-300"
			}`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			<input
				id="fileInput"
				type="file"
				className="hidden"
				onChange={onFileInputChange}
				multiple
				accept="image/*"
			/>
			<label htmlFor="fileInput" className="cursor-pointer">
				<p className="text-lg mb-2">Drag & Drop files here</p>
				<p className="text-sm text-gray-500">or click to select files</p>
			</label>
		</div>
	);
}
