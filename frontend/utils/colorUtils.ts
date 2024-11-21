// utils/colorUtils.ts
export function generateColor(label: string): string {
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const r = (hash >> 0) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = (hash >> 16) & 0xff;
  
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  export default generateColor;
  