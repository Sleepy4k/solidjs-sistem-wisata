type TParseData = (data: string | number) => string | number;

const convertToTitleCase = (text: string) => {
  const splitText = text.split("_");
  const titleCaseText = splitText
    .map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1).toLowerCase();

      return firstLetter + restOfWord;
    })
    .join(" ");

  return titleCaseText;
};

const convertStringToNumber: TParseData = (data: string | number) => {
  return Number(data);
};

const convertNumberToString: TParseData = (data: string | number) => {
  return String(data);
};

const convertErrorResponseData = (error: any) => {
  let errorObject: string[] = [];
  const splitError = error.split("\n");

  splitError.map((errorMessage: string) => {
    const colonIndex = errorMessage.indexOf(":");
    const message = errorMessage.substring(colonIndex + 2);

    errorObject.push(message);
  });

  return errorObject;
};

const trimText = (text: string, length: number) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export {
  convertToTitleCase,
  convertStringToNumber,
  convertNumberToString,
  convertErrorResponseData,
  trimText,
};
