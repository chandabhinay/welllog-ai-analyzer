/**
 * LAS File Parser Utility
 * Parses LAS (Log ASCII Standard) files and extracts well information and curve data
 */

class LASParser {
  constructor(fileContent) {
    this.content = fileContent;
    this.version = null;
    this.wellInfo = {};
    this.curves = [];
    this.data = [];
  }

  /**
   * Parse the entire LAS file
   */
  parse() {
    const lines = this.content.split('\n');
    let currentSection = null;
    let dataSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Detect sections
      if (line.startsWith('~')) {
        currentSection = this.detectSection(line);
        if (currentSection === 'data') {
          dataSection = true;
          this.parseDataSection(lines.slice(i + 1));
          break;
        }
        continue;
      }

      // Parse based on current section
      if (!dataSection) {
        if (currentSection === 'version') {
          this.parseVersionLine(line);
        } else if (currentSection === 'well') {
          this.parseWellLine(line);
        } else if (currentSection === 'curve') {
          this.parseCurveLine(line);
        }
      }
    }

    return {
      version: this.version,
      wellInfo: this.wellInfo,
      curves: this.curves,
      data: this.data
    };
  }

  /**
   * Detect which section we're in
   */
  detectSection(line) {
    const lower = line.toLowerCase();
    if (lower.includes('version')) return 'version';
    if (lower.includes('well')) return 'well';
    if (lower.includes('curve')) return 'curve';
    if (lower.includes('parameter')) return 'parameter';
    if (lower.includes('ascii') || lower.includes('data')) return 'data';
    return null;
  }

  /**
   * Parse version information
   */
  parseVersionLine(line) {
    const match = line.match(/VERS\.?\s+([0-9.]+)/i);
    if (match) {
      this.version = match[1];
    }
  }

  /**
   * Parse well information line
   */
  parseWellLine(line) {
    // Format: MNEM.UNIT DATA: DESCRIPTION
    const parts = line.split(':');
    if (parts.length < 2) return;

    const leftPart = parts[0].trim();
    const description = parts.slice(1).join(':').trim();

    // Extract mnemonic and value
    const tokens = leftPart.split(/\s+/);
    if (tokens.length < 2) return;

    const mnemonic = tokens[0].split('.')[0];
    const value = tokens[tokens.length - 1];

    // Store well information
    const key = this.camelCase(mnemonic);
    this.wellInfo[key] = {
      value: value,
      description: description,
      mnemonic: mnemonic
    };
  }

  /**
   * Parse curve information line
   */
  parseCurveLine(line) {
    // Format: MNEM.UNIT API_CODE: DESCRIPTION
    const parts = line.split(':');
    if (parts.length < 2) return;

    const leftPart = parts[0].trim();
    const description = parts.slice(1).join(':').trim();

    const tokens = leftPart.split(/\s+/);
    if (tokens.length < 1) return;

    const fullMnemonic = tokens[0];
    const [mnemonic, unit] = fullMnemonic.split('.');

    // Only add if it's a valid curve name
    if (mnemonic && !mnemonic.startsWith('#')) {
      this.curves.push({
        mnemonic: mnemonic,
        unit: unit || 'UNKN',
        description: description.trim()
      });
    }
  }

  /**
   * Parse data section
   */
  parseDataSection(lines) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('~')) continue;

      // Split by whitespace and parse values
      const values = trimmed.split(/\s+/).map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? null : num;
      });

      if (values.length > 0) {
        const dataPoint = {};
        this.curves.forEach((curve, index) => {
          if (index < values.length) {
            dataPoint[curve.mnemonic] = values[index];
          }
        });
        this.data.push(dataPoint);
      }
    }
  }

  /**
   * Convert string to camelCase
   */
  camelCase(str) {
    return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Get parsed well metadata
   */
  getWellMetadata() {
    return {
      wellName: this.wellInfo.well?.value || 'Unknown',
      company: this.wellInfo.comp?.value,
      field: this.wellInfo.fld?.value,
      location: this.wellInfo.loc?.value,
      country: this.wellInfo.ctry?.value,
      state: this.wellInfo.stat?.value,
      uwi: this.wellInfo.uwi?.value,
      api: this.wellInfo.api?.value,
      startDepth: parseFloat(this.wellInfo.strt?.value),
      stopDepth: parseFloat(this.wellInfo.stop?.value),
      step: parseFloat(this.wellInfo.step?.value),
      nullValue: parseFloat(this.wellInfo.null?.value || -9999),
      dateAnalyzed: this.wellInfo.date?.value
    };
  }

  /**
   * Get curve names
   */
  getCurveNames() {
    return this.curves.map(c => c.mnemonic);
  }

  /**
   * Get data for specific curves within depth range
   */
  getDataByDepthRange(startDepth, endDepth, curveNames = null) {
    const filtered = this.data.filter(point => {
      const depth = point.Depth || point.DEPT || point.depth;
      return depth >= startDepth && depth <= endDepth;
    });

    if (curveNames && curveNames.length > 0) {
      return filtered.map(point => {
        const filtered = { Depth: point.Depth || point.DEPT || point.depth };
        curveNames.forEach(name => {
          if (point[name] !== undefined) {
            filtered[name] = point[name];
          }
        });
        return filtered;
      });
    }

    return filtered;
  }
}

module.exports = LASParser;
