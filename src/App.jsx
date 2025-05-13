// App.jsx
import React, { useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Annotator from "./components/Annotator";
import "./styles/image-annotator.scss";

export default function App() {
  // Track the uploaded image
  const [imageSrc, setImageSrc] = useState(null);

  // Track which drawing mode is active (either polygon or arrow)
  const [mode, setMode] = useState("polygon");

  // Store all annotation objects
  const [annotations, setAnnotations] = useState([]);

  // Track the currently selected annotation by ID
  const [selectedId, setSelectedId] = useState(null);

  // Refs allow child components (like Annotator) to trigger undo/export
  const undoRef = useRef(null);
  const exportRef = useRef(null);

  return (
    <div className="image-annotator">
      {/* Sidebar: contains mode toggle, uploader, annotation list, and action buttons */}
      <Sidebar
        mode={mode}
        setMode={setMode}
        imageSrc={imageSrc}
        onImageLoad={setImageSrc}
        annotations={annotations}
        setSelectedId={setSelectedId}
        selectedId={selectedId}
        onAnnotationChange={setAnnotations}
        onExport={() => exportRef.current?.()}
        onUndo={() => undoRef.current?.()}
      />

      {/* Main annotation canvas with image and interactive overlays */}
      <div className="image-annotator__main">
        {imageSrc && (
          <Annotator
            imageSrc={imageSrc}
            mode={mode}
            annotations={annotations}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onAnnotationChange={setAnnotations}
            onUndoRef={undoRef}
            onExportRef={exportRef}
          />
        )}
      </div>
    </div>
  );
}
