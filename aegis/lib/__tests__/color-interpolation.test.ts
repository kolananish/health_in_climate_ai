import { getRiskColor, interpolateColor } from '@/lib/utils';

describe('Color Interpolation', () => {
  describe('interpolateColor', () => {
    it('returns first color when factor is 0', () => {
      const result = interpolateColor('#FF0000', '#00FF00', 0);
      expect(result).toBe('#ff0000');
    });

    it('returns second color when factor is 1', () => {
      const result = interpolateColor('#FF0000', '#00FF00', 1);
      expect(result).toBe('#00ff00');
    });

    it('interpolates correctly at 0.5 factor', () => {
      const result = interpolateColor('#000000', '#FFFFFF', 0.5);
      expect(result).toBe('#808080');
    });

    it('handles colors without # prefix', () => {
      const result = interpolateColor('FF0000', '00FF00', 0.5);
      expect(result).toBe('#808000');
    });

    it('clamps factor to valid range', () => {
      const result1 = interpolateColor('#FF0000', '#00FF00', -0.5);
      expect(result1).toBe('#ff0000');
      
      const result2 = interpolateColor('#FF0000', '#00FF00', 1.5);
      expect(result2).toBe('#00ff00');
    });
  });

  describe('getRiskColor', () => {
    it('returns green for risk score 0.0', () => {
      const color = getRiskColor(0.0);
      expect(color).toBe('#10b981'); // Should be pure green
    });

    it('returns red for risk score 1.0', () => {
      const color = getRiskColor(1.0);
      expect(color).toBe('#ef4444'); // Should be pure red
    });

    it('returns interpolated color for mid-range scores', () => {
      const color = getRiskColor(0.5);
      // Should be yellow at 0.5
      expect(color).toBe('#eab308');
    });

    it('clamps risk score to valid range', () => {
      const colorLow = getRiskColor(-0.5);
      const colorHigh = getRiskColor(1.5);
      
      expect(colorLow).toBe('#10b981'); // Should be green (0.0)
      expect(colorHigh).toBe('#ef4444'); // Should be red (1.0)
    });

    it('provides smooth interpolation between color stops', () => {
      // Test that colors change smoothly
      const color1 = getRiskColor(0.1);
      const color2 = getRiskColor(0.15);
      const color3 = getRiskColor(0.2);
      
      // All should be different due to interpolation
      expect(color1).not.toBe(color2);
      expect(color2).not.toBe(color3);
      expect(color1).not.toBe(color3);
    });
  });
});