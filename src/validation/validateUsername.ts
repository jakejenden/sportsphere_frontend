export const validateUsername = (username: string, isUsernameUnique: boolean): string => {
    if (!isUsernameUnique) {
      return 'Username is already taken'
    }
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    return usernameRegex.test(username)
      ? ''
      : 'Username must be 3-20 alphanumeric characters';
  };
  