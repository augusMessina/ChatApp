export const checkUsernameValid = (username: string): string => {
  // Check if the username has between 4 and 12 characters
  if (username.length < 4 || username.length > 12) {
    return "Username must contain between 4 and 12 characters";
  }

  // Check if the username starts with a letter
  if (!/^[a-zA-Z]/.test(username)) {
    return "First character must be a letter";
  }

  // Check if the username doesn't contain any special character other than "-", "_", or "."
  if (!/^[a-zA-Z0-9-_.]+$/.test(username)) {
    return "Username can't contain other special characters than dash, underscore and dot";
  }

  // Check if the username doesn't contain any spaces
  if (/\s/.test(username)) {
    return "Username can't contain spaces";
  }

  // If all conditions are met, the username is valid
  return "valid";
};
