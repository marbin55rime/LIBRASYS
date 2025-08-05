export const setAdminInfo = (adminInfo) => {
  localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
};

export const getAdminInfo = () => {
  const adminInfo = localStorage.getItem('adminInfo');
  const parsedInfo = adminInfo ? JSON.parse(adminInfo) : null;
  return parsedInfo;
};

export const removeAdminInfo = () => {
  localStorage.removeItem('adminInfo');
};