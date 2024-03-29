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
  subModuleData = 'App/submodule_data',
  submissionID = 'App/submissionID',
  moduleSlug = 'App/moduleSlug',
  subModuleSlug = 'App/subModuleSlug',
  moduleID = 'App/moduleID',
  workflowID = 'App/workflowID',
  formKey = 'App/formKey',
  formEdit = 'App/formEdit',
  navHierarchy = 'App/navHierarchy',
  approvers = 'App/approvers',
  editmoduleSlug = 'App/editmoduleSlug',
  editmoduleTitle = 'App/editmoduleTitle',
  editmoduleId = 'App/editmoduleId',
  formID = 'App/formID',
  editSubmissionId = 'App/editSubmissionId',
  editBreadcrumbs = 'App/editBreadcrumbs',
  previewMode = 'App/previewMode'
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

/**
 * Get item from session storage
 * @param {StorageItem} itemName
 * @returns {any | null} Either null or any other primitive or non-primitive type apart from undefined
 */
export const getItemSession = (itemName: StorageItem): any | null => {
  const item = sessionStorage.getItem(itemName);
  return item ? JSON.parse(item) : null;
};

/**
 * Set or update already set item in session storage
 * @param {StorageItem} itemName
 * @param {unknown} value
 */
export const setItemSession = (itemName: StorageItem, value: unknown): void => {
  sessionStorage.setItem(itemName, JSON.stringify(value));
};

/**
 * Remove item from session storage
 * @param {StorageItem} itemName
 */
export const removeItemSession = (itemName: StorageItem): void => {
  sessionStorage.removeItem(itemName);
};
