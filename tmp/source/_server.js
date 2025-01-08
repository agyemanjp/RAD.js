import path from 'path';
import express from "express";
import { isArray, ok } from "@agyemanjp/standard";
/** Create express app configured with routes */
export function appFactory(env, routesFactory, storageFactory) {
    const app = express();
    const storage = storageFactory({
        dbUrl: env.databaseUrl,
        apiBasePath: `localhost:${env.port}/api`,
        s3Config: {
            endpoint: env.objectStorageRootUrl,
            bucketName: env.objectStorageDefaultBucket,
            secretAccessKey: env.objectStorageAccessKeySecret,
            accessKeyId: env.objectStorageAccessKeyId,
            region: env.objectStorageRegion
        }
    });
    /*const messenger = unifiedMessaging({
        email: smtpFactory({
            user: env.smtpUsername,
            pass: env.smtpPassword,
            host: env.smtpHost,
            port: env.smtpPort
        }),
        sms: twilioFactory({
            accountSid: env.twilioAccountSid,
            authToken: env.twilioAuthToken,
        })
    })*/
    const routes = routesFactory({ storage, env, staticPath: path.join(process.cwd(), "./dist") });
    if (routes.isErr())
        return routes.errWithGenericValue();
    routes.value.forEach((route) => {
        if (typeof route === "function") {
            app.use(route);
        }
        else if (isArray(route)) {
            const [method, path, handler] = route;
            app[method](path, handler);
            console.log(`Set up route: [${method.toUpperCase()}] "${path}"`);
        }
        else {
            const { method, path, handler } = route;
            app[method](path, handler);
            console.log(`Set up route: [${method.toUpperCase()}] "${path}"`);
        }
    });
    return ok(app);
}
/** Configure abnormal process termination handlers */
export function cfgProcTermination(appName, server, sockets) {
    process.on("unhandledRejection", (reason) => cleanShutdown(`Unhandled rejection`, reason));
    process.on("uncaughtException", (err) => cleanShutdown(`Uncaught exception`, err));
    process.on("SIGTERM", (signal) => cleanShutdown(signal));
    process.on("SIGINT", (signal) => cleanShutdown(signal));
    /** Clean server shutdown */
    function shutdown(reason, error) {
        if (error !== undefined) {
            console.error(`\n${appName} server shutting down due to: ${reason}\n${error instanceof Error ? error.stack : error}`);
        }
        else {
            console.warn(`\n${appName} server shutting down due to: ${reason}`);
        }
        server?.close(() => {
            console.log(`${appName} server closed\n`);
            process.exit(error === undefined ? 0 : 1);
        });
        Object.keys(sockets).forEach((socketId) => {
            sockets[socketId]?.destroy();
            //console.log('socket', socketId, 'destroyed')
        });
    }
    /** Cleanly shuts down server and associated processes */
    function cleanShutdown(reason, error) {
        const msg = error !== undefined
            ? (`\n${reason}\n${error instanceof Error ? error.stack : error}`)
            : (`${reason}`);
        console.warn(`\nHypothesize server shutting down due to: ${msg}`);
        if (server !== undefined) {
            server.close(() => {
                console.debug('Hypothesize server closed\n');
                process.exit(error === undefined ? 0 : 1);
            });
        }
        Object.keys(sockets).forEach((socketId) => {
            const socket = sockets[socketId];
            if (socket !== undefined) {
                socket.destroy();
            }
        });
    }
}
//# sourceMappingURL=_server.js.map