const users = [];

const addUser = ({ socketId, userId, name, email }) => {
  users.push({ socketId, userId, name, email });
};

const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    users.splice(index, 1);
  }
};

module.exports = { users, addUser, removeUser };
