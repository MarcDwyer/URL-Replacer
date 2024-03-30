export function replaceSubstring(
  originalString: string,
  searchString: string,
  replacementString: string
) {
  // Use the indexOf method to find the index of the first occurrence of searchString
  const index = originalString.indexOf(searchString);

  // If the searchString is not found, return the original string
  if (index === -1) {
    return originalString;
  }

  // Use string concatenation to create the new string with the replacement
  const newString =
    originalString.substring(0, index) +
    replacementString +
    originalString.substring(index + searchString.length);

  return newString;
}
