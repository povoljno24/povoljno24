/**
 * Applies a "Povoljno24.rs" watermark to an image file.
 * Returns a new Blob (processed image).
 */
export async function applyWatermark(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Styling for watermark
        const fontSize = Math.max(16, Math.floor(canvas.width / 15));
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Tiled watermark pattern across the whole image
        const stepX = fontSize * 5;
        const stepY = fontSize * 3;
        
        ctx.save();
        ctx.rotate(-Math.PI / 6); // Slight angle
        
        // Loop through the canvas area (expanded to cover rotated space)
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.fillText('Povoljno24.rs', x, y);
          }
        }
        ctx.restore();

        // One prominent one in the center
        ctx.font = `bold ${fontSize * 1.5}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('Povoljno24.rs', canvas.width / 2, canvas.height / 2);

        // Convert back to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type, 0.90);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
