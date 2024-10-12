export const mockUsers = [
  {
    id: "1",
    email: "user@example.com",
    password: "1", // bcrypt hash of 'password123'
    role: "user",
  },
];

export const mockDb = {
  findUserByEmail: async (email: string) => {
    return mockUsers.find((user) => user.email === email) || null;
  },
};
