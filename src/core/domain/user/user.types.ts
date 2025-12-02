/**
 * Domain model for an account owner.
 */
export type User = {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
};
