/**
 * Utility functions for authentication and user management
 */

export interface LoginIdentifier {
  email: string;
  isUsername: boolean;
}

/**
 * Resolves login identifier to email format
 * @param input - Either email or username
 * @returns Object with email and flag indicating if it was a username
 */
export const resolveLoginIdentifier = (input: string): LoginIdentifier => {
  const isEmail = input.includes('@');
  
  if (isEmail) {
    return {
      email: input,
      isUsername: false
    };
  } else {
    // Convert username to alias email format
    return {
      email: `${input}@club.local`,
      isUsername: true
    };
  }
};

/**
 * Generates alias email for staff/owner usernames
 * @param username - The username to convert
 * @returns Alias email in format username@club.local
 */
export const generateAliasEmail = (username: string): string => {
  return `${username}@club.local`;
};

/**
 * Extracts username from alias email
 * @param aliasEmail - Email in format username@club.local
 * @returns Username part if it's an alias email, otherwise null
 */
export const extractUsername = (aliasEmail: string): string | null => {
  if (aliasEmail.endsWith('@club.local')) {
    return aliasEmail.replace('@club.local', '');
  }
  return null;
};