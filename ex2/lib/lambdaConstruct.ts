import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';


interface LambdaConstructProps extends cdk.StackProps {

}

export class LambdaConstruct extends cdk.Construct {

    public readonly cleanup: lambda.Function;
    public readonly emailFunction: lambda.Function;
    public readonly encryptionFunction: lambda.Function;
    public readonly reportGenerate: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: LambdaConstructProps) {
        super(scope, id);

        this.cleanup = new lambda.Function(this, 'cleanupFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-cleanup')),
            timeout: cdk.Duration.seconds(100)
        });

        this.emailFunction = new lambda.Function(this, 'emailFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-email-function')),
            timeout: cdk.Duration.seconds(100)
        });

        this.encryptionFunction = new lambda.Function(this, 'encryptionFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-encryption-function')),
            timeout: cdk.Duration.seconds(100)
        });

        this.reportGenerate = new lambda.Function(this, 'reportGenerateFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-report-generate')),
            timeout: cdk.Duration.seconds(100)
        });





    }
}