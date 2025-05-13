# Image Annotator

A responsive web application for annotating images with polygons and arrows. Built with React and SCSS, this tool allows users to create, edit, and export annotations for images.

## Features

- 🖼️ Upload and annotate images
- 📐 Draw polygons and arrows
- ✏️ Edit annotation labels and descriptions
- 📱 Responsive design for desktop, tablet, and mobile
- 💾 Export annotations as JSON
- ↩️ Undo functionality
- 🎯 Touch-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-annotator.git
cd image-annotator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Drawing Annotations

1. **Upload an Image**
   - Click the upload button in the sidebar
   - Select an image file from your device

2. **Select Annotation Mode**
   - Choose between "Polygon" or "Arrow" mode
   - Polygon mode: Click to create points, click near the start point to complete
   - Arrow mode: Click to set start point, click again to set end point

3. **Editing Annotations**
   - Click an annotation to select it
   - Drag points to adjust shape
   - Right-click a polygon point to remove it
   - Use the sidebar to edit labels and descriptions

4. **Managing Annotations**
   - Click an annotation in the sidebar to select it
   - Expand an annotation to edit its details
   - Use the "Undo" button to remove the last annotation
   - Click "Export JSON" to download all annotations

### Mobile Usage

- Touch-friendly interface for drawing and editing
- Responsive layout adapts to screen size
- Larger touch targets for better mobile interaction

## Project Structure

```
image-annotator/
├── src/
│   ├── components/
│   │   ├── Annotator.jsx    # Main annotation canvas
│   │   ├── Sidebar.jsx      # Control panel and annotation list
│   │   └── ImageUploader.jsx # Image upload component
│   ├── styles/
│   │   ├── _annotations.scss
│   │   ├── _canvas.scss
│   │   ├── _sidebar.scss
│   │   └── image-annotator.scss
│   └── App.jsx
├── public/
└── package.json
```

### Styling

The application uses SCSS with BEMIT methodology. Main style files:

- `_variables.scss`: Color palette and spacing
- `_canvas.scss`: Annotation canvas styles
- `_sidebar.scss`: Sidebar and controls
- `_annotations.scss`: Annotation list styles

### Configuration

Key configuration options can be found in:

- `src/styles/_variables.scss`: Theme colors and spacing
- `src/components/Annotator.jsx`: Annotation behavior
- `src/components/Sidebar.jsx`: UI controls

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request