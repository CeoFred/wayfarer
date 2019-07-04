const success = data => ({
  status: 'success',
  data,
});


const error = msg => ({
  status: 'erorr',
  error: msg,
});

module.exports = {
  error,
  success,
};
