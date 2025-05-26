import { mockUsers } from './mock-users';

export const getPaginatedMockUsers = async () => {
  return {
    ok: true,
    users: mockUsers,
    totalPages: 1,
    currentPage: 1
  };
};
