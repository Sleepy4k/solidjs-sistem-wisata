import { APP_ENV } from "@consts";
import { EDebugType } from "@enums";

const println = (
  title: string,
  message: string,
  type: EDebugType = EDebugType.OTHER
) => {
  const isDevMode = APP_ENV === "development";
  const content = `[${title}] ${message}`;

  switch (type) {
    case EDebugType.ERROR:
      isDevMode && console.log(content);
      break;

    case EDebugType.WARN:
      isDevMode && console.warn(content);
      break;

    case EDebugType.SUCCESS:
      isDevMode && console.info(content);
      break;

    case EDebugType.OTHER:
      isDevMode && console.log(content);
      break;

    default:
      isDevMode && console.log(content);
      break;
  }
};

export { println };
