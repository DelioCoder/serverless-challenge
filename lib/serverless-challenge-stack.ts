import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ServerlessChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const characterTable = new dynamodb.Table(this, 'CharacterTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'CharacterTable',
    });

    const postTable = new dynamodb.Table(this, 'PostTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'PostTable',
    });

    const combineFn = new lambda.Function(this, 'CombineLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'combine.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(5)
    });

    const storeFn = new lambda.Function(this, 'StoreLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'store.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(5)
    });

    const recordsFn = new lambda.Function(this, 'RecordLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'records.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(5)
    });

    characterTable.grantReadWriteData(combineFn);
    postTable.grantReadWriteData(storeFn);
    characterTable.grantReadWriteData(recordsFn);

    const api = new apigw.RestApi(this, `example`, {
      restApiName: `servesrless-challenge`
    });

    api.root.addResource('combine').addMethod('GET', new apigw.LambdaIntegration(combineFn));
    api.root.addResource('store').addMethod('POST', new apigw.LambdaIntegration(storeFn));
    api.root.addResource('record').addMethod('GET', new apigw.LambdaIntegration(recordsFn));
    
  }
}
