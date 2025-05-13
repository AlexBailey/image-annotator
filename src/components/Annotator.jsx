import React, { useState, useRef, useEffect } from "react";

/**
 * Annotator lets users draw, label, and edit polygons and arrows over an image.
 */
function Annotator({
  imageSrc,
  mode,
  annotations,
  selectedId,
  setSelectedId,
  onAnnotationChange,
  onUndoRef,
  onExportRef,
}) {
  const [drawing, setDrawing] = useState(null); // Currently drawn shape
  const [cursorPos, setCursorPos] = useState(null); // Tracks mouse for guide lines
  const [dragInfo, setDragInfo] = useState(null); // Tracks point being dragged

  const svgRef = useRef(null);
  const skipClickRef = useRef(false); // Prevents accidental click on drag

  // Convert screen coords to percentage-based coordinates (responsive)
  const getRelativeCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  };

  // Convert percentage to pixel values for SVG drawing
  const getAbsolutePoint = ({ x, y }) => {
    const svg = svgRef.current;
    return {
      x: (x / 100) * svg.clientWidth,
      y: (y / 100) * svg.clientHeight,
    };
  };

  // Handle user clicks to draw or complete polygons/arrows
  const handleSvgClick = (e) => {
    if (e.button !== 0 || skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }

    const click = getRelativeCoords(e);

    // Polygon mode
    if (mode === "polygon") {
      if (drawing) {
        const first = drawing.points[0];
        const dx = click.x - first.x;
        const dy = click.y - first.y;
        const isCloseToStart = Math.sqrt(dx * dx + dy * dy) < 5;

        if (drawing.points.length >= 3 && isCloseToStart) {
          onAnnotationChange([...annotations, { ...drawing, isClosed: true }]);
          setDrawing(null);
          setCursorPos(null);
        } else {
          setDrawing({ ...drawing, points: [...drawing.points, click] });
        }
      } else {
        setDrawing({
          id: Date.now(),
          type: "polygon",
          points: [click],
          isClosed: false,
          label: "Zone",
          description: "",
        });
      }
    }

    // Arrow mode
    if (mode === "arrow") {
      if (!drawing) {
        setDrawing({
          id: Date.now(),
          type: "arrow",
          start: click,
          end: null,
          label: "Direction",
          description: "",
        });
      } else if (!drawing.end) {
        onAnnotationChange([...annotations, { ...drawing, end: click }]);
        setDrawing(null);
      }
    }
  };

  // Handle mouse movement: show guide lines and drag updates
  const handleMouseMove = (e) => {
    const coords = getRelativeCoords(e);
    setCursorPos(coords);

    if (dragInfo) {
      skipClickRef.current = true;

      onAnnotationChange((prev) =>
        prev.map((a) => {
          if (a.id !== dragInfo.annotationId) return a;

          // Polygon point drag
          if (a.type === "polygon") {
            const updated = [...a.points];
            updated[dragInfo.pointIndex] = coords;
            return { ...a, points: updated };
          }

          // Arrow drag
          if (a.type === "arrow" && dragInfo.arrowHandle) {
            return {
              ...a,
              [dragInfo.arrowHandle]: coords,
            };
          }
        })
      );
    }
  };

  // Stop dragging when pointer is released
  const handleMouseUp = () => {
    setDragInfo(null);
  };

  // Remove a point from a polygon
  const removePoint = (annotationId, pointIndex) => {
    onAnnotationChange((prev) =>
      prev.map((a) => {
        if (a.id !== annotationId) return a;
        if (a.points.length <= 3 && a.isClosed) return a;
        const updated = [...a.points];
        updated.splice(pointIndex, 1);
        return { ...a, points: updated };
      })
    );
  };

  useEffect(() => {
    if (onUndoRef) {
      onUndoRef.current = () => onAnnotationChange((prev) => prev.slice(0, -1));
    }

    if (onExportRef) {
      onExportRef.current = () => {
        const json = JSON.stringify(annotations, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "annotations.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
    }
  }, [onUndoRef, onExportRef, annotations, onAnnotationChange]);

  useEffect(() => {
    window.addEventListener("pointerup", handleMouseUp);
    return () => window.removeEventListener("pointerup", handleMouseUp);
  }, []);

  return (
    <div className="image-annotator__canvas-wrapper">
      <img src={imageSrc} alt="Uploaded" className="image-annotator__image" />

      <svg
        ref={svgRef}
        className="image-annotator__canvas"
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={() => setSelectedId(null)}
      >
        {annotations.map((ann) => (
          <g key={ann.id}>
            {ann.type === "polygon" && ann.isClosed && (
              <>
                <polygon
                  points={ann.points
                    .map((p) => {
                      const abs = getAbsolutePoint(p);
                      return `${abs.x},${abs.y}`;
                    })
                    .join(" ")}
                  fill="rgba(40, 167, 69, 0.3)"
                  stroke={
                    ann.id === selectedId ? "#007bff" : "rgba(40, 167, 69, 0.8)"
                  }
                  strokeWidth={ann.id === selectedId ? "3" : "2"}
                  strokeDasharray={ann.id === selectedId ? "5,3" : "none"}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(ann.id);
                  }}
                />

                {ann.points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={`${p.x}%`}
                    cy={`${p.y}%`}
                    r="4"
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onPointerDown={(e) => {
                      if (e.button === 2) {
                        e.preventDefault();
                        removePoint(ann.id, idx);
                      } else if (e.button === 0) {
                        setDragInfo({ annotationId: ann.id, pointIndex: idx });
                      }
                    }}
                  />
                ))}
              </>
            )}

            {/* Arrow rendering with draggable start/end handles */}
            {ann.type === "arrow" && ann.end && (
              <>
                <line
                  x1={`${ann.start.x}%`}
                  y1={`${ann.start.y}%`}
                  x2={`${ann.end.x}%`}
                  y2={`${ann.end.y}%`}
                  stroke={ann.id === selectedId ? "#007bff" : "red"}
                  strokeWidth={ann.id === selectedId ? "3" : "2"}
                  style={{ cursor: "pointer" }}
                  markerEnd="url(#arrowhead)"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(ann.id);
                  }}
                />
                {[["start"], ["end"]].map(([key]) => (
                  <circle
                    key={key}
                    cx={`${ann[key].x}%`}
                    cy={`${ann[key].y}%`}
                    r="8"
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onPointerDown={(e) => {
                      if (e.button === 0) {
                        e.stopPropagation();
                        setDragInfo({ annotationId: ann.id, arrowHandle: key });
                      }
                    }}
                  />
                ))}
              </>
            )}
          </g>
        ))}

        {/* Live preview line for arrow (after first click) */}
        {drawing?.type === "arrow" &&
          drawing.start &&
          !drawing.end &&
          cursorPos && (
            <line
              x1={`${drawing.start.x}%`}
              y1={`${drawing.start.y}%`}
              x2={`${cursorPos.x}%`}
              y2={`${cursorPos.y}%`}
              stroke="red"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          )}

        {/* Live preview polyline while drawing polygon */}
        {drawing?.type === "polygon" && drawing.points.length > 0 && (
          <>
            <polyline
              points={[...drawing.points, cursorPos]
                .filter(Boolean)
                .map((p) => {
                  const abs = getAbsolutePoint(p);
                  return `${abs.x},${abs.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgba(40, 167, 69, 1)"
              strokeWidth="2"
            />
            {drawing.points.map((p, idx) => (
              <circle
                key={idx}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r="4"
                fill={idx === 0 ? "orange" : "rgba(40, 167, 69, 1)"}
              />
            ))}
          </>
        )}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="red" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default Annotator;
