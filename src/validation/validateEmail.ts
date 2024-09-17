export const validateEmail = (email: string, isEmailUnique: boolean): string => {
    if (!isEmailUnique) {
      return 'Email is already registered'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Invalid email address';
  };
  