import { describe, it, expect } from 'vitest';
import {
    generateGradientCSS,
    validateGradientConfig,
    isValidHexColor,
    getLuminance,
    getContrastRatio,
    DEFAULT_GRADIENTS,
    getCachedGradientConfig,
    clearGradientCache
} from '../gradient-utils';

describe('gradient-utils', () => {
    describe('getCachedGradientConfig', () => {
        const testConfig = {
            colors: ['#ff0000', '#00ff00'],
            speed: 5,
            blur: 'low' as const,
            direction: 'horizontal' as const
        };

        it('should return cached instance for same key and config', () => {
            clearGradientCache();
            const config1 = getCachedGradientConfig('test-1', testConfig);
            const config2 = getCachedGradientConfig('test-1', testConfig);

            expect(config1).toBe(config2); // Strict equality check for same object reference
        });

        it('should return different instances for different keys', () => {
            clearGradientCache();
            const config1 = getCachedGradientConfig('test-1', testConfig);
            const config2 = getCachedGradientConfig('test-2', testConfig);

            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2); // Content should be same
        });

        it('should return different instances for different configs', () => {
            clearGradientCache();
            const config1 = getCachedGradientConfig('test-1', testConfig);
            const config2 = getCachedGradientConfig('test-1', { ...testConfig, speed: 10 });

            expect(config1).not.toBe(config2);
            expect(config1.speed).toBe(5);
            expect(config2.speed).toBe(10);
        });

        it('should produce same key regardless of property order', () => {
            clearGradientCache();
            const config1 = getCachedGradientConfig('test-1', {
                colors: ['#ff0000', '#00ff00'],
                speed: 5
            });

            // Different property order
            const config2 = getCachedGradientConfig('test-1', {
                speed: 5,
                colors: ['#ff0000', '#00ff00']
            });

            expect(config1).toBe(config2);
        });
    });

    describe('generateGradientCSS', () => {
        const testColors = ['#ff0000', '#00ff00', '#0000ff'];

        it('should return radial-gradient for radial direction', () => {
            const config = validateGradientConfig({
                colors: testColors,
                direction: 'radial'
            }, { checkAccessibility: false });

            const result = generateGradientCSS(config);

            expect(result).toBe('radial-gradient(circle, #ff0000, #00ff00, #0000ff)');
            expect(result).toMatch(/^radial-gradient\(/);
            expect(result).not.toMatch(/^linear-gradient\(/);
        });

        it('should return linear-gradient with "to right" for horizontal direction', () => {
            const config = validateGradientConfig({
                colors: testColors,
                direction: 'horizontal'
            }, { checkAccessibility: false });

            const result = generateGradientCSS(config);

            expect(result).toBe('linear-gradient(to right, #ff0000, #00ff00, #0000ff)');
        });

        it('should return linear-gradient with "to bottom" for vertical direction', () => {
            const config = validateGradientConfig({
                colors: testColors,
                direction: 'vertical'
            }, { checkAccessibility: false });

            const result = generateGradientCSS(config);

            expect(result).toBe('linear-gradient(to bottom, #ff0000, #00ff00, #0000ff)');
        });

        it('should return linear-gradient with "to bottom right" for diagonal direction', () => {
            const config = validateGradientConfig({
                colors: testColors,
                direction: 'diagonal'
            }, { checkAccessibility: false });

            const result = generateGradientCSS(config);

            expect(result).toBe('linear-gradient(to bottom right, #ff0000, #00ff00, #0000ff)');
        });

        it('should use radial-gradient for DEFAULT_GRADIENTS.warm (default)', () => {
            const config = validateGradientConfig(DEFAULT_GRADIENTS.warm, {
                checkAccessibility: false
            });

            const result = generateGradientCSS(config);

            expect(result).toMatch(/^radial-gradient\(circle,/);
        });

        it('should use linear-gradient for DEFAULT_GRADIENTS.cool (horizontal)', () => {
            const config = validateGradientConfig(DEFAULT_GRADIENTS.cool, {
                checkAccessibility: false
            });

            const result = generateGradientCSS(config);

            expect(result).toMatch(/^linear-gradient\(to right,/);
        });
    });

    describe('isValidHexColor', () => {
        it('should validate 6-digit hex colors', () => {
            expect(isValidHexColor('#ff0000')).toBe(true);
            expect(isValidHexColor('#FF0000')).toBe(true);
            expect(isValidHexColor('#123abc')).toBe(true);
        });

        it('should validate 3-digit hex colors', () => {
            expect(isValidHexColor('#f00')).toBe(true);
            expect(isValidHexColor('#FFF')).toBe(true);
        });

        it('should reject invalid colors', () => {
            expect(isValidHexColor('ff0000')).toBe(false);
            expect(isValidHexColor('#gg0000')).toBe(false);
            expect(isValidHexColor('#ff00')).toBe(false);
            expect(isValidHexColor('')).toBe(false);
        });
    });

    describe('getLuminance', () => {
        it('should return 0 for black', () => {
            expect(getLuminance('#000000')).toBeCloseTo(0, 5);
        });

        it('should return 1 for white', () => {
            expect(getLuminance('#ffffff')).toBeCloseTo(1, 5);
        });
    });

    describe('getContrastRatio', () => {
        it('should return maximum contrast for black and white', () => {
            const ratio = getContrastRatio('#000000', '#ffffff');
            expect(ratio).toBeCloseTo(21, 0);
        });

        it('should return 1 for identical colors', () => {
            const ratio = getContrastRatio('#ff0000', '#ff0000');
            expect(ratio).toBeCloseTo(1, 5);
        });
    });
});
