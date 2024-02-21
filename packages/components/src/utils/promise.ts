export const delay = (ms: number = 0) => new Promise((res) => {
  setTimeout(res, ms);
});
