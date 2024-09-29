export const convertHexToDecimal = (hexColor) => {
  // Remove the "#" symbol if present
  hexColor = hexColor.replace(/^#/, "")

  // Convert the hexadecimal string to a decimal number
  const decimalValue = parseInt(hexColor, 16)

  // Add the "0x" prefix to denote a hexadecimal number in JavaScript
  const result = `0x${decimalValue.toString(16)}`

  return result
}
