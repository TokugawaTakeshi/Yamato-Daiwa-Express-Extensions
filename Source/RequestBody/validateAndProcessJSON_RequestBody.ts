import {
  RawObjectDataProcessor,
  HTTP_StatusCodes,
  isArbitraryObject,
  Logger,
  InvalidParameterValueError
} from "@yamato-daiwa/es-extensions";
import type { ReadonlyParsedJSON } from "@yamato-daiwa/es-extensions";
import type { Response } from "express";


export function validateAndProcessJSON_RequestBody<RequestData extends ReadonlyParsedJSON>(
  validRequestBodySpecification: RawObjectDataProcessor.ObjectDataSpecification
): (request: unknown, response: unknown, toNextMiddleware: () => void) => void {
  return (request: unknown, response: unknown, toNextMiddleware: () => void): void => {

    if (!isArbitraryObject(request)) {

      /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
      * ※ The "routing-controllers" package does not provide the type guard for `Response` interface. */
      (response as Response).status(HTTP_StatusCodes.internalServerError);

      Logger.logError({
        errorType: InvalidParameterValueError.NAME,
        title: InvalidParameterValueError.localization.defaultTitle,
        description: InvalidParameterValueError.localization.generateDescription({
          parameterName: "request",
          parameterNumber: 1,
          messageSpecificPart: `The "request" is not object and has type "${ typeof request }"`
        }),
        occurrenceLocation: "validateAndProcessRequestBody -> innerFunction(request, response, toNextMiddleware)"
      });

      return;

    }


    const requestBodyProcessingResult: RawObjectDataProcessor.ProcessingResult<RequestData> = RawObjectDataProcessor.
      process(request.body, validRequestBodySpecification);


    if (requestBodyProcessingResult.rawDataIsInvalid) {

      /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- See ※ */
      (response as Response).
          status(HTTP_StatusCodes.badRequest).
          json(requestBodyProcessingResult.validationErrorsMessages);

      return;

    }

    request.body = requestBodyProcessingResult.processedData;

    toNextMiddleware();

  };

}
