/**
 * Parser and code generator for Google Drive video embeds
 */

// Extract Google Drive ID from any common format
export function extractDriveId(input) {
  if (!input || typeof input !== 'string') return null;
  const cleanInput = input.trim();

  // Pattern 1: /file/d/{id}
  const fileDMatch = cleanInput.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id={id} in query string (open?id=..., uc?id=...)
  const queryMatch = cleanInput.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (queryMatch && queryMatch[1]) return queryMatch[1];

  // Pattern 3: /d/{id} generic
  const dMatch = cleanInput.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 4: Raw file ID directly (Drive IDs are typically 28 to 44 base64-like chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(cleanInput)) {
    return cleanInput;
  }

  return null;
}

// Parse multiline string into video items
export function parseDriveLinks(rawText) {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  return lines.map((line, index) => {
    const fileId = extractDriveId(line);
    const isValid = Boolean(fileId);

    return {
      id: `drive-item-${index}-${fileId || Math.random().toString(36).substring(7)}`,
      index: index + 1,
      originalText: line,
      fileId: fileId || '',
      previewUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '',
      viewUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view` : '',
      isValid,
      errorMessage: isValid ? '' : 'Đường link không hợp lệ hoặc thiếu File ID',
    };
  });
}

// Generate code based on options
export function generateEmbedCode(items, options) {
  const validItems = items.filter(it => it.isValid);
  if (validItems.length === 0) return '';

  const {
    aspectRatio = '9/16',
    maxWidth = '360px',
    borderRadius = '12px',
    boxShadow = 'none',
    allowAutoplay = true,
    allowFullscreen = true,
    loadingLazy = false,
    format = 'html-inline', // 'html-inline', 'html-css', 'react-jsx', 'urls'
    layout = 'stacked', // 'stacked', 'grid'
    gridColumns = 2,
    margin = '0 auto 20px auto',
  } = options;

  const shadowStyles = {
    none: '',
    soft: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);',
    elevated: 'box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.15);',
    glow: 'box-shadow: 0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(168, 85, 247, 0.2);',
    card: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);',
  };

  const shadowValue = shadowStyles[boxShadow] || '';

  // 1. FORMAT: Plain URL List
  if (format === 'urls') {
    return validItems.map(item => item.previewUrl).join('\n');
  }

  // 2. FORMAT: HTML with Inline Styles (User's preferred format)
  if (format === 'html-inline') {
    if (layout === 'grid' && validItems.length > 1) {
      const gridItems = validItems.map(item => `  <div style="position: relative; width: 100%; aspect-ratio: ${aspectRatio};">
    <iframe 
      src="${item.previewUrl}" 
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: ${borderRadius}; ${shadowValue}" 
      allow="${allowAutoplay ? 'autoplay; ' : ''}encrypted-media; picture-in-picture" 
      ${allowFullscreen ? 'allowfullscreen' : ''} 
      ${loadingLazy ? 'loading="lazy"' : ''}
      frameborder="0">
    </iframe>
  </div>`).join('\n');

      return `<!-- Google Drive Videos - Responsive Grid -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, ${maxWidth}), 1fr)); gap: 20px; width: 100%; max-width: ${parseInt(maxWidth) * gridColumns + 40}px; margin: ${margin};">
${gridItems}
</div>`;
    }

    // Stacked inline
    return validItems.map((item, idx) => `<!-- Video ${idx + 1} -->
<div style="position: relative; width: 100%; max-width: ${maxWidth}; aspect-ratio: ${aspectRatio}; margin: ${margin};">
  <iframe 
    src="${item.previewUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: ${borderRadius}; ${shadowValue}" 
    allow="${allowAutoplay ? 'autoplay; ' : ''}encrypted-media; picture-in-picture" 
    ${allowFullscreen ? 'allowfullscreen' : ''} 
    ${loadingLazy ? 'loading="lazy"' : ''}
    frameborder="0">
  </iframe>
</div>`).join('\n\n');
  }

  // 3. FORMAT: HTML + CSS Classes (Clean separation)
  if (format === 'html-css') {
    const cssContent = `<style>
.drive-embed-container {
  position: relative;
  width: 100%;
  max-width: ${maxWidth};
  aspect-ratio: ${aspectRatio};
  margin: ${margin};
}
.drive-embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: ${borderRadius};
  ${shadowValue.replace(/;$/, '')}
}
${layout === 'grid' && validItems.length > 1 ? `
.drive-embed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${maxWidth}), 1fr));
  gap: 20px;
  width: 100%;
  max-width: ${parseInt(maxWidth) * gridColumns + 40}px;
  margin: ${margin};
}
` : ''}
</style>`;

    if (layout === 'grid' && validItems.length > 1) {
      const iframes = validItems.map(item => `  <div class="drive-embed-container" style="max-width: 100%; margin: 0;">
    <iframe src="${item.previewUrl}" allow="${allowAutoplay ? 'autoplay; ' : ''}encrypted-media" ${allowFullscreen ? 'allowfullscreen' : ''} frameborder="0"></iframe>
  </div>`).join('\n');

      return `${cssContent}

<div class="drive-embed-grid">
${iframes}
</div>`;
    }

    const itemsHtml = validItems.map((item, idx) => `<!-- Video ${idx + 1} -->
<div class="drive-embed-container">
  <iframe src="${item.previewUrl}" allow="${allowAutoplay ? 'autoplay; ' : ''}encrypted-media" ${allowFullscreen ? 'allowfullscreen' : ''} ${loadingLazy ? 'loading="lazy"' : ''} frameborder="0"></iframe>
</div>`).join('\n');

    return `${cssContent}\n\n${itemsHtml}`;
  }

  // 4. FORMAT: React JSX Component
  if (format === 'react-jsx') {
    return `import React from 'react';

const driveVideos = [
${validItems.map(item => `  "${item.previewUrl}"`).join(',\n')}
];

export default function DriveVideoPlayer() {
  return (
    <div style={{
      ${layout === 'grid' && validItems.length > 1 ? `display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, ${maxWidth}), 1fr))',
      gap: '20px',
      maxWidth: '${parseInt(maxWidth) * gridColumns + 40}px',` : `display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',`}
      width: '100%',
      margin: '${margin}'
    }}>
      {driveVideos.map((url, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '${maxWidth}',
            aspectRatio: '${aspectRatio}',
          }}
        >
          <iframe
            src={url}
            title={\`Drive Video \${index + 1}\`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '${borderRadius}',
            }}
            allow="${allowAutoplay ? 'autoplay; ' : ''}encrypted-media; picture-in-picture"
            ${allowFullscreen ? 'allowFullScreen' : ''}
            ${loadingLazy ? 'loading="lazy"' : ''}
          />
        </div>
      ))}
    </div>
  );
}`;
  }

  return '';
}

