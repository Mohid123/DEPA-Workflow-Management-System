/**
 * Exports generic utility functions for handling all functionality related to manipulating local storage
 */

/**
 * @enum StorageItem
 */
export enum StorageItem {
  User = 'App/user',
  LoggedInUser = 'App/loggedInUser',
  JwtToken = 'App/jwtToken',
  RefreshToken = 'App/refreshToken',
  Key = 'App/key',
  Theme = 'App/theme',
  publishAppValue = 'App/publish_app_value',
  activeIndex = 'App/active_index',
  subModuleData = 'App/submodule_data'
}

/**
 * Get item from local storage
 * @param {StorageItem} itemName 
 * @returns {any | null} Either null or any other primitive or non-primitive type apart from undefined
 */
export const getItem = (itemName: StorageItem): any | null => {
  const item = localStorage.getItem(itemName);
  return item ? JSON.parse(item) : null;
};

/**
 * Set or update already set item in local storage
 * @param {StorageItem} itemName 
 * @param {unknown} value 
 */
export const setItem = (itemName: StorageItem, value: unknown): void => {
  localStorage.setItem(itemName, JSON.stringify(value));
};

/**
 * Remove item from local storage
 * @param {StorageItem} itemName 
 */
export const removeItem = (itemName: StorageItem): void => {
  localStorage.removeItem(itemName);
};
