export const setAdminInfo = (adminInfo) => {
  const now = new Date();
  let expiryTime = 0;

  if (adminInfo.expiresIn) {
    const expiresInValue = adminInfo.expiresIn;
    const num = parseInt(expiresInValue.slice(0, -1));
    const unit = expiresInValue.slice(-1);

    if (unit === 'd') {
      expiryTime = now.getTime() + num * 24 * 60 * 60 * 1000;
    } else if (unit === 'h') {
      expiryTime = now.getTime() + num * 60 * 60 * 1000;
    } else if (unit === 'm') {
      expiryTime = now.getTime() + num * 60 * 1000;
    } else if (unit === 's') {
      expiryTime = now.getTime() + num * 1000;
    }
  }

  localStorage.setItem('adminInfo', JSON.stringify({ ...adminInfo, expiry: expiryTime }));
};

export const getAdminInfo = () => {
  const adminInfo = localStorage.getItem('adminInfo');
  const parsedInfo = adminInfo ? JSON.parse(adminInfo) : null;

  if (parsedInfo && parsedInfo.expiry) {
    const now = new Date();
    if (typeof parsedInfo.expiry === 'number' && now.getTime() > parsedInfo.expiry) {
      removeAdminInfo();
      return null;
    }
  }
  return parsedInfo;
};

export const removeAdminInfo = () => {
  localStorage.removeItem('adminInfo');
};