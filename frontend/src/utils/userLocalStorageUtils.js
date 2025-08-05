export const setUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  const parsedInfo = userInfo ? JSON.parse(userInfo) : null;
  return parsedInfo;
};

export const removeUserInfo = () => {
  localStorage.removeItem('userInfo');
};