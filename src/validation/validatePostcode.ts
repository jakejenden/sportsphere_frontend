export const validatePostcode = (postcode: string): string => {
  const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/i;
  return postcodeRegex.test(postcode.trim()) ? '' : 'Postcode does not match UK postcode format';
};
