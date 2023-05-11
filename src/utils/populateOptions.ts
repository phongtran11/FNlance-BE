export const populateUser = () => ({
  path: 'userId',
  select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
});
