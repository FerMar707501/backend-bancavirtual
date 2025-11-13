const generateAccountNumber = () => {
  const prefix = 'BV';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateLoanNumber = () => {
  const prefix = 'PR';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateTransactionNumber = () => {
  const prefix = 'TRX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${timestamp}${random}`;
};

module.exports = {
  generateAccountNumber,
  generateLoanNumber,
  generateTransactionNumber
};
