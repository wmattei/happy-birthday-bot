import * as cdk from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class HappyBirthdayBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3 = new Bucket(this, "HappyBirthdayImages", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: "happy-birthday-images",
    });

    s3.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${s3.bucketArn}/*`],
        principals: [new cdk.aws_iam.AnyPrincipal()],
        effect: Effect.ALLOW,
      })
    );

    const lambda = new DockerImageFunction(this, "HappyBirthdayBotFunction", {
      architecture: Architecture.ARM_64,
      timeout: cdk.Duration.minutes(1),
      memorySize: 1024,
      code: DockerImageCode.fromImageAsset(""),
      functionName: "HappyBirthdayBotFunction",
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
