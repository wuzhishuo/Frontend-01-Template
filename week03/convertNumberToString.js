function convertNumberToString(number, radix = 10) {
  var integer = Math.floor(number)
  var fraction = number - integer
  var string = ""

  while (integer > 0) {
    string = String(integer % radix) + string
    integer = Math.floor(integer / radix)
  }

  if(fraction) {
    string += '.'

    while(fraction) {
      fraction = fraction * radix
      let integerPart = Math.floor(fraction%radix)
      string += String(integerPart)
      fraction -= integerPart
    }
  }


  return string
}
