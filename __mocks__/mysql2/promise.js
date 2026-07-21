const mockConnection = {
  release: jest.fn(),
};

const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

module.exports = {
  createPool: jest.fn(() => mockPool),
};
