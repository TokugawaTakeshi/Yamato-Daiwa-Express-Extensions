# Yamato Daiwa Express Extensions

Additional functions for [express](https://www.npmjs.com/package/express) and its plugins, and also for 
  [routing-controllers](https://www.npmjs.com/package/routing-controllers).


## Installation

```Bash
npm i @yamato-daiwa/express-extensions -E
```

Also, install the following peer dependencies if not installed yet.

+ **body-parser**: ~1.20.0
+ **express**: ~4.21.0
+ **express-session**: ~1.18.0
+ **routing-controllers**: ~0.10.0


## Functionality

+ [`ExpressMiddleware`](#expressmiddleware)
+ [`Route`]()

+ Session

  + [`saveExpressSession`](#saveexpresssession)
  + [`disposeExpressSession`](#disposeexpresssession)
  
+ Request Body

  + [`parseAndValidateJSON_RequestBody`](#parseandvalidatejson_requestbody)
  + [`validateAndProcessJSON_RequestBody`](#validateandprocessrequestbody) 


### `ExpressMiddleware`

The abstract class intended to be extended for the creating of Express middleware and using with
  [`@UseBefore` and `@UseAfter` decorators](https://www.npmjs.com/package/routing-controllers/v/0.6.0-beta.3#using-middlewares).
Unlike [`MiddlewareInterface` and `@Middleware()` decorator](https://www.npmjs.com/package/routing-controllers/v/0.6.0-beta.3#creating-your-own-express-middleware) 
  of **routing-controllers**, has safely typed parameters.

```mermaid
classDiagram
  class ExpressMiddleware {
    <<abstract>>
    #handleRequest(request: Express.Request, response: Express.Response, toNextMiddleware: ToNextMiddlewareTransfer) Promise<void>
  }
```

The only method need to be implemented is `handleRequest`:

```
(
  request: Express.Request,
  response: Express.Response,
  toNextMiddleware: ExpressMiddleware.ToNextMiddlewareTransfer
): Promise<void>
```

#### Example

```typescript
import type Express from "express";
import ExpressMiddleware from "@Incubators/routing-controllers-polyfills/ExpressMiddleware";
import { Logger } from "@yamato-daiwa/es-extensions";


export default class DebuggerMiddleware extends ExpressMiddleware {

  protected override async handleRequest(
      request: Express.Request,
      response: Express.Response,
      toNextMiddleware: ExpressMiddleware.ToNextMiddlewareTransfer
  ): Promise<void> {

    Logger.logInfo({
      title: "DebuggerMiddleware",
      description: "",
      additionalData: {
        request,
        response
      }
    });

    toNextMiddleware();
    return Promise.resolve();

  }

}
```

### `Route`

The adapter for `Method` decorator from **routing-controllers** to `HTTP_Methods` enumeration from 
  ["fundamental-constants"](https://www.npmjs.com/package/fundamental-constants)/["@yamato-daiwa/es-extensions"](https://www.npmjs.com/package/@yamato-daiwa/es-extensions).




### Session
#### `saveExpressSession`

```
saveExpressSession(session: Session): Promise<void>
```

The promisfied version of [`session.save(callback)`](https://www.npmjs.com/package/express-session#user-content-sessionsavecallback).
The promise will reject if the callback of `session.save` will receive
  neither undefined nor null parameter.


#### `disposeExpressSession`

```
# === [ Overload 1 ] Must wait until completion
(session: Session, options: Readonly<{ mustWaitUntilCompletion: true; }>): Promise<void>;

# === [ Overload 2 ] Do not wait until completion
(session: Session, options: Readonly<{ mustWaitUntilCompletion: false; }>): void;
```

The wrapper for [`session.destroy(callback)`](https://www.npmjs.com/package/express-session#user-content-sessiondestroycallback).

* If the second parameter has been set to `{ mustWaitUntilCompletion: true }`, this function will return the promise which
    will be resolved when the disposal will successfully complete. 
  In this case, the `disposeExpressSession` is the promisfied version of `session.destroy(callback)`. 
* If there is no need to wait the ending of disposal, set the second parameter to `{ mustWaitUntilCompletion: false }` 
    and this function will return nothing.
  

### Request Body
#### `parseAndValidateJSON_RequestBody`

```
<RequestData extends ReadonlyParsedJSON>(
  settings: Readonly<{
    requestBodySizeLimit__bytesPackageFormat: string | number;
    validationAndProcessing: RawObjectDataProcessor.ObjectDataSpecification;
  }>
): ExpressMiddleware
```

Parses expected to be the JSON-type request body, validates it by [RawObjectDataProcessor](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/CoreLibrary/Package/Documentation/RawObjectDataProcessor/RawObjectDataProcessor.md)
  and, if demanded, modifying it by same util.
The *alternative* to [class-transformer](https://github.com/typestack/class-transformer) which is transforming the
  request body to the instances of classes for the cases when there is no need to turn the objects to the instances
  of the classes.

* Requirements 
  1. **body-parser** has _not_ been applied neither globally nor locally, by other words, the request body
    has not been parsed yet.
  2. The **class-transformer** is disabled by `useExpressServer({ classTransformer: false })` where the `useExpressServer`
     is the function from **routing-controllers** 
* Intended to be used as one of parameters of **routing-controllers** middleware.


#### `validateAndProcessJSON_RequestBody`

```
<RequestData extends ReadonlyParsedJSON>(
  validRequestBodySpecification: RawObjectDataProcessor.ObjectDataSpecification
): ExpressMiddleware
```

Validates the pre-parsed JSON body by [RawObjectDataProcessor](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/CoreLibrary/Package/Documentation/RawObjectDataProcessor/RawObjectDataProcessor.md)
  and, if demanded, modifying it by same util.
The *alternative* to [class-transformer](https://github.com/typestack/class-transformer) which is transforming the
  request body to the instances of classes for the cases when there is no need to turn the objects to the instances
  of the classes.

* Requirements
  1. The JSON-type request body has been preliminary parsed by **body-parser**.
  2. The **class-transformer** is disabled by `useExpressServer({ classTransformer: false })` where the `useExpressServer`
     is the function from **routing-controllers**
* Intended to be used as one of parameters of **routing-controllers** middleware.
