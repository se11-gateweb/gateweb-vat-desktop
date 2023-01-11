const reverseIndex = (obj) => {
  const ret = {};
  Object.keys(obj).forEach((key) => {
    ret[obj[key]] = key;
  });
  return ret;
};

const exports = { reverseIndex };

export default exports;
