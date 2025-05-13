import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

/**
 * Sidebar component manages annotation mode toggles, image upload,
 * and the full annotation list with editable fields. It handles:
 * - Switching between polygon and arrow mode
 * - Uploading an image
 * - Displaying and selecting annotations
 * - Expanding, editing, saving or cancelling annotation labels and descriptions
 */
function Sidebar({
  mode,
  setMode,
  onImageLoad,
  annotations,
  selectedId,
  setSelectedId,
  onAnnotationChange,
  onExport,
  onUndo
}) {
  const [expandedId, setExpandedId] = useState(null); // Tracks which annotation is expanded
  const [editingField, setEditingField] = useState({ id: null, field: null }); // Field in edit mode
  const [tempValues, setTempValues] = useState({ zone: '', description: '' }); // Temp text values

  // Expand or collapse a selected annotation
  const handleExpand = (id) => {
    setExpandedId(prevId => (prevId === id ? null : id));
    setEditingField({ id: null, field: null });
  };

  // Start editing a field (zone or description)
  const handleEdit = (id, field, value) => {
    setEditingField({ id, field });
    setTempValues(prev => ({ ...prev, [field]: value }));
  };

  // Update local draft value while editing
  const handleChange = (field, value) => {
    setTempValues(prev => ({ ...prev, [field]: value }));
  };

  // Save new label or description and exit edit mode
  const handleSave = (id, field) => {
    const updated = annotations.map(ann => {
      if (ann.id === id) {
        return { ...ann, [field === 'zone' ? 'label' : 'description']: tempValues[field] };
      }
      return ann;
    });
    onAnnotationChange(updated);
    setEditingField({ id: null, field: null });
  };

  // Cancel editing and reset local inputs
  const handleCancel = () => {
    setEditingField({ id: null, field: null });
    setTempValues({ zone: '', description: '' });
  };

  return (
    <div className="image-annotator__sidebar">
      <h2>Annotation Mode</h2>
      <button onClick={() => setMode('polygon')} className={mode === 'polygon' ? 'active' : ''}>
        Polygon
      </button>
      <button onClick={() => setMode('arrow')} className={mode === 'arrow' ? 'active' : ''}>
        Arrow
      </button>

      <ImageUploader onImageLoad={onImageLoad} />

      {annotations.length > 0 && (
        <>
          <h3>Annotations</h3>
          <ul className="image-annotator__annotation-list">
            {annotations.map((ann) => {
              const isExpanded = expandedId === ann.id;
              const isEditing = editingField.id === ann.id;

              return (
                <li
                  key={ann.id}
                  className={`image-annotator__annotation-item ${selectedId === ann.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(ann.id)}
                >
                  {/* Toggle expansion of the selected annotation panel */}
                  <div className="image-annotator__annotation-header" onClick={() => handleExpand(ann.id)}>
                    <strong>{ann.label || 'No Name'}</strong>
                    <span className="description">{ann.description || 'No Description'}</span>
                  </div>

                  {isExpanded && (
                    <div className="image-annotator__annotation-expanded">
                      {/* Editable zone name */}
                      {isEditing && editingField.field === 'zone' ? (
                        <>
                          <input
                            type="text"
                            value={tempValues.zone}
                            onChange={(e) => handleChange('zone', e.target.value)}
                            className="image-annotator__input"
                          />
                          <div className="image-annotator__edit-buttons">
                            <button onClick={() => handleSave(ann.id, 'zone')}>Save</button>
                            <button onClick={handleCancel}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div
                          className="image-annotator__editable-text"
                          onClick={() => handleEdit(ann.id, 'zone', ann.label)}
                        >
                          {ann.label || 'No Zone'}
                        </div>
                      )}

                      {/* Editable description */}
                      {isEditing && editingField.field === 'description' ? (
                        <>
                          <textarea
                            value={tempValues.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="image-annotator__input"
                          />
                          <div className="image-annotator__edit-buttons">
                            <button onClick={() => handleSave(ann.id, 'description')}>Save</button>
                            <button onClick={handleCancel}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div
                          className="image-annotator__editable-text"
                          onClick={() => handleEdit(ann.id, 'description', ann.description)}
                        >
                          <span className="description">{ann.description || 'No Description'}</span>

                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Export + Undo controls */}
          <button onClick={onExport}>Export JSON</button>
          <button onClick={onUndo}>Undo</button>
        </>
      )}
    </div>
  );
}

export default Sidebar;