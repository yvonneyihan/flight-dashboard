const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(() => mockClient),
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue('OK'),
  keys: jest.fn().mockResolvedValue([]),
  del: jest.fn().mockResolvedValue(1),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  createClient: jest.fn(() => mockClient),
};
