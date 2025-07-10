import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ServerlessChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const domainPrefix = 'serverless-app-auth';
    const region = cdk.Stack.of(this).region;
    
    const userPool = new cognito.UserPool(this, 'AppUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true,
        requireLowercase: true
      }
    });

    userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: domainPrefix
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'AppUserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        flows: { implicitCodeGrant: true },
        callbackUrls: ['https://example/success'],
        logoutUrls: ['https://example/']
      }
    });

    new cdk.CfnOutput(this, 'CognitoLoginUrl', {
      value: `https://${domainPrefix}.auth.${region}.amazoncognito.com/login?client_id=${userPoolClient.userPoolClientId}&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=https://example/success`,
    });

    const characterTable = new dynamodb.Table(this, 'CharacterTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'CharacterTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const postTable = new dynamodb.Table(this, 'PostTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'PostTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY
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

    combineFn.addEnvironment('TABLE_NAME', characterTable.tableName);
    recordsFn.addEnvironment('TABLE_NAME', characterTable.tableName);
    storeFn.addEnvironment('TABLE_NAME', postTable.tableName);

    characterTable.grantReadWriteData(combineFn);
    postTable.grantReadWriteData(storeFn);
    characterTable.grantReadWriteData(recordsFn);

    const api = new apigw.RestApi(this, `example`, {
      restApiName: `servesrless-challenge`
    });

    api.addUsagePlan('UsagePlan', {
      name: 'RateLimitPlanExample',
      throttle: {
        rateLimit: 5,
        burstLimit: 10
      }
    }).addApiStage({
      stage: api.deploymentStage
    })

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'AppAuthorizer', {
      cognitoUserPools: [userPool]
    });

    api.root.addResource('fusionar').addMethod('GET', new apigw.LambdaIntegration(combineFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    api.root.addResource('almacenar').addMethod('POST', new apigw.LambdaIntegration(storeFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    api.root.addResource('historial').addMethod('GET', new apigw.LambdaIntegration(recordsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

  }
}
