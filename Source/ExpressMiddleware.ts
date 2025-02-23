import type { ExpressMiddlewareInterface } from "routing-controllers";
import type Express from "express";


export abstract class ExpressMiddleware implements ExpressMiddlewareInterface {

  protected abstract handleRequest(
    request: Express.Request,
    response: Express.Response,
    toNextMiddleware: ExpressMiddleware.ToNextMiddlewareTransfer
  ): Promise<void>;


  /* eslint-disable-next-line id-length -- The limitations of library. */
  public use(request: unknown, response: unknown, toNextMiddleware: ExpressMiddleware.ToNextMiddlewareTransfer): void {
    this.handleRequest(

      /* eslint-disable @typescript-eslint/consistent-type-assertions --
       * In "routing-controllers" library, both request and response are `any`.
       * Because this class assumes the usage with Express framework, this type assertion is acceptable. */
      request as Express.Request,
      response as Express.Response,
      /* eslint-enable @typescript-eslint/consistent-type-assertions */

      toNextMiddleware

    ).
        catch(
          (error: unknown): void => { toNextMiddleware(error); }
        );
  }

}


export namespace ExpressMiddleware {

  export type ToNextMiddlewareTransfer = (error?: unknown) => unknown;

}
