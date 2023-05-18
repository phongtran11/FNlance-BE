export const populateUser = () => ({
  path: 'userId',
  select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
});

export const populateRequestReceive = () => ({
  path: 'requestReceived',
});
