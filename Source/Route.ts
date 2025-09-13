import { Method } from "routing-controllers";
import { HTTP_Methods } from "fundamental-constants";
import { Logger, InvalidParameterValueError } from "@yamato-daiwa/es-extensions";


export function Route(
  HTTP_Method: HTTP_Methods, pathTemplate: string
): (
  target: unknown, propertyKey: string, descriptor: PropertyDescriptor
) => void {
  return (
    target: unknown, propertyKey: string, descriptor: PropertyDescriptor
  ): void => {

    let HTTP_MethodInRoutingControllersFormat: Parameters<typeof Method>[0];

    /* eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check --
     * Not all HTTP methods supported by **routing-controllers**. */
    switch (HTTP_Method) {

      case HTTP_Methods.get:
        HTTP_MethodInRoutingControllersFormat = "get";
        break;

      case HTTP_Methods.post:
        HTTP_MethodInRoutingControllersFormat = "post";
        break;

      case HTTP_Methods.put:
        HTTP_MethodInRoutingControllersFormat = "put";
        break;

      case HTTP_Methods.delete:
        HTTP_MethodInRoutingControllersFormat = "delete";
        break;

      case HTTP_Methods.patch:
        HTTP_MethodInRoutingControllersFormat = "patch";
        break;

      case HTTP_Methods.head:
        HTTP_MethodInRoutingControllersFormat = "head";
        break;

      case HTTP_Methods.options:
        HTTP_MethodInRoutingControllersFormat = "options";
        break;

      case HTTP_Methods.connect:
        HTTP_MethodInRoutingControllersFormat = "connect";
        break;

      case HTTP_Methods.trace:
        HTTP_MethodInRoutingControllersFormat = "trace";
        break;

      default:

        Logger.throwErrorWithFormattedMessage({
          errorInstance: new InvalidParameterValueError({
            parameterNumber: 1,
            parameterName: "HTTP_Method",
            messageSpecificPart: `The value "${ HTTP_Method }" is not supported.`
          }),
          title: InvalidParameterValueError.localization.defaultTitle,
          occurrenceLocation: "Route(HTTP_Method, pathTemplate)"
        });

    }

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-call -- 「routing-controller」ライブラリの型定義は未完成。 */
    Method(HTTP_MethodInRoutingControllersFormat, pathTemplate)(target, propertyKey, descriptor);

  };
}
