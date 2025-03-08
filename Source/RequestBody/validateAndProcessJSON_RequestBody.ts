/* ─── Framework ──────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Express from "express";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  RawObjectDataProcessor,
  HTTP_StatusCodes,
  type ReadonlyParsedJSON,
  Logger
} from "@yamato-daiwa/es-extensions";


export function validateAndProcessJSON_RequestBody<RequestData extends ReadonlyParsedJSON>(
  validationAndProcessing: RawObjectDataProcessor.ObjectDataSpecification,
  { mustLogDataAfterParsing = false }: Readonly<{ mustLogDataAfterParsing?: boolean; }> = { mustLogDataAfterParsing: false }
): (request: unknown, response: unknown, toNextMiddleware: () => void) => void {
  return (_request: unknown, _response: unknown, toNextMiddleware: () => void): void => {

    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
     * The `Express.Request` is the interface and has no the type guard.
     * Although it extends `http.IncomingMessage` class, we need `body` field which does not exist on this class.
     * Being designed for express framework, this middleware assumes that `_request` has `Express.Request` type. */
    const request: Express.Request = _request as Express.Request;

    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
     * The `Express.Response` is the interface and has no the type guard.
     * Being designed for express framework, this middleware assumes that `_response` has `Express.Response` type. */
    const response: Express.Response = _response as Express.Response;

    Logger.logInfo({
      title: `${ request.method.toUpperCase() }::${ request.url }`,
      description: "Parsed request body:",
      additionalData: request.body,
      mustOutputIf: mustLogDataAfterParsing
    });

    const requestBodyProcessingResult: RawObjectDataProcessor.ProcessingResult<RequestData> = RawObjectDataProcessor.
      process(request.body, validationAndProcessing);


    if (requestBodyProcessingResult.rawDataIsInvalid) {

      response.
          status(HTTP_StatusCodes.badRequest).
          json(requestBodyProcessingResult.validationErrorsMessages);

      return;

    }

    request.body = requestBodyProcessingResult.processedData;

    toNextMiddleware();

  };

}
