import * as cdk from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Architecture, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class HappyBirthdayBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3 = new Bucket(this, "HappyBirthdayImages", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: "happy-birthday-images",
    });

    const lambda = new NodejsFunction(this, "HappyBirthdayBotFunction", {
      architecture: Architecture.ARM_64,
      timeout: cdk.Duration.minutes(1),
      memorySize: 256,
      entry: "src/happy-birthday-bot/index.ts",
      functionName: "HappyBirthdayBotFunction",
      runtime: Runtime.NODEJS_20_X,
      layers: [
        LayerVersion.fromLayerVersionArn(
          this,
          "Layer",
          "arn:aws:lambda:us-east-1:063257378709:layer:canvas-nodejs:1"
        ),
      ],
      bundling: {
        externalModules: ["canvas"],
        commandHooks: {
          afterBundling(inputDir, outputDir) {
            return [`cp -r ${inputDir}/src/assets ${outputDir}`];
          },
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
      environment: {
        NODE_ENV: "production",
        S3_BUCKET_NAME: s3.bucketName,
      },
    });

    s3.grantReadWrite(lambda);
    new Rule(this, "MorningRule", {
      description:
        "Schedule the Happy Birthday Bot to run every morning at 08:00 am",
      schedule: Schedule.expression("cron(0 12 * * ? *)"),
      ruleName: "MorningRule",
      targets: [new LambdaFunction(lambda)],
    });
  }
}
