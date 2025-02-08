import type { Session } from "express-session";
import { isNeitherUndefinedNorNull } from "@yamato-daiwa/es-extensions";


export function disposeExpressSession(session: Session, options: Readonly<{ mustWaitUntilCompletion: true; }>): Promise<void>;

export function disposeExpressSession(session: Session, options: Readonly<{ mustWaitUntilCompletion: false; }>): void;


export function disposeExpressSession(
  session: Session,
  { mustWaitUntilCompletion }: Readonly<{ mustWaitUntilCompletion: boolean; }>
): Promise<void> | void {

  if (!mustWaitUntilCompletion) {
    session.destroy(
      /* eslint-disable-next-line @typescript-eslint/no-empty-function --
       * Nothing required to do if no need to wait until completion. */
      (): void => {}
    );
  }


  return new Promise<void>(
    (resolve: () => void, reject: (error: unknown) => void): void => {

      session.destroy(
        (error?: unknown): void => {

          if (isNeitherUndefinedNorNull(error)) {
            reject(error);
            return;
          }


          resolve();

        }
      );

    }
  );

}
