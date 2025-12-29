/**
 * Utilities for gradient color management and validation
 * @module gradient-utils
 */

/**
 * Gradient configuration interface
 */
export interface GradientConfig {
  /** Array of colors in hex format */
  colors: string[];
  /** Animation speed in seconds */
  speed?: number;
  /** Blur intensity */
  blur?: 'none' | 'low' | 'medium' | 'high';
  /** Direction of gradient animation */
  direction?: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
  /** Accessibility: minimum contrast ratio required */
  minContrastRatio?: number;
  /** Enable performance optimization */
  optimizePerformance?: boolean;
}

/**
 * Validation options interface
 */
export interface ValidationOptions {
  /** Minimum contrast ratio for accessibility checks */
  minContrastRatio?: number;
  /** Whether to perform accessibility checks */
  checkAccessibility?: boolean;
}

/**
 * Default gradient configurations
 */
export const DEFAULT_GRADIENTS = {
  warm: {
    colors: ["#f8f3ed", "#efe6dc", "#f5ede3", "#e6dcd0"],
    speed: 10,
    blur: 'medium' as const,
    direction: 'radial' as const,
    minContrastRatio: 4.5,
    optimizePerformance: true
  },
  cool: {
    colors: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8"],
    speed: 8,
    blur: 'low' as const,
    direction: 'horizontal' as const,
    minContrastRatio: 4.5,
    optimizePerformance: true
  },
  vibrant: {
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"],
    speed: 12,
    blur: 'high' as const,
    direction: 'diagonal' as const,
    minContrastRatio: 3,
    optimizePerformance: true
  }
};

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Sanitize color input to prevent XSS attacks
 */
export function sanitizeColorInput(color: string): string {
  // Remove any potentially harmful characters
  const sanitized = color.replace(/[<>"'&]/g, '');

  // Ensure it's a valid hex color
  if (!isValidHexColor(sanitized)) {
    throw new Error(`Invalid color format: ${color}. Expected hex color (e.g., #ff0000)`);
  }

  return sanitized;
}

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(hexColor: string): number {
  const sanitized = sanitizeColorInput(hexColor);
  const rgb = parseInt(sanitized.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if gradient meets accessibility standards
 */
export function checkAccessibility(
  colors: string[],
  minContrastRatio: number = 4.5
): { isAccessible: boolean; issues: string[] } {
  const issues: string[] = [];

  if (colors.length < 2) {
    issues.push('At least 2 colors are required for a gradient');
    return { isAccessible: false, issues };
  }

  // Sanitize colors
  const sanitizedColors = colors.map(color => {
    const sanitized = sanitizeColorInput(color);
    if (sanitized !== color) {
      console.warn('Invalid color detected and sanitized:', color);
    }
    return sanitized;
  });

  // Validate accessibility if enabled
  if (minContrastRatio > 0) {
    // Check contrast between consecutive colors
    for (let i = 0; i < sanitizedColors.length - 1; i++) {
      const contrast = getContrastRatio(sanitizedColors[i], sanitizedColors[i + 1]);
      if (contrast < minContrastRatio) {
        issues.push(`Low contrast between ${sanitizedColors[i]} and ${sanitizedColors[i + 1]}: ${contrast.toFixed(2)}`);
      }
    }

    if (issues.length > 0) {
      console.warn('Accessibility issues found:', issues);
    }
  }

  return {
    isAccessible: issues.length === 0,
    issues
  };
}

/**
 * Validate and normalize gradient configuration
 */
export function validateGradientConfig(
  config: Partial<GradientConfig> = {},
  options: ValidationOptions = {}
): GradientConfig {
  const {
    minContrastRatio = 3, // WCAG AA minimum
    checkAccessibility: shouldCheckAccessibility = true
  } = options;

  // Destructure with defaults
  const {
    colors = DEFAULT_GRADIENTS.warm.colors,
    speed = DEFAULT_GRADIENTS.warm.speed || 10,
    blur = DEFAULT_GRADIENTS.warm.blur || 'medium'
  } = config;

  if (!colors || colors.length === 0) {
    throw new Error('Gradient configuration must include at least one color');
  }

  // Sanitize all colors
  const sanitizedColors = colors.map(sanitizeColorInput);

  // Check accessibility if enabled
  if (shouldCheckAccessibility) {
    const accessibility = checkAccessibility(
      sanitizedColors,
      minContrastRatio
    );

    if (!accessibility.isAccessible) {
      console.warn('Accessibility issues detected:', accessibility.issues);
    }
  }

  return {
    colors: sanitizedColors,
    speed: Math.max(1, Math.min(60, speed)), // Limit between 1-60 seconds
    blur: blur,
    direction: config.direction || 'radial',
    minContrastRatio: minContrastRatio,
    optimizePerformance: config.optimizePerformance !== false
  };
}

/**
 * Generate CSS for gradient animation
 */
export function generateGradientCSS(config: GradientConfig): string {
  const { colors, direction } = config;

  // Create gradient string
  const gradientStops = colors.join(', ');

  // Handle radial gradient separately
  if (direction === 'radial') {
    return `radial-gradient(circle, ${gradientStops})`;
  }

  // Determine linear gradient direction
  let gradientDirection;
  switch (direction) {
    case 'horizontal':
      gradientDirection = 'to right';
      break;
    case 'vertical':
      gradientDirection = 'to bottom';
      break;
    case 'diagonal':
      gradientDirection = 'to bottom right';
      break;
    default:
      gradientDirection = 'to right';
      break;
  }

  return `linear-gradient(${gradientDirection}, ${gradientStops})`;
}

/**
 * Memoized gradient configuration for performance
 */
const gradientCache = new Map<string, GradientConfig>();

/**
 * Generate a deterministic cache key for gradient configuration
 */
export function generateCacheKey(key: string, config: Partial<GradientConfig>): string {
  // Escape delimiters in key to prevent collisions
  const safeKey = key.replace(/\|/g, '\\|');
  const parts = [safeKey];

  if (config.colors) parts.push(`colors:${config.colors.join(',')}`);
  if (config.speed !== undefined) parts.push(`speed:${config.speed}`);
  if (config.blur !== undefined) parts.push(`blur:${config.blur}`);
  if (config.direction !== undefined) parts.push(`dir:${config.direction}`);
  if (config.minContrastRatio !== undefined) parts.push(`mcr:${config.minContrastRatio}`);
  if (config.optimizePerformance !== undefined) parts.push(`opt:${config.optimizePerformance}`);

  return parts.join('|');
}

/**
 * Get or create cached gradient configuration
 */
export function getCachedGradientConfig(
  key: string,
  config: Partial<GradientConfig>
): GradientConfig {
  const cacheKey = generateCacheKey(key, config);

  if (gradientCache.has(cacheKey)) {
    return gradientCache.get(cacheKey)!;
  }

  const validatedConfig = validateGradientConfig(config);
  gradientCache.set(cacheKey, validatedConfig);

  return validatedConfig;
}

/**
 * Clear gradient cache (useful for development)
 */
export function clearGradientCache(): void {
  gradientCache.clear();
}