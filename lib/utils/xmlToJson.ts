/**
 * XML to JSON Converter
 *
 * Converts XML documents to JSON using DOMParser.
 * Privacy-first: all processing happens locally in the browser.
 */

export interface XMLToJSONResult {
  success: boolean;
  json: string;
  output: any;
  error?: string;
  inputSize: number;
  outputSize: number;
}

/**
 * Convert XML to JSON
 *
 * Rules:
 * - Element nodes become objects
 * - Multiple child elements with same tag name become arrays
 * - Attributes go under key "_attributes"
 * - Text nodes go under key "_text" (only if non-empty after trimming)
 * - If a node has only text and no attributes/children, return string value directly
 */
export function convertXMLToJSON(xmlString: string): XMLToJSONResult {
  const inputSize = xmlString.length;

  // Validate input
  if (!xmlString.trim()) {
    return {
      success: false,
      json: '',
      output: null,
      error: 'Please enter XML to convert',
      inputSize: 0,
      outputSize: 0,
    };
  }

  try {
    // Parse XML using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    // Check for parse errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'Invalid XML syntax';
      return {
        success: false,
        json: '',
        output: null,
        error: errorText,
        inputSize,
        outputSize: 0,
      };
    }

    // Convert DOM to JSON
    const result = domToJSON(xmlDoc.documentElement);

    // Format output
    const json = JSON.stringify(result, null, 2);
    const outputSize = json.length;

    return {
      success: true,
      json,
      output: result,
      error: undefined,
      inputSize,
      outputSize,
    };
  } catch (error) {
    return {
      success: false,
      json: '',
      output: null,
      error: error instanceof Error ? error.message : 'Conversion failed',
      inputSize,
      outputSize: 0,
    };
  }
}

/**
 * Recursively convert DOM node to JSON
 */
function domToJSON(node: Element): any {
  const obj: any = {};

  // Process attributes
  if (node.attributes.length > 0) {
    const attrs: any = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      attrs[attr.name] = attr.value;
    }
    obj._attributes = attrs;
  }

  // Process child nodes
  const children: any = {};
  let hasChildElements = false;
  let textContent = '';

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];

    if (child.nodeType === Node.ELEMENT_NODE) {
      hasChildElements = true;
      const childElement = child as Element;
      const childName = childElement.nodeName;
      const childValue = domToJSON(childElement);

      // Handle multiple children with same name
      if (children[childName]) {
        // Convert to array if not already
        if (!Array.isArray(children[childName])) {
          children[childName] = [children[childName]];
        }
        children[childName].push(childValue);
      } else {
        children[childName] = childValue;
      }
    } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
      textContent += child.textContent || '';
    }
  }

  // Handle text content
  const trimmedText = textContent.trim();
  if (trimmedText) {
    // If node has only text and no attributes or child elements, return string directly
    if (!hasChildElements && node.attributes.length === 0) {
      return trimmedText;
    }
    obj._text = trimmedText;
  }

  // Merge children into obj
  Object.assign(obj, children);

  // If obj is empty (self-closing tag with no attributes), return empty object
  if (Object.keys(obj).length === 0) {
    return {};
  }

  return obj;
}

/**
 * Validate XML syntax
 */
export function validateXML(xmlString: string): { valid: boolean; error?: string } {
  if (!xmlString.trim()) {
    return { valid: false, error: 'XML is empty' };
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = xmlDoc.querySelector('parsererror');

    if (parserError) {
      return {
        valid: false,
        error: parserError.textContent || 'Invalid XML syntax',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}
