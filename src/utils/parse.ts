const ucFirst = (text: string) => {
  if (!text) return "";
  return firstChar(text, true) + text.slice(1);
};

const ucWords = (text: string) => {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => ucFirst(word))
    .join(" ");
};

const toSlug = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

const convertToTitle = (text: string) => {
  if (!text) return "";
  return text.includes("-")
    ? text
        .split("-")
        .slice(1)
        .map((word) => ucWords(word))
        .join(" ")
        .trim()
    : ucWords(text);
};

const firstChar = (text: string, upperCase: boolean = false) => {
  if (!text) return "";
  return upperCase
    ? text.charAt(0).toUpperCase()
    : text.charAt(0).toLowerCase();
};

const getObjectLength = (obj: Record<string, any>): number => {
  return Object.keys(obj).length;
};

const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = "id-ID"
) => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (getObjectLength(options) === 0) {
    options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
  }

  return d.toLocaleDateString(locale, options);
};

const pluralize = (
  count: number | string,
  singular: string,
  plural: string
) => {
  if (typeof count === "string") {
    count = parseInt(count);
  }
  return count === 1 ? singular : plural;
};

const formatCurrency = (
  amount: number | string,
  minimumFractionDigits: number = 0,
  locale: string = "id-ID",
  currency: string = "IDR"
): string => {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: minimumFractionDigits,
  }).format(amount);
};

export {
  firstChar,
  ucFirst,
  toSlug,
  ucWords,
  convertToTitle,
  formatDate,
  pluralize,
  getObjectLength,
  formatCurrency,
};
