export enum StorageItem {
  User = 'App/user',
  LoggedInUser = 'App/loggedInUser',
  JwtToken = 'App/jwtToken',
  RefreshToken = 'App/refreshToken',
  Key = 'App/key',
  Theme = 'App/theme',
  publishAppValue = 'App/publish_app_value',
  activeIndex = 'App/active_index'
}

export const getItem = (itemName: StorageItem): any | null => {
  const item = localStorage.getItem(itemName);
  return item ? JSON.parse(item) : null;
};

export const setItem = (itemName: StorageItem, value: unknown): void => {
  localStorage.setItem(itemName, JSON.stringify(value));
};

export const removeItem = (itemName: StorageItem): void => {
  localStorage.removeItem(itemName);
};
