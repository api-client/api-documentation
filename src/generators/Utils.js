/**
   * @param {any} obj
   * @return {string} 
   */
export function toXml(obj) {
  let xml = '';
  Object.keys(obj).forEach((prop) => {
    xml += Array.isArray(obj[prop]) ? '' : `<${prop}>`;
    if (Array.isArray(obj[prop])) {
      obj[prop].forEach((item) => {
        xml += `<${prop}>\n\t`;
        xml += toXml({ ...item });
        xml += `</${prop}>\n`;
      });
    } else if (typeof obj[prop] === "object") {
      xml += toXml({ ...obj[prop] });
    } else {
      xml += obj[prop];
    }
    xml += Array.isArray(obj[prop]) ? '' : `</${prop}>\n`;
  });
  xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
  return xml
}

/**
 * @return {string} A current date in the YYYY-MM-DD format.
 */
export function dateExample() {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @return {string} A current time in the HH-mm-ss format.
 */
export function timeExample() {
  const d = new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * @param {string=} format The data time format
 * @return {string} A current time in the HH-mm-ss format.
 */
export function dateTimeExample(format='rfc3339') {
  const d = new Date();
  if (format === 'rfc2616') {
    return d.toUTCString();
  }
  if (format === 'rfc3339') {
    const year = d.getUTCFullYear();
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    const seconds = d.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = d.getUTCMilliseconds().toString().padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  } 
  return '';
}

/**
 * @return {string} A current time in the HH-mm-ss format.
 */
export function dateTimeOnlyExample() {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
