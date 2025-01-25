import type { FontStyle } from 'jspdf-autotable';

type RGB = [number, number, number];

export const COLORS: Record<string, RGB> = {
  primary: [41, 128, 185] as RGB,
  success: [34, 197, 94] as RGB,
  warning: [234, 179, 8] as RGB,
  danger: [239, 68, 68] as RGB,
  background: [245, 247, 250] as RGB,
};

export const FONTS = {
  heading: {
    size: 18,
    style: 'bold',
  },
  subheading: {
    size: 14,
    style: 'bold',
  },
  body: {
    size: 12,
    style: 'normal',
  },
};

export const TABLE_STYLES = {
  headStyles: { 
    fillColor: COLORS.primary,
    textColor: 255,
    fontStyle: 'bold' as FontStyle,
  },
  alternateRowStyles: {
    fillColor: COLORS.background,
  },
  margin: { top: 10 },
};

export const PAGE_SETTINGS = {
  margin: 20,
  pageBreak: 'avoid' as const,
};