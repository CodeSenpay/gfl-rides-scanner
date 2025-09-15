import Toast from "react-native-toast-message";

export const showSuccessMessage = (title: string, message: string) => {
  Toast.show({
    type: "success", // 'success' | 'error' | 'info'
    text1: title,
    text2: message,
  });
};

export const showErrorMessage = (title: string, message: string) => {
  Toast.show({
    type: "error", // 'success' | 'error' | 'info'
    text1: title,
    text2: message,
  });
};
