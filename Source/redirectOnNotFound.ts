import type Express from "express";


export function redirectOnNotFound(
  targetRoute: string
): (_request: Express.Request, response: Express.Response) => void {

  return (_request: Express.Request, response: Express.Response): void => {
    if (!response.headersSent) {
      response.redirect(targetRoute);
    }
  };

}
