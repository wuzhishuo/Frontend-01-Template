const BINARY_INTEGER_REGEX = /^(0b|0B)(0|1)+$/
const OCTAL_INTEGER_REGEX = /^(0o|0O)[0-7]+$/
const HEX_INTEGER_REGEX = /^(0x|0X)[0-9a-fA-F]+$/
const DECIMAL_REGEX = /^0|([1-9]\d*).(\d*)?[e|E][\+|\-]?\d+?$/

function convertStringToNumber(str, radix = 10) {
  if (!str || !isNumber(str)) {
    return NaN
  }

  const splitNumber = this.splitNumberString(str,radix)

  if (!splitNumber.number) {
    throw new Error("字符串与进制不匹配")
  }

  let chars = splitNumber.number.split("")
  var number = 0
  var i = 0
  while (i < chars.length && chars[i] !== ".") {
    number = number * radix
    const numberCharCode = chars[i].toUpperCase().charCodeAt(0)
    number +=
      (numberCharCode <= "9".charCodeAt(0)
        ? numberCharCode - "0".charCodeAt(0)
        : numberCharCode - "0".charCodeAt(0) - 7)
    i++
  }

  if (chars[i] == ".") {
    i++
  }

  var fraction = 1
  while (i < chars.length) {
    fraction = fraction / radix
    const numberCharCode = chars[i].charCodeAt(0)
    const currentNumber =
      (numberCharCode <= "9".charCodeAt(0)
        ? numberCharCode - "0".charCodeAt(0)
        : numberCharCode - "0".charCodeAt(0) - 7)
    number += currentNumber * fraction
    i++
  }

  if(!splitNumber.e) {
    return number
  }

  let eNumber = splitNumber.e.match(/\d+/)[0]
  let isNegative = splitNumber.e[0] == '-'

  return number * Math.pow(10,isNegative? -eNumber: eNumber)
}

function isNumber(str) {
  return (
    DECIMAL_REGEX.test(str) ||
    BINARY_INTEGER_REGEX.test(str) ||
    OCTAL_INTEGER_REGEX.test(str) ||
    HEX_INTEGER_REGEX.test(str)
  )
}

function splitNumberString(str, radix) {
  if (!str || !radix) {
    return ""
  }

  str = str.toLowerCase()
  let numberPart = ""
  let ePart = ""

  switch (radix) {
    case 2:
      numberPart = BINARY_INTEGER_REGEX.test(str) ? str.replace("0b", "") : ""
      break
    case 8:
      numberPart = OCTAL_INTEGER_REGEX.test(str) ? str.replace("0o", "") : ""
      break
    case 16:
      numberPart = HEX_INTEGER_REGEX.test(str) ? str.replace("0x", "") : ""
      break
    case 10:
      const ePartRegex = /(e|E){1}(\+|\-)?\d+/
      numberPart = str.replace(ePartRegex, "")
      ePart = ePartRegex.test(str) && str.match(ePartRegex)[0]
      break
    default:
      break
  }

  return {
    number: numberPart,
    e: ePart
  }
}
