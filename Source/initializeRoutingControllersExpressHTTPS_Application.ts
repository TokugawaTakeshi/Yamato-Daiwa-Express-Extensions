import createExpressApplication, { type Express as ExpressApplication } from "express";
import NodeHTTPS from "https";
import FileSystem from "fs";
import { Logger } from "@yamato-daiwa/es-extensions";
import { useExpressServer as supportControllerClasses, type RoutingControllersOptions } from "routing-controllers";


export async function initializeRoutingControllersExpressHTTPS_Application(
  {
    configuration: {
      HTTPS,
      routingControllers
    },
    eventsHandlers: {
      onExpressApplicationCreated,
      onHTTPS_ServerCreated,
      onRoutingControllersSetupComplete,
      onApplicationStarted
    }
  }: Readonly<{

    configuration: Readonly<{

      HTTPS: Readonly<
        { port: number; } &
        (
          (
            { SSL_Key: string; } |
            { SSL_KeyFilePath__absoluteOrRelative: string; }
          ) &
          (
            { SSL_Certificate: string; } |
            { SSL_CertificateFilePath__absoluteOrRelative: string; }
          )
        )
      >;
      routingControllers: RoutingControllersOptions;
    }>;

    eventsHandlers: Readonly<{
      onExpressApplicationCreated: (expressApplication: ExpressApplication) => Promise<void>;
      onHTTPS_ServerCreated?: (HTTPS_Server: NodeHTTPS.Server, expressApplication: ExpressApplication) => Promise<void>;
      onRoutingControllersSetupComplete?: (expressApplication: ExpressApplication) => Promise<void>;
      onApplicationStarted?: () => Promise<void>;
    }>;

  }>
): Promise<void> {

  const expressApplication: ExpressApplication = createExpressApplication();

  await onExpressApplicationCreated(expressApplication);

  const HTTPS_Server: NodeHTTPS.Server =
      NodeHTTPS.createServer(

        {
          key: "SSL_Key" in HTTPS ?
              HTTPS.SSL_Key : FileSystem.readFileSync(HTTPS.SSL_KeyFilePath__absoluteOrRelative, "utf8"),
          cert: "SSL_Certificate" in HTTPS ?
              HTTPS.SSL_Certificate : FileSystem.readFileSync(HTTPS.SSL_CertificateFilePath__absoluteOrRelative, "utf8")
        },

        /* eslint-disable-next-line @typescript-eslint/strict-void-return --
        * There no documentation proves that this code is correct; the correctness of this code has been known
        *   via the GitHub issue: https://github.com/typestack/routing-controllers/discussions/1243 */
        expressApplication

  );

  await onHTTPS_ServerCreated?.(HTTPS_Server, expressApplication);


  supportControllerClasses(expressApplication, routingControllers);

  await onRoutingControllersSetupComplete?.(expressApplication);


  HTTPS_Server.listen(
    HTTPS.port,
    (): void => {
      onApplicationStarted?.().catch(Logger.logPromiseError);
    }

  );

}
