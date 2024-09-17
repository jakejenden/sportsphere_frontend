export const validatePassword = (password: string, retypedPassword: string): string => {
    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;
    const special = /[!@#\$%\^&\*]/;
  
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!lowercase.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!uppercase.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!number.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!special.test(password)) {
      return 'Password must contain at least one special character';
    }
    if (password !== retypedPassword) {
      return 'Passwords do not match';
    }
    return '';
  };
  