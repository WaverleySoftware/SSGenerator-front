
const checkIsHaveField = (obj, key: string): boolean => {
  if (obj && typeof obj === 'object') {
    if (obj.fields && obj.fields.length && obj.fields.indexOf(key) !== -1) {
      return true;
    } else {
      let isHasKey = false;

      for (const objKey in obj) {
        if (checkIsHaveField(obj[objKey], key)) {
          isHasKey = true;
          break;
        }
      }

      return isHasKey;
    }
  }

  return false;
};

const focusOnField = (element: HTMLInputElement) => {
  if (element && element.focus && typeof element.focus === 'function') {
    setTimeout(() => {
      element.focus();
      element.scrollIntoView({behavior: 'smooth'});
    }, 500);
  }
};

const FocusOnFirstErrorField = (fieldsTree: any, fieldName: string, element?: HTMLInputElement) => {
  if (fieldsTree && typeof fieldsTree === 'object') {
    for (const key in fieldsTree) {
      if (key) {
        const item = fieldsTree[key];
        const hasField = checkIsHaveField(item, fieldName);

        // Close all panels without first errored
        if (item.hasOwnProperty('status') && item.status) {
          item.status = false;
        }

        // If field has error open panel
        if (hasField) {
          if (item.hasOwnProperty('status') && item.status === false) {
            setTimeout(() => item.status = true);
          }
          FocusOnFirstErrorField(item, fieldName);

          break;
        }
      }
    }
  }

  if (element) {
    setTimeout(() => focusOnField(element), 100);
  }
};

export { FocusOnFirstErrorField };
