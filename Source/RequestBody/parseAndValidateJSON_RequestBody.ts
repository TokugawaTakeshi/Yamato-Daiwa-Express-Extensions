/* ─── Framework ──────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Express from "express";
import BodyParser from "body-parser";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  RawObjectDataProcessor,
  HTTP_StatusCodes,
  type ReadonlyParsedJSON,
  isNeitherUndefinedNorNull,
  Logger
} from "@yamato-daiwa/es-extensions";


export function parseAndValidateJSON_RequestBody<RequestData extends ReadonlyParsedJSON>(
  {
    requestBodySizeLimit__bytesPackageFormat,
    validationAndProcessing,
    mustLogDataAfterParsing = false
  }: Readonly<{
    requestBodySizeLimit__bytesPackageFormat: string | number;
    validationAndProcessing: RawObjectDataProcessor.ObjectDataSpecification;
    mustLogDataAfterParsing?: boolean;
  }>
): (request: unknown, response: unknown, toNextMiddleware: (error?: unknown) => void) => void {
  return (_request: unknown, _response: unknown, toNextMiddleware: (error?: unknown) => void): void => {

    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
     * The `Express.Request` is the interface and has no the type guard.
     * Although it extends `http.IncomingMessage` class, we need `body` field which does not exist on this class.
     * Being designed for express framework, this middleware assumes that `_request` has `Express.Request` type. */
    const request: Express.Request = _request as Express.Request;

    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
     * The `Express.Response` is the interface and has no the type guard.
     * Being designed for express framework, this middleware assumes that `_response` has `Express.Response` type. */
    const response: Express.Response = _response as Express.Response;

    BodyParser.json({ limit: requestBodySizeLimit__bytesPackageFormat })(
      request,
      response,
      (error?: unknown): void => {

        if (isNeitherUndefinedNorNull(error)) {
          toNextMiddleware(error);
          return;
        }


        Logger.logInfo({
          title: `${ request.method.toUpperCase() }::${ request.url }`,
          description: "Parsed request body:",
          additionalData: request.body,
          mustOutputIf: mustLogDataAfterParsing
        });

        const requestBodyValidationAndProcessingResult: RawObjectDataProcessor.ProcessingResult<RequestData> =
            RawObjectDataProcessor.process(request.body, validationAndProcessing);

        if (requestBodyValidationAndProcessingResult.isRawDataInvalid) {

          response.
              status(HTTP_StatusCodes.badRequest).
              json(requestBodyValidationAndProcessingResult.validationErrorsMessages);

          return;

        }


        request.body = requestBodyValidationAndProcessingResult.processedData;

        toNextMiddleware();

      }
    );

  };

}
