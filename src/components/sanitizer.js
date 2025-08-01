import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty 
 * @param {Object} options 
 * @returns {string} 
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitize text content (strips all HTML)
 * @param {string} dirty - The potentially unsafe content
 * @returns {string} - Plain text content
 */
export const sanitizeText = (dirty) => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize rich text content (allows more HTML tags for rich content)
 * @param {string} dirty - The potentially unsafe HTML content
 * @returns {string} - Sanitized rich HTML content
 */
export const sanitizeRichText = (dirty) => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "img",
      "div",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "class",
      "id",
      "style",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
  });
};

/**
 * Sanitize URLs to prevent javascript: and data: URL attacks
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL or empty string if unsafe
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Remove any whitespace
  const cleanUrl = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "about:",
  ];
  const lowerUrl = cleanUrl.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  // Allow only http, https, mailto, tel protocols and relative URLs
  const allowedProtocolPattern = /^(https?:\/\/|mailto:|tel:|\/|\.\/|#)/i;

  if (!allowedProtocolPattern.test(cleanUrl)) {
    return "";
  }

  return cleanUrl;
};

/**
 * Sanitize CSS styles to prevent CSS injection attacks
 * @param {string} styles - The CSS styles to sanitize
 * @returns {string} - Sanitized CSS styles
 */
export const sanitizeCSS = (styles) => {
  if (!styles || typeof styles !== "string") {
    return "";
  }

  // Remove dangerous CSS properties and values
  const dangerousPatterns = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /import/gi,
    /@import/gi,
  ];

  let sanitized = styles;
  dangerousPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized;
};

/**
 * Create a safe React component for rendering sanitized HTML
 * @param {string} html - The HTML content to render
 * @param {Object} options - Sanitization options
 * @returns {Object} - Props object with dangerouslySetInnerHTML
 */
export const createSafeHTML = (html, options = {}) => {
  const sanitized = sanitizeHTML(html, options);
  return {
    dangerouslySetInnerHTML: { __html: sanitized },
  };
};

/**
 * Sanitize form input data
 * @param {Object} formData - The form data object
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  if (!formData || typeof formData !== "object") {
    return {};
  }

  const sanitized = {};

  Object.keys(formData).forEach((key) => {
    const value = formData[key];

    if (typeof value === "string") {
      
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else {
      
      sanitized[key] = value;
    }
  });

  return sanitized;
};


export { DOMPurify };