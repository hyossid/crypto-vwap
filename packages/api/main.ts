import { ConsoleLogger, LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@root/api/app.module';
import { Response, json, urlencoded } from 'express';

const clientJsonPayloadLimit = '10mb';

function amendActionPath(document: OpenAPIObject) {
  const paths = Object.keys(document.paths);
  for (const p of paths) {
    if (p.indexOf('[:]') < 0) continue;
    const fixedPath = p.split('[:]').join(':');
    document.paths[fixedPath] = document.paths[p];
    delete document.paths[p];
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(json({ limit: clientJsonPayloadLimit }));
  app.use(urlencoded({ limit: clientJsonPayloadLimit, extended: true }));

  const logger: LoggerService = new ConsoleLogger();

  const swaggerBuilder = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('VWAP API')
    .setDescription('VWAP API service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  amendActionPath(document);
  SwaggerModule.setup('swagger-ui', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.getHttpAdapter().get('/swagger-api.json', (_, res: Response) => {
    res.json(document);
  });
  process
    .on('unhandledRejection', reason => {
      const message =
        reason instanceof Error
          ? `${reason.stack ?? reason}`
          : JSON.stringify(reason);
      logger.error(`unhandledRejection: ${message}`);
      process.exit(1);
    })
    .on('uncaughtException', (err, origin) => {
      logger.error(`${origin} ${err.name} ${err.stack}`);
      process.exit(1);
    });

  const port = Number.parseInt(process.env.PORT ?? '3003', 10);
  await Promise.all([
    app.listen(port, () =>
      logger.log(`VWAP API server started at port ${port}`),
    ),
  ]);
}
bootstrap().catch(console.error);
