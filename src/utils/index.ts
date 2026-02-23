import { println } from "./debug";
import LocalStorage from "./storage";
import {
  firstChar,
  ucFirst,
  ucWords,
  toSlug,
  pluralize,
  formatDate,
  convertToTitle,
  getObjectLength,
  formatCurrency,
} from "./parse";
import toast, { showToast, success, error, info, debug, pauseToast, resumeToast } from "./toast";

export {
  println,
  LocalStorage,
  firstChar,
  ucFirst,
  ucWords,
  toSlug,
  pluralize,
  formatDate,
  convertToTitle,
  getObjectLength,
  formatCurrency,
  toast,
  showToast,
  success,
  error,
  info,
  pauseToast,
  resumeToast,
  debug,
};
