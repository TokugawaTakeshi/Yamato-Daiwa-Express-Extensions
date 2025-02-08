import type { Session } from "express-session";
import { isNeitherUndefinedNorNull } from "@yamato-daiwa/es-extensions";


export function saveExpressSession(session: Session): Promise<void> | void {

  return new Promise<void>(
    (resolve: () => void, reject: (error: unknown) => void): void => {

      session.save(
        (error: unknown): void => {

          if (isNeitherUndefinedNorNull(error)) {
            reject(error);
          }


          resolve();

        }
      );

    }
  );

}
