async function sleep(miliSeconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, miliSeconds);
  });
}

module.exports = sleep;
