/* eslint-disable max-classes-per-file -- This rule is unsolicited for classes inside namespaces. */

/* ─── Framework ──────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Express from "express";
import {
  createParamDecorator,
  BadRequestError,
  type Action,
  HttpError
} from "routing-controllers";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  RawObjectDataProcessor,
  type ReadonlyParsedJSON_Object,
  Logger,
  HTTP_StatusCodes
} from "@yamato-daiwa/es-extensions";
import QueryString from "qs";


abstract class QueryParametersProcessor {

  private static defaultDeserializer: QueryParametersProcessor.Deserializer = QueryString.parse;

  public static setDefaultDeserializer(deserializer: QueryParametersProcessor.Deserializer): void {
    QueryParametersProcessor.defaultDeserializer = deserializer;
  }


  public static process<QueryParameters extends ReadonlyParsedJSON_Object>(
    propertiesSpecification: RawObjectDataProcessor.PropertiesSpecification,
    deserializer: QueryParametersProcessor.Deserializer = QueryParametersProcessor.defaultDeserializer
  ): (object: object, method: string, index: number) => void {
    return createParamDecorator({
      required: true,
      value(action: Action): unknown {

        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Express.js is the target framework. */
        const request: Express.Request = action.request as Express.Request;

        let serializedQueryParameters: string | undefined;

        try {

          serializedQueryParameters = request.url.split("?")[1];

        } catch (error: unknown) {

          Logger.throwErrorAndLog({
            errorInstance: new QueryParametersProcessor.QueryParametersDeserializingError(),
            title: QueryParametersProcessor.QueryParametersDeserializingError.localization.defaultTitle,
            occurrenceLocation: "QueryParametersProcessor.process(propertiesSpecification, deserializer)",
            innerError: error
          });

        }


        /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --
        * Unfortunately even explicit type annotation for `serializedQueryParameters` does not assure TypeScript that
        *   this value could be undefined as array element which could not present. */
        const deserializedQueryParameters: unknown = deserializer(serializedQueryParameters ?? "");

        const processingResult: RawObjectDataProcessor.ProcessingResult<QueryParameters> = RawObjectDataProcessor.process(
          deserializedQueryParameters,
          {
            nameForLogging: "DeserializedQueryParameters",
            subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
            properties: propertiesSpecification
          }
        );

        if (processingResult.rawDataIsInvalid) {
          throw new BadRequestError(processingResult.validationErrorsMessages.join("\n"));
        }


        return processingResult.processedData;

      }
    });

  }

}


namespace QueryParametersProcessor {

  export type Deserializer = (serializedQueryParameters: string) => ReadonlyParsedJSON_Object;

  export class QueryParametersDeserializingError extends HttpError {

    public static readonly NAME: string = "QueryParametersDeserializingError";

    public static localization: QueryParametersDeserializingError.Localization = {
      defaultTitle: "Query Parameters Deserializing Failed",
      description: "The error has occurred during deserializing of query parameters"
    };


    /* eslint-disable-next-line id-denylist -- Possibly this name is required by `routing-controllers`. */
    public args: Array<unknown>;


    public constructor(argumentsForInternalLogging: Array<unknown> = []) {

      super(HTTP_StatusCodes.internalServerError);
      Object.setPrototypeOf(this, QueryParametersDeserializingError.prototype);

      this.name = QueryParametersDeserializingError.NAME;
      this.message = QueryParametersDeserializingError.localization.description;

      /* eslint-disable-next-line id-denylist -- Possibly this name is required by `routing-controllers`. */
      this.args = argumentsForInternalLogging;

    }


    public toJSON(): Readonly<{
      type: string;
      title: string;
      message: string;
      status: number;
    }> {
      return {
        type: QueryParametersDeserializingError.NAME,
        title: QueryParametersDeserializingError.localization.defaultTitle,
        message: this.message,
        status: this.httpCode
      };
    }

  }

  export namespace QueryParametersDeserializingError {

    export type Localization = Readonly<{
      defaultTitle: string;
      description: string;
    }>;

  }

}


export default QueryParametersProcessor;
