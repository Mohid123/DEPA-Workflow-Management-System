export const calculateAspectRatio = (image: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        let height = img.naturalHeight;
        let width = img.naturalWidth;
        if (Math.round(width / height) !== 1) {
          resolve(false);
        }
        resolve(true);
      };
    };
  });
}

export const calculateFileSize = (file: any): boolean => {
  const maxSize = (1024 * 1024) * 2;
  if (
    (file?.type == 'image/jpg' ||
      file?.type == 'image/jpeg' ||
      file?.type == 'image/png' ||
      file?.type == 'image/webp') &&
    file?.size <= maxSize
  ) {
    return true;
  }
  return false;
}